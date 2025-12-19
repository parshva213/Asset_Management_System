import express from "express";
import db from "../config/database.js";
import { verifyToken } from "../middleware/auth.js";
const router = express.Router();

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
    }

    query += " ORDER BY ar.created_at DESC"

    const [requests] = await db.execute(query, params)
    res.json(requests)
  } catch (error) {
    console.error("Error fetching requests:", error)
    res.status(500).json({ message: "Server error" })
  }
})

router.post("/", verifyToken, async (req, res) => {
  try {
    const { asset_id, request_type, reason, description, priority } = req.body

    const [result] = await db.execute(
      `INSERT INTO asset_requests (asset_id, request_type, reason, description, priority, requested_by) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [asset_id || null, request_type, reason, description, priority, req.user.id],
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

    const [requests] = await db.execute("SELECT requested_by FROM asset_requests WHERE id = ?", [id])
    if (requests.length === 0) {
      return res.status(404).json({ message: "Request not found" })
    }

    if (req.user.role === "Employee" && requests[0].requested_by !== req.user.id) {
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
    if (req.user.role === "Employee") {
      return res.status(403).json({ message: "Access denied" })
    }

    const { id } = req.params
    const { status, response } = req.body

    await db.execute("UPDATE asset_requests SET status = ?, response = ?, assigned_to = ? WHERE id = ?", [
      status,
      response || null,
      req.user.id,
      id,
    ])

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

    const [requests] = await db.execute("SELECT requested_by FROM asset_requests WHERE id = ?", [id])
    if (requests.length === 0) {
      return res.status(404).json({ message: "Request not found" })
    }

    if (req.user.role === "Employee" && requests[0].requested_by !== req.user.id) {
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
