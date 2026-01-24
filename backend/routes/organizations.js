import express from "express";
import pool from "../config/database.js";
import { verifyToken, checkRole } from "../middleware/auth.js";
import { logActivity } from "../utils/activityLogger.js";
import { generateUniqueKey } from "../utils/uniqueKeyGenerator.js";

const router = express.Router();

// ============ VENDOR ROUTES (Must be before generic /:id routes) ============

// Get organizations for vendor (vendor-specific endpoint)
router.get("/vendor/list", verifyToken, checkRole(["Vendor"]), async (req, res) => {
  try {
    const vendorId = req.user.id;

    // Get all organizations that accept vendors (have v_opk)
    const [allOrgs] = await pool.query("SELECT id, name, description, v_opk, created_at FROM organizations WHERE status = 'Active' AND v_opk IS NOT NULL AND v_opk != ''");

    // Get organizations registered with this vendor
    const [vendorOrgs] = await pool.query(
      `SELECT o.id, o.name, o.description, o.v_opk, o.created_at 
       FROM organizations o 
       INNER JOIN vendor_org vo ON o.v_opk = vo.org_key 
       WHERE vo.vendor_id = ? AND o.status = 'Active'`,
      [vendorId]
    );

    // Extract vendor organization IDs for easy comparison
    const vendorOrgIds = vendorOrgs.map(org => org.id);

    // Separate organizations
    const registeredOrganizations = vendorOrgs;
    const otherOrganizations = allOrgs.filter(org => !vendorOrgIds.includes(org.id));

    res.json({
      registeredOrganizations,
      otherOrganizations,
      totalOrganizations: allOrgs.length,
      vendorOrganizationsCount: vendorOrgs.length,
      otherOrganizationsCount: otherOrganizations.length
    });
  } catch (error) {
    console.error("Error fetching vendor organizations:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Register vendor with an organization
router.post("/vendor/register/:orgId", verifyToken, checkRole(["Vendor"]), async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { orgId } = req.params;

    // Get the organization to get its v_opk
    const [orgData] = await pool.query("SELECT id, v_opk FROM organizations WHERE id = ? AND v_opk IS NOT NULL AND v_opk != ''", [orgId]);
    
    if (orgData.length === 0) {
      return res.status(404).json({ message: "Organization not found or doesn't accept vendors" });
    }

    const orgKey = orgData[0].v_opk;

    // Check if vendor is already registered with this organization
    const [existingReg] = await pool.query("SELECT id FROM vendor_org WHERE vendor_id = ? AND org_key = ?", [vendorId, orgKey]);
    
    if (existingReg.length > 0) {
      return res.status(400).json({ message: "You are already registered with this organization" });
    }

    // Insert into vendor_org table
    const [result] = await pool.query(
      "INSERT INTO vendor_org (vendor_id, org_key) VALUES (?, ?)",
      [vendorId, orgKey]
    );

    // Log activity
    await logActivity(vendorId, "Registered with organization", "vendor_org", result.insertId, `Vendor registered with organization: ${orgData[0].id}`);

    res.status(201).json({ message: "Successfully registered with organization" });
  } catch (error) {
    console.error("Error registering vendor with organization:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ============ GENERAL ORGANIZATION ROUTES ============

// Get all organizations
router.get("/", verifyToken, async (req, res) => {
  try {
    console.log("User attempting to access organizations:", req.user);
    const userRole = (req.user.role || "").trim().toLowerCase();
    if (userRole !== "software developer") {
      return res.status(403).json({ 
        message: `Access denied. Your role is: '${req.user.role}' (normalized: '${userRole}'). Required: 'software developer'` 
      });
    }

    const [rows] = await pool.query("SELECT * FROM organizations ORDER BY id ASC");
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

    let { name, description, orgpk, member, v_opk } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: "Organization name must be at least 2 characters" });
    }

    // Generate keys if not provided
    if (!orgpk) orgpk = await generateUniqueKey();
    if (!v_opk) v_opk = await generateUniqueKey();

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
    if ((req.user.role || "").trim().toLowerCase() !== "software developer") {
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
