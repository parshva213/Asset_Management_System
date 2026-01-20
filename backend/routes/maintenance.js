import express from "express";
import pool from "../config/database.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// GET all maintenance records
router.get("/", verifyToken, async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT m.*, a.name as asset_name, u.name as maintenance_by_name
      FROM maintenance_records m
      JOIN assets a ON m.asset_id = a.id
      JOIN users u ON m.maintenance_by = u.id
      ORDER BY m.id ASC
    `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// GET maintenance tasks (for tasks page)
router.get("/tasks", verifyToken, async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT m.*, a.name as asset_name
      FROM maintenance_records m
      JOIN assets a ON m.asset_id = a.id
      WHERE m.status != 'Completed'
      ORDER BY m.id ASC
    `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// POST create maintenance record (Supervisor/Admin)
router.post("/", verifyToken, async (req, res) => {
    if (!["Super Admin", "Supervisor"].includes(req.user.role)) {
        return res.status(403).json({ message: "Access denied" });
    }

    const { asset_id, maintenance_by, maintenance_type, description, priority } = req.body;

    if (!asset_id || !maintenance_by || !maintenance_type) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        // Check if asset exists
        const [asset] = await pool.query("SELECT * FROM assets WHERE id = ?", [asset_id]);
        if (asset.length === 0) return res.status(404).json({ message: "Asset not found" });

        // Check if user is maintenance staff
        const [staff] = await pool.query("SELECT * FROM users WHERE id = ? AND role = 'Maintenance'", [maintenance_by]);
        if (staff.length === 0) return res.status(400).json({ message: "Invalid maintenance staff" });

        const [result] = await pool.query(
            "INSERT INTO maintenance_records (asset_id, maintenance_by, maintenance_type, description, status) VALUES (?, ?, ?, ?, 'Pending')",
            [asset_id, maintenance_by, maintenance_type, description || null]
        );

        // Update asset status
        await pool.query("UPDATE assets SET status = 'Under Maintenance' WHERE id = ?", [asset_id]);

        res.status(201).json({ message: "Maintenance record created", id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// PUT update maintenance record (Maintenance Staff)
router.put("/:id", verifyToken, async (req, res) => {
    const { status, description } = req.body;
    const { id } = req.params;

    try {
        const [record] = await pool.query("SELECT * FROM maintenance_records WHERE id = ?", [id]);
        if (record.length === 0) return res.status(404).json({ message: "Record not found" });

        if (req.user.role === "Maintenance") {
            if (record[0].maintenance_by !== req.user.id) {
                return res.status(403).json({ message: "Access denied" });
            }
        } else if (!["Super Admin", "Supervisor"].includes(req.user.role)) {
            return res.status(403).json({ message: "Access denied" });
        }

        await pool.query(
            "UPDATE maintenance_records SET status = ?, description = ? WHERE id = ?",
            [status, description, id]
        );

        // If completed, update asset status to Available
        if (status === "Completed") {
            await pool.query("UPDATE assets SET status = 'Available' WHERE id = ?", [record[0].asset_id]);
        }

        res.json({ message: "Maintenance record updated" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// DELETE maintenance record (Admin only)
router.delete("/:id", verifyToken, async (req, res) => {
    if (req.user.role !== "Super Admin") {
        return res.status(403).json({ message: "Access denied" });
    }

    try {
        await pool.query("DELETE FROM maintenance_records WHERE id = ?", [req.params.id]);
        res.json({ message: "Maintenance record deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
