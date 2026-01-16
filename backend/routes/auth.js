import express from "express";
import db from "../config/database.js";
import jwt from "jsonwebtoken";
import { generateKey } from "../utils/keyGenerator.js";
import { generateUniqueKey } from "../utils/uniqueKeyGenerator.js";

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
  const { name, email, password, role, department, phone } = req.body;
  if (!name || !email || !password || !role)
    return res.status(400).json({ message: "All fields are required" });

  try {
    const [existsResult] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existsResult.length > 0) return res.status(400).json({ message: "Email already exists" });

    let normalizedRole = role;
    if (role === "IT Supervisor") normalizedRole = "Supervisor";
    if (role === "Maintenance Staff") normalizedRole = "Maintenance";

    const [roleResult] = await db.query("SELECT name FROM roles WHERE name = ?", [normalizedRole]);
    if (roleResult.length === 0) {
    }

    const unpk = req.body.unpk || generateKey(5); // Keep using simple key for unpk fallback if it assumes parent? Or should this also be unique? unpk is usually a link.
    // If unpk is being generated for the user as *their* backlink key (Wait, unpk in user table is Not Unique).
    // The prompt specificially asked for OWNPK. So we generate ownpk.
    
    // The prompt specificially asked for OWNPK. So we generate ownpk.
    
    const ownpk = await generateUniqueKey();
    const org_id = req.body.orgId || null;

    const [result] = await db.query(
      "INSERT INTO users (name, email, password, role, department, phone, unpk, ownpk, org_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [name, email, password, normalizedRole, department || null, phone || null, unpk, ownpk, org_id]
    );

    const userId = result.insertId;

    if (org_id && req.body.regKey) {
      await db.query(
        "INSERT INTO key_vault (organization_id, key_value, user_id) VALUES (?, ?, ?)",
        [org_id, req.body.regKey, userId]
      );
      console.log(`Recorded key usage in key_vault for org ${org_id}`);
    }

    const user = { id: userId, name, email, role: normalizedRole, department: department || null, phone: phone || null, unpk, ownpk, org_id };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: "1d" });

    res.json({ message: "User registered", user, token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [userResult] = await db.query(
      `SELECT id, name, email, password, role, department, ownpk
       FROM users
       WHERE email = ?`,
      [email]
    );

    if (userResult.length === 0) {
      return res.status(404).json({ message: "Account is not registered" });
    }
    console.log(userResult);

    const user = userResult[0];

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

router.get("/profile", authenticate(), async (req, res) => {
  try {
    const [result] = await db.query(
      `SELECT id, name, email, role, department, phone, unpk, status, created_at
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

router.post("/verify-registration-key", async (req, res) => {
  const { key } = req.body;
  console.log(`Verifying key: ${key}`);
  if (!key) return res.status(400).json({ message: "Key is required" });

  try {
    const [orgResult] = await db.query(
      "SELECT id, name, member FROM organizations WHERE orgpk = ?",
      [key]
    );
    if (orgResult.length > 0) {
      const org = orgResult[0];
      console.log(`Key recognized as orgpk for: ${org.name}. Limit: ${org.member}`);

      const [vaultResult] = await db.query(
        "SELECT COUNT(*) as count FROM key_vault WHERE organization_id = ?",
        [org.id]
      );
      const usedCount = vaultResult[0].count;
      console.log(`Checking quota: ${usedCount} used of ${org.member} allowed`);

      if (org.member && usedCount >= parseInt(org.member)) {
        return res.status(400).json({ message: "Limet comes to the end" });
      }

      console.log(`[VERIFY] Organization key verified. Assigning Super Admin role for org: ${org.name}`);
      return res.json({
        type: "organization",
        orgId: org.id,
        orgName: org.name,
        allowedRoles: ["Super Admin"]
      });
    }

    const [vOrgResult] = await db.query(
      "SELECT id, name, member FROM organizations WHERE v_opk = ?",
      [key]
    );
    if (vOrgResult.length > 0) {
      const org = vOrgResult[0];
      console.log(`Key recognized as v_opk for: ${org.name}. Limit: ${org.member}`);

      const [vaultResult] = await db.query(
        "SELECT COUNT(*) as count FROM key_vault WHERE organization_id = ?",
        [org.id]
      );
      const usedCount = vaultResult[0].count;
      console.log(`Checking quota: ${usedCount} used of ${org.member} allowed`);

      if (org.member && usedCount >= parseInt(org.member)) {
        return res.status(400).json({ message: "Limet comes to the end" });
      }

      console.log(`Key recognized as v_opk for: ${org.name}`);
      return res.json({
        type: "vendor",
        orgId: org.id,
        orgName: org.name,
        allowedRoles: ["Vendor"]
      });
    }

    // Check users table for ownpk
    const [ownpkResult] = await db.query(
      "SELECT u.id, u.name, u.email, u.role, u.org_id, o.name as orgName " +
      "FROM users u LEFT JOIN organizations o ON u.org_id = o.id " +
      "WHERE u.ownpk = ?",
      [key]
    );

    if (ownpkResult.length > 0) {
      const user = ownpkResult[0];
      console.log(`Key recognized as OWNPK for user: ${user.name} (${user.role}). Org: ${user.orgName || 'None'}`);

      if (user.role === "Super Admin") {
        return res.json({
          type: "admin_referral",
        referrerName: user.name || user.email,
          allowedRoles: ["IT Supervisor", "Maintenance Staff"],
          orgId: user.org_id,
          orgName: user.orgName
        });
      }

      if (user.role === "IT Supervisor" || user.role === "Supervisor") {
        return res.json({
          type: "supervisor_referral",
        referrerName: user.name || user.email,
          allowedRoles: ["Employee"],
          orgId: user.org_id,
          orgName: user.orgName
        });
      }

      return res.json({
        type: "user_referral",
        referrerName: user.name,
        allowedRoles: ["Employee"],
        orgId: user.org_id,
        orgName: user.orgName
      });
    }

    const [userResult] = await db.query(
      "SELECT u.id, u.name, u.role, u.org_id, o.name as orgName " +
      "FROM users u LEFT JOIN organizations o ON u.org_id = o.id " +
      "WHERE u.unpk = ?",
      [key]
    );
    if (userResult.length > 0) {
      const user = userResult[0];
      console.log(`Key recognized as UNPK for user: ${user.name} (${user.role}). Org: ${user.orgName || 'None'}`);

      if (user.role === "Super Admin") {
        return res.json({
          type: "admin_referral",
          referrerName: user.name,
          allowedRoles: ["IT Supervisor", "Maintenance Staff"],
          orgId: user.org_id,
          orgName: user.orgName
        });
      }

      if (user.role === "IT Supervisor" || user.role === "Supervisor") {
        return res.json({
          type: "supervisor_referral",
          referrerName: user.name,
          allowedRoles: ["Employee"],
          orgId: user.org_id,
          orgName: user.orgName
        });
      }

      return res.json({
        type: "user_referral",
        referrerName: user.name,
        allowedRoles: ["Employee"],
        orgId: user.org_id,
        orgName: user.orgName
      });
    }

    console.log(`Key ${key} not found in any registration category`);
    res.status(400).json({ message: "Invalid registration key" });
  } catch (err) {
    console.error("Key Verification Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
