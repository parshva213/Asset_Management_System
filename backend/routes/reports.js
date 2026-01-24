import express from "express";
import db from "../config/database.js";
import { verifyToken } from "../middleware/auth.js";
const router = express.Router();

// ==================== EMPLOYEE ROUTES ====================

// GET - Employee/Supervisor own details with location and room
router.get("/my-details", verifyToken, async (req, res) => {
  try {
    if (!["Employee", "Supervisor"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied. Only employees and supervisors can access this." });
    }

    const [employee] = await db.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.phone,
        u.department,
        u.role,
        u.ownpk,
        l.id as location_id,
        l.name as location_name,
        l.address as location_address,
        r.id as room_id,
        r.name as room_name,
        r.floor,
        r.capacity,
        COUNT(DISTINCT a.id) as total_assets,
        (SELECT COUNT(*) FROM assets WHERE assigned_to = u.id AND status = 'Assigned') as assigned_assets,
        (SELECT COUNT(*) FROM assets WHERE assigned_to = u.id AND status = 'Available') as available_assets
      FROM users u
      LEFT JOIN locations l ON u.loc_id = l.id
      LEFT JOIN rooms r ON u.room_id = r.id
      LEFT JOIN assets a ON u.id = a.assigned_to
      WHERE u.id = ?
      GROUP BY u.id
    `, [req.user.id]);

    if (employee.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(employee[0]);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET - Employee's assets with details
router.get("/my-assets", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "Employee") {
      return res.status(403).json({ message: "Access denied. Only employees can access this." });
    }

    const [assets] = await db.query(`
      SELECT 
        a.id,
        a.name,
        a.description,
        a.serial_number,
        a.status,
        a.asset_type,
        c.name as category,
        l.name as location_name,
        r.name as room_name,
        u_supervisor.name as supervised_by
      FROM assets a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN locations l ON a.location_id = l.id
      LEFT JOIN rooms r ON a.room_id = r.id
      LEFT JOIN users u_supervisor ON a.assigned_by = u_supervisor.id
      WHERE a.assigned_to = ?
      ORDER BY a.name ASC
    `, [req.user.id]);

    res.json(assets);
  } catch (error) {
    console.error("Error fetching employee assets:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ==================== SUPERVISOR ROUTES ====================

// GET - All employees assigned to this supervisor
router.get("/supervisor/my-employees", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "Supervisor") {
      return res.status(403).json({ message: "Access denied. Only supervisors can access this." });
    }

    const [employees] = await db.query(`
      SELECT DISTINCT
        u.id,
        u.name,
        u.email,
        u.phone,
        u.department,
        u.role,
        l.id as location_id,
        l.name as location_name,
        r.id as room_id,
        r.name as room_name,
        r.floor,
        (SELECT COUNT(*) FROM assets WHERE assigned_to = u.id) as total_assets,
        (SELECT COUNT(*) FROM assets WHERE assigned_to = u.id AND status = 'Assigned') as assigned_assets,
        (SELECT COUNT(*) FROM assets WHERE assigned_to = u.id AND status = 'Available') as available_assets
      FROM users u
      LEFT JOIN locations l ON u.loc_id = l.id
      LEFT JOIN rooms r ON u.room_id = r.id
      WHERE u.role = 'Employee' AND u.org_id = ?
      ORDER BY u.name ASC
    `, [req.user.org_id]);

    res.json(employees);
  } catch (error) {
    console.error("Error fetching supervisor's employees:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET - Specific employee details with all assets for supervisor
router.get("/supervisor/employee/:employeeId/details", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "Supervisor") {
      return res.status(403).json({ message: "Access denied. Only supervisors can access this." });
    }

    const { employeeId } = req.params;

    // Get employee details
    const [employee] = await db.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.phone,
        u.department,
        u.role,
        l.id as location_id,
        l.name as location_name,
        l.address as location_address,
        r.id as room_id,
        r.name as room_name,
        r.floor,
        r.capacity,
        COUNT(DISTINCT a.id) as total_assets
      FROM users u
      LEFT JOIN locations l ON u.loc_id = l.id
      LEFT JOIN rooms r ON u.room_id = r.id
      LEFT JOIN assets a ON u.id = a.assigned_to AND a.assigned_by = ?
      WHERE u.id = ? AND u.role = 'Employee'
      GROUP BY u.id
    `, [req.user.id, employeeId]);

    if (employee.length === 0) {
      return res.status(404).json({ message: "Employee not found or not under your supervision" });
    }

    // Get employee's assets
    const [assets] = await db.query(`
      SELECT 
        a.id,
        a.name,
        a.description,
        a.serial_number,
        a.status,
        a.asset_type,
        c.name as category,
        l.name as location_name,
        r.name as room_name
      FROM assets a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN locations l ON a.location_id = l.id
      LEFT JOIN rooms r ON a.room_id = r.id
      WHERE a.assigned_to = ? AND a.assigned_by = ?
      ORDER BY a.name ASC
    `, [employeeId, req.user.id]);

    res.json({
      employee: employee[0],
      assets: assets,
      assetCount: assets.length,
    });
  } catch (error) {
    console.error("Error fetching employee details:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE - Employee's location and room (can be done by admin or supervisor)
router.put("/employee/:employeeId/location", verifyToken, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { location_id, room_id } = req.body;

    // Check authorization (Super Admin or the Supervisor assigned to this employee)
    const [employee] = await db.query(
      "SELECT id, loc_id FROM users WHERE id = ?",
      [employeeId]
    );

    if (employee.length === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    if (req.user.role !== "Super Admin") {
      // Check if this supervisor has any assets assigned to this employee
      const [hasAssets] = await db.query(
        "SELECT COUNT(*) as count FROM assets WHERE assigned_to = ? AND assigned_by = ?",
        [employeeId, req.user.id]
      );

      if (hasAssets[0].count === 0 && req.user.role !== "Super Admin") {
        return res.status(403).json({ message: "Access denied. Employee not under your supervision." });
      }
    }

    // Validate location and room if provided
    if (location_id) {
      const [location] = await db.query("SELECT id FROM locations WHERE id = ? AND org_id = ?", [
        location_id,
        req.user.org_id,
      ]);
      if (location.length === 0) {
        return res.status(400).json({ message: "Location not found in your organization" });
      }
    }

    if (room_id) {
      const [room] = await db.query("SELECT id, location_id FROM rooms WHERE id = ?", [room_id]);
      if (room.length === 0) {
        return res.status(400).json({ message: "Room not found" });
      }
      // Verify room belongs to location if both are provided
      if (location_id && room[0].location_id !== location_id) {
        return res.status(400).json({ message: "Room does not belong to the specified location" });
      }
    }

    // Update employee's location and room
    await db.query("UPDATE users SET loc_id = ?, room_id = ? WHERE id = ?", [
      location_id || null,
      room_id || null,
      employeeId,
    ]);

    // Return updated employee details
    const [updated] = await db.query(`
      SELECT 
        u.id,
        u.name,
        l.id as location_id,
        l.name as location_name,
        r.id as room_id,
        r.name as room_name
      FROM users u
      LEFT JOIN locations l ON u.loc_id = l.id
      LEFT JOIN rooms r ON u.room_id = r.id
      WHERE u.id = ?
    `, [employeeId]);

    res.json({
      message: "Employee location/room updated successfully",
      employee: updated[0],
    });
  } catch (error) {
    console.error("Error updating employee location:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ==================== ROOM REGISTRATION ROUTES ====================

// GET - All locations with rooms for organization
router.get("/locations-and-rooms", verifyToken, async (req, res) => {
  try {
    if (!["Employee", "Supervisor"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied. Only employees and supervisors can access this." });
    }

    const [locations] = await db.query(`
      SELECT 
        l.id,
        l.name,
        l.address,
        l.org_id
      FROM locations l
      WHERE l.org_id = ?
      ORDER BY l.name ASC
    `, [req.user.org_id]);

    // For each location, get rooms with details
    const locationsWithRooms = await Promise.all(
      locations.map(async (location) => {
        const [rooms] = await db.query(`
          SELECT 
            r.id,
            r.name,
            r.floor,
            r.capacity,
            (SELECT COUNT(*) FROM users WHERE room_id = r.id) as current_occupancy
          FROM rooms r
          WHERE r.location_id = ?
          ORDER BY r.name ASC
        `, [location.id]);

        return {
          ...location,
          rooms: rooms
        };
      })
    );

    res.json(locationsWithRooms);
  } catch (error) {
    console.error("Error fetching locations and rooms:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST - Register employee to room with supervisor key verification
router.post("/register-to-room", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "Employee") {
      return res.status(403).json({ message: "Access denied. Only employees can register." });
    }

    const { room_id, supervisor_key } = req.body;

    if (!room_id || !supervisor_key) {
      return res.status(400).json({ message: "Room ID and supervisor key are required." });
    }

    // Get room details
    const [room] = await db.query(`
      SELECT r.*, (SELECT COUNT(*) FROM users WHERE room_id = r.id) as current_occupancy
      FROM rooms r
      WHERE r.id = ?
    `, [room_id]);

    if (room.length === 0) {
      return res.status(404).json({ message: "Room not found." });
    }

    const roomData = room[0];

    // Check if room is full
    if (roomData.current_occupancy >= roomData.capacity) {
      return res.status(400).json({ 
        message: `Room is full. Capacity: ${roomData.capacity}, Current occupancy: ${roomData.current_occupancy}` 
      });
    }

    // Verify supervisor key - check if it matches ANY supervisor's ownpk in the organization
    const [supervisor] = await db.query(`
      SELECT u.id, u.name FROM users u 
      WHERE u.ownpk = ? AND u.role = 'Supervisor' AND u.org_id = ?
      LIMIT 1
    `, [supervisor_key, req.user.org_id]);

    if (supervisor.length === 0) {
      return res.status(403).json({ message: "Invalid supervisor key. Please verify with your supervisor." });
    }

    // Update employee's location and room
    await db.query(`
      UPDATE users 
      SET loc_id = ?, room_id = ?
      WHERE id = ?
    `, [roomData.location_id, room_id, req.user.id]);

    res.json({
      success: true,
      message: "Successfully registered to room.",
      room: {
        id: roomData.id,
        name: roomData.name,
        floor: roomData.floor,
        capacity: roomData.capacity,
        location_id: roomData.location_id
      }
    });
  } catch (error) {
    console.error("Error registering to room:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ==================== ASSET ASSIGNMENT ROUTES ====================

// GET - Available assets for assignment (not yet assigned or available)
router.get("/available-assets", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "Supervisor") {
      return res.status(403).json({ message: "Access denied. Only supervisors can access this." });
    }

    const [assets] = await db.query(`
      SELECT 
        a.id,
        a.name,
        a.serial_number,
        c.name as category_name,
        a.status,
        a.assigned_to
      FROM assets a
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE (a.status = 'Available' OR a.assigned_to IS NULL)
      AND a.org_id = ?
      ORDER BY a.name ASC
    `, [req.user.org_id]);

    res.json(assets);
  } catch (error) {
    console.error("Error fetching available assets:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST - Assign asset to employee
router.post("/assign-asset", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "Supervisor") {
      return res.status(403).json({ message: "Access denied. Only supervisors can assign assets." });
    }

    const { asset_id, employee_id } = req.body;

    if (!asset_id || !employee_id) {
      return res.status(400).json({ message: "Asset ID and Employee ID are required." });
    }

    // Verify asset exists and is available
    const [asset] = await db.query(`
      SELECT * FROM assets WHERE id = ? AND org_id = ?
    `, [asset_id, req.user.org_id]);

    if (asset.length === 0) {
      return res.status(404).json({ message: "Asset not found or not in your organization." });
    }

    if (asset[0].assigned_to !== null && asset[0].status === 'Assigned') {
      return res.status(400).json({ message: "This asset is already assigned." });
    }

    // Verify employee exists and is in same organization
    const [employee] = await db.query(`
      SELECT id FROM users WHERE id = ? AND org_id = ? AND role = 'Employee'
    `, [employee_id, req.user.org_id]);

    if (employee.length === 0) {
      return res.status(404).json({ message: "Employee not found or not in your organization." });
    }

    // Assign asset
    await db.query(`
      UPDATE assets 
      SET assigned_to = ?, assigned_by = ?, status = 'Assigned'
      WHERE id = ?
    `, [employee_id, req.user.id, asset_id]);

    res.json({
      success: true,
      message: "Asset assigned successfully.",
      asset: {
        id: asset[0].id,
        name: asset[0].name,
        assigned_to: employee_id
      }
    });
  } catch (error) {
    console.error("Error assigning asset:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET - Count of assigned assets for an employee
router.get("/employee/:employeeId/asset-count", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "Supervisor") {
      return res.status(403).json({ message: "Access denied." });
    }

    const { employeeId } = req.params;

    const [result] = await db.query(`
      SELECT 
        COUNT(*) as total_assets,
        SUM(CASE WHEN status = 'Assigned' THEN 1 ELSE 0 END) as assigned_assets
      FROM assets 
      WHERE assigned_to = ?
    `, [employeeId]);

    res.json(result[0]);
  } catch (error) {
    console.error("Error fetching asset count:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
