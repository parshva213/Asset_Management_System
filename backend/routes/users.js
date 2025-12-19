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
             GROUP_CONCAT(CONCAT(a.id, ':', a.name, ':', a.serial_number) SEPARATOR '|') as assigned_assets_data
      FROM users u
      LEFT JOIN assets a ON u.id = a.assigned_to AND a.status = 'Assigned'
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
          const [id, name, serial_number] = assetData.split(":")
          assignedAssets.push({ id: Number.parseInt(id), name, serial_number })
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

    await db.execute(
      "UPDATE assets SET assigned_to = ?, assigned_by = ?, status = 'Assigned' WHERE id = ? AND status = 'Available'", [user_id, req.user.id, asset_id],
    )

    const [assets] = await db.execute("SELECT name FROM assets WHERE id = ?", [asset_id])
    const [users] = await db.execute("SELECT name FROM users WHERE id = ?", [user_id])

    // Activity logging removed

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

    await db.execute(
      "UPDATE assets SET assigned_to = NULL, assigned_by = NULL, status = 'Available' WHERE id = ? AND assigned_to = ?",
      [asset_id, user_id],
    )

    const [assets] = await db.execute("SELECT name FROM assets WHERE id = ?", [asset_id])
    const [users] = await db.execute("SELECT name FROM users WHERE id = ?", [user_id])

    // Activity logging removed

    res.json({ message: "Asset unassigned successfully" })
  } catch (error) {
    console.error("Error unassigning asset:", error)
    res.status(500).json({ message: "Server error" })
  }
})

export default router