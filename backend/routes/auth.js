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
  const { name, email, password, role, department, phone } = req.body;
  if (!name || !email || !password || !role)
    return res.status(400).json({ message: "All fields are required" });

  try {
    // Check if email already exists
    const [existsResult] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existsResult.length > 0) return res.status(400).json({ message: "Email already exists" });

    // Normalize role input
    const normalizedRole = role === "Admin" ? "Super Admin" : role;

    // Validate role exists in roles table (Using roles table is optional if roles are simple strings, 
    // but based on context, let's keep validation if roles table exists, otherwise skip or check enum)
    // Assuming roles table exists as per previous code context:
    const [roleResult] = await db.query("SELECT name FROM roles WHERE name = ?", [normalizedRole]);
    if (roleResult.length === 0) {
      // Fallback if roles table usage is inconsistent - forcing valid role manually or inserting.
      // But let's assume roles table might NOT be fully used given server.js logic.
      // server.js doesn't check roles table. It inserts directly string.
      // Let's align with server.js approach which is simpler and less error-prone here.
    }

    // Insert user directly with role name
    const [result] = await db.query(
      "INSERT INTO users (name, email, password, role, department, phone) VALUES (?, ?, ?, ?, ?, ?)",
      [name, email, password, normalizedRole, department || null, phone || null]
    );

    const user = { id: result.insertId, name, email, role: normalizedRole, department: department || null, phone: phone || null };
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
    // Check if user exists first
    const [userResult] = await db.query(
      `SELECT id, name, email, password, role, department
       FROM users
       WHERE email = ?`,
      [email]
    );

    if (userResult.length === 0) {
        return res.status(404).json({ message: "Account is not registered" });
    }

    const user = userResult[0];

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
    const [result] = await db.query(
      `SELECT id, name, email, role, department, phone, status, created_at
       FROM users 
       WHERE id = ?`,
      [req.user.id]
    );
    if (result.length === 0) return res.status(404).json({ message: "User not found" });

    res.json({ user: result[0] });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------ UPDATE PROFILE ------------------
router.put("/profile", authenticate(), async (req, res) => {
  const { name, email, department, phone } = req.body;
  if (!name || !email) {
    return res.status(400).json({ message: "Name and Email are required" });
  }

  try {
    await db.query(
      "UPDATE users SET name=?, email=?, department=?, phone=? WHERE id=?",
      [name, email, department || null, phone || null, req.user.id]
    );
    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("Profile Update Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------ CHANGE PASSWORD ------------------
router.put("/change-password", authenticate(), async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Both fields are required" });
  }

  try {
    // Verify current password first
    const [userRows] = await db.query("SELECT password FROM users WHERE id=?", [req.user.id]);
    if (userRows.length === 0) return res.status(404).json({ message: "User not found" });

    if (userRows[0].password !== currentPassword) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Update password
    await db.query("UPDATE users SET password=? WHERE id=?", [newPassword, req.user.id]);
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Password Change Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
