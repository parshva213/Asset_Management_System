// DIAGNOSTIC RESTART: 404 CHECK
// import express from "express";
// import mysql from "mysql2/promise";
// import jwt from "jsonwebtoken";
// import dotenv from "dotenv";
// import cors from "cors";

// dotenv.config();
// const app = express();
// app.use(express.json());
// app.use(cors());

// ------------------ DB CONNECTION ------------------
// const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
// });

// // ------------------ JWT AUTH ------------------
// const authenticate = (roles = []) => {
//   return async (req, res, next) => {
//     const token = req.headers["authorization"]?.split(" ")[1];
//     if (!token) return res.status(401).json({ error: "Unauthorized" });

//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       req.user = decoded;

//       if (roles.length && !roles.includes(decoded.role)) {
//         return res.status(403).json({ error: "Forbidden" });
//       }

//       next();
//     } catch (err) {
//       return res.status(403).json({ error: "Invalid token" });
//     }
//   };
// };

// // ------------------ REGISTER ------------------
// app.post("/api/auth/register", async (req, res) => {
//   const { name, email, password, role, department, phone } = req.body;
//   if (!name || !email || !password || !role)
//     return res.status(400).json({ message: "All required fields must be filled" });

//   try {
//     // Check if email exists
//     const [exists] = await pool.query("SELECT * FROM users WHERE email=?", [email]);
//     if (exists.length > 0) return res.status(400).json({ message: "Email already exists" });

//     // Insert user
//     const [result] = await pool.query(
//       "INSERT INTO users (name, email, password, role, department, phone) VALUES (?, ?, ?, ?, ?, ?)",
//       [name, email, password, role, department || null, phone || null]
//     );

//     const token = jwt.sign(
//       { id: result.insertId, name, email, role },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     res.json({ message: "User registered", user: { id: result.insertId, name, email, role, department, phone }, token });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // ------------------ LOGIN ------------------
// app.post("/api/auth/login", async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const [rows] = await pool.query(
//       `SELECT id, name, email, role 
//        FROM users 
//        WHERE email=? AND password=?`,
//       [email, password]
//     );

//     if (rows.length === 0) return res.status(401).json({ message: "Invalid credentials" });

//     const user = rows[0];
//     const token = jwt.sign(
//       { id: user.id, name: user.name, email: user.email, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     res.json({ user, token });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // ------------------ GET PROFILE ------------------
// app.get("/api/auth/profile", authenticate(), async (req, res) => {
//   try {
//     const [rows] = await pool.query(
//       "SELECT id, name, email, role, department, phone FROM users WHERE id=?",
//       [req.user.id]
//     );
//     if (rows.length === 0) return res.status(404).json({ message: "User not found" });

//     res.json({ user: rows[0] });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // ------------------ ADMIN (Manage Users) ------------------
// app.get("/api/users", authenticate(["Admin"]), async (req, res) => {
//   const [rows] = await pool.query("SELECT id, name, email, role, department, phone FROM users");
//   res.json(rows);
// });

// app.post("/api/users", authenticate(["Admin"]), async (req, res) => {
//   const { name, email, password, role, department, phone } = req.body;
//   await pool.query(
//     "INSERT INTO users (name, email, password, role, department, phone) VALUES (?, ?, ?, ?, ?, ?)",
//     [name, email, password, role, department || null, phone || null]
//   );
//   res.json({ success: true });
// });

// app.put("/api/users/:id", authenticate(["Admin"]), async (req, res) => {
//   const { name, email, password, role, department, phone } = req.body;
//   await pool.query(
//     "UPDATE users SET name=?, email=?, password=?, role=?, department=?, phone=? WHERE id=?",
//     [name, email, password, role, department || null, phone || null, req.params.id]
//   );
//   res.json({ success: true });
// });

// app.delete("/api/users/:id", authenticate(["Admin"]), async (req, res) => {
//   await pool.query("DELETE FROM users WHERE id=?", [req.params.id]);
//   res.json({ success: true });
// });

