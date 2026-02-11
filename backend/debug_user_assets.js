import pool from './config/database.js';

async function debugAssets() {
    try {
        console.log("Searching for user 'rtgh'...");
        // Find user by name "rtgh" (fuzzy match just in case)
        const [users] = await pool.query("SELECT * FROM users WHERE name LIKE ?", ['%rtgh%']);

        if (users.length === 0) {
            console.log("User 'rtgh' not found!");
            // List top 5 users to see what's there
            const [allUsers] = await pool.query("SELECT * FROM users LIMIT 5");
            console.log("First 5 users in DB:", allUsers.map(u => ({ id: u.id, name: u.name, role: u.role })));
            process.exit(1);
        }

        const user = users[0];
        console.log("User found:", {
            id: user.id,
            name: user.name,
            role: user.role,
            org_id: user.org_id
        });

        console.log(`\nSearching for assets assigned to user ID ${user.id}...`);
        const [assets] = await pool.query(
            "SELECT * FROM assets WHERE assigned_to = ?",
            [user.id]
        );

        console.log(`Found ${assets.length} assets assigned to user.`);
        if (assets.length > 0) {
            assets.forEach(a => {
                console.log(`- Asset ID: ${a.id}, Name: ${a.name}, Org ID: ${a.org_id}, Status: ${a.status}`);
            });
        } else {
            // Check if there are ANY assets in the system
            const [totalAssets] = await pool.query("SELECT COUNT(*) as count FROM assets");
            console.log(`Total assets in system: ${totalAssets[0].count}`);

            // Check assets with similar org_id
            const [orgAssets] = await pool.query("SELECT * FROM assets WHERE org_id = ? LIMIT 5", [user.org_id]);
            console.log(`First 5 assets for Org ${user.org_id}:`, orgAssets.map(a => ({
                id: a.id,
                name: a.name,
                assigned_to: a.assigned_to,
                status: a.status
            })));
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        process.exit();
    }
}

debugAssets();
