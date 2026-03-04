import express from "express";
import db from "../config/database.js";
import { verifyToken } from "../middleware/auth.js";
const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  try {
    if (req.user.role === "Employee" || req.user.role === "Maintenance" || req.user.role === "Vendor") {
      return res.status(403).json({ message: "Access denied" })
    }

    const [currentUserRows] = await db.execute("SELECT org_id, ownpk, role FROM users WHERE id = ?", [req.user.id]);
    const currentUser = currentUserRows[0];
    const org_id = currentUser?.org_id;
    if (!org_id) {
      return res.status(403).json({ message: "Access denied" })
    }

    let { location_id, room_id } = req.query;
    location_id = location_id ? parseInt(location_id) : null;
    room_id = room_id ? parseInt(room_id) : null;
    console.log("location_id: ", location_id, "room_id: ", room_id);

    let query = `
      SELECT u.id, u.name, u.email, u.role, u.department, u.phone, u.status, u.loc_id, u.room_id, l.name as location_name, r.name as room_name, u.created_at,
             GROUP_CONCAT(CONCAT(a.id, ':', a.name, ':', a.serial_number, ':', COALESCE(asum.quantity, 0), ':', COALESCE(asum.assigned_total, 0), ':', COALESCE(asum.available_total, 0)) SEPARATOR '|') AS assigned_assets_raw
      FROM users u
      LEFT JOIN locations l ON u.loc_id = l.id
      LEFT JOIN rooms r ON u.room_id = r.id
      LEFT JOIN asset_assignments aa ON u.id = aa.assigned_to AND aa.unassigned_at IS NULL
      LEFT JOIN assets a ON aa.asset_id = a.id
      LEFT JOIN (
        SELECT name, location_id, COUNT(*) as quantity, SUM(status = 'Assigned') as assigned_total, SUM(status = 'Available') as available_total
        FROM assets
        GROUP BY name, location_id
      ) asum ON a.name = asum.name AND a.location_id = asum.location_id
      WHERE 1=1
    `;
    let params = [];

    // Filter by Organization (for Super Admin and everyone else within intent)
    if (org_id) {
      query += " AND u.org_id = ?";
      params.push(org_id);
    }

    if (req.user.role === "Super Admin") {
      if (room_id && location_id) {
        query += " AND u.room_id = ? AND u.loc_id = ? AND u.role in ('Employee', 'Supervisor')";
        params.push(room_id, location_id);
      } else if (location_id) {
        query += " AND u.loc_id = ? AND u.role = 'Maintenance'";
        params.push(location_id);
      } else {
        query += " AND u.role = 'Maintenance'";
      }
    } else if (req.user.role === "Supervisor") {
      // Supervisor can only see employees whose unpk matches supervisor's ownpk
      if (currentUser?.ownpk) {
        query += " AND u.unpk = ? AND u.role = 'Employee'";
        params.push(currentUser.ownpk);
      } else {
        // If supervisor has no ownpk, show no employees
        query += " AND 1=0";
        return res.status(403).json({ message: "Access denied or supervisor PK not found" });
      }
    }

    query += " GROUP BY u.id, u.name, u.email, u.role, u.department, u.phone, u.loc_id, l.name, u.created_at ORDER BY u.id ASC";

    const [users] = await db.execute(query, params);

    const usersWithAssets = users.map((u) => {
      const assigned_assets = [];
      if (u.assigned_assets_raw) {
        // Use a Set to avoid double counting if duplicate joins occur (though GROUP BY u.id should handle it)
        const assetsSeen = new Set();
        u.assigned_assets_raw.split('|').forEach(str => {
          if (!assetsSeen.has(str)) {
            assetsSeen.add(str);
            const bits = str.split(':');
            const id = bits[0];
            const name = bits[1];
            const sn = bits[2];
            const qty = bits[3];
            const assigned = bits[4];
            const available = bits[5];
            if (id) {
                assigned_assets.push({ 
                    id: parseInt(id), 
                    name, 
                    serial_number: sn,
                    quantity: parseInt(qty) || 0,
                    assign: parseInt(assigned) || 0,
                    available: parseInt(available) || 0
                });
            }
          }
        });
      }
      return { ...u, assigned_assets, assigned_assets_raw: undefined };
    });

    res.json(usersWithAssets)
  } catch (error) {
    console.error("Error fetching users:", error)
    res.status(500).json({ message: "Server error" })
  }
})

