import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function run() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('Cleaning up schema...');
        await connection.query('DROP TABLE IF EXISTS key_vault');
        console.log('Dropped key_vault.');

        const [cols] = await connection.query('DESCRIBE users');
        const names = cols.map(c => c.Field.toLowerCase());

        if (names.includes('ownpk')) {
            // Check if ownpk is used as a foreign key somewhere
            console.log('Attempting to drop ownpk...');
            try {
                await connection.query('ALTER TABLE users DROP COLUMN ownpk');
                console.log('✅ Dropped ownpk.');
            } catch (err) {
                console.log('⚠️ Could not drop ownpk directly:', err.message);
                // Try to find and drop constraints first
                const [constraints] = await connection.query(`
                    SELECT CONSTRAINT_NAME 
                    FROM information_schema.KEY_COLUMN_USAGE 
                    WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'ownpk'
                `);
                for (const c of constraints) {
                    await connection.query(`ALTER TABLE users DROP FOREIGN KEY ${c.CONSTRAINT_NAME}`);
                    console.log(`Dropped constraint ${c.CONSTRAINT_NAME}`);
                }
                await connection.query('ALTER TABLE users DROP COLUMN ownpk');
                console.log('✅ Dropped ownpk after dropping constraints.');
            }
        }

        if (!names.includes('unpk')) {
            await connection.query('ALTER TABLE users ADD COLUMN unpk VARCHAR(5)');
            console.log('✅ Added unpk.');
        }

        if (!names.includes('organization_id')) {
            await connection.query('ALTER TABLE users ADD COLUMN organization_id INT');
            try {
                await connection.query('ALTER TABLE users ADD CONSTRAINT fk_user_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL');
                console.log('✅ Added organization_id and foreign key.');
            } catch (err) {
                console.log('⚠️ Could not add foreign key for organization_id:', err.message);
            }
        }

        console.log('Creating key_vault...');
        await connection.query(`
            CREATE TABLE key_vault (
                id INT PRIMARY KEY AUTO_INCREMENT,
                organization_id INT,
                key_value VARCHAR(5) NOT NULL,
                user_id INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
            )
        `);
        console.log('✅ Created key_vault.');

    } catch (e) {
        console.error('❌ Migration Error:', e);
    } finally {
        await connection.end();
        process.exit();
    }
}

run();
