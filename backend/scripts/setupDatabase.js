import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from multiple locations
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function setupDatabase() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'asset_management',
  };

  console.log('🔧 Database Setup Script\n');
  console.log('This script will help you set up your database.\n');

  let connection;
  try {
    // Step 1: Connect to MySQL (without database)
    console.log('Step 1: Connecting to MySQL server...');
    connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
    });
    console.log('✅ Connected to MySQL server!\n');

    // Step 2: Create database if it doesn't exist
    console.log(`Step 2: Creating database '${config.database}' if it doesn't exist...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\``);
    console.log(`✅ Database '${config.database}' is ready!\n`);

    // Step 3: Use the database
    await connection.query(`USE \`${config.database}\``);

    // Step 4: Check if schema.sql exists and offer to run it
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    try {
      const schemaSQL = readFileSync(schemaPath, 'utf8');
      console.log('Step 3: Found schema.sql file.');
      console.log('⚠️  Note: This script does not automatically run schema.sql');
      console.log('   Please run it manually using:');
      console.log(`   mysql -u ${config.user} -p ${config.database} < database/schema.sql\n`);
    } catch (err) {
      console.log('Step 3: schema.sql not found (this is okay if you already have tables).\n');
    }

    // Step 5: Show current tables
    const [tables] = await connection.query('SHOW TABLES');
    if (tables.length > 0) {
      console.log(`✅ Found ${tables.length} existing table(s):`);
      tables.forEach(table => {
        const tableName = Object.values(table)[0];
        console.log(`   - ${tableName}`);
      });
    } else {
      console.log('⚠️  No tables found. You need to run schema.sql to create the tables.');
    }

    await connection.end();
    console.log('\n✅ Database setup check completed!');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Setup failed!\n');
    console.error('Error Code:', err.code);
    console.error('Error Message:', err.message);
    
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Authentication Error - Your MySQL password is incorrect.');
      console.error('\n📝 How to fix:');
      console.error('   1. Find your correct MySQL root password');
      console.error('   2. Update DB_PASSWORD in your .env file');
      console.error('   3. If you forgot the password, you need to reset it:');
      console.error('      - Windows: Use MySQL Workbench or Command Prompt');
      console.error('      - Or follow MySQL password reset guide for your OS');
    }
    
    process.exit(1);
  }
}

setupDatabase();

