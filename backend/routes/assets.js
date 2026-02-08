import express from "express";
const router = express.Router();
import pool from "../config/database.js"; // use pool for DB connection
import { verifyToken as authenticateToken } from "../middleware/auth.js"; // JWT auth middleware
import { generateSerialNumbers } from "../utils/serialNumberUtils.js";

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
      query = "SELECT name, count(*) as count FROM assets WHERE category_id IN (SELECT id FROM categories WHERE org_id = ?) GROUP BY name ORDER BY id ASC";
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
    quantity,
    category_id,
    location_id,
    asset_type,
    purchase_date,
    warranty_expiry,
    purchase_cost,
    room_id
  } = req.body;

  try {
    // Basic validation
    if (!name || !asset_type) {
      return res.status(400).json({ message: "Missing required fields" });
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
      const [rms] = await pool.query("SELECT id FROM rooms WHERE id=?", [room_id]);
      if (rms.length === 0) return res.status(400).json({ message: "Invalid room" });
    }
    const qty = parseInt(quantity) || 1;
    
    // Generate Serial Number Prefix
    // Format: [FirstWordOfFullName]-[InitialsOfAssetName]-[Type]-[CatID]-[LocID]
    const firstWord = name.split(' ')[0].toUpperCase();
    const assetNameOnly = name.split(' ').slice(1).join(' ') || name; // Fallback if only one word
    const initials = (assetNameOnly || name)
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase();
    
    const typeCode = asset_type === 'Hardware' ? 'HW' : 'SW';
    const catCode = String(category_id || 0);
    const locCode = String(location_id || 0);
    const prefix = `${firstWord}-${initials}-${typeCode}-${catCode}-${locCode}`;

    // Get the last sequence number for this prefix
    const [lastRecord] = await pool.query(
        "SELECT serial_number FROM assets WHERE serial_number LIKE ? ORDER BY serial_number DESC LIMIT 1",
        [`${prefix}/%`]
    );

    let startSeq = 1;
    if (lastRecord.length > 0) {
        const lastSerial = lastRecord[0].serial_number;
        const lastSeq = parseInt(lastSerial.split('/').pop());
        if (!isNaN(lastSeq)) {
            startSeq = lastSeq + 1;
        }
    }

    const serials = generateSerialNumbers(prefix, qty, startSeq);

    const sql = `INSERT INTO assets (name, description, category_id, location_id, room_id, asset_type, purchase_date, warranty_expiry, purchase_cost, created_by, org_id, serial_number) 
                 VALUES ?`;

    const insertData = serials.map(sn => [
        name, 
        description || null, 
        category_id || null, 
        location_id || null, 
        room_id || null,
        asset_type, 
        purchase_date || null, 
        warranty_expiry || null, 
        purchase_cost || null, 
        req.user.id,
        req.user.org_id,
        sn
    ]);

    await pool.query(sql, [insertData]);
    
    res.status(201).json({ message: `${qty} assets created successfully` });
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
    quantity,
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
      `UPDATE assets SET name=?, description=?, quantity=?, category_id=?, location_id=?, room_id=?, status=?, asset_type=?, purchase_date=?, warranty_expiry=?, purchase_cost=?, assigned_to=?, assigned_by=? WHERE id=?`,
      [name, description || null, quantity || null, category_id || null, location_id || null, room_id || null, status || null, asset_type, purchase_date || null, warranty_expiry || null, purchase_cost || null, assigned_to || null, assigned_by || null, req.params.id]
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

