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
      SELECT u.id, u.name, u.email, u.role, u.department, u.phone, u.loc_id, l.name as location_name, u.created_at,
             GROUP_CONCAT(CONCAT(a.id, ':', a.name, ':', a.serial_number) SEPARATOR '|') AS assigned_assets_raw
      FROM users u
      LEFT JOIN locations l ON u.loc_id = l.id
      LEFT JOIN asset_assignments aa ON u.id = aa.assigned_to AND aa.unassigned_at IS NULL
      LEFT JOIN assets a ON aa.asset_id = a.id
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
      // Supervisor can only see their referred team
      if (currentUser.ownpk) {
        query += " AND u.unpk = ? and u.role = 'Employee'";
        params.push(currentUser.ownpk);
      } else {
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
            const [id, name, sn] = str.split(':');
            if (id) assigned_assets.push({ id: parseInt(id), name, serial_number: sn });
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
  try {
    const { loc_id, room_id } = req.body
    
    // We update only what's provided, focusing on loc_id for the user request
    let query = "UPDATE users SET "
    let params = []
    let updates = []

    if (loc_id !== undefined) {
      updates.push("loc_id = ?")
      params.push(loc_id)
    }

    if (room_id !== undefined) {
      updates.push("room_id = ?")
      params.push(room_id)
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "No fields to update" })
    }

    query += updates.join(", ") + " WHERE id = ?"
    params.push(req.params.id)

    await db.execute(query, params)
    res.json({ message: "User updated successfully" })
  } catch (error) {
    console.error("Error updating user:", error)
    res.status(500).json({ message: "Server error" })
  }
})

export default router