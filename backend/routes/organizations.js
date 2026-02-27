import express from "express";
import pool from "../config/database.js";
import { verifyToken } from "../middleware/auth.js";
import { logActivity } from "../utils/activityLogger.js";
import { generateUniqueKey } from "../utils/uniqueKeyGenerator.js";

const router = express.Router();

// Get all organizations
router.get("/", verifyToken, async (req, res) => {
  try {
    const userRole = (req.user.role || "").trim().toLowerCase();
    if (userRole !== "software developer") {
      return res.status(403).json({
        message: `Access denied. Your role is: '${req.user.role}' (normalized: '${userRole}'). Required: 'software developer'`
      });
    }

    const [rows] = await pool.query("SELECT * FROM organizations where status <> 'Deleted' ORDER BY id ASC");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching organizations:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single organization
router.get("/:id", verifyToken, async (req, res) => {
  try {
    if ((req.user.role || "").trim().toLowerCase() !== "software developer") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM organizations");

    if (rows.length === 0) {
      return res.status(404).json({ message: "Organization not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching organization:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create organization
router.post("/", verifyToken, async (req, res) => {
  try {
    if ((req.user.role || "").trim().toLowerCase() !== "software developer") {
      return res.status(403).json({ message: "Access denied" });
    }

    let { name, description, member } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: "Organization name must be at least 2 characters" });
    }

    // Generate keys if not provided
    let orgpk = await generateUniqueKey();
    let v_opk = await generateUniqueKey();

    const [result] = await pool.query(
      "INSERT INTO organizations (name, description, orgpk, member, v_opk) VALUES (?, ?, ?, ?, ?)",
      [name, description || null, orgpk, member || null, v_opk]
    );
    const organizationId = result.insertId;

    // Log activity safely
    await logActivity(req.user.id, "Created organization", "organization", organizationId, `Created organization: ${name}`);

    res.status(200).json({ message: "Organization created successfully", id: organizationId });
  } catch (error) {
    console.error("Error creating organization:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

// Update organization
router.put("/:id", verifyToken, async (req, res) => {
  try {
    if ((req.user.role || "").trim().toLowerCase() !== "software developer") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { id } = req.params;
    const { name, description, member, } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: "Organization name must be at least 2 characters" });
    }

    // Check if organization exists
    const [checkRows] = await pool.query("SELECT id FROM organizations WHERE id = ?", [id]);
    if (checkRows.length === 0) {
      return res.status(404).json({ message: "Organization not found" });
    }

    await pool.query(
      "UPDATE organizations SET name = ?, description = ?, member = ? WHERE id = ?",
      [name, description || null, member || null, id]
    );

    // Log activity safely
    await logActivity(req.user.id, "Updated organization", "organization", id, `Updated organization: ${name}`);

    res.json({ message: "Organization updated successfully" });
  } catch (error) {
    console.error("Error updating organization:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete organization
router.put("/:id/:name", verifyToken, async (req, res) => {
  try {
    if ((req.user.role || "").trim().toLowerCase() !== "software developer") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { id, name } = req.params;

    const [rows] = await pool.query("SELECT name FROM organizations WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Organization not found" });
    }

    await pool.query("update organizations SET status = ? WHERE id = ?", [name, id]);

    res.json({ message: `Organization ${name} successfully` });
  } catch (error) {
    console.error("Error deleting organization:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