// // ===================================================
// // Start Server
// // ===================================================
// app.listen(process.env.PORT || 5000, () => {
//   console.log(`Server running on port ${process.env.PORT || 5000}`);
// });





import express from "express";
import pool from "./config/database.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import assetsRouter from './routes/assets.js';
import authRouter from './routes/auth.js';
import categoriesRouter from './routes/categories.js';
import locationsRouter from './routes/locations.js';
import requestsRouter from './routes/requests.js';
import usersRouter from './routes/users.js';
import purchaseOrdersRouter from './routes/purchaseOrders.js';
import maintenanceRouter from './routes/maintenance.js';
import organizationsRouter from './routes/organizations.js';
import { generateKey } from "./utils/keyGenerator.js";
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import errorHandler from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from multiple locations (backend directory or root directory)
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });
const app = express();

// Security Middleware
app.use(helmet());
app.use(cors());

// Trust Proxy for Rate Limiting
app.set('trust proxy', 1);

// Logging Middleware
app.use(morgan('dev'));

// Rate Limiting removed

app.use(express.json());

// ------------------ DB CONNECTION ------------------
// Pool imported from config/database.js

// ------------------ JWT AUTH ------------------
const authenticate = (roles = []) => {
    return async (req, res, next) => {
        const authHeader = req.headers["authorization"];
        const token = authHeader ? authHeader.split(" ")[1] : undefined;
        if (!token) return res.status(401).json({ error: "Unauthorized" });

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;

            // Ensure org_id is present if not in token
            if (!req.user.org_id) {
                const [rows] = await pool.query("SELECT org_id FROM users WHERE id = ?", [req.user.id]);
                if (rows.length > 0) {
                    req.user.org_id = rows[0].org_id;
                }
            }

            if (roles.length && !roles.some(role => role.toLowerCase() === (req.user.role || "").toLowerCase())) {
                console.warn(`[AUTH] Forbidden: User ID ${req.user.id} has role "${req.user.role}", but endpoint requires one of: ${roles.join(", ")}`);
                return res.status(403).json({ error: "Forbidden" });
            }

            next();
        } catch (err) {
            console.error(`[AUTH] Token Verification Error: ${err.message}`);
            return res.status(403).json({ error: "Invalid token" });
        }
    };
};

// ------------------ REGISTER ------------------
// Duplicate register route removed. Using routes/auth.js instead.

// ------------------ LOGIN ------------------
// Duplicate login route removed. Using routes/auth.js instead.

// ------------------ GET PROFILE ------------------
// Duplicate profile route removed. Using routes/auth.js instead.

