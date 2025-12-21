// import express from "express";
// import mysql from "mysql2/promise";
// import jwt from "jsonwebtoken";

// const router = express.Router();

// const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
// });

// const JWT_SECRET = process.env.JWT_SECRET || "secret";

// // ------------------ JWT AUTH ------------------
// export const authenticate = (roles = []) => {
//   return async (req, res, next) => {
//     const token = req.headers["authorization"]?.split(" ")[1];
//     if (!token) return res.status(401).json({ error: "Unauthorized" });

//     try {
//       const decoded = jwt.verify(token, JWT_SECRET);
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
// router.post("/register", async (req, res) => {
//   const { name, email, password, role_id, department } = req.body;
//   if (!name || !email || !password || !role_id)
//     return res.status(400).json({ message: "All fields are required" });

//   try {
//     const [exists] = await pool.query("SELECT * FROM users WHERE email=?", [email]);
//     if (exists.length > 0) return res.status(400).json({ message: "Email already exists" });

//     const [result] = await pool.query(
//       "INSERT INTO users (name, email, password, role_id, department) VALUES (?, ?, ?, ?, ?)",
//       [name, email, password, role_id, department || null]
//     );

//     // Get role name from roles table
//     const [roleRow] = await pool.query("SELECT name FROM roles WHERE id=?", [role_id]);
//     const roleName = roleRow[0].name;

//     const user = { id: result.insertId, name, email, role: roleName, department };
//     const token = jwt.sign(user, JWT_SECRET, { expiresIn: "1d" });

//     res.json({ message: "User registered", user, token });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // ------------------ LOGIN ------------------
// router.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const [rows] = await pool.query(
//       `SELECT u.id, u.name, u.email, u.password, r.name AS role
//        FROM users u
//        JOIN roles r ON u.role_id = r.id
//        WHERE u.email=? AND u.password=?`,
//       [email, password]
//     );

//     if (rows.length === 0) return res.status(401).json({ message: "Invalid credentials" });

//     const user = rows[0];
//     const token = jwt.sign(
//       { id: user.id, name: user.name, email: user.email, role: user.role },
//       JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     res.json({ message: "Login successful", user, token });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // ------------------ PROFILE ------------------
// router.get("/profile", authenticate(), async (req, res) => {
//   try {
//     const [rows] = await pool.query(
//       `SELECT u.id, u.name, u.email, r.name AS role, u.department
//        FROM users u
//        JOIN roles r ON u.role_id = r.id
//        WHERE u.id=?`,
//       [req.user.id]
//     );
//     if (rows.length === 0) return res.status(404).json({ message: "User not found" });

//     res.json({ user: rows[0] });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// export default router;






import express from "express";
import db from "../config/database.js";
import jwt from "jsonwebtoken";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "secret";

// ------------------ JWT AUTH ------------------
export const authenticate = (roles = []) => {
  return async (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;

      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ error: "Forbidden" });
      }

      next();
    } catch (err) {
      return res.status(403).json({ error: "Invalid token" });
    }
  };
};

// ------------------ REGISTER ------------------
router.post("/register", async (req, res) => {
  const { name, email, password, role, department } = req.body;
  if (!name || !email || !password || !role)
    return res.status(400).json({ message: "All fields are required" });

  try {
    // Check if email already exists
    const existsResult = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existsResult.rows.length > 0) return res.status(400).json({ message: "Email already exists" });

    // Normalize role input
    const normalizedRole = role === "Admin" ? "Super Admin" : role;

    // Validate role exists in roles table
    const roleResult = await db.query("SELECT name FROM roles WHERE name = $1", [normalizedRole]);
    if (roleResult.rows.length === 0) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Vendors & Maintenance Staff don't need department
    const departmentValue =
      normalizedRole.toLowerCase() === "vendor" || normalizedRole.toLowerCase() === "maintenance"
        ? null
        : department || null;

    // Insert user directly with role name
    const result = await db.query(
      "INSERT INTO users (name, email, password, role, department) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [name, email, password, normalizedRole, departmentValue]
    );

    const user = { id: result.rows[0].id, name, email, role: normalizedRole, department: departmentValue };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: "1d" });

    res.json({ message: "User registered", user, token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------ LOGIN ------------------
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists first (As requested: "fire query to check the account is registerd or not")
    const userResult = await db.query(
      `SELECT id, name, email, password, role, department
       FROM users
       WHERE email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
        return res.status(404).json({ message: "Account is not registered" });
    }

    const user = userResult.rows[0];

    // Check password
    if (user.password !== password) {
        return res.status(401).json({ message: "Password does not match" });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ message: "Login successful", user, token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------ PROFILE ------------------
router.get("/profile", authenticate(), async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, name, email, role, department 
       FROM users 
       WHERE id = $1`,
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "User not found" });

    res.json({ user: result.rows[0] });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
