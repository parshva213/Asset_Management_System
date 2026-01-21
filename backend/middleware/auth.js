import jwt from "jsonwebtoken";
import db from "../config/database.js";

// Use the same secret fallback as auth routes to keep signing & verification aligned
const JWT_SECRET = process.env.JWT_SECRET || "secret";

// Verify JWT token
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // Get user from database (token payload uses `id`)
    const [rows] = await db.query("SELECT id, email, name, role, org_id FROM users WHERE id = ?", [decoded.id]);

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid token." });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token." });
  }
};

// Check user role
export const checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied. Insufficient permissions." });
    }
    next();
  };
};
