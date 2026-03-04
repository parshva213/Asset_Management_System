import db from "../config/database.js";

async function expandAssetRequestsDescription() {
  try {
    console.log("Expanding asset_requests description column...");
    
    // Expand description column from VARCHAR(100) to VARCHAR(1000)
    await db.execute(
      "ALTER TABLE asset_requests MODIFY COLUMN description VARCHAR(1000)"
    );
    
    // Also expand reason and response columns for consistency
    await db.execute(
      "ALTER TABLE asset_requests MODIFY COLUMN reason VARCHAR(500)"
    );
    
    await db.execute(
      "ALTER TABLE asset_requests MODIFY COLUMN response VARCHAR(1000)"
    );
    
    console.log("✓ Successfully expanded asset_requests columns");
    console.log("  - description: VARCHAR(100) → VARCHAR(1000)");
    console.log("  - reason: VARCHAR(100) → VARCHAR(500)");
    console.log("  - response: VARCHAR(100) → VARCHAR(1000)");
    
    process.exit(0);
  } catch (error) {
    console.error("Error expanding columns:", error);
    process.exit(1);
  }
}

expandAssetRequestsDescription();
