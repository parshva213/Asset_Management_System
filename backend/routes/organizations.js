import express from "express";
import pool from "../config/database.js";
import { verifyToken } from "../middleware/auth.js";
import { logActivity } from "../utils/activityLogger.js";
import { generateKey } from "../utils/keyGenerator.js";

const router = express.Router();

// Get all organizations
router.get("/", verifyToken, async (req, res) => {
  try {
    // Only Software Developer can access organizations
    if (req.user.role !== "Software Developer") {
      return res.status(403).json({ message: "Access denied" });
    }

    const [rows] = await pool.query("SELECT * FROM organizations ORDER BY name");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching organizations:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single organization
router.get("/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "Software Developer") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM organizations WHERE id = ?", [id]);
    
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
    if (req.user.role !== "Software Developer") {
      return res.status(403).json({ message: "Access denied" });
    }

    let { name, description, orgpk, member, v_opk } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: "Organization name must be at least 2 characters" });
    }

    // Generate keys if not provided
    if (!orgpk) orgpk = generateKey(5);
    if (!v_opk) v_opk = generateKey(5);

    const [result] = await pool.query(
      "INSERT INTO organizations (name, description, orgpk, member, v_opk) VALUES (?, ?, ?, ?, ?)",
      [name, description || null, orgpk, member || null, v_opk]
    );
    const organizationId = result.insertId;

    // Log activity safely
    await logActivity(req.user.id, "Created organization", "organization", organizationId, `Created organization: ${name}`);

    res.status(201).json({ message: "Organization created successfully", id: organizationId });
  } catch (error) {
    console.error("Error creating organization:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update organization
router.put("/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "Software Developer") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { id } = req.params;
    const { name, description, orgpk, member, v_opk } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: "Organization name must be at least 2 characters" });
    }

    // Check if organization exists
    const [checkRows] = await pool.query("SELECT id FROM organizations WHERE id = ?", [id]);
    if (checkRows.length === 0) {
      return res.status(404).json({ message: "Organization not found" });
    }

    await pool.query(
      "UPDATE organizations SET name = ?, description = ?, orgpk = ?, member = ?, v_opk = ? WHERE id = ?",
      [name, description || null, orgpk || null, member || null, v_opk || null, id]
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
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "Software Developer") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { id } = req.params;

    const [rows] = await pool.query("SELECT name FROM organizations WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Organization not found" });
    }

    await pool.query("DELETE FROM organizations WHERE id = ?", [id]);

    // Log activity safely
    await logActivity(req.user.id, "Deleted organization", "organization", id, `Deleted organization: ${rows[0].name}`);

    res.json({ message: "Organization deleted successfully" });
  } catch (error) {
    console.error("Error deleting organization:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