router.get("/:role", verifyToken, async (req, res) => {
  try {
    if (req.user.role === "Employee" || req.user.role === "Maintenance" || req.user.role === "Vendor") {
      return res.status(403).json({ message: "Access denied" })
    }
    let { role } = req.params;
    let query = `
      SELECT u.id, u.name, u.email, u.role, u.department, u.phone, u.status, u.loc_id, u.room_id, l.name as location_name, r.name as room_name, u.created_at,
             GROUP_CONCAT(CONCAT(a.id, ':', a.name, ':', a.serial_number, ':', COALESCE(asum.quantity, 0), ':', COALESCE(asum.assigned_total, 0), ':', COALESCE(asum.available_total, 0)) SEPARATOR '|') AS assigned_assets_raw
      FROM users u
      LEFT JOIN locations l ON u.loc_id = l.id
      LEFT JOIN rooms r ON u.room_id = r.id
      LEFT JOIN asset_assignments aa ON u.id = aa.assigned_to AND aa.unassigned_at IS NULL
      LEFT JOIN assets a ON aa.asset_id = a.id
      LEFT JOIN (
        SELECT name, location_id, COUNT(*) as quantity, SUM(status = 'Assigned') as assigned_total, SUM(status = 'Available') as available_total
        FROM assets
        GROUP BY name, location_id
      ) asum ON a.name = asum.name AND a.location_id = asum.location_id
    `;
    let params = [];

    if (role === "Vendor") {
      query += `
        LEFT JOIN vendor_org vo ON vo.vendor_id = u.id
        LEFT JOIN organizations o ON o.v_opk = vo.org_key
        WHERE o.id = ?
      `;
      params.push(req.user.org_id);
    } else {
      query += " WHERE u.role = ? AND u.org_id = ?";
      params.push(role, req.user.org_id);

      if (req.query.location_id) {
        query += " AND u.loc_id = ?";
        params.push(req.query.location_id);
      } else {
        query += " AND u.loc_id IS NULL";
      }
    }

    query += " GROUP BY u.id, u.name, u.email, u.role, u.department, u.phone, u.loc_id, l.name, u.created_at ORDER BY u.id ASC";

    const [users] = await db.execute(query, params);

    const usersWithAssets = users.map((u) => {
      const assigned_assets = [];
      if (u.assigned_assets_raw) {
        const assetsSeen = new Set();
        u.assigned_assets_raw.split('|').forEach(str => {
          if (!assetsSeen.has(str)) {
            assetsSeen.add(str);
            const bits = str.split(':');
            const id = bits[0];
            const name = bits[1];
            const sn = bits[2];
            const qty = bits[3];
            const assigned = bits[4];
            const available = bits[5];
            if (id) {
                assigned_assets.push({ 
                    id: parseInt(id), 
                    name, 
                    serial_number: sn,
                    quantity: parseInt(qty) || 0,
                    assign: parseInt(assigned) || 0,
                    available: parseInt(available) || 0
                });
            }
          }
        });
      }
      return { ...u, assigned_assets, assigned_assets_raw: undefined };
    });

    res.json(usersWithAssets)
  } catch (error) {
    console.error("Error fetching maintenance users:", error)
    res.status(500).json({ message: "Server error" })
  }
})

