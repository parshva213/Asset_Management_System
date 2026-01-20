import express from "express";
import pool from "../config/database.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// GET all purchase orders (filtered by role)
router.get("/", verifyToken, async (req, res) => {
    try {
        let query = `
      SELECT po.*, u.name as supervisor_name, v.name as vendor_name, a.name as admin_name
      FROM purchase_orders po
      LEFT JOIN users u ON po.supervisor_id = u.id
      LEFT JOIN users v ON po.vendor_id = v.id
      LEFT JOIN users a ON po.admin_id = a.id
    `;
        const params = [];

        if (req.user.role === "Vendor") {
            query += " WHERE po.vendor_id = ?";
            params.push(req.user.id);
        } else if (req.user.role === "Supervisor") {
            query += " WHERE po.supervisor_id = ?";
            params.push(req.user.id);
        }

        query += " ORDER BY po.id ASC";

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// POST create purchase order (Supervisor only)
router.post("/", verifyToken, async (req, res) => {
    if (req.user.role !== "Supervisor") {
        return res.status(403).json({ message: "Only Supervisors can create purchase orders" });
    }

    const { vendor_id, asset_name, quantity, quote } = req.body;

    if (!vendor_id || !asset_name || !quantity) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        const [result] = await pool.query(
            "INSERT INTO purchase_orders (supervisor_id, vendor_id, asset_name, quantity, quote) VALUES (?, ?, ?, ?, ?)",
            [req.user.id, vendor_id, asset_name, quantity, quote || null]
        );
        res.status(201).json({ message: "Purchase order created", id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// PUT update status (Admin or Vendor)
router.put("/:id/status", verifyToken, async (req, res) => {
    const { status, quote } = req.body;
    const { id } = req.params;

    try {
        const [po] = await pool.query("SELECT * FROM purchase_orders WHERE id = ?", [id]);
        if (po.length === 0) return res.status(404).json({ message: "Purchase order not found" });

        if (req.user.role === "Vendor") {
            if (po[0].vendor_id !== req.user.id) return res.status(403).json({ message: "Access denied" });
            // Vendors can only update status to 'Quoted' or 'Delivered' and provide a quote
            if (!["Quoted", "Delivered"].includes(status)) {
                return res.status(400).json({ message: "Invalid status for Vendor" });
            }

            let query = "UPDATE purchase_orders SET status = ?";
            const params = [status];

            if (quote) {
                query += ", quote = ?";
                params.push(quote);
            }

            query += " WHERE id = ?";
            params.push(id);

            await pool.query(query, params);

        } else if (req.user.role === "Super Admin") {
            // Admins can Approve or Reject
            if (!["Approved", "Rejected"].includes(status)) {
                return res.status(400).json({ message: "Invalid status for Admin" });
            }
            await pool.query("UPDATE purchase_orders SET status = ?, admin_id = ? WHERE id = ?", [status, req.user.id, id]);
        } else {
            return res.status(403).json({ message: "Access denied" });
        }

        res.json({ message: "Purchase order updated" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// DELETE purchase order (Admin only)
router.delete("/:id", verifyToken, async (req, res) => {
    if (req.user.role !== "Super Admin") {
        return res.status(403).json({ message: "Access denied" });
    }

    try {
        await pool.query("DELETE FROM purchase_orders WHERE id = ?", [req.params.id]);
        res.json({ message: "Purchase order deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
