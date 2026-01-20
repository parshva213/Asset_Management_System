import express from "express";
import db from "../config/database.js";
import { verifyToken } from "../middleware/auth.js";
import { logActivity } from "../utils/activityLogger.js";
const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM categories ORDER BY id ASC")
    res.json(rows)
  } catch (error) {
    console.error("Error fetching categories:", error)
    res.status(500).json({ message: "Server error" })
  }
})

router.post("/", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "Super Admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    const { name, description } = req.body

    const [result] = await db.query("INSERT INTO categories (name, description) VALUES (?, ?)", [name, description])
    const categoryId = result.insertId

    // Log activity safely
    await logActivity(req.user.id, "Created category", "category", categoryId, `Created category: ${name}`)

    res.status(201).json({ message: "Category created successfully", id: categoryId })
  } catch (error) {
    console.error("Error creating category:", error)
    res.status(500).json({ message: "Server error" })
  }
})

router.put("/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "Super Admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    const { id } = req.params
    const { name, description } = req.body

    await db.query("UPDATE categories SET name = ?, description = ? WHERE id = ?", [name, description, id])

    // Log activity safely
    await logActivity(req.user.id, "Updated category", "category", id, `Updated category: ${name}`)

    res.json({ message: "Category updated successfully" })
  } catch (error) {
    console.error("Error updating category:", error)
    res.status(500).json({ message: "Server error" })
  }
})

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "Super Admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    const { id } = req.params

    const [rows] = await db.query("SELECT name FROM categories WHERE id = ?", [id])
    if (rows.length === 0) {
      return res.status(404).json({ message: "Category not found" })
    }

    await db.query("DELETE FROM categories WHERE id = ?", [id])

    // Log activity safely
    await logActivity(req.user.id, "Deleted category", "category", id, `Deleted category: ${rows[0].name}`)

    res.json({ message: "Category deleted successfully" })
  } catch (error) {
    console.error("Error deleting category:", error)
    res.status(500).json({ message: "Server error" })
  }
})

export default router
