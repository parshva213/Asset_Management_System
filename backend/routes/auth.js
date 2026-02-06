import express from "express";
import db from "../config/database.js";
import jwt from "jsonwebtoken";
import { generateUniqueKey } from "../utils/uniqueKeyGenerator.js";
import bcrypt from "bcryptjs";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export const authenticate = (roles = []) => {
  return async (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;

      if (roles.length && !roles.some(role => role.toLowerCase() === (req.user.role || "").toLowerCase())) {
        return res.status(403).json({ error: "Forbidden" });
      }

      next();
    } catch (err) {
      return res.status(403).json({ error: "Invalid token" });
    }
  };
};

router.post("/register", async (req, res) => {
  const { name, email, password, role, department, phone, orgId, unpk, loc_id, room_id } = req.body;
  try {
    const [existsResult] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existsResult.length > 0) return res.status(400).json({ message: "Email already exists" });

    let normalizedRole = role;
    if (role === "Maintenance Staff") normalizedRole = "Maintenance";
    if (role === "Software Developer") normalizedRole = "software developer";
    // We can assume `unpk` might be needed for some legacy reason or consistency, so we generate it uniquely too.
    
    // Use provided ownpk (if valid/unique check needed? we should probably check uniqueness if provided)
    // For now, if provided ownpk exists, we might error or retry? 
    // The implementation plan says: Check if ownpk is provided. If so, verify uniqueness. If duplicate, return 400.
    
    const ownpk = await generateUniqueKey();
    let org_id = null;
    if(orgId){
      org_id = orgId;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await db.query(
      "INSERT INTO users (name, email, password, role, department, phone, unpk, ownpk, org_id, loc_id, room_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [name, email, hashedPassword, normalizedRole, department || null, phone || null, unpk || null, ownpk, org_id, loc_id || null, room_id || null]
    );
    const userId = result.insertId;
    let organization_name = null;
    if (org_id) {
       const [orgRow] = await db.query("SELECT name FROM organizations WHERE id = ?", [org_id]);
       if (orgRow.length > 0) organization_name = orgRow[0].name;
    }

    const user = { 
      id: userId, 
      name, 
      email, 
      role: normalizedRole, 
      department: department || null, 
      phone: phone || null, 
      ownpk, 
      org_id,
      organization_name
    };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: "1d" });

    res.json({ message: "User registered", user, token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const [userResult] = await db.query(
      `SELECT u.id, u.name, u.email, u.password, u.role, u.department, u.phone, u.ownpk, u.org_id, 
              o.name as organization_name, u.status, u.loc_id, l.name as location_name, u.room_id, r.name as room_name
       FROM users u
       LEFT JOIN organizations o ON u.org_id = o.id
       LEFT JOIN locations l ON u.loc_id = l.id
       LEFT JOIN rooms r ON u.room_id = r.id
       WHERE u.email = ?`,
      [email]
    );

    if (userResult.length === 0) {
      return res.status(404).json({ message: "Account is not registered" });
    }
    const user = userResult[0];
    if (!['Active', 'On Leave'].includes(user.status)) {
      return res.status(403).json({ message: "Account is not active" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
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

router.get("/profile", authenticate(), async (req, res) => {
  try {
    const [result] = await db.query(
      `SELECT u.id, u.name, u.email, u.role, u.department, u.phone, u.unpk, u.ownpk, u.created_at, u.org_id, 
              o.name as organization_name, u.loc_id, l.name as location_name, u.room_id, r.name as room_name
       FROM users u
       LEFT JOIN organizations o ON u.org_id = o.id
       LEFT JOIN locations l ON u.loc_id = l.id
       LEFT JOIN rooms r ON u.room_id = r.id
       WHERE u.id = ?`,
      [req.user.id]
    );
    if (result.length === 0) return res.status(404).json({ message: "User not found" });

    res.json({ user: result[0] });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/profile", authenticate(), async (req, res) => {
  const { name, email, department} = req.body;
  if (!name || !email) {
    return res.status(400).json({ message: "Name and Email are required" });
  }

  try {
    await db.query(
      "UPDATE users SET name=?, email=?, department=? WHERE id=?",
      [name, email, department || null, req.user.id]
    );
    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("Profile Update Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/change-password", authenticate(), async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Both fields are required" });
  }

  try {
    const [userRows] = await db.query("SELECT password FROM users WHERE id=?", [req.user.id]);
    if (userRows.length === 0) return res.status(404).json({ message: "User not found" });

    if (userRows[0].password !== currentPassword) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    await db.query("UPDATE users SET password=? WHERE id=?", [newPassword, req.user.id]);
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Password Change Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const [user] = await db.query("SELECT count(*) as count FROM users WHERE email = ?", [email]);
    if (user[0].count === 0) {
      return res.status(404).json({ message: "Email not found" });
    }

    // Generate a simple PIN (for simulation)
    const resetPin = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[RESET PASSWORD] PIN for ${email}: ${resetPin}`);

    // In a real app, send email here.
    
    res.json({ message: "Reset PIN sent to your email", resetPin }); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Endpoint for no-email password reset flow (direct update)
router.post("/reset-password-confirm", async (req, res) => {
  const { email, newPassword } = req.body;
  
  if (!email || !newPassword) {
      return res.status(400).json({ message: "Email and new password are required" });
  }

  try {
      // 1. Check if user exists
      const [userRows] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
      if (userRows.length === 0) {
          return res.status(404).json({ message: "User not found" });
      }

      // 2. Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // 3. Update password
      await db.query("UPDATE users SET password = ? WHERE email = ?", [hashedPassword, email]);

      res.json({ message: "Password updated successfully" });
  } catch (err) {
      console.error("Reset Password Error:", err);
      res.status(500).json({ message: "Server error" });
  }
});

router.post("/verify-registration-key", async (req, res) => {
  const { key } = req.body;
  if (!key) return res.status(400).json({ message: "Key is required" });

  try {
    // check org table for orgpk
    const [orgResult] = await db.query(
      "SELECT id, name, member FROM organizations WHERE BINARY orgpk = ?",
      [key]
    );
    if (orgResult.length > 0) {
      const org = orgResult[0];
      const [count] = await db.query(
        "SELECT COUNT(*) as count FROM users WHERE BINARY unpk = ?",
        [key]
      )
      if (org.id === 1) {
        return res.json({
          type: "organization",
          orgId: org.id,
          allowedRoles: ["Software Developer"],
          unpk: key
        })
      }
      if (count[0].count >= org.member) {
        return res.status(400).json({ message: "Organization limit reached " +org.id });
      }
      return res.json({
        type: "organization",
        orgId: org.id,
        allowedRoles: ["Super Admin"],
        unpk: key
      });
    }
    // Check users table for ownpk
    const [ownpkResult] = await db.query(
      "SELECT id, name as userName, email, role, org_id FROM users WHERE BINARY ownpk = ?",
      [key]
    );
    if (ownpkResult.length > 0) {
      const user = ownpkResult[0];
      const [orgName] = await db.query(
        "SELECT name FROM organizations WHERE id = ?",
        [user.org_id]
      );
      
      user.orgName = orgName.length > 0 ? orgName[0].name : 'None'; 
      console.log(`Key recognized as OWNPK for user: ${user.userName} (${user.role}). Org: ${user.orgName}`);
      
      if (user.role === "Super Admin") {
        return res.json({
          type: "admin_referral",
          referrerName: user.userName || user.email,
          allowedRoles: ["Supervisor", "Maintenance Staff"],
          orgId: user.org_id,
          unpk: key
        });
      }
      if (user.role === "Supervisor") {
        return res.json({
          type: "supervisor_referral",
          referrerName: user.userName || user.email,
          allowedRoles: ["Employee"],
          orgId: user.org_id,
          unpk: key
        });
      }
    }
    console.error(`Key ${key} not found in any registration category`);
    res.status(400).json({ message: "Invalid registration key" });
  } catch (err) {
    console.error("Key Verification Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Public endpoint to fetch locations for registration (no auth required)
router.get("/public/locations/:orgId", async (req, res) => {
  const { orgId } = req.params;
  try {
    const [locations] = await db.query(
      "SELECT id, name FROM locations WHERE org_id = ? ORDER BY name ASC",
      [orgId]
    );
    res.json(locations);
  } catch (err) {
    console.error("Error fetching locations:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Public endpoint to fetch rooms by location for registration (no auth required)
router.get("/public/rooms/:locationId", async (req, res) => {
  const { locationId } = req.params;
  try {
    const [rooms] = await db.query(
      "SELECT id, name, location_id FROM rooms WHERE location_id = ? ORDER BY name ASC",
      [locationId]
    );
    res.json(rooms);
  } catch (err) {
    console.error("Error fetching rooms:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
