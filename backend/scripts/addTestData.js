import db from "../config/database.js";

async function addTestData() {
  try {
    console.log("Starting to add test data...");

    // Get organization (assuming org_id = 2)
    const orgId = 2;

    // Get location (Test Building)
    let [locations] = await db.query(
      "SELECT id FROM locations WHERE name = 'Test Building' LIMIT 1"
    );

    let locationId;
    if (locations.length === 0) {
      const [result] = await db.query(
        "INSERT INTO locations (org_id, name, address, description) VALUES (?, ?, ?, ?)",
        [orgId, "Test Building", "123 Main Street", "Test Building for Demo"]
      );
      locationId = result.insertId;
      console.log(`✅ Created location: Test Building (ID: ${locationId})`);
    } else {
      locationId = locations[0].id;
      console.log(`✅ Found existing location: Test Building (ID: ${locationId})`);
    }

    // Create rooms
    const roomNames = [
      {
        name: "Conference Room A",
        floor: "1",
        capacity: 20,
        description: "Large conference room",
      },
      {
        name: "Office 101",
        floor: "1",
        capacity: 4,
        description: "Small office space",
      },
      {
        name: "Server Room",
        floor: "2",
        capacity: 2,
        description: "IT Server Room",
      },
    ];

    const roomIds = [];
    for (const room of roomNames) {
      let [existingRooms] = await db.query(
        "SELECT id FROM rooms WHERE name = ? AND location_id = ?",
        [room.name, locationId]
      );

      if (existingRooms.length === 0) {
        const [result] = await db.query(
          "INSERT INTO rooms (name, floor, capacity, description, location_id) VALUES (?, ?, ?, ?, ?)",
          [room.name, room.floor, room.capacity, room.description, locationId]
        );
        roomIds.push(result.insertId);
        console.log(`✅ Created room: ${room.name} (ID: ${result.insertId})`);
      } else {
        roomIds.push(existingRooms[0].id);
        console.log(
          `✅ Found existing room: ${room.name} (ID: ${existingRooms[0].id})`
        );
      }
    }

    // Get supervisor
    let [supervisors] = await db.query(
      "SELECT id FROM users WHERE role = 'Supervisor' AND org_id = 2 LIMIT 1"
    );
    const supervisorId = supervisors.length > 0 ? supervisors[0].id : null;
    console.log(`✅ Supervisor ID: ${supervisorId}`);

    // Get or create maintenance staff
    let [maintenance] = await db.query(
      "SELECT id FROM users WHERE role = 'Maintenance' AND org_id = 2 LIMIT 1"
    );
    const maintenanceId = maintenance.length > 0 ? maintenance[0].id : null;
    console.log(`✅ Maintenance ID: ${maintenanceId}`);

    // Get super admin
    let [superAdmin] = await db.query(
      "SELECT id FROM users WHERE role = 'Super Admin' AND org_id = 2 LIMIT 1"
    );
    const superAdminId = superAdmin.length > 0 ? superAdmin[0].id : null;
    console.log(`✅ Super Admin ID: ${superAdminId}`);

    // Create test employees
    const employees = [
      {
        name: "John Employee",
        email: "john.emp@test.com",
        password: "$2a$10$qJShzocPNsFZSsd7MY4lyeaovrz1OosjRBixqA9BQGhgwoMxewuvm",
        department: "IT",
        phone: "9999999999",
        ownpk: "TEST001",
        unpk: "EMP01",
        roomId: roomIds[0],
      },
      {
        name: "Jane Employee",
        email: "jane.emp@test.com",
        password: "$2a$10$qJShzocPNsFZSsd7MY4lyeaovrz1OosjRBixqA9BQGhgwoMxewuvm",
        department: "IT",
        phone: "9999999998",
        ownpk: "TEST002",
        unpk: "EMP02",
        roomId: roomIds[0],
      },
      {
        name: "Bob Employee",
        email: "bob.emp@test.com",
        password: "$2a$10$qJShzocPNsFZSsd7MY4lyeaovrz1OosjRBixqA9BQGhgwoMxewuvm",
        department: "Operations",
        phone: "9999999997",
        ownpk: "TEST003",
        unpk: "EMP03",
        roomId: roomIds[1],
      },
    ];

    const employeeIds = [];
    for (const emp of employees) {
      let [existingEmps] = await db.query(
        "SELECT id FROM users WHERE email = ?",
        [emp.email]
      );

      if (existingEmps.length === 0) {
        const [result] = await db.query(
          "INSERT INTO users (name, email, password, role, status, department, phone, ownpk, unpk, org_id, loc_id, room_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            emp.name,
            emp.email,
            emp.password,
            "Employee",
            "Active",
            emp.department,
            emp.phone,
            emp.ownpk,
            emp.unpk,
            2,
            locationId,
            emp.roomId,
          ]
        );
        employeeIds.push(result.insertId);
        console.log(`✅ Created employee: ${emp.name} (ID: ${result.insertId})`);
      } else {
        employeeIds.push(existingEmps[0].id);
        console.log(
          `✅ Found existing employee: ${emp.name} (ID: ${existingEmps[0].id})`
        );
      }
    }

    // Get category
    let [categories] = await db.query("SELECT id FROM categories LIMIT 1");
    const categoryId = categories.length > 0 ? categories[0].id : 1;
    console.log(`✅ Category ID: ${categoryId}`);

    // Create test assets
    const assets = [
      {
        name: "Laptop Dell XPS",
        serial: "DELL-001-TEST",
        description: "Developer Laptop",
        roomId: roomIds[0],
        employeeId: employeeIds[0],
      },
      {
        name: "Monitor LG 27\"",
        serial: "LG-001-TEST",
        description: "High Resolution Monitor",
        roomId: roomIds[0],
        employeeId: employeeIds[0],
      },
      {
        name: "Keyboard Mechanical",
        serial: "KEY-001-TEST",
        description: "RGB Mechanical Keyboard",
        roomId: roomIds[0],
        employeeId: employeeIds[1],
      },
      {
        name: "Office Chair",
        serial: "CHAIR-001-TEST",
        description: "Ergonomic Office Chair",
        roomId: roomIds[1],
        employeeId: employeeIds[2],
      },
    ];

    const assetIds = [];
    for (const asset of assets) {
      let [existingAssets] = await db.query(
        "SELECT id FROM assets WHERE serial_number = ?",
        [asset.serial]
      );

      if (existingAssets.length === 0) {
        const [result] = await db.query(
          "INSERT INTO assets (name, description, serial_number, category_id, location_id, room_id, status, asset_type, purchase_date, assigned_to, assigned_by, created_by, org_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            asset.name,
            asset.description,
            asset.serial,
            categoryId,
            locationId,
            asset.roomId,
            "Assigned",
            "Hardware",
            new Date(),
            asset.employeeId,
            supervisorId,
            superAdminId,
            orgId,
          ]
        );
        assetIds.push(result.insertId);
        console.log(
          `✅ Created asset: ${asset.name} - Serial: ${asset.serial} (ID: ${result.insertId})`
        );
      } else {
        assetIds.push(existingAssets[0].id);
        console.log(
          `✅ Found existing asset: ${asset.name} - Serial: ${asset.serial} (ID: ${existingAssets[0].id})`
        );
      }
    }

    // Create maintenance records
    if (assetIds.length > 0 && maintenanceId) {
      for (let i = 0; i < Math.min(2, assetIds.length); i++) {
        const [result] = await db.query(
          "INSERT INTO maintenance_records (asset_id, maintenance_by, maintenance_type, description, status) VALUES (?, ?, ?, ?, ?)",
          [
            assetIds[i],
            maintenanceId,
            "Configuration",
            "Initial Setup and Configuration",
            "Completed",
          ]
        );
        console.log(
          `✅ Created maintenance record for asset ${assetIds[i]} (ID: ${result.insertId})`
        );
      }
    }

    console.log("\n📊 Summary:");
    console.log(`   - Location: Test Building (ID: ${locationId})`);
    console.log(`   - Rooms created: ${roomIds.length}`);
    console.log(`   - Employees created: ${employeeIds.length}`);
    console.log(`   - Assets created: ${assetIds.length}`);
    console.log(`   - Maintenance records created: ${Math.min(2, assetIds.length)}`);
    console.log("\n✅ Test data added successfully!");
  } catch (error) {
    console.error("❌ Error adding test data:", error);
    process.exit(1);
  }
}

addTestData().then(() => process.exit(0));
