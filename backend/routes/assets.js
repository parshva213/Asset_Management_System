import express from "express";
const router = express.Router();
import pool from "../config/database.js"; // use pool for DB connection
import { verifyToken as authenticateToken } from "../middleware/auth.js"; // JWT auth middleware
import { generateSerialNumbers } from "../utils/serialNumberUtils.js";

// GET all assets
// GET all assets
router.get("/Under-Maintenance", authenticateToken, async (req, res) => {
  try {
    const [result] = await pool.query("SELECT * FROM assets WHERE status not in ('Available', 'Assigned') ");
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
})

router.get("/current-asset/:id", authenticateToken, async (req,res)=>{
  try {
    const {id} = req.params;
    let query = `
      SELECT a.*, c.name as category_name
      FROM assets a
      LEFT JOIN asset_assignments aa ON a.id =  aa.asset_id 
      LEFT JOIN users u ON  aa.assigned_to = u.id
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.org_id = ? AND aa.unassigned_by IS NULL AND u.id = ?
    `;
    const result = await pool.query(query, [req.user.org_id, id]);
    res.json(result[0]);
  } catch (error) {
    console.error('Error in /current-asset/:id:', error);
    res.status(500).json({message: "Database error"})
  }
})

router.get("/available-assets-to-assign/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(`
      SELECT 
        MIN(CASE WHEN a.status = 'Available' THEN a.id END) AS available_min_id,
        a.name,
        COUNT(*) AS total_assets,
        SUM(a.status = 'Available') AS available_assets,
        SUM(a.status = 'Assigned') AS assigned_assets
      FROM assets a
      WHERE 
        a.location_id = ?
        AND a.org_id = ?
      GROUP BY 
        a.name,
        SUBSTRING_INDEX(a.serial_number, '/', 1)
      ORDER BY 
        a.name ASC;
      `, [id, req.user.org_id]);
    res.json(result);
  } catch (error) {
    res.status(500).json({message: "Database error"})
  }
})

// GET all assets
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { status, location_id, room_id, role, detailed, name: assetName } = req.query;
    const { org_id, role: userRole, room_id: userRoomId, id: userId } = req.user;
    let query = "";
    let params = [org_id];

    // 1. Individual Asset View: Super Admin (Maintenance) or Specific Request
    if ((userRole === "Super Admin" && !location_id) || (detailed)) {
      query = `SELECT a.id, a.serial_number AS sn, a.name AS aname, a.status, a.warranty_expiry, a.purchase_cost, a.asset_type,
               c.name AS cat_name, l.name AS loc_name, r.name AS room_name, u.name AS assign_to,
               u.ownpk AS assignee_ownpk, u.unpk AS assignee_unpk
        FROM assets a
        LEFT JOIN categories c ON a.category_id = c.id
        LEFT JOIN locations l ON a.location_id = l.id
        LEFT JOIN rooms r ON a.room_id = r.id
        LEFT JOIN (
          SELECT asset_id, assigned_to, ROW_NUMBER() OVER(PARTITION BY asset_id ORDER BY id DESC) as rn
          FROM asset_assignments
        ) aa ON a.id = aa.asset_id AND aa.rn = 1
        LEFT JOIN users u ON aa.assigned_to = u.id
        WHERE a.org_id = ?`;

      if (userRole === "Super Admin" && !location_id) {
        query += " AND a.status NOT IN ('Available', 'Assigned')";
      }
      if (room_id) {
        query += " AND a.room_id = ?";
        params.push(room_id);
      }
      if (status) {
        query += " AND a.status = ?";
        params.push(status);
      }
      if (assetName) {
        query += " AND a.name = ?";
        params.push(assetName);
      }
      query += " ORDER BY a.id ASC";
    } 
    // 2. Aggregated Summary View: Used by LocationAssets page and Supervisor Dashboard
    else if (location_id) {
      query = `
        SELECT MIN(a.id) AS id, a.name, a.name AS aname, COUNT(a.id) AS quantity,
               SUM(a.status = 'Assigned') AS assigned_total, 
               SUM(a.status = 'Available') AS available_total,
               SUM(a.status IN ('Available', 'Assigned')) AS active,
               SUM(a.status NOT IN ('Available', 'Assigned')) AS not_active,
               c.name AS cat_name, MAX(a.purchase_cost) AS price, MAX(a.asset_type) AS asset_type
        FROM assets a
        LEFT JOIN categories c ON a.category_id = c.id
        WHERE a.location_id = ? AND a.org_id = ?`;
      
      params = [location_id, org_id];

      // Enforce room filtering for Supervisor or when room_id is requested
      if (userRole === "Supervisor" || room_id) {
        const targetRoomId = userRole === "Supervisor" ? (userRoomId || room_id) : room_id;
        if (targetRoomId) {
          query += " AND a.room_id = ?";
          params.push(targetRoomId);
        }
      }

      query += ` GROUP BY a.name, c.name ORDER BY a.name ASC`;
    } 
    // 3. Standard List View: Filtered by various criteria
    else {
      query = `
        SELECT a.*, u.name as assign, c.name as category_name, l.name as location_name, r.name as room_name,
               COALESCE(asum.quantity, 0) as quantity, COALESCE(asum.assigned_total, 0) as assigned_total, 
               COALESCE(asum.available_total, 0) as available_total
        FROM assets a 
        LEFT JOIN asset_assignments aa ON a.id = aa.asset_id AND aa.unassigned_at IS NULL
        LEFT JOIN users u ON aa.assigned_to = u.id
        LEFT JOIN categories c ON a.category_id = c.id
        LEFT JOIN locations l ON a.location_id = l.id
        LEFT JOIN rooms r ON a.room_id = r.id
        LEFT JOIN (
          SELECT name, location_id, org_id, COUNT(*) as quantity, 
                 SUM(status = 'Assigned') as assigned_total, SUM(status = 'Available') as available_total
          FROM assets GROUP BY name, location_id, org_id
        ) asum ON a.name = asum.name AND a.location_id = asum.location_id AND a.org_id = asum.org_id`;

      let whereClauses = ["a.org_id = ?"];
      if (userRole === "Employee") { whereClauses.push("aa.assigned_to = ?"); params.push(userId); }
      if (userRole === "Supervisor") { whereClauses.push("a.room_id = ?"); params.push(userRoomId); }
      if (status) { whereClauses.push("a.status = ?"); params.push(status); }
      if (location_id) { whereClauses.push("a.location_id = ?"); params.push(location_id); }
      if (room_id && userRole !== "Supervisor") { whereClauses.push("a.room_id = ?"); params.push(room_id); }
      if (role) { whereClauses.push("u.role = ?"); params.push(role); }

      query += " WHERE " + whereClauses.join(" AND ") + " ORDER BY a.id ASC";
    }

    const [result] = await pool.query(query, params);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});


// GET unique asset names (one per group) for "New Asset" requests
router.get("/unique-names", authenticateToken, async (req, res) => {
  try {
    const query = `
            SELECT MIN(id) as id, name, category_id, asset_type 
            FROM assets 
            WHERE org_id = ? 
            GROUP BY name, category_id, asset_type 
            ORDER BY name ASC
        `;
    const [result] = await pool.query(query, [req.user.org_id]);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});

router.get("/roomAssignData", authenticateToken, async (req, res) => {
  try {
    const { location_id, room_id } = req.query
    let query = `
      select distinct a.id, a.name as aname, u.name as uname, u.role, a.asset_type, a.serial_number, a.warranty_expiry, c.name as cat_name, a.purchase_date
      from assets a
      left join categories c on a.category_id = c.id
      join asset_assignments aa on a.id = aa.asset_id and aa.unassigned_at is null and aa.unassigned_by is null
      join users u on aa.assigned_to = u.id
      where a.status = 'Assigned' and a.org_id = ? and a.location_id = ? and a.room_id = ?
      and u.role in ('Supervisor', 'Employee')
      order by uname asc
    `;
    const [result] = await pool.query(query, [req.user.org_id, location_id, room_id]);
    res.json(result);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Database error" });
  }
})

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


export default router;

