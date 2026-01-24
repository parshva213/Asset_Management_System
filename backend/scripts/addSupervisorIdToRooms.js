import db from '../config/database.js';

(async () => {
  try {
    console.log('Checking if supervisor_id column exists in rooms table...');
    
    const [columns] = await db.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'rooms' AND COLUMN_NAME = 'supervisor_id'
    `);

    if (columns.length > 0) {
      console.log('✅ supervisor_id column already exists');
    } else {
      console.log('Adding supervisor_id column to rooms table...');
      await db.query(`
        ALTER TABLE rooms 
        ADD COLUMN supervisor_id INT AFTER capacity,
        ADD FOREIGN KEY (supervisor_id) REFERENCES users(id) ON DELETE SET NULL
      `);
      console.log('✅ supervisor_id column added successfully');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
