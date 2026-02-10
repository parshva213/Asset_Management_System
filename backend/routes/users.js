import express from "express";
import db from "../config/database.js";
import { verifyToken } from "../middleware/auth.js";
const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  try {
    if (req.user.role === "Employee" || req.user.role === "Maintenance" || req.user.role === "Vendor") {
      return res.status(403).json({ message: "Access denied" })
    }

    const [currentUserRows] = await db.execute("SELECT org_id, ownpk, role FROM users WHERE id = ?", [req.user.id]);
    const currentUser = currentUserRows[0];
    const org_id = currentUser?.org_id;
    if (!org_id) {
      return res.status(403).json({ message: "Access denied" })
    }

    const { location_id, room_id } = req.query;

    let query = `
      SELECT u.id, u.name, u.email, u.role, u.department, u.phone, u.status, u.loc_id, u.room_id, l.name as location_name, r.name as room_name, u.created_at,
             GROUP_CONCAT(CONCAT(a.id, ':', a.name, ':', a.serial_number, ':', COALESCE(asum.quantity, 0), ':', COALESCE(asum.assigned_total, 0), ':', COALESCE(asum.available_total, 0)) SEPARATOR '|') AS assigned_assets_raw
      FROM users u
      LEFT JOIN locations l ON u.loc_id = l.id
      LEFT JOIN rooms r ON u.room_id = r.id
      LEFT JOIN asset_assignments aa ON u.id = aa.assigned_to AND aa.unassigned_at IS NULL
      LEFT JOIN assets a ON aa.asset_id = a.id
      LEFT JOIN (
        SELECT name, location_id, COUNT(*) as quantity, SUM(status = 'Assigned') as assigned_total, SUM(status = 'Available') as available_total
        FROM assets
        GROUP BY name, location_id
      ) asum ON a.name = asum.name AND a.location_id = asum.location_id
      WHERE 1=1
    `;
    let params = [];

    // Filter by Organization (for Super Admin and everyone else within intent)
    if (org_id) {
      query += " AND u.org_id = ?";
      params.push(org_id);
    }

    if (req.user.role === "Super Admin") {
      if (room_id) {
        query += " AND u.room_id = ? AND (u.role = 'Employee' or u.role = 'Supervisor')";
        params.push(room_id);
      } else if (location_id) {
        query += " AND u.loc_id = ? AND u.role = 'Maintenance'";
        params.push(location_id);
      } else {
        query += " AND u.role = 'Maintenance'";
      }
    } else if (req.user.role === "Supervisor") {
      // Supervisor can only see employees in the same room
      const [supervisorRows] = await db.execute("SELECT room_id FROM users WHERE id = ?", [req.user.id]);
      const supervisorRoomId = supervisorRows[0]?.room_id;
      if (supervisorRoomId) {
        query += " AND u.room_id = ? AND u.role = 'Employee'";
        params.push(supervisorRoomId);
      } else {
        // If supervisor has no room, show no employees
        query += " AND 1=0";
        return res.status(403).json({ message: "Access denied" })
      }
    }

    query += " GROUP BY u.id, u.name, u.email, u.role, u.department, u.phone, u.loc_id, l.name, u.created_at ORDER BY u.id ASC";

    console.log("Users Query:", query);
    console.log("Params:", params);

    const [users] = await db.execute(query, params);
    console.log("Users Found in Query:", users.length);
    console.log("First User:", users[0]);

    const usersWithAssets = users.map((u) => {
      const assigned_assets = [];
      if (u.assigned_assets_raw) {
        // Use a Set to avoid double counting if duplicate joins occur (though GROUP BY u.id should handle it)
        const assetsSeen = new Set();
        u.assigned_assets_raw.split('|').forEach(str => {
          if (!assetsSeen.has(str)) {
            assetsSeen.add(str);
            const bits = str.split(':');
            const id = bits[0];
            const name = bits[1];
            const sn = bits[2];
            const qty = bits[3];
            const assigned = bits[4];
            const available = bits[5];
            if (id) {
                assigned_assets.push({ 
                    id: parseInt(id), 
                    name, 
                    serial_number: sn,
                    quantity: parseInt(qty) || 0,
                    assign: parseInt(assigned) || 0,
                    available: parseInt(available) || 0
                });
            }
          }
        });
      }
      return { ...u, assigned_assets, assigned_assets_raw: undefined };
    });

    res.json(usersWithAssets)
  } catch (error) {
    console.error("Error fetching users:", error)
    res.status(500).json({ message: "Server error" })
  }
})

