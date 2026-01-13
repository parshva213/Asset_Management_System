import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function check() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'asset_management',
  };

  try {
    const connection = await mysql.createConnection(config);
    
    console.log('--- Organizations Table ---');
    try {
        const [orgCols] = await connection.query('DESCRIBE organizations');
        orgCols.forEach(col => console.log(`${col.Field}: ${col.Type}`));
    } catch (e) {
        console.log('Organizations table does not exist.');
    }

    console.log('\n--- Users Table ---');
    try {
        const [userCols] = await connection.query('DESCRIBE users');
        userCols.forEach(col => console.log(`  - ${col.Field}: ${col.Type}`));
    } catch (e) {
        console.log('Users table does not exist.');
    }

    await connection.end();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
