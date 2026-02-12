import pool from './config/database.js';

async function diagnoseEmployeeAssets() {
    try {
        console.log("=".repeat(60));
        console.log("EMPLOYEE ASSETS DIAGNOSTIC TOOL");
        console.log("=".repeat(60));

        // 1. Find all Employee users
        console.log("\n[1] Finding all Employee users...");
        const [employees] = await pool.query(
            "SELECT id, name, email, role, org_id FROM users WHERE role = 'Employee'"
        );

        console.log(`✓ Found ${employees.length} employee(s):`);
        employees.forEach(emp => {
            console.log(`  - ID: ${emp.id}, Name: ${emp.name}, Email: ${emp.email}, Org: ${emp.org_id}`);
        });

        // 2. Check total assets in the system
        console.log("\n[2] Checking total assets in database...");
        const [totalAssets] = await pool.query("SELECT COUNT(*) as count FROM assets");
        console.log(`✓ Total assets in system: ${totalAssets[0].count}`);

        // 3. Check assets with assigned_to set
        console.log("\n[3] Checking assets with assigned_to values...");
        const [assignedAssets] = await pool.query(
            "SELECT id, name, assigned_to, status, org_id FROM assets WHERE assigned_to IS NOT NULL"
        );
        console.log(`✓ Found ${assignedAssets.length} assets with assigned_to set:`);
        assignedAssets.forEach(asset => {
            console.log(`  - Asset ID: ${asset.id}, Name: ${asset.name}, Assigned To User ID: ${asset.assigned_to}, Status: ${asset.status}`);
        });

        // 4. For each employee, run the exact query used by the API
        console.log("\n[4] Running exact API query for each employee...");
        for (const employee of employees) {
            console.log(`\n  Testing for Employee: ${employee.name} (ID: ${employee.id})`);

            // This is the exact query from routes/assets.js
            const query = `
                SELECT a.*, u.name as assign,
                c.name as category_name,
                l.name as location_name,
                r.name as room_name,
                COALESCE(asum.quantity, 0) as quantity,
                COALESCE(asum.assigned_total, 0) as assigned_total,
                COALESCE(asum.available_total, 0) as available_total
                FROM assets a 
                LEFT JOIN users u ON a.assigned_to = u.id
                LEFT JOIN categories c ON a.category_id = c.id
                LEFT JOIN locations l ON a.location_id = l.id
                LEFT JOIN rooms r ON a.room_id = r.id
                LEFT JOIN (
                  SELECT name, location_id, org_id, COUNT(*) as quantity, 
                         SUM(status = 'Assigned') as assigned_total, 
                         SUM(status = 'Available') as available_total
                  FROM assets
                  GROUP BY name, location_id, org_id
                ) asum ON a.name = asum.name AND a.location_id = asum.location_id AND a.org_id = asum.org_id
                WHERE a.org_id = ? AND a.assigned_to = ?
                ORDER BY a.id ASC
            `;

            const [results] = await pool.query(query, [employee.org_id, employee.id]);
            console.log(`  ✓ Query returned ${results.length} asset(s)`);

            if (results.length > 0) {
                results.forEach(asset => {
                    console.log(`    - ${asset.name} (Serial: ${asset.serial_number}, Status: ${asset.status})`);
                });
            } else {
                console.log(`    ⚠ No assets found for this employee!`);
            }
        }

        // 5. Cross-check: Show which users have assets assigned
        console.log("\n[5] Cross-checking: Users who have assets assigned to them...");
        const [usersWithAssets] = await pool.query(`
            SELECT DISTINCT u.id, u.name, u.role, COUNT(a.id) as asset_count
            FROM users u
            INNER JOIN assets a ON a.assigned_to = u.id
            GROUP BY u.id, u.name, u.role
        `);

        console.log(`✓ Found ${usersWithAssets.length} user(s) with assigned assets:`);
        usersWithAssets.forEach(user => {
            console.log(`  - User ID: ${user.id}, Name: ${user.name}, Role: ${user.role}, Assets: ${user.asset_count}`);
        });

        console.log("\n" + "=".repeat(60));
        console.log("DIAGNOSTIC COMPLETE");
        console.log("=".repeat(60));

    } catch (err) {
        console.error("❌ Error during diagnosis:", err);
    } finally {
        process.exit();
    }
}

diagnoseEmployeeAssets();
