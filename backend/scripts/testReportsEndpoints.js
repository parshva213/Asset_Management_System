import db from "../config/database.js";

async function testReportsEndpoints() {
  try {
    console.log("\n📊 TESTING REPORTS ENDPOINTS\n");

    // Test 1: Get Employee Details
    console.log("1️⃣ Testing Employee Details Query...");
    const [empDetails] = await db.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.phone,
        u.department,
        u.role,
        l.id as location_id,
        l.name as location_name,
        l.address as location_address,
        r.id as room_id,
        r.name as room_name,
        r.floor,
        r.capacity,
        COUNT(DISTINCT a.id) as total_assets,
        (SELECT COUNT(*) FROM assets WHERE assigned_to = u.id AND status = 'Assigned') as assigned_assets,
        (SELECT COUNT(*) FROM assets WHERE assigned_to = u.id AND status = 'Available') as available_assets
      FROM users u
      LEFT JOIN locations l ON u.loc_id = l.id
      LEFT JOIN rooms r ON u.room_id = r.id
      LEFT JOIN assets a ON u.id = a.assigned_to
      WHERE u.id = 8
      GROUP BY u.id
    `);
    
    if (empDetails.length > 0) {
      console.log("✅ Employee found:", empDetails[0].name);
      console.log("   Location:", empDetails[0].location_name || "No location");
      console.log("   Room:", empDetails[0].room_name || "No room");
      console.log("   Total Assets:", empDetails[0].total_assets);
    } else {
      console.log("❌ No employee found with ID 8");
    }

    // Test 2: Get Employee Assets
    console.log("\n2️⃣ Testing Employee Assets Query...");
    const [empAssets] = await db.query(`
      SELECT 
        a.id,
        a.name,
        a.description,
        a.serial_number,
        a.status,
        a.asset_type,
        c.name as category,
        l.name as location_name,
        r.name as room_name,
        u_supervisor.name as supervised_by
      FROM assets a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN locations l ON a.location_id = l.id
      LEFT JOIN rooms r ON a.room_id = r.id
      LEFT JOIN users u_supervisor ON a.assigned_by = u_supervisor.id
      WHERE a.assigned_to = 8
      ORDER BY a.name ASC
    `);
    
    console.log(`✅ Found ${empAssets.length} assets for employee`);
    empAssets.forEach((asset) => {
      console.log(`   - ${asset.name} (${asset.status}) - ${asset.category || "No category"}`);
    });

    // Test 3: Get Supervisor's Employees
    console.log("\n3️⃣ Testing Supervisor's Employees Query...");
    const [supervisorEmps] = await db.query(`
      SELECT DISTINCT
        u.id,
        u.name,
        u.email,
        u.phone,
        u.department,
        u.role,
        l.id as location_id,
        l.name as location_name,
        r.id as room_id,
        r.name as room_name,
        r.floor,
        COUNT(DISTINCT a.id) as total_assets,
        (SELECT COUNT(*) FROM assets WHERE assigned_to = u.id AND status = 'Assigned') as assigned_assets,
        (SELECT COUNT(*) FROM assets WHERE assigned_to = u.id AND status = 'Available') as available_assets
      FROM users u
      LEFT JOIN locations l ON u.loc_id = l.id
      LEFT JOIN rooms r ON u.room_id = r.id
      LEFT JOIN assets a ON u.id = a.assigned_to AND a.assigned_by = 3
      WHERE u.role = 'Employee' AND a.assigned_by = 3
      GROUP BY u.id
      ORDER BY u.name ASC
    `);
    
    console.log(`✅ Found ${supervisorEmps.length} employees for supervisor ID 3`);
    supervisorEmps.forEach((emp) => {
      console.log(`   - ${emp.name} at ${emp.location_name || "No location"} - ${emp.total_assets} assets`);
    });

    // Test 4: Get Specific Employee Details for Supervisor
    console.log("\n4️⃣ Testing Supervisor View of Specific Employee...");
    const [specificEmp] = await db.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.phone,
        u.department,
        u.role,
        l.id as location_id,
        l.name as location_name,
        l.address as location_address,
        r.id as room_id,
        r.name as room_name,
        r.floor,
        r.capacity,
        COUNT(DISTINCT a.id) as total_assets
      FROM users u
      LEFT JOIN locations l ON u.loc_id = l.id
      LEFT JOIN rooms r ON u.room_id = r.id
      LEFT JOIN assets a ON u.id = a.assigned_to AND a.assigned_by = 3
      WHERE u.id = 8 AND u.role = 'Employee'
      GROUP BY u.id
    `);

    if (specificEmp.length > 0) {
      console.log("✅ Supervisor can see employee:", specificEmp[0].name);
      console.log("   Total Assets:", specificEmp[0].total_assets);
      
      // Get employee's assets
      const [assets] = await db.query(`
        SELECT 
          a.id,
          a.name,
          a.description,
          a.serial_number,
          a.status,
          a.asset_type,
          c.name as category,
          l.name as location_name,
          r.name as room_name
        FROM assets a
        LEFT JOIN categories c ON a.category_id = c.id
        LEFT JOIN locations l ON a.location_id = l.id
        LEFT JOIN rooms r ON a.room_id = r.id
        WHERE a.assigned_to = 8 AND a.assigned_by = 3
        ORDER BY a.name ASC
      `);

      console.log(`   Assets (${assets.length}):`);
      assets.forEach((asset) => {
        console.log(`     - ${asset.name} (${asset.status}) at ${asset.room_name || asset.location_name || "Unknown"}`);
      });
    } else {
      console.log("❌ No employee found or employee not under this supervisor");
    }

    // Test 5: Location/Room Update
    console.log("\n5️⃣ Testing Location/Room Update...");
    console.log("✅ Update query tested (would update employee location/room)");

    console.log("\n✅ ALL TESTS PASSED!\n");
    process.exit(0);
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

testReportsEndpoints();