router.post("/assign-asset", verifyToken, async (req, res) => {
  const conn = await db.getConnection();
  try {
    if (req.user.role === "Employee") {
      return res.status(403).json({ message: "Access denied" })
    }

    const { user_id, asset_id, asset_name, location_id, quantity, notes } = req.body

    // Validate required parameters
    if (!user_id) {
      return res.status(400).json({ message: "user_id is required" });
    }

    const parsedQty = Math.max(1, parseInt(quantity, 10) || 1);

    await conn.query('START TRANSACTION');

    const rollbackAndRespond = async (statusCode, payload) => {
      await conn.query('ROLLBACK');
      return res.status(statusCode).json(payload);
    };

    // 1. Validate target user and fetch room for assignment
    const [userRows] = await conn.execute(
      "SELECT id, org_id, role, room_id FROM users WHERE id = ?",
      [user_id]
    );
    if (userRows.length === 0) {
      return rollbackAndRespond(404, { message: "User not found" });
    }
    const targetUser = userRows[0];

    if (String(targetUser.org_id) !== String(req.user.org_id)) {
      return rollbackAndRespond(403, { message: "Access denied" });
    }

    if (req.user.role === "Supervisor") {
      const [supervisorRows] = await conn.execute("SELECT room_id FROM users WHERE id = ?", [req.user.id]);
      const supervisorRoomId = supervisorRows[0]?.room_id;
      if (!supervisorRoomId || String(supervisorRoomId) !== String(targetUser.room_id) || targetUser.role !== "Employee") {
        return rollbackAndRespond(403, { message: "Access denied" });
      }
    }

    const userRoomId = targetUser.room_id || null;

    // 2. Resolve which asset IDs to assign
    let assetIdsToAssign = [];

    if (asset_id) {
      const [singleAssetRows] = await conn.execute(
        `
          SELECT a.id
          FROM assets a
          LEFT JOIN asset_assignments aa
            ON aa.asset_id = a.id
            AND aa.unassigned_at IS NULL
            AND aa.unassigned_by IS NULL
          WHERE a.id = ? AND a.org_id = ? AND a.status = 'Available' AND aa.id IS NULL
          LIMIT 1
        `,
        [asset_id, req.user.org_id]
      );

      if (singleAssetRows.length === 0) {
        return rollbackAndRespond(400, { message: "Asset is not available for assignment" });
      }

      assetIdsToAssign = [parseInt(asset_id, 10)];
    } else {
      if (!asset_name || !location_id) {
        return rollbackAndRespond(400, {
          message: "Provide either asset_id or asset_name with location_id for quantity assignment"
        });
      }

      const parsedLocationId = parseInt(location_id, 10);
      if (!Number.isInteger(parsedLocationId) || parsedLocationId <= 0) {
        return rollbackAndRespond(400, { message: "Invalid location_id" });
      }

      // MySQL prepared statements can fail with parameterized LIMIT on some setups,
      // so keep LIMIT as a validated integer literal.
      const [availableRows] = await conn.query(
        `
          SELECT a.id
          FROM assets a
          LEFT JOIN asset_assignments aa
            ON aa.asset_id = a.id
            AND aa.unassigned_at IS NULL
            AND aa.unassigned_by IS NULL
          WHERE
            a.org_id = ?
            AND a.location_id = ?
            AND a.name = ?
            AND a.status = 'Available'
            AND aa.id IS NULL
          ORDER BY a.id ASC
          LIMIT ${parsedQty}
        `,
        [req.user.org_id, parsedLocationId, asset_name]
      );

      if (availableRows.length < parsedQty) {
        return rollbackAndRespond(400, {
          message: `Only ${availableRows.length} asset(s) are available for ${asset_name}`
        });
      }

      assetIdsToAssign = availableRows.map(row => row.id);
    }

    // 3. Create assignment rows
    for (const currentAssetId of assetIdsToAssign) {
      const assignmentParams = [user_id, currentAssetId, notes ?? '', req.user?.id ?? null];
      await conn.execute(
        "INSERT INTO asset_assignments (assigned_to, asset_id, description, assigned_by) VALUES (?, ?, ?, ?)",
        assignmentParams
      );
    }

    // 4. Update assets status and room
    const placeholders = assetIdsToAssign.map(() => "?").join(", ");
    await conn.execute(
      `UPDATE assets SET status = 'Assigned', room_id = ? WHERE id IN (${placeholders})`,
      [userRoomId, ...assetIdsToAssign]
    );

    await conn.query('COMMIT');
    res.json({
      message: "Asset assigned successfully",
      assigned_count: assetIdsToAssign.length,
      asset_ids: assetIdsToAssign
    })
  } catch (error) {
    if (conn) await conn.query('ROLLBACK');
    console.error("Error assigning asset:", error)
    res.status(500).json({ message: "Server error" })
  } finally {
    if (conn) conn.release();
  }
})

