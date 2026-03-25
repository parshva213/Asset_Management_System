import express from "express";
import db from "../config/database.js";
import { verifyToken } from "../middleware/auth.js";
const router = express.Router();

// Validation helper for request fields
const validateRequestFields = (data) => {
  const errors = [];
  
  if (data.reason && data.reason.length > 500) {
    errors.push("Reason must be 500 characters or less");
  }
  
  if (data.description && data.description.length > 1000) {
    errors.push("Description must be 1000 characters or less");
  }
  
  if (data.response && data.response.length > 1000) {
    errors.push("Response must be 1000 characters or less");
  }
  
  return errors;
};

router.get("/", verifyToken, async (req, res) => {
  try {
    let query = `
      SELECT ar.*, a.name as asset_name, a.serial_number as asset_serial,
             u1.name as requester_name, u2.name as assigned_to_name,
             l.name as location_name, r.name as room_name, s.name as supervisor_name,
             u1.loc_id as location_id, u1.room_id as room_id
      FROM asset_requests ar
      LEFT JOIN assets a ON ar.asset_id = a.id
      LEFT JOIN users u1 ON ar.requested_by = u1.id
      LEFT JOIN users u2 ON ar.assigned_to = u2.id
      LEFT JOIN locations l ON u1.loc_id = l.id
      LEFT JOIN rooms r ON u1.room_id = r.id
      LEFT JOIN users s ON u1.unpk = s.ownpk AND s.role = 'Supervisor'
      WHERE 1=1
    `
    const params = []

    if (req.user.role === "Employee") {
      query += " AND ar.requested_by = ?"
      params.push(req.user.id)
    } else if (req.user.role === "Software Developer") {
      query += " AND ar.requested_by = ?"
      params.push(req.user.id)
    } else if (req.user.org_id) {
      query += " AND u1.org_id = ?"
      params.push(req.user.org_id)
    }

    query += " ORDER BY ar.id ASC"

    const [requests] = await db.execute(query, params)
    res.json(requests)
  } catch (error) {
    console.error("Error fetching requests:", error)
    res.status(500).json({ message: "Server error" })
  }
})

router.post("/", verifyToken, async (req, res) => {
  try {
    const { asset_id, request_type, reason, description, priority, assigned_to, response } = req.body

    // Validate field lengths
    const validationErrors = validateRequestFields({ reason, description, response });
    if (validationErrors.length > 0) {
      return res.status(400).json({
        message: "Validation error",
        errors: validationErrors
      });
    }
    if (asset_id) {
      const [assetRows] = await db.execute("SELECT id FROM assets WHERE id = ? AND org_id = ?", [asset_id, req.user.org_id])
      if (assetRows.length === 0) {
        return res.status(403).json({ message: "Access denied" })
      }
    }

    const [result] = await db.execute(
      `INSERT INTO asset_requests (asset_id, request_type, reason, description, priority, status, requested_by, assigned_to, response)
       VALUES (?, ?, ?, ?, ?, 'Pending', ?, ?, ?)`,
      [asset_id || null, request_type, reason || null, description || null, priority || 'Medium', req.user.id, assigned_to || null, response || null],
    )

    // Activity logging removed

    res.status(201).json({ message: "Request created successfully", id: result.insertId })
  } catch (error) {
    console.error("Error creating request:", error)
    res.status(500).json({ message: "Server error" })
  }
})

router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params
    const { asset_id, request_type, reason, description, priority } = req.body

    const [requests] = await db.execute(
      `SELECT ar.requested_by, u.org_id
       FROM asset_requests ar
       LEFT JOIN users u ON ar.requested_by = u.id
       WHERE ar.id = ?`,
      [id]
    )
    if (requests.length === 0) {
      return res.status(404).json({ message: "Request not found" })
    }

    if (req.user.role === "Employee" && requests[0].requested_by !== req.user.id) {
      return res.status(403).json({ message: "Access denied" })
    }

    if (req.user.role === "Software Developer" && requests[0].requested_by !== req.user.id) {
      return res.status(403).json({ message: "Access denied" })
    }

    if (req.user.org_id && String(requests[0].org_id) !== String(req.user.org_id)) {
      return res.status(403).json({ message: "Access denied" })
    }

    await db.execute(
      `UPDATE asset_requests SET asset_id = ?, request_type = ?, reason = ?, description = ?, priority = ?
       WHERE id = ?`,
      [asset_id || null, request_type, reason, description, priority, id],
    )

    // Activity logging removed

    res.json({ message: "Request updated successfully" })
  } catch (error) {
    console.error("Error updating request:", error)
    res.status(500).json({ message: "Server error" })
  }
})

