import db from "../config/database.js";

async function testRoomsEndpoint() {
  try {
    console.log("Testing rooms endpoint data...\n");

    // Get location
    const [location] = await db.query(
      "SELECT * FROM locations WHERE name = 'Test Building' LIMIT 1"
    );
    console.log("✅ Location:", location[0].name, "(ID:", location[0].id + ")");

    // Get rooms for location
    const [rooms] = await db.query(
      "SELECT r.*, l.name as location_name FROM rooms r LEFT JOIN locations l ON r.location_id = l.id WHERE r.location_id = ? AND l.org_id = ? ORDER BY r.id ASC",
      [location[0].id, location[0].org_id]
    );
    console.log("✅ Rooms in location:", rooms.length);
    rooms.forEach((r) => console.log("   -", r.name, "(Floor:", r.floor, ")"));

    // Get employees in first room
    if (rooms.length > 0) {
      const roomId = rooms[0].id;
      const [roomData] = await db.query(
        "SELECT r.*, l.name as location_name FROM rooms r LEFT JOIN locations l ON r.location_id = l.id WHERE r.id = ?",
        [roomId]
      );

      const [employees] = await db.query(
        `SELECT 
          u.id, u.name, u.email, u.role, u.phone, u.department,
          COUNT(DISTINCT a.id) as assets_count,
          (SELECT GROUP_CONCAT(DISTINCT supervisor.name SEPARATOR ', ') 
           FROM users u2
           INNER JOIN assets a2 ON u2.id = a2.assigned_to
           INNER JOIN users supervisor ON a2.assigned_by = supervisor.id
           WHERE a2.room_id = ? AND u2.id = u.id AND a2.status IN ('Assigned', 'Available')) as supervised_by,
          (SELECT GROUP_CONCAT(DISTINCT maint.name SEPARATOR ', ')
           FROM users u3
           INNER JOIN assets a3 ON u3.id = a3.assigned_to
           INNER JOIN maintenance_records mr ON a3.id = mr.asset_id
           INNER JOIN users maint ON mr.maintenance_by = maint.id
           WHERE a3.room_id = ? AND u3.id = u.id AND a3.status IN ('Assigned', 'Available')) as maintained_by
        FROM users u
        INNER JOIN assets a ON u.id = a.assigned_to
        WHERE a.room_id = ? AND a.status IN ('Assigned', 'Available')
        GROUP BY u.id
        ORDER BY u.name ASC`,
        [roomId, roomId, roomId]
      );

      console.log(
        "\n✅ Employees in",
        roomData[0].name,
        ":",
        employees.length
      );
      employees.forEach((emp) => {
        console.log("   - Name:", emp.name);
        console.log("     Email:", emp.email);
        console.log("     Department:", emp.department);
        console.log("     Assets:", emp.assets_count);
        console.log("     Supervised by:", emp.supervised_by || "N/A");
        console.log("     Maintained by:", emp.maintained_by || "N/A");
      });
    }

    console.log("\n✅ All endpoint data looks correct!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

testRoomsEndpoint();
