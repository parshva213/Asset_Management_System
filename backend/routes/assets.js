import express from "express";
const router = express.Router();
import pool from "../config/database.js"; // use pool for DB connection
import { verifyToken as authenticateToken } from "../middleware/auth.js"; // JWT auth middleware

// GET all assets
router.get("/", authenticateToken, async (req, res) => {
  try {
    let query = `
      SELECT a.*, c.name as category_name, l.name as location_name
      FROM assets a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN locations l ON a.location_id = l.id
    `;
    const params = [];

    if (req.user.role === "Employee") {
      query += " WHERE a.assigned_to = ?";
      params.push(req.user.id);
    }

    const [results] = await pool.query(query, params);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});

// POST new asset
router.post("/", authenticateToken, async (req, res) => {
  if (req.user.role === "Employee") {
    return res.status(403).json({ message: "Access denied" });
  }

  const {
    name,
    description,
    serial_number,
    category_id,
    location_id,
    asset_type,
    purchase_date,
    warranty_expiry
  } = req.body;

  try {
    // Basic validation
    if (!name || !asset_type) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (asset_type === "Hardware" && !serial_number) {
      return res.status(400).json({ message: "Serial number is required for hardware" });
    }

    // Foreign key checks (category_id/location_id may be null)
    if (category_id) {
      const [cats] = await pool.query("SELECT id FROM categories WHERE id=?", [category_id]);
      if (cats.length === 0) return res.status(400).json({ message: "Invalid category" });
    }
    if (location_id) {
      const [locs] = await pool.query("SELECT id FROM locations WHERE id=?", [location_id]);
      if (locs.length === 0) return res.status(400).json({ message: "Invalid location" });
    }

    const [result] = await pool.query(
      `INSERT INTO assets (name, description, serial_number, category_id, location_id, asset_type, purchase_date, warranty_expiry)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description || null, serial_number || null, category_id || null, location_id || null, asset_type, purchase_date || null, warranty_expiry || null]
    );
    res.status(201).json({ message: "Asset created", assetId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});

// PUT update asset
router.put("/:id", authenticateToken, async (req, res) => {
  if (req.user.role === "Employee") {
    return res.status(403).json({ message: "Access denied" });
  }

  const {
    name,
    description,
    serial_number,
    category_id,
    location_id,
    asset_type,
    purchase_date,
    warranty_expiry
  } = req.body;

  try {
    await pool.query(
      `UPDATE assets SET name=?, description=?, serial_number=?, category_id=?, location_id=?, asset_type=?, purchase_date=?, warranty_expiry=? WHERE id=?`,
      [name, description, serial_number, category_id, location_id, asset_type, purchase_date, warranty_expiry, req.params.id]
    );
    res.json({ message: "Asset updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});

// DELETE asset
router.delete("/:id", authenticateToken, async (req, res) => {
  if (req.user.role === "Employee") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    await pool.query("DELETE FROM assets WHERE id=?", [req.params.id]);
    res.json({ message: "Asset deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});

export default router;

