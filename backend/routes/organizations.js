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
    if (userRole === "software developer") {
      const [rows] = await pool.query("SELECT * FROM organizations where status <> 'Deleted' ORDER BY id ASC");
      return res.json(rows);
    }

    if (userRole === "vendor") {
      const [rows] = await pool.query(
        `SELECT o.id, o.name, o.description, o.status, o.created_at,
                CASE WHEN vo.id IS NULL THEN 0 ELSE 1 END AS is_registered
         FROM organizations o
         LEFT JOIN vendor_org vo ON vo.org_key = o.v_opk AND vo.vendor_id = ?
         WHERE o.status <> 'Deleted'
         ORDER BY o.id ASC`,
        [req.user.id]
      );
      return res.json(rows);
    }

    return res.status(403).json({ message: "Access denied" });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Vendor one-click registration for organization requirements
router.post("/:id/register", verifyToken, async (req, res) => {
  try {
    if ((req.user.role || "").trim().toLowerCase() !== "vendor") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { id } = req.params;

    const [orgRows] = await pool.query(
      "SELECT id, name, v_opk, status FROM organizations WHERE id = ?",
      [id]
    );

    if (orgRows.length === 0) {
      return res.status(404).json({ message: "Organization not found" });
    }

    const org = orgRows[0];
    if (org.status !== "Active") {
      return res.status(400).json({ message: "Organization is not active" });
    }

    const [existing] = await pool.query(
      "SELECT id FROM vendor_org WHERE vendor_id = ? AND org_key = ?",
      [req.user.id, org.v_opk]
    );

    if (existing.length > 0) {
      return res.json({ message: `Already registered with ${org.name}` });
    }

    await pool.query(
      "INSERT INTO vendor_org (vendor_id, org_key) VALUES (?, ?)",
      [req.user.id, org.v_opk]
    );

    return res.status(201).json({ message: `Registered with ${org.name}` });
  } catch (error) {
    console.error("Error registering vendor organization:", error);
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