// ------------------ DASHBOARD ------------------
app.get("/api/dashboard", authenticate(), async (req, res) => {
    try {
        let stats = {};

        if (req.user.role === "Super Admin" || req.user.role === "Admin") {
            // Total assets, users, requests, etc.
            const [totalAssets] = await pool.query("SELECT COUNT(*) as count FROM assets");
            const [totalUsers] = await pool.query("SELECT COUNT(*) as count FROM users WHERE role != 'Super Admin'");
            const [pendingRequests] = await pool.query("SELECT COUNT(*) as count FROM asset_requests WHERE status = 'Pending'");
            const [availableAssets] = await pool.query("SELECT COUNT(*) as count FROM assets WHERE status = 'Available'");
            const [assignedAssets] = await pool.query("SELECT COUNT(*) as count FROM assets WHERE status = 'Assigned'");
            stats = {
                totalAssets: totalAssets[0].count,
                totalUsers: totalUsers[0].count,
                departmentUsers: totalUsers[0].count, // Same as totalUsers for Super Admin
                pendingRequests: pendingRequests[0].count,
                availableAssets: availableAssets[0].count,
                assignedAssets: assignedAssets[0].count,
            };
        } else if (req.user.role === "Supervisor") {
            // Department assets, employees, etc.
            const [totalAssets] = await pool.query("SELECT COUNT(*) as count FROM assets");
            const [departmentUsers] = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'Employee'");
            const [pendingRequests] = await pool.query("SELECT COUNT(*) as count FROM asset_requests WHERE status = 'Pending'");
            const [assignedAssets] = await pool.query("SELECT COUNT(*) as count FROM assets WHERE status = 'Assigned'");

            stats = {
                totalAssets: totalAssets[0].count,
                departmentUsers: departmentUsers[0].count,
                pendingRequests: pendingRequests[0].count,
                assignedAssets: assignedAssets[0].count,
            };
        } else if (req.user.role === "Employee") {
            // User's assigned assets
            const [assignedAssets] = await pool.query(
                "SELECT COUNT(*) as count FROM asset_assignments WHERE assigned_to = ? AND unassigned_at IS NULL", [req.user.id]
            );

            stats = {
                assignedAssets: assignedAssets[0].count,
            };
        }

        res.json(stats);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// ------------------ ADMIN DASHBOARD ------------------
app.get("/api/admin/dashboard", authenticate(["Super Admin", "Admin"]), async (req, res) => {
    try {
        const [availableAssets] = await pool.query("SELECT COUNT(*) as count FROM assets where org_id = ? AND status = 'Available'", [req.user.org_id]);
        const [assignedAssets] = await pool.query("SELECT COUNT(*) as count FROM assets WHERE org_id = ? AND status = 'Assigned'", [req.user.org_id]);
        const [maintainedAssets] = await pool.query("SELECT COUNT(*) as count FROM assets WHERE org_id = ? AND status not in ('Available', 'Assigned')", [req.user.org_id]);
        const [activeUsers] = await pool.query("SELECT COUNT(*) as count FROM users WHERE org_id = ? AND role != 'Super Admin' AND status IN ('Active', 'On Leave')", [req.user.org_id]);
        const [inactiveUsers] = await pool.query("SELECT COUNT(*) as count FROM users WHERE org_id = ? AND role != 'Super Admin' AND status NOT IN ('Active', 'On Leave')", [req.user.org_id]);

        // Separate category counts by type
        const [hwCategories] = await pool.query("SELECT COUNT(*) as count FROM categories WHERE org_id = ? AND type = 'Hardware'", [req.user.org_id]);
        const [swCategories] = await pool.query("SELECT COUNT(*) as count FROM categories WHERE org_id = ? AND type = 'Software'", [req.user.org_id]);

        const [totalLocations] = await pool.query("SELECT COUNT(*) as count FROM locations WHERE org_id = ?", [req.user.org_id]);
        const [totalRooms] = await pool.query("SELECT COUNT(*) as count FROM rooms WHERE location_id IN (SELECT id from locations where org_id = ?) ", [req.user.org_id]);
        const [pendingRequests] = await pool.query("SELECT COUNT(*) as count FROM asset_requests WHERE status IN ('Pending', 'In Progress') and requested_by IN (SELECT id from users where org_id = ?)", [req.user.org_id]);
        const [approvedRequests] = await pool.query("select count(*) as count from asset_requests where status in ('Approved', 'Completed', 'Rejected') and  requested_by in (select id from users where org_id = ?);", [req.user.org_id]);
        const [pendingOrders] = await pool.query("SELECT COUNT(*) as count FROM purchase_orders WHERE status IN ('Requested', 'Quoted', 'Approved') and admin_id IN (SELECT id from users where org_id = ? and role = 'Super Admin')", [req.user.org_id]);
        const [completedOrders] = await pool.query("SELECT COUNT(*) as count FROM purchase_orders WHERE status = 'Delivered' and admin_id IN (SELECT id from users where org_id = ? and role = 'Super Admin')", [req.user.org_id]);
        res.json({
            assignedAssets: assignedAssets[0].count,
            maintainedAssets: maintainedAssets[0].count,
            availableAssets: availableAssets[0].count,
            activeUsers: activeUsers[0].count,
            inactiveUsers: inactiveUsers[0].count,
            hwCategories: hwCategories[0].count,
            swCategories: swCategories[0].count,
            totalLocations: totalLocations[0].count,
            totalRooms: totalRooms[0].count,
            pendingRequests: pendingRequests[0].count,
            approvedRequests: approvedRequests[0].count,
            pendingOrders: pendingOrders[0].count,
            completedOrders: completedOrders[0].count,
        });
        res.end();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// ------------------ SUPERVISOR DASHBOARD ------------------
app.get("/api/supervisor/dashboard", authenticate(["Supervisor"]), async (req, res) => {
    try {
        const orgId = req.user.org_id;
        const locId = req.user.loc_id;
        const roomId = req.user.room_id;

        const [totalAssets] = await pool.query("SELECT COUNT(*) as count FROM assets WHERE org_id = ? AND (room_id = ? OR ? IS NULL)", [orgId, roomId, roomId]);
        const [availableAssets] = await pool.query("SELECT COUNT(*) as count FROM assets WHERE org_id = ? AND (room_id = ? OR ? IS NULL) AND status = 'Available'", [orgId, roomId, roomId]);
        const [myAssets] = await pool.query("SELECT COUNT(*) as count FROM asset_assignments WHERE assigned_to = ? AND unassigned_at IS NULL", [req.user.id]);
        const [teamAssets] = await pool.query("SELECT COUNT(*) as count FROM asset_assignments aa JOIN users u ON aa.assigned_to = u.id WHERE (u.room_id = ? OR ? IS NULL) AND u.role = 'Employee' AND aa.unassigned_at IS NULL", [roomId, roomId]);

        const [[supervisorInfo]] = await pool.query("SELECT ownpk FROM users WHERE id = ?", [req.user.id]);
        const ownpk = supervisorInfo?.ownpk;

        const [activeTeam] = await pool.query("SELECT COUNT(*) as count FROM users WHERE unpk = ? AND role = 'Employee' AND status = 'Active'", [ownpk]);
        const [onLeaveTeam] = await pool.query("SELECT COUNT(*) as count FROM users WHERE unpk = ? AND role = 'Employee' AND status = 'On Leave'", [ownpk]);

        const [pendingRequests] = await pool.query("SELECT COUNT(*) as count FROM asset_requests WHERE status not in ('Completed', 'Rejected') AND requested_by IN (SELECT id FROM users WHERE org_id = ? AND (room_id = ? OR ? IS NULL))", [orgId, roomId, roomId]);
        const [completedRequests] = await pool.query("SELECT COUNT(*) as count FROM asset_requests WHERE status = 'Completed' AND requested_by IN (SELECT id FROM users WHERE org_id = ? AND (room_id = ? OR ? IS NULL))", [orgId, roomId, roomId]);
        // Split Orders logic
        const [remainingOrders] = await pool.query("SELECT COUNT(*) as count FROM purchase_orders WHERE supervisor_id = ? AND status IN ('Requested', 'Quoted', 'Approved')", [req.user.id]);
        const [rejectedOrders] = await pool.query("SELECT COUNT(*) as count FROM purchase_orders WHERE supervisor_id = ? AND status = 'Rejected'", [req.user.id]);
        const [deliveredOrders] = await pool.query("SELECT COUNT(*) as count FROM purchase_orders WHERE supervisor_id = ? AND status = 'Delivered'", [req.user.id]);

        res.json({
            totalAssets: totalAssets[0].count,
            myAssets: myAssets[0].count,
            teamAssets: teamAssets[0].count,
            availableAssets: availableAssets[0].count,
            activeTeam: activeTeam[0].count,
            onLeaveTeam: onLeaveTeam[0].count,
            pendingRequests: pendingRequests[0].count,
            completedRequests: completedRequests[0].count,
            remainingOrders: remainingOrders[0].count,
            rejectedOrders: rejectedOrders[0].count,
            deliveredOrders: deliveredOrders[0].count,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// ------------------ EMPLOYEE DASHBOARD ------------------
app.get("/api/employee/dashboard", authenticate(["Employee"]), async (req, res) => {
    try {
        const [assignedAssets] = await pool.query("SELECT COUNT(*) as count FROM asset_assignments WHERE assigned_to = ? AND unassigned_at IS NULL", [req.user.id]);
        const [pendingRequests] = await pool.query("SELECT COUNT(*) as count FROM asset_requests WHERE requested_by = ? AND status = 'Pending'", [req.user.id]);
        const [approvedRequests] = await pool.query("SELECT COUNT(*) as count FROM asset_requests WHERE requested_by = ? AND status in ('Approved', 'In Progress')", [req.user.id]);
        const [totalRequests] = await pool.query("SELECT COUNT(*) as count FROM asset_requests WHERE requested_by = ?", [req.user.id]);
        const [assignedAssetsList] = await pool.query(`
            SELECT a.id, a.name, a.status 
            FROM assets a
            JOIN asset_assignments aa ON a.id = aa.asset_id
            WHERE aa.assigned_to = ? AND aa.unassigned_at IS NULL
            ORDER BY a.id ASC
        `, [req.user.id]);
        const [myRequests] = await pool.query("SELECT id, description, status FROM asset_requests WHERE requested_by = ? ORDER BY id ASC", [req.user.id]);

        res.json({
            assignedAssets: assignedAssets[0].count,
            pendingRequests: pendingRequests[0].count,
            approvedRequests: approvedRequests[0].count,
            totalRequests: totalRequests[0].count,
            assignedAssetsList,
            myRequests,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});



// ------------------ VENDOR DASHBOARD ------------------
app.get("/api/vendor/dashboard", authenticate(["Vendor"]), async (req, res) => {
    try {
        const [requestedOrders] = await pool.query("SELECT po.*, u.name as requested_by FROM purchase_orders po LEFT JOIN users u ON po.supervisor_id = u.id WHERE po.status = 'Requested' AND po.vendor_id = ? ORDER BY po.id ASC", [req.user.id]);
        const [quotedOrders] = await pool.query("SELECT po.*, u.name as requested_by FROM purchase_orders po LEFT JOIN users u ON po.supervisor_id = u.id WHERE po.status = 'Quoted' AND po.vendor_id = ? ORDER BY po.id ASC", [req.user.id]);
        const [deliveredOrders] = await pool.query("SELECT po.*, u.name as requested_by FROM purchase_orders po LEFT JOIN users u ON po.supervisor_id = u.id WHERE po.status = 'Delivered' AND po.vendor_id = ? ORDER BY po.id ASC", [req.user.id]);
        const [approvedOrders] = await pool.query("SELECT po.*, u.name as requested_by FROM purchase_orders po LEFT JOIN users u ON po.supervisor_id = u.id WHERE po.status = 'Approved' AND po.vendor_id = ? ORDER BY po.id ASC", [req.user.id]);

        const pendingCount = requestedOrders.length + quotedOrders.length;
        const completedCount = deliveredOrders.length;
        const totalSupplied = deliveredOrders.length;

        res.json({
            pendingOrders: requestedOrders.concat(quotedOrders),
            completedOrders: deliveredOrders,
            suppliedAssets: deliveredOrders,
            pendingCount,
            completedCount,
            totalSupplied,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// ------------------ MAINTENANCE DASHBOARD ------------------
app.get("/api/maintenance/dashboard", authenticate(["Maintenance", "Super Admin"]), async (req, res) => {
    try {
        const orgId = req.user.org_id;

        const [pendingTasks] = await pool.query(`
            SELECT mr.id, mr.maintenance_type, a.name as asset_name
            FROM maintenance_records mr
            LEFT JOIN assets a ON mr.asset_id = a.id
            WHERE mr.status = 'Pending' AND a.org_id = ?
            ORDER BY mr.id ASC
        `, [orgId]);

        const [completedTasks] = await pool.query(`
            SELECT mr.id, mr.maintenance_type, a.name as asset_name
            FROM maintenance_records mr
            LEFT JOIN assets a ON mr.asset_id = a.id
            WHERE mr.status = 'Completed' AND a.org_id = ?
            ORDER BY mr.id ASC
        `, [orgId]);

        const [assetsToMaintain] = await pool.query(`
            SELECT a.id, a.name, a.status
            FROM assets a
            WHERE a.status IN ('Needs Maintenance', 'Under Maintenance') AND a.org_id = ?
            ORDER BY a.id ASC
        `, [orgId]);

        const [configTasks] = await pool.query("SELECT COUNT(*) as count FROM maintenance_records mr JOIN assets a ON mr.asset_id = a.id WHERE mr.maintenance_type = 'Configuration' AND a.org_id = ?", [orgId]);

        const pendingCount = pendingTasks.length;
        const completedCount = completedTasks.length;
        const totalAssets = assetsToMaintain.length;

        res.json({
            pendingTasks,
            completedTasks,
            assetsToMaintain,
            pendingCount,
            completedCount,
            totalAssets,
            configCount: configTasks[0].count,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// ------------------ ADMIN (Manage Users) ------------------
// app.get("/api/users", authenticate(["Super Admin", "Admin"]), async (req, res) => {
//     const [rows] = await pool.query("SELECT id, name, email, role, department, phone FROM users where role <> 'super admin' AND role <> 'Admin'");
//     res.json(rows);
// });

app.post("/api/users", authenticate(["Super Admin", "Admin"]), async (req, res) => {
    const { name, email, password, role, department, phone } = req.body;
    const unpk = req.body.unpk || generateKey(5);
    await pool.query(
        "INSERT INTO users (name, email, password, role, department, phone, unpk) VALUES (?, ?, ?, ?, ?, ?, ?)", [name, email, password, role, department || null, phone || null, unpk]
    );
    res.json({ success: true });
});



app.delete("/api/users/:id", authenticate(["Super Admin", "Admin"]), async (req, res) => {
    await pool.query("DELETE FROM users WHERE id=?", [req.params.id]);
    res.json({ success: true });
});





// =======================
// MAINTENANCE STAFF ROUTES
// =======================
// Moved to routes/maintenance.js

// ===================================================
// Mount Routes
// ===================================================
app.use('/api/assets', assetsRouter);
app.use('/api/auth', authRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/locations', locationsRouter);
app.use('/api/requests', requestsRouter);
app.use('/api/users', usersRouter);
app.use('/api/purchase-orders', purchaseOrdersRouter);
app.use('/api/maintenance', maintenanceRouter);
app.use('/api/organizations', organizationsRouter);

// Error Handler (must be last)
app.use(errorHandler);

// ===================================================
// Start Server (with robust error handling)
// ===================================================
const PORT = process.env.PORT || 5000;

// Log environment configuration (without sensitive data)
console.log('\n🚀 Starting Asset Management System Server...');
console.log(`   Port: ${PORT}`);
console.log(`   Database: ${process.env.DB_NAME || 'not set'}`);
console.log(`   DB Host: ${process.env.DB_HOST || 'not set'}`);
console.log(`   DB User: ${process.env.DB_USER || 'not set'}`);
console.log(`   Environment: ${process.env.NODE_ENV || 'development'}\n`);

const server = app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`   API available at http://localhost:${PORT}/api\n`);
});

server.on("error", (err) => {
    if (err && err.code === "EADDRINUSE") {
        console.error(`Port ${PORT} is already in use. Please stop the process using this port or set PORT to a different value.`);
        process.exit(1);
    }
    console.error("Server error:", err);
    process.exit(1);
});

// Global Error Handling to prevent crash
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error(err.name, err.message, err.stack);
    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! 💥 Shutting down...');
    console.error(err.name, err.message, err.stack);
    server.close(() => {
        process.exit(1);
    });
});