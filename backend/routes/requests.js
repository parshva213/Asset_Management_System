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
             u1.name as requester_name, u2.name as assigned_to_name
      FROM asset_requests ar
      LEFT JOIN assets a ON ar.asset_id = a.id
      LEFT JOIN users u1 ON ar.requested_by = u1.id
      LEFT JOIN users u2 ON ar.assigned_to = u2.id
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

<<<<<<< HEAD
    // Validate field lengths
    const validationErrors = validateRequestFields({ reason, description, response });
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        message: "Validation error",
        errors: validationErrors
      });
=======
    if (asset_id) {
      const [assetRows] = await db.execute("SELECT id FROM assets WHERE id = ? AND org_id = ?", [asset_id, req.user.org_id])
      if (assetRows.length === 0) {
        return res.status(403).json({ message: "Access denied" })
      }
>>>>>>> 529cfb45fb3c89c89998467680e5f1168f45741c
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

<<<<<<< HEAD
    // Validate field lengths
    const validationErrors = validateRequestFields({ reason, description });
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        message: "Validation error",
        errors: validationErrors
      });
    }

    const [requests] = await db.execute("SELECT requested_by FROM asset_requests WHERE id = ?", [id])
=======
    const [requests] = await db.execute(
      `SELECT ar.requested_by, u.org_id
       FROM asset_requests ar
       LEFT JOIN users u ON ar.requested_by = u.id
       WHERE ar.id = ?`,
      [id]
    )
>>>>>>> 529cfb45fb3c89c89998467680e5f1168f45741c
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

<<<<<<< HEAD
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

=======
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

>>>>>>> 529cfb45fb3c89c89998467680e5f1168f45741c
    await db.execute("UPDATE asset_requests SET status = ?, response = ?, assigned_to = ? WHERE id = ?", [
      status,
      response || null,
      req.user.id,
      id,
    ])

    // When request is accepted (status = "In Progress"), create a maintenance record
    if (status === "In Progress" && request.asset_id) {
      let maintenanceType = "Repair"
      
      // Map request_type to maintenance_type
      if (request.request_type === "Repair") {
        maintenanceType = "Repair"
      } else if (request.request_type === "Replacement") {
        maintenanceType = "Upgrade"
      } else if (request.request_type === "New Asset") {
        maintenanceType = "Configuration"
      }

      await db.execute(
        "INSERT INTO maintenance_records (asset_id, maintenance_by, maintenance_type, description, status) VALUES (?, ?, ?, ?, ?)",
        [
          request.asset_id,
          req.user.id,
          maintenanceType,
          request.description || request.reason || "",
          "In Progress"
        ]
      )
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
