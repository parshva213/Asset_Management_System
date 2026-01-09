import express from "express";
import db from "../config/database.js";
import { verifyToken } from "../middleware/auth.js";
import { logActivity } from "../utils/activityLogger.js";
const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT l.*, (SELECT COUNT(*) FROM rooms r WHERE r.location_id = l.id) as room_count
      FROM locations l
      ORDER BY l.name
    `)
    res.json(rows)
  } catch (error) {
    console.error("Error fetching locations:", error)
    res.status(500).json({ message: "Server error" })
  }
})

router.get("/rooms", verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT r.*, l.name as location_name 
      FROM rooms r 
      LEFT JOIN locations l ON r.location_id = l.id 
      ORDER BY l.name, r.name
    `)
    res.json(rows)
  } catch (error) {
    console.error("Error fetching rooms:", error)
    res.status(500).json({ message: "Server error" })
  }
})

router.get("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params
    const [rows] = await db.query("SELECT * FROM locations WHERE id = ?", [id])
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "Location not found" })
    }
    
    res.json(rows[0])
  } catch (error) {
    console.error("Error fetching location:", error)
    res.status(500).json({ message: "Server error" })
  }
})

router.post("/", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "Super Admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    const { name, address, description } = req.body

    const [result] = await db.query("INSERT INTO locations (name, address, description) VALUES (?, ?, ?)", [
      name,
      address,
      description,
    ])
    const locationId = result.insertId

    // Log activity safely
    await logActivity(req.user.id, "Created location", "location", locationId, `Created location: ${name}`)

    res.status(201).json({ message: "Location created successfully", id: locationId })
  } catch (error) {
    console.error("Error creating location:", error)
    res.status(500).json({ message: "Server error" })
  }
})

router.post("/rooms", verifyToken, async (req, res) => {
  try {
    if (req.user.role === "Employee") {
      return res.status(403).json({ message: "Access denied" })
    }

    const { name, floor, capacity, description, location_id } = req.body

    const [result] = await db.query(
      "INSERT INTO rooms (name, floor, capacity, description, location_id) VALUES (?, ?, ?, ?, ?)",
      [name, floor, capacity, description, location_id],
    )
    const roomId = result.insertId

    // Log activity safely
    await logActivity(req.user.id, "Created room", "room", roomId, `Created room: ${name}`)

    res.status(201).json({ message: "Room created successfully", id: roomId })
  } catch (error) {
    console.error("Error creating room:", error)
    res.status(500).json({ message: "Server error" })
  }
})

router.put("/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "Super Admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    const { id } = req.params
    const { name, address, description } = req.body

    await db.query("UPDATE locations SET name = ?, address = ?, description = ? WHERE id = ?", [
      name,
      address,
      description,
      id,
    ])

    // Log activity safely
    await logActivity(req.user.id, "Updated location", "location", id, `Updated location: ${name}`)

    res.json({ message: "Location updated successfully" })
  } catch (error) {
    console.error("Error updating location:", error)
    res.status(500).json({ message: "Server error" })
  }
})

router.put("/rooms/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.role === "Employee") {
      return res.status(403).json({ message: "Access denied" })
    }

    const { id } = req.params
    const { name, floor, capacity, description, location_id } = req.body

    await db.query(
      "UPDATE rooms SET name = ?, floor = ?, capacity = ?, description = ?, location_id = ? WHERE id = ?",
      [name, floor, capacity, description, location_id, id],
    )

    // Log activity safely
    await logActivity(req.user.id, "Updated room", "room", id, `Updated room: ${name}`)

    res.json({ message: "Room updated successfully" })
  } catch (error) {
    console.error("Error updating room:", error)
    res.status(500).json({ message: "Server error" })
  }
})

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "Super Admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    const { id } = req.params

    const [rows] = await db.query("SELECT name FROM locations WHERE id = ?", [id])
    if (rows.length === 0) {
      return res.status(404).json({ message: "Location not found" })
    }

    await db.query("DELETE FROM locations WHERE id = ?", [id])

    // Log activity safely
    await logActivity(req.user.id, "Deleted location", "location", id, `Deleted location: ${rows[0].name}`)

    res.json({ message: "Location deleted successfully" })
  } catch (error) {
    console.error("Error deleting location:", error)
    res.status(500).json({ message: "Server error" })
  }
})

router.delete("/rooms/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.role === "Employee") {
      return res.status(403).json({ message: "Access denied" })
    }

    const { id } = req.params

    const [rows] = await db.query("SELECT name FROM rooms WHERE id = ?", [id])
    if (rows.length === 0) {
      return res.status(404).json({ message: "Room not found" })
    }

    await db.query("DELETE FROM rooms WHERE id = ?", [id])

    // Log activity safely
    await logActivity(req.user.id, "Deleted room", "room", id, `Deleted room: ${rows[0].name}`)

    res.json({ message: "Room deleted successfully" })
  } catch (error) {
    console.error("Error deleting room:", error)
    res.status(500).json({ message: "Server error" })
  }
})

export default router
