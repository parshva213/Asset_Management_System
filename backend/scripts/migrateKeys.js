import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function migrate() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'asset_management',
  };

  console.log('🔧 Database Migration: Adding PK columns\n');

  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ Connected to MySQL server.');

    // Add columns to organizations
    console.log('Updating organizations table...');
    try {
        const [cols] = await connection.query('DESCRIBE organizations');
        const colNames = cols.map(c => c.Field.toLowerCase());
        
        if (!colNames.includes('orgpk')) {
            await connection.query('ALTER TABLE organizations ADD COLUMN orgpk VARCHAR(5)');
            console.log('✅ Added orgpk to organizations.');
        }
        if (!colNames.includes('v_opk')) {
            await connection.query('ALTER TABLE organizations ADD COLUMN v_opk VARCHAR(5)');
            console.log('✅ Added v_opk to organizations.');
        }
    } catch (err) {
        console.log('⚠️  Could not update organizations table:', err.message);
    }

    // Update users table
    console.log('Updating users table...');
    try {
        const [cols] = await connection.query('DESCRIBE users');
        const colNames = cols.map(c => c.Field.toLowerCase());
        
        // Ensure unpk exists
        if (!colNames.includes('unpk')) {
            if (colNames.includes('ownpk')) {
                await connection.query('ALTER TABLE users ADD COLUMN unpk VARCHAR(5)');
                await connection.query('UPDATE users SET unpk = ownpk');
                console.log('✅ Migrated data from ownpk to unpk.');
            } else {
                await connection.query('ALTER TABLE users ADD COLUMN unpk VARCHAR(5)');
                console.log('✅ Added unpk column.');
            }
        }

        // Drop ownpk if it exists
        if (colNames.includes('ownpk')) {
            await connection.query('ALTER TABLE users DROP COLUMN ownpk');
            console.log('✅ Dropped ownpk column.');
        }

        // Ensure organization_id exists
        if (!colNames.includes('organization_id')) {
            await connection.query('ALTER TABLE users ADD COLUMN organization_id INT');
            await connection.query('ALTER TABLE users ADD CONSTRAINT fk_user_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL');
            console.log('✅ Added organization_id to users.');
        }
    } catch (err) {
        console.log('⚠️  Could not update users table:', err.message);
    }

    // Create key_vault table
    console.log('Checking key_vault table...');
    try {
        await connection.query(`
            CREATE TABLE IF NOT EXISTS key_vault (
                id INT PRIMARY KEY AUTO_INCREMENT,
                organization_id INT,
                key_value VARCHAR(5) NOT NULL,
                user_id INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
            )
        `);
        console.log('✅ key_vault table is ready.');
    } catch (err) {
        console.log('⚠️  Could not create key_vault table:', err.message);
    }

    await connection.end();
    console.log('\n✅ Migration completed!');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Migration failed!', err.message);
    process.exit(1);
  }
}

migrate();
