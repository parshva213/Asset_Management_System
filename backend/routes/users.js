import express from "express";
import db from "../config/database.js";
import { verifyToken } from "../middleware/auth.js";
const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  try {
    if (req.user.role === "Employee" || req.user.role === "Maintenance" || req.user.role === "Vendor") {
      return res.status(403).json({ message: "Access denied" })
    }
    
    const [org_id_rows] = await db.execute("SELECT org_id FROM users WHERE id = ?", [req.user.id]);
    const org_id = org_id_rows[0].org_id;

    const { location_id, role: queryRole } = req.query;

    // Special Case: Super Admin viewing unassigned team members (no query params)
    if (req.user.role === "Super Admin" && Object.keys(req.query).length === 0) {
      const [users] = await db.execute(
        `SELECT u.id, u.name, u.email, u.role, u.department, u.phone, u.created_at,
               GROUP_CONCAT(CONCAT(a.id, ':', a.name, ':', a.serial_number) SEPARATOR '|') as assigned_assets_raw
        FROM users u
        LEFT JOIN asset_assignments aa ON u.id = aa.user_id
        LEFT JOIN assets a ON aa.asset_id = a.id
        WHERE (u.org_id = ? OR u.org_id IS NULL)
          AND u.role = 'Maintenance'
          AND u.loc_id IS NULL
          AND u.room_id IS NULL
        GROUP BY u.id
        ORDER BY u.id ASC`,
        [org_id]
      )
      const usersWithAssets = users.map((u) => {
        const assigned_assets = [];
        if (u.assigned_assets_raw) {
          u.assigned_assets_raw.split('|').forEach(str => {
            const [id, name, sn] = str.split(':');
            assigned_assets.push({ id: parseInt(id), name, serial_number: sn });
          });
        }
        return { ...u, assigned_assets, assigned_assets_raw: undefined };
      });
      return res.json(usersWithAssets)
    }

    // Standard Filtering Case
    const orgFilter = "(u.org_id = ? OR u.org_id IS NULL)";
    let queryParams = [org_id];
    let query = `
      SELECT u.id, u.name, u.email, u.role, u.department, u.phone, u.loc_id, l.name as location_name, u.created_at,
             GROUP_CONCAT(CONCAT(a.id, ':', a.name, ':', a.serial_number) SEPARATOR '|') as assigned_assets_raw
      FROM users u
      LEFT JOIN locations l ON u.loc_id = l.id
      LEFT JOIN asset_assignments aa ON u.id = aa.user_id
      LEFT JOIN assets a ON aa.asset_id = a.id
      WHERE ${orgFilter}
    `

    if (req.user.role === "IT Supervisor") {
      query += " AND u.role = 'Employee'"
    }

    if (location_id) {
      query += ` AND u.loc_id = ?`
      queryParams.push(location_id)
    }

    if (queryRole) {
      query += " AND u.role = ?"
      queryParams.push(queryRole)
    }

    query += " GROUP BY u.id ORDER BY u.id ASC"

    const [users] = await db.execute(query, queryParams)

    const usersWithAssets = users.map((u) => {
      const assigned_assets = [];
      if (u.assigned_assets_raw) {
        u.assigned_assets_raw.split('|').forEach(str => {
          const [id, name, sn] = str.split(':');
          assigned_assets.push({ id: parseInt(id), name, serial_number: sn });
        });
      }
      return { ...u, assigned_assets, location_name: u.location_name, assigned_assets_raw: undefined };
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
      "INSERT INTO asset_assignments (user_id, asset_id, description) VALUES (?, ?, ?)",
      [user_id, asset_id, notes || '']
    )

    // 2. Update Asset Status
    await db.execute(
      "UPDATE assets SET status = 'Assigned', assigned_to = ?, assigned_by = ? WHERE id = ?", 
      [user_id, req.user.id, asset_id]
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

    const { user_id, asset_id } = req.body

    // 1. Remove Assignment Record
    await db.execute(
        "DELETE FROM asset_assignments WHERE user_id = ? AND asset_id = ?",
        [user_id, asset_id]
    )

    // 2. Update Asset Status
    await db.execute(
      "UPDATE assets SET assigned_to = NULL, assigned_by = NULL, status = 'Available' WHERE id = ?",
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
    if (req.user.role === "Employee") {
      return res.status(403).json({ message: "Access denied" })
    }

    const { loc_id, department, phone } = req.body
    
    // We update only what's provided, focusing on loc_id for the user request
    let query = "UPDATE users SET "
    let params = []
    let updates = []

    if (loc_id !== undefined) {
      updates.push("loc_id = ?")
      params.push(loc_id)
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