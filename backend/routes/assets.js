import express from "express";
const router = express.Router();
import pool from "../config/database.js"; // use pool for DB connection
import { verifyToken as authenticateToken } from "../middleware/auth.js"; // JWT auth middleware

// GET all assets
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { status, location_id, category_id, room_id } = req.query;
    let query = "SELECT * FROM assets";
    let params = [];
    let whereClauses = [];

    // All roles (except maybe SD but that's handled elsewhere) 
    // should be restricted by their organization's categories
    if (req.user.role !== "Software Developer") {
        whereClauses.push("category_id IN (SELECT id FROM categories WHERE org_id = ?)");
        params.push(req.user.org_id);
    }

    if (status) {
        whereClauses.push("status = ?");
        params.push(status);
    }
    if (location_id) {
        whereClauses.push("location_id = ?");
        params.push(location_id);
    }
    if (category_id) {
        whereClauses.push("category_id = ?");
        params.push(category_id);
    }
    if (room_id) {
        whereClauses.push("room_id = ?");
        params.push(room_id);
    }

    if (whereClauses.length > 0) {
        query += " WHERE " + whereClauses.join(" AND ");
    }

    // Special Case: Super Admin viewing grouped summary if NO query params 
    // (This was original intent from user's earlier code, but might interfere with generic GET)
    // Actually, looking at the code, the original intent was:
    // query = "SELECT *,count(*) as count FROM assets where category_id in (select id from categories where org_id = ?) ORDER BY id ASC Group by name";
    // If we want to keep that exact behavior when NO params:
    if (req.user.role === "Super Admin" && Object.keys(req.query).length === 0) {
      query = "SELECT *, count(*) as count FROM assets WHERE category_id IN (SELECT id FROM categories WHERE org_id = ?) GROUP BY name ORDER BY id ASC";
      params = [req.user.org_id];
    } else {
      query += " ORDER BY id ASC";
    }

    const [result] = await pool.query(query, params);
    res.json(result);

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
    room_id,
    status,
    asset_type,
    purchase_date,
    warranty_expiry,
    purchase_cost,
    assigned_to,
    assigned_by,
    created_by
  } = req.body;

  try {
    // Basic validation
    if (!name || !asset_type) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (asset_type === "Hardware" && !serial_number) {
      return res.status(400).json({ message: "Serial number is required for hardware" });
    }

    // Foreign key checks (category_id/location_id/room_id/assigned_to/assigned_by/created_by may be null)
    if (category_id) {
      const [cats] = await pool.query("SELECT id FROM categories WHERE id=?", [category_id]);
      if (cats.length === 0) return res.status(400).json({ message: "Invalid category" });
    }
    if (location_id) {
      const [locs] = await pool.query("SELECT id FROM locations WHERE id=?", [location_id]);
      if (locs.length === 0) return res.status(400).json({ message: "Invalid location" });
    }
    if (room_id) {
      const [rooms] = await pool.query("SELECT id FROM rooms WHERE id=?", [room_id]);
      if (rooms.length === 0) return res.status(400).json({ message: "Invalid room" });
    }
    if (assigned_to) {
      const [users] = await pool.query("SELECT id FROM users WHERE id=?", [assigned_to]);
      if (users.length === 0) return res.status(400).json({ message: "Invalid assigned_to user" });
    }
    if (assigned_by) {
      const [users] = await pool.query("SELECT id FROM users WHERE id=?", [assigned_by]);
      if (users.length === 0) return res.status(400).json({ message: "Invalid assigned_by user" });
    }
    if (created_by) {
      const [users] = await pool.query("SELECT id FROM users WHERE id=?", [created_by]);
      if (users.length === 0) return res.status(400).json({ message: "Invalid created_by user" });
    }

    const [result] = await pool.query(
      `INSERT INTO assets (name, description, serial_number, category_id, location_id, room_id, status, asset_type, purchase_date, warranty_expiry, purchase_cost, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description || null, serial_number || null, category_id || null, location_id || null, room_id || null, status || 'Available', asset_type, purchase_date || null, warranty_expiry || null, purchase_cost || null, created_by || req.user.id]
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
    room_id,
    status,
    asset_type,
    purchase_date,
    warranty_expiry,
    purchase_cost,
    assigned_to,
    assigned_by
  } = req.body;

  try {
    // Foreign key checks (category_id/location_id/room_id/assigned_to/assigned_by may be null)
    if (category_id) {
      const [cats] = await pool.query("SELECT id FROM categories WHERE id=?", [category_id]);
      if (cats.length === 0) return res.status(400).json({ message: "Invalid category" });
    }
    if (location_id) {
      const [locs] = await pool.query("SELECT id FROM locations WHERE id=?", [location_id]);
      if (locs.length === 0) return res.status(400).json({ message: "Invalid location" });
    }
    if (room_id) {
      const [rooms] = await pool.query("SELECT id FROM rooms WHERE id=?", [room_id]);
      if (rooms.length === 0) return res.status(400).json({ message: "Invalid room" });
    }
    if (assigned_to) {
      const [users] = await pool.query("SELECT id FROM users WHERE id=?", [assigned_to]);
      if (users.length === 0) return res.status(400).json({ message: "Invalid assigned_to user" });
    }
    if (assigned_by) {
      const [users] = await pool.query("SELECT id FROM users WHERE id=?", [assigned_by]);
      if (users.length === 0) return res.status(400).json({ message: "Invalid assigned_by user" });
    }

    await pool.query(
      `UPDATE assets SET name=?, description=?, serial_number=?, category_id=?, location_id=?, room_id=?, status=?, asset_type=?, purchase_date=?, warranty_expiry=?, purchase_cost=?, assigned_to=?, assigned_by=? WHERE id=?`,
      [name, description || null, serial_number || null, category_id || null, location_id || null, room_id || null, status || null, asset_type, purchase_date || null, warranty_expiry || null, purchase_cost || null, assigned_to || null, assigned_by || null, req.params.id]
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