router.post("/unassign-asset", verifyToken, async (req, res) => {
  try {
    if (req.user.role === "Employee") {
      return res.status(403).json({ message: "Access denied" })
    }

    const { asset_id } = req.body

    // 1. Remove Assignment Record
    await db.execute(
      "UPDATE asset_assignments SET unassigned_by = ?, unassigned_at = CURRENT_TIMESTAMP WHERE asset_id = ? AND unassigned_at IS NULL",
      [req.user.id, asset_id]
    )

    // 2. Update Asset Status and Assigned To
    await db.execute(
      "UPDATE assets SET status = 'Available' WHERE id = ?",
      [asset_id]
    )

    res.json({ message: "Asset unassigned successfully" })
  } catch (error) {
    console.error("Error unassigning asset:", error)
    res.status(500).json({ message: "Server error" })
  }
})

router.put("/:id", verifyToken, async (req, res) => {
  let conn;
  try {
    const { loc_id, room_id } = req.body;
    conn = await db.getConnection();
    await conn.query(`START TRANSACTION`);

    let [[oldUser]] = await conn.execute(`SELECT loc_id FROM users WHERE id = ?`, [req.params.id]);
    
    // We update only what's provided, focusing on loc_id for the user request
    let updates = [];
    let params = [];
    let query = "";

    if (loc_id !== undefined) {
      updates.push("loc_id = ?");
      params.push(loc_id);
    }

    if (room_id !== undefined) {
      updates.push("room_id = ?");
      params.push(room_id);
      await conn.query("Update assets set room_id = ? where id in (select asset_id from asset_assignment where  ")
    }

    if (req.body.role !== undefined) {
      updates.push("role = ?");
      params.push(req.body.role);
    }

    if (updates.length > 0) {
      let updateQuery = "UPDATE users SET " + updates.join(", ") + " WHERE id = ?";
      params.push(req.params.id);
      await conn.execute(updateQuery, params);
    }

    // If location has changed, unassign all current assets
    if (loc_id !== undefined && oldUser && String(loc_id) !== String(oldUser.loc_id)) {
      // 1. Get all currently assigned asset IDs for this user
      const [assignments] = await conn.execute(
        "SELECT asset_id FROM asset_assignments WHERE assigned_to = ? AND unassigned_at IS NULL",
        [req.params.id]
      );

      if (assignments.length > 0) {
        const assetIds = assignments.map(a => a.asset_id);
        
        // 2. Mark assignments as ended
        await conn.execute(
          "UPDATE asset_assignments SET unassigned_by = ?, unassigned_at = CURRENT_TIMESTAMP WHERE assigned_to = ? AND unassigned_at IS NULL",
          [req.user.id, req.params.id]
        );

        // 3. Update assets status to Available
        const placeholders = assetIds.map(() => "?").join(",");
        await conn.execute(
          `UPDATE assets SET status = 'Available' WHERE id IN (${placeholders})`,
          assetIds
        );
      }
    }

    await conn.query(`COMMIT`);
    res.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    if (conn) await conn.query(`ROLLBACK`).catch(err => console.error("Rollback failed:", err));
    res.status(500).json({ message: "Server error" });
  } finally {
    if (conn) conn.release();
  }
});

export default router
