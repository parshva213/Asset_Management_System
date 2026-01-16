import pool from "../config/database.js";
import { generateKey } from "./keyGenerator.js";

/**
 * Generates a unique key by checking against organizations (orgpk, v_opk) and users (ownpk).
 * Retries until a unique key is found.
 * @returns {Promise<string>} - A unique 5-character key
 */
export const generateUniqueKey = async () => {
    let isUnique = false;
    let key = "";

    while (!isUnique) {
        key = generateKey(5);
        
        // Check availability in all relevant columns
        // We act optimistically; if any match found, we retry.
        try {
            const [orgPkResult] = await pool.query("SELECT id FROM organizations WHERE orgpk = ?", [key]);
            if (orgPkResult.length > 0) continue;

            const [vOpkResult] = await pool.query("SELECT id FROM organizations WHERE v_opk = ?", [key]);
            if (vOpkResult.length > 0) continue;

            const [userOwnPkResult] = await pool.query("SELECT id FROM users WHERE ownpk = ?", [key]);
            if (userOwnPkResult.length > 0) continue;

            // If we reach here, it's unique
            isUnique = true;
        } catch (err) {
            console.error("Error checking key uniqueness:", err);
            // In case of DB error, break loop to avoid infinite loop -> rethrow
            throw err;
        }
    }

    return key;
};