router.get("/maintenance", verifyToken, async (req, res) => {
  try {
    if (req.user.role === "Employee" || req.user.role === "Maintenance" || req.user.role === "Vendor") {
      return res.status(403).json({ message: "Access denied" })
    }

    let query = `
      SELECT u.id, u.name, u.email, u.role, u.department, u.phone, u.status, u.loc_id, u.room_id, l.name as location_name, r.name as room_name, u.created_at,
             GROUP_CONCAT(CONCAT(a.id, ':', a.name, ':', a.serial_number, ':', COALESCE(asum.quantity, 0), ':', COALESCE(asum.assigned_total, 0), ':', COALESCE(asum.available_total, 0)) SEPARATOR '|') AS assigned_assets_raw
      FROM users u
      LEFT JOIN locations l ON u.loc_id = l.id
      LEFT JOIN rooms r ON u.room_id = r.id
      LEFT JOIN asset_assignments aa ON u.id = aa.assigned_to AND aa.unassigned_at IS NULL
      LEFT JOIN assets a ON aa.asset_id = a.id
      LEFT JOIN (
        SELECT name, location_id, COUNT(*) as quantity, SUM(status = 'Assigned') as assigned_total, SUM(status = 'Available') as available_total
        FROM assets
        GROUP BY name, location_id
      ) asum ON a.name = asum.name AND a.location_id = asum.location_id
      WHERE u.role = 'Maintenance' AND u.org_id = ?
    `;
    let params = [req.user.org_id];

    if (req.query.location_id) {
      query += " AND u.loc_id = ?";
      params.push(req.query.location_id);
    } else {
      query += " AND u.loc_id IS NULL";
    }

    query += " GROUP BY u.id, u.name, u.email, u.role, u.department, u.phone, u.loc_id, l.name, u.created_at ORDER BY u.id ASC";

    const [users] = await db.execute(query, params);

    const usersWithAssets = users.map((u) => {
      const assigned_assets = [];
      if (u.assigned_assets_raw) {
        const assetsSeen = new Set();
        u.assigned_assets_raw.split('|').forEach(str => {
          if (!assetsSeen.has(str)) {
            assetsSeen.add(str);
            const bits = str.split(':');
            const id = bits[0];
            const name = bits[1];
            const sn = bits[2];
            const qty = bits[3];
            const assigned = bits[4];
            const available = bits[5];
            if (id) {
                assigned_assets.push({ 
                    id: parseInt(id), 
                    name, 
                    serial_number: sn,
                    quantity: parseInt(qty) || 0,
                    assign: parseInt(assigned) || 0,
                    available: parseInt(available) || 0
                });
            }
          }
        });
      }
      return { ...u, assigned_assets, assigned_assets_raw: undefined };
    });

    res.json(usersWithAssets)
  } catch (error) {
    console.error("Error fetching maintenance users:", error)
    res.status(500).json({ message: "Server error" })
  }
})

router.post("/assign-asset", verifyToken, async (req, res) => {
  try {
    if (req.user.role === "Employee") {
      return res.status(403).json({ message: "Access denied" })
    }

    const { user_id, asset_id, notes } = req.body

    // 1. Create Assignment Record
    await db.execute(
      "INSERT INTO asset_assignments (assigned_to, asset_id, description, assigned_by) VALUES (?, ?, ?, ?)",
      [user_id, asset_id, notes || '', req.user.id]
    )

    // 2. Update Asset Status
    await db.execute(
      "UPDATE assets SET status = 'Assigned' WHERE id = ?",
      [asset_id]
    )

    res.json({ message: "Asset assigned successfully" })
  } catch (error) {
    console.error("Error assigning asset:", error)
    res.status(500).json({ message: "Server error" })
  }
})

router.post("/unassign-asset", verifyToken, async (req, res) => {
  try {
    if (req.user.role === "Employee") {
      return res.status(403).json({ message: "Access denied" })
    }

    const { asset_id } = req.body

    // 1. Remove Assignment Record
    await db.execute(
      "UPDATE asset_assignments SET unassigned_by = ?, unassigned_at = CURRENT_TIMESTAMP WHERE asset_id = ? AND unassigned_at IS NULL",
      [req.user.id, asset_id]
    )

    // 2. Update Asset Status
    await db.execute(
      "UPDATE assets SET status = 'Available' WHERE id = ?",
      [asset_id]
    )

    res.json({ message: "Asset unassigned successfully" })
  } catch (error) {
    console.error("Error unassigning asset:", error)
    res.status(500).json({ message: "Server error" })
  }
})

router.put("/:id", verifyToken, async (req, res) => {
  let conn;
  try {
    const { loc_id, room_id } = req.body;
    conn = await db.getConnection();
    await conn.query(`START TRANSACTION`);

    let [[oldUser]] = await conn.execute(`SELECT loc_id FROM users WHERE id = ?`, [req.params.id]);
    
    // We update only what's provided, focusing on loc_id for the user request
    let updates = [];
    let params = [];

    if (loc_id !== undefined) {
      updates.push("loc_id = ?");
      params.push(loc_id);
    }

    if (room_id !== undefined) {
      updates.push("room_id = ?");
      params.push(room_id);
    }

    if (req.body.role !== undefined) {
      updates.push("role = ?");
      params.push(req.body.role);
    }

    if (updates.length > 0) {
      let updateQuery = "UPDATE users SET " + updates.join(", ") + " WHERE id = ?";
      params.push(req.params.id);
      await conn.execute(updateQuery, params);
    }

    // If location has changed, unassign all current assets
    if (loc_id !== undefined && oldUser && String(loc_id) !== String(oldUser.loc_id)) {
      // 1. Get all currently assigned asset IDs for this user
      const [assignments] = await conn.execute(
        "SELECT asset_id FROM asset_assignments WHERE assigned_to = ? AND unassigned_at IS NULL",
        [req.params.id]
      );

      if (assignments.length > 0) {
        const assetIds = assignments.map(a => a.asset_id);
        
        // 2. Mark assignments as ended
        await conn.execute(
          "UPDATE asset_assignments SET unassigned_by = ?, unassigned_at = CURRENT_TIMESTAMP WHERE assigned_to = ? AND unassigned_at IS NULL",
          [req.user.id, req.params.id]
        );

        // 3. Update assets status to Available
        const placeholders = assetIds.map(() => "?").join(",");
        await conn.execute(
          `UPDATE assets SET status = 'Available' WHERE id IN (${placeholders})`,
          assetIds
        );
      }
    }

    await conn.query(`COMMIT`);
    res.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    if (conn) await conn.query(`ROLLBACK`).catch(err => console.error("Rollback failed:", err));
    res.status(500).json({ message: "Server error" });
  } finally {
    if (conn) conn.release();
  }
});

export default router