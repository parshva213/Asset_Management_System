import express from "express";
import pool from "../config/database.js";
import { verifyToken } from "../middleware/auth.js";
import { generateSerialNumbers } from "../utils/serialNumberUtils.js";

const router = express.Router();

// GET all purchase orders (filtered by role)
router.get("/", verifyToken, async (req, res) => {
    try {
        let query = `
      SELECT po.*, u.name as supervisor_name, v.name as vendor_name, a.name as admin_name,
             COALESCE(sp.supplied_quantity, 0) AS supplied_quantity,
             sp.supply_date,
             sp.warranty_expiry,
             sp.warranty_period_days
      FROM purchase_orders po
      LEFT JOIN users u ON po.supervisor_id = u.id
      LEFT JOIN users v ON po.vendor_id = v.id
      LEFT JOIN users a ON po.admin_id = a.id
      LEFT JOIN (
        SELECT
          CAST(SUBSTRING_INDEX(description, '#', -1) AS UNSIGNED) AS po_id,
          COUNT(*) AS supplied_quantity,
          MAX(created_at) AS supply_date,
          MAX(warranty_expiry) AS warranty_expiry,
          DATEDIFF(MAX(warranty_expiry), DATE(MAX(created_at))) AS warranty_period_days
        FROM assets
        WHERE description LIKE 'Supplied by vendor for PO #%'
        GROUP BY CAST(SUBSTRING_INDEX(description, '#', -1) AS UNSIGNED)
      ) sp ON sp.po_id = po.id
    `;
        const params = [];

        if (req.user.role === "Vendor") {
            query += " WHERE po.vendor_id = ?";
            params.push(req.user.id);
        } else if (req.user.role === "Supervisor") {
            query += " WHERE po.supervisor_id = ?";
            params.push(req.user.id);
        }

        query += " ORDER BY po.id ASC";

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// GET vendor requirements from registered organizations
router.get("/vendor/requirements", verifyToken, async (req, res) => {
    if (req.user.role !== "Vendor") {
        return res.status(403).json({ message: "Access denied" });
    }

    try {
        const [rows] = await pool.query(
            `SELECT po.*, u.name as supervisor_name, v.name as vendor_name, a.name as admin_name,
                    o.id as organization_id, o.name as organization_name,
                    COALESCE(sp.supplied_quantity, 0) AS supplied_quantity,
                    sp.supply_date,
                    sp.warranty_expiry,
                    sp.warranty_period_days
             FROM purchase_orders po
             LEFT JOIN users u ON po.supervisor_id = u.id
             LEFT JOIN users v ON po.vendor_id = v.id
             LEFT JOIN users a ON po.admin_id = a.id
             LEFT JOIN organizations o ON u.org_id = o.id
             LEFT JOIN (
                SELECT
                    CAST(SUBSTRING_INDEX(description, '#', -1) AS UNSIGNED) AS po_id,
                    COUNT(*) AS supplied_quantity,
                    MAX(created_at) AS supply_date,
                    MAX(warranty_expiry) AS warranty_expiry,
                    DATEDIFF(MAX(warranty_expiry), DATE(MAX(created_at))) AS warranty_period_days
                FROM assets
                WHERE description LIKE 'Supplied by vendor for PO #%'
                GROUP BY CAST(SUBSTRING_INDEX(description, '#', -1) AS UNSIGNED)
             ) sp ON sp.po_id = po.id
             INNER JOIN vendor_org vo ON vo.org_key = o.v_opk AND vo.vendor_id = ?
             WHERE (
                po.vendor_id = ?
                OR (
                    po.vendor_id IS NULL
                    AND po.status = 'Requested'
                    AND NOT EXISTS (
                        SELECT 1
                        FROM purchase_orders myq
                        WHERE myq.supervisor_id = po.supervisor_id
                          AND myq.asset_name = po.asset_name
                          AND myq.created_at = po.created_at
                          AND myq.vendor_id = ?
                          AND myq.status IN ('Quoted', 'Approved', 'Delivered')
                    )
                )
             )
             ORDER BY po.created_at ASC, po.id ASC`,
            [req.user.id, req.user.id, req.user.id]
        );

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// POST create purchase order (Supervisor only)
router.post("/", verifyToken, async (req, res) => {
    if (req.user.role !== "Supervisor") {
        return res.status(403).json({ message: "Only Supervisors can create purchase orders" });
    }

    const { vendor_id, asset_name, quantity, quote } = req.body;

    if (!asset_name || !quantity) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    if (quantity <= 0) {
        return res.status(400).json({ message: "Quantity must be greater than zero" });
    }


    try {
        const [result] = await pool.query(
            "INSERT INTO purchase_orders (supervisor_id, vendor_id, asset_name, quantity, quote) VALUES (?, ?, ?, ?, ?)",
            [req.user.id, vendor_id || null, asset_name, quantity, quote || null]
        );

        res.status(201).json({ message: "Purchase order created", id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// PUT update status (Admin or Vendor)
router.put("/:id/status", verifyToken, async (req, res) => {
    const { status, quote, supply_quantity, warranty_expiry, asset_type } = req.body;
    const { id } = req.params;

    try {
        const [poRows] = await pool.query(
            `SELECT po.*, u.org_id, o.v_opk
             FROM purchase_orders po
             LEFT JOIN users u ON po.supervisor_id = u.id
             LEFT JOIN organizations o ON o.id = u.org_id
             WHERE po.id = ?`,
            [id]
        );
        if (poRows.length === 0) return res.status(404).json({ message: "Purchase order not found" });
        const po = poRows[0];

        if (req.user.role === "Vendor") {
            if (!["Quoted", "Delivered"].includes(status)) {
                return res.status(400).json({ message: "Invalid status for Vendor" });
            }

            if (status === "Quoted") {
                const quoteValue = Number(quote);
                if (!Number.isFinite(quoteValue) || quoteValue <= 0) {
                    return res.status(400).json({ message: "Valid quote is required" });
                }

                const [registeredRows] = await pool.query(
                    "SELECT id FROM vendor_org WHERE vendor_id = ? AND org_key = ?",
                    [req.user.id, po.v_opk]
                );
                if (registeredRows.length === 0) {
                    return res.status(403).json({ message: "Register with this organization first" });
                }
                if (po.vendor_id === req.user.id) {
                    // Vendor can revise only their own quoted/rejected row.
                    if (!["Quoted", "Rejected"].includes(po.status)) {
                        return res.status(400).json({ message: "Quote can only be updated from Quoted/Rejected state" });
                    }
                    await pool.query(
                        "UPDATE purchase_orders SET status = ?, quote = ? WHERE id = ?",
                        [status, quoteValue, id]
                    );
                } else if (po.vendor_id === null) {
                    // Broadcast requested row: create vendor-specific quote row.
                    if (po.status !== "Requested") {
                        return res.status(400).json({ message: "Only requested orders can be quoted" });
                    }

                    const [existingMyQuoteRows] = await pool.query(
                        `SELECT id, status
                         FROM purchase_orders
                         WHERE supervisor_id = ?
                           AND asset_name = ?
                           AND created_at = ?
                           AND vendor_id = ?
                         LIMIT 1`,
                        [po.supervisor_id, po.asset_name, po.created_at, req.user.id]
                    );

                    if (existingMyQuoteRows.length > 0) {
                        const myQuote = existingMyQuoteRows[0];
                        if (["Approved", "Delivered"].includes(myQuote.status)) {
                            return res.status(400).json({ message: "This quote is already approved/delivered" });
                        }

                        await pool.query(
                            "UPDATE purchase_orders SET status = ?, quote = ?, quantity = ? WHERE id = ?",
                            ["Quoted", quoteValue, po.quantity, myQuote.id]
                        );
                    } else {
                        await pool.query(
                            `INSERT INTO purchase_orders
                            (supervisor_id, vendor_id, asset_name, quantity, quote, status, created_at)
                            VALUES (?, ?, ?, ?, ?, 'Quoted', ?)`,
                            [po.supervisor_id, req.user.id, po.asset_name, po.quantity, quoteValue, po.created_at]
                        );
                    }
                } else {
                    // Fallback for stale UI / another vendor row: still allow this vendor to submit
                    // their own quote if this request is not finalized.
                    const [finalizedRows] = await pool.query(
                        `SELECT id
                         FROM purchase_orders
                         WHERE supervisor_id = ?
                           AND asset_name = ?
                           AND created_at = ?
                           AND status IN ('Approved', 'Delivered')
                         LIMIT 1`,
                        [po.supervisor_id, po.asset_name, po.created_at]
                    );
                    if (finalizedRows.length > 0) {
                        return res.status(403).json({ message: "Quote window is closed for this requirement" });
                    }

                    const [myQuoteRows] = await pool.query(
                        `SELECT id, status
                         FROM purchase_orders
                         WHERE supervisor_id = ?
                           AND asset_name = ?
                           AND created_at = ?
                           AND vendor_id = ?
                         LIMIT 1`,
                        [po.supervisor_id, po.asset_name, po.created_at, req.user.id]
                    );

                    if (myQuoteRows.length > 0) {
                        const myQuote = myQuoteRows[0];
                        if (["Approved", "Delivered"].includes(myQuote.status)) {
                            return res.status(400).json({ message: "This quote is already approved/delivered" });
                        }
                        await pool.query(
                            "UPDATE purchase_orders SET status = ?, quote = ?, quantity = ? WHERE id = ?",
                            ["Quoted", quoteValue, po.quantity, myQuote.id]
                        );
                    } else {
                        await pool.query(
                            `INSERT INTO purchase_orders
                            (supervisor_id, vendor_id, asset_name, quantity, quote, status, created_at)
                            VALUES (?, ?, ?, ?, ?, 'Quoted', ?)`,
                            [po.supervisor_id, req.user.id, po.asset_name, po.quantity, quoteValue, po.created_at]
                        );
                    }
                }
            } else {
                if (po.vendor_id !== req.user.id) {
                    return res.status(403).json({ message: "Access denied" });
                }
                if (po.status !== "Approved") {
                    return res.status(400).json({ message: "Order must be Approved before delivery" });
                }

                const supplyQty = parseInt(supply_quantity, 10);
                if (!Number.isInteger(supplyQty) || supplyQty <= 0) {
                    return res.status(400).json({ message: "Valid supply quantity is required" });
                }
                if (supplyQty > po.quantity) {
                    return res.status(400).json({ message: "Supply quantity cannot exceed pending quantity" });
                }
                if (!warranty_expiry) {
                    return res.status(400).json({ message: "Warranty expiry is required" });
                }

                let conn;
                try {
                    conn = await pool.getConnection();
                    await conn.beginTransaction();

                    // Re-check row in transaction to avoid race conditions on quantity updates.
                    const [currentRows] = await conn.query(
                        "SELECT id, quantity, status FROM purchase_orders WHERE id = ? FOR UPDATE",
                        [id]
                    );
                    if (currentRows.length === 0) {
                        await conn.rollback();
                        return res.status(404).json({ message: "Purchase order not found" });
                    }
                    const currentPo = currentRows[0];
                    if (currentPo.status !== "Approved") {
                        await conn.rollback();
                        return res.status(400).json({ message: "Order must be Approved before supply" });
                    }
                    if (supplyQty > currentPo.quantity) {
                        await conn.rollback();
                        return res.status(400).json({ message: "Supply quantity cannot exceed pending quantity" });
                    }

                    const [assetTemplateRows] = await conn.query(
                        `SELECT asset_type, category_id, location_id, room_id
                         FROM assets
                         WHERE org_id = ? AND name = ?
                         ORDER BY id DESC
                         LIMIT 1`,
                        [po.org_id, po.asset_name]
                    );
                    const template = assetTemplateRows[0] || {};

                    let resolvedAssetType = asset_type || template.asset_type || "Hardware";
                    if (!["Hardware", "Software"].includes(resolvedAssetType)) {
                        await conn.rollback();
                        return res.status(400).json({ message: "Invalid asset type" });
                    }

                    const categoryId = template.category_id || null;
                    const locationId = template.location_id || null;
                    const roomId = template.room_id || null;

                    // Serial format aligned with existing assets route.
                    const firstWord = po.asset_name.split(" ")[0].toUpperCase();
                    const assetNameOnly = po.asset_name.split(" ").slice(1).join(" ") || po.asset_name;
                    const initials = (assetNameOnly || po.asset_name)
                        .split(" ")
                        .filter(Boolean)
                        .map(word => word[0])
                        .join("")
                        .toUpperCase();
                    const typeCode = resolvedAssetType === "Hardware" ? "HW" : "SW";
                    const catCode = String(categoryId || 0);
                    const locCode = String(locationId || 0);
                    const prefix = `${firstWord}-${initials}-${typeCode}-${catCode}-${locCode}`;

                    const [lastRecord] = await conn.query(
                        "SELECT serial_number FROM assets WHERE serial_number LIKE ? ORDER BY serial_number DESC LIMIT 1",
                        [`${prefix}/%`]
                    );
                    let startSeq = 1;
                    if (lastRecord.length > 0) {
                        const lastSerial = lastRecord[0].serial_number;
                        const lastSeq = parseInt(String(lastSerial).split("/").pop(), 10);
                        if (!Number.isNaN(lastSeq)) {
                            startSeq = lastSeq + 1;
                        }
                    }

                    const serials = generateSerialNumbers(prefix, supplyQty, startSeq);
                    const purchaseDate = new Date().toISOString().slice(0, 10);
                    const assetRows = serials.map((serial) => ([
                        po.asset_name,
                        po.org_id,
                        `Supplied by vendor for PO #${po.id}`,
                        serial,
                        categoryId,
                        locationId,
                        roomId,
                        "Available",
                        resolvedAssetType,
                        purchaseDate,
                        warranty_expiry,
                        null,
                        req.user.id
                    ]));

                    await conn.query(
                        `INSERT INTO assets
                        (name, org_id, description, serial_number, category_id, location_id, room_id, status, asset_type, purchase_date, warranty_expiry, purchase_cost, created_by)
                        VALUES ?`,
                        [assetRows]
                    );

                    const remainingQty = currentPo.quantity - supplyQty;
                    if (remainingQty > 0) {
                        await conn.query(
                            "UPDATE purchase_orders SET quantity = ? WHERE id = ?",
                            [remainingQty, id]
                        );
                    } else {
                        await conn.query(
                            "UPDATE purchase_orders SET status = ?, quantity = 0 WHERE id = ?",
                            ["Delivered", id]
                        );
                    }

                    await conn.commit();

                    if (remainingQty > 0) {
                        return res.json({
                            message: `Supplied ${supplyQty} assets. Pending quantity: ${remainingQty}`,
                            pending_quantity: remainingQty
                        });
                    }
                    return res.json({ message: "Purchase order updated" });
                } catch (txErr) {
                    if (conn) {
                        await conn.rollback();
                    }
                    throw txErr;
                } finally {
                    if (conn) {
                        conn.release();
                    }
                }
            }

        } else if (req.user.role === "Super Admin") {
            // Admins can Approve or Reject
            if (!["Approved", "Rejected"].includes(status)) {
                return res.status(400).json({ message: "Invalid status for Admin" });
            }
            await pool.query("UPDATE purchase_orders SET status = ?, admin_id = ? WHERE id = ?", [status, req.user.id, id]);

            // If one vendor is approved, close the open request and other competing quoted rows.
            if (status === "Approved") {
                await pool.query(
                    `UPDATE purchase_orders
                     SET status = 'Rejected', admin_id = ?
                     WHERE supervisor_id = ?
                       AND asset_name = ?
                       AND created_at = ?
                       AND vendor_id IS NULL
                       AND status = 'Requested'`,
                    [req.user.id, po.supervisor_id, po.asset_name, po.created_at]
                );

                await pool.query(
                    `UPDATE purchase_orders
                     SET status = 'Rejected', admin_id = ?
                     WHERE supervisor_id = ?
                       AND asset_name = ?
                       AND created_at = ?
                       AND id <> ?
                       AND vendor_id IS NOT NULL
                       AND status = 'Quoted'`,
                    [req.user.id, po.supervisor_id, po.asset_name, po.created_at, id]
                );
            }
        } else {
            return res.status(403).json({ message: "Access denied" });
        }

        res.json({ message: "Purchase order updated" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// DELETE purchase order (Admin only)
router.delete("/:id", verifyToken, async (req, res) => {
    if (req.user.role !== "Super Admin") {
        return res.status(403).json({ message: "Access denied" });
    }

    try {
        await pool.query("DELETE FROM purchase_orders WHERE id = ?", [req.params.id]);
        res.json({ message: "Purchase order deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