router.put("/:id/status", verifyToken, async (req, res) => {
  try {
    if (req.user.role === "Employee" || req.user.role === "Software Developer") {
      return res.status(403).json({ message: "Access denied" })
    }

    const { id } = req.params
    const { status, response } = req.body

    // Validate field lengths
    const validationErrors = validateRequestFields({ response });
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        message: "Validation error",
        errors: validationErrors
      });
    }

    // Get the asset request details
    const [requestDetails] = await db.execute("SELECT * FROM asset_requests WHERE id = ?", [id])
    
    if (!requestDetails || requestDetails.length === 0) {
      return res.status(404).json({ message: "Request not found" })
    }

    const request = requestDetails[0]

    const [requestRows] = await db.execute(
      `SELECT ar.id
       FROM asset_requests ar
       LEFT JOIN users u ON ar.requested_by = u.id
       WHERE ar.id = ? AND u.org_id = ?`,
      [id, req.user.org_id]
    )
    if (requestRows.length === 0) {
      return res.status(404).json({ message: "Request not found" })
    }

    await db.execute("UPDATE asset_requests SET status = ?, response = ?, assigned_to = ? WHERE id = ?", [
      status,
      response || null,
      req.user.id,
      id,
    ])

    // When request is accepted (status = "In Progress"), create a maintenance record
    if (status === "In Progress" && (request.asset_id || request.request_type === "New Asset")) {
      let maintenanceType = "Repair"
      let maintenanceStatus = "Pending" // Forced to always be Pending
      let finalAssetId = request.asset_id
      
      // Query for the requester's location to use as a fallback and to find the target asset location
      const [requesterRows] = await db.execute("SELECT loc_id FROM users WHERE id = ?", [request.requested_by]);
      const requesterLocationId = requesterRows[0]?.loc_id;

      let assetLocationId = null;

      // Determine maintenanceType, status, and target Asset ID based on request_type
      if (request.request_type === "Repair") {
        maintenanceType = "Repair"
        maintenanceStatus = "Pending" 
        
        const [assetRows] = await db.execute("SELECT location_id FROM assets WHERE id = ?", [finalAssetId]);
        assetLocationId = assetRows[0]?.location_id;
        
      } else if (request.request_type === "Replacement") {
        maintenanceType = "Upgrade"
        maintenanceStatus = "Pending" 
        
        const [assetRows] = await db.execute("SELECT location_id FROM assets WHERE id = ?", [finalAssetId]);
        assetLocationId = assetRows[0]?.location_id;
        
      } else if (request.request_type === "New Asset") {
        maintenanceType = "Configuration"
        maintenanceStatus = "Pending" // Using exact casing expected in DB
        
        // For New Asset, we need to find an available asset matching the requested model
        // The model name is stored in the description as "Model: [Model Name]"
        if (request.description) {
          const modelMatch = request.description.match(/Model:\s*(.+?)(?:\n|$)/);
          if (modelMatch && modelMatch[1]) {
            const modelName = modelMatch[1].trim();
            
            // Try to find an available asset
            // We prioritize the requester's location, but if they have no loc_id, we just check within org
            let query = `
              SELECT a.id, a.location_id 
              FROM assets a
              LEFT JOIN asset_assignments aa 
                ON aa.asset_id = a.id 
                AND aa.unassigned_at IS NULL 
                AND aa.unassigned_by IS NULL
              WHERE a.org_id = ? AND a.name = ? AND a.status = 'Available' AND aa.id IS NULL
            `;
            const params = [req.user.org_id, modelName];
            
            if (requesterLocationId) {
              query += ` AND a.location_id = ?`;
              params.push(requesterLocationId);
            }
            
            query += ` LIMIT 1`;
            
            const [availableAssets] = await db.execute(query, params);
            
            if (availableAssets.length > 0) {
              finalAssetId = availableAssets[0].id;
              assetLocationId = availableAssets[0].location_id;
            }
          }
        }
      }

      // If we couldn't resolve an finalAssetId (even for New Asset), skip maintenance record creation
      if (finalAssetId) {
        let maintenanceByUserId = null;

        // Find a random user with 'Maintenance' role from the same location
        if (assetLocationId) {
          const [maintenanceUserRows] = await db.execute(
            "SELECT id FROM users WHERE role = 'Maintenance' AND loc_id = ? AND org_id = ? ORDER BY RAND() LIMIT 1",
            [assetLocationId, req.user.org_id]
          );
          if (maintenanceUserRows.length > 0) {
            maintenanceByUserId = maintenanceUserRows[0].id;
          }
        }

        await db.execute(
          "INSERT INTO maintenance_records (asset_id, maintenance_by, maintenance_type, description, status) VALUES (?, ?, ?, ?, ?)",
          [
            finalAssetId,
            maintenanceByUserId,
            maintenanceType,
            request.description || request.reason || "",
            maintenanceStatus
          ]
        )
      }
    }

    // Activity logging removed

    res.json({ message: "Request status updated successfully" })
  } catch (error) {
    console.error("Error updating request status:", error)
    res.status(500).json({ message: "Server error" })
  }
})

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params

    const [requests] = await db.execute(
      `SELECT ar.requested_by, u.org_id
       FROM asset_requests ar
       LEFT JOIN users u ON ar.requested_by = u.id
       WHERE ar.id = ?`,
      [id]
    )
    if (requests.length === 0) {
      return res.status(404).json({ message: "Request not found" })
    }

    if (req.user.role === "Employee" && requests[0].requested_by !== req.user.id) {
      return res.status(403).json({ message: "Access denied" })
    }

    if (req.user.role === "Software Developer" && requests[0].requested_by !== req.user.id) {
      return res.status(403).json({ message: "Access denied" })
    }

    if (req.user.org_id && String(requests[0].org_id) !== String(req.user.org_id)) {
      return res.status(403).json({ message: "Access denied" })
    }

    await db.execute("DELETE FROM asset_requests WHERE id = ?", [id])

    // Activity logging removed

    res.json({ message: "Request deleted successfully" })
  } catch (error) {
    console.error("Error deleting request:", error)
    res.status(500).json({ message: "Server error" })
  }
})

export default router
