import express from "express";
import db from "../config/database.js";
import { verifyToken } from "../middleware/auth.js";
const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  try {
    if (req.user.role === "Employee") {
      return res.status(403).json({ message: "Access denied" })
    }

    let query = `
      SELECT u.id, u.name, u.email, u.role, u.department, u.created_at,
             GROUP_CONCAT(
               CONCAT(a.id, ':', a.name, ':', IFNULL(a.serial_number, 'N/A')) 
               SEPARATOR '|'
             ) as assigned_assets_data
      FROM users u
      LEFT JOIN asset_assignments aa ON u.id = aa.user_id
      LEFT JOIN assets a ON aa.asset_id = a.id
      WHERE u.role != 'Super Admin'
    `

    if (req.user.role === "IT Supervisor") {
      query += " AND u.role = 'Employee'"
    }

    query += " GROUP BY u.id ORDER BY u.name"

    const [users] = await db.execute(query)

    const usersWithAssets = users.map((user) => {
      const assignedAssets = []
      if (user.assigned_assets_data) {
        const assetsData = user.assigned_assets_data.split("|")
        assetsData.forEach((assetData) => {
          const parts = assetData.split(":")
          if (parts.length >= 2) {
             const [id, name, serial_number] = parts
             assignedAssets.push({ id: Number.parseInt(id), name, serial_number })
          }
        })
      }
      return {
        ...user,
        assigned_assets: assignedAssets,
        assigned_assets_data: undefined,
      }
    })

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

export default router