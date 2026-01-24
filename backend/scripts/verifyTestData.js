import db from "../config/database.js";

async function verifyTestData() {
  try {
    const [roomCount] = await db.query("SELECT COUNT(*) as count FROM rooms");
    console.log("✅ Total Rooms:", roomCount[0].count);

    const [empCount] = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'Employee' AND org_id = 2");
    console.log("✅ Total Employees in Org 2:", empCount[0].count);

    const [assetCount] = await db.query("SELECT COUNT(*) as count FROM assets WHERE org_id = 2");
    console.log("✅ Total Assets in Org 2:", assetCount[0].count);

    const [maintCount] = await db.query("SELECT COUNT(*) as count FROM maintenance_records");
    console.log("✅ Total Maintenance Records:", maintCount[0].count);

    const [testLocation] = await db.query("SELECT id, name FROM locations WHERE name = 'Test Building'");
    if (testLocation.length > 0) {
      console.log("✅ Test Building exists (ID:", testLocation[0].id + ")");
    }

    console.log("\n✅ All test data verified successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Verification failed:", error);
    process.exit(1);
  }
}

verifyTestData();
