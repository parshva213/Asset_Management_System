import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from multiple locations
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function testConnection() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'asset_management',
  };

  console.log('🔍 Testing database connection...\n');
  console.log('Configuration:');
  console.log(`  Host: ${config.host}`);
  console.log(`  Port: ${config.port}`);
  console.log(`  User: ${config.user}`);
  console.log(`  Password: ${config.password ? '***' + config.password.slice(-2) : '(empty)'}`);
  console.log(`  Database: ${config.database}\n`);

  let connection;
  try {
    // First, try to connect without database (to check if MySQL is running and credentials are correct)
    console.log('Step 1: Testing MySQL server connection...');
    connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
    });
    console.log('✅ Successfully connected to MySQL server!\n');
    await connection.end();

    // Second, check if database exists
    console.log('Step 2: Checking if database exists...');
    connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
    });
    
    const [databases] = await connection.query('SHOW DATABASES LIKE ?', [config.database]);
    if (databases.length === 0) {
      console.log(`⚠️  Database '${config.database}' does not exist.`);
      console.log(`   Creating database '${config.database}'...`);
      await connection.query(`CREATE DATABASE IF NOT EXISTS ${config.database}`);
      console.log(`✅ Database '${config.database}' created successfully!\n`);
    } else {
      console.log(`✅ Database '${config.database}' exists!\n`);
    }
    await connection.end();

    // Third, connect to the specific database
    console.log('Step 3: Testing connection to database...');
    connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
    });
    
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`✅ Successfully connected to database '${config.database}'!`);
    console.log(`   Found ${tables.length} table(s) in the database.\n`);
    
    if (tables.length > 0) {
      console.log('Tables:');
      tables.forEach(table => {
        const tableName = Object.values(table)[0];
        console.log(`  - ${tableName}`);
      });
    }
    
    await connection.end();
    console.log('\n✅ All connection tests passed! Your database is ready to use.');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Connection failed!\n');
    console.error('Error Code:', err.code);
    console.error('Error Message:', err.message);
    
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 This is an authentication error. Possible solutions:');
      console.error('   1. The password in your .env file is incorrect');
      console.error('   2. The MySQL user does not exist or has been deleted');
      console.error('   3. The user exists but from a different host (not localhost)');
      console.error('\n📝 To fix this:');
      console.error('   Option A: Update DB_PASSWORD in your .env file with the correct password');
      console.error('   Option B: Reset MySQL root password');
      console.error('   Option C: Create a new MySQL user with proper permissions');
    } else if (err.code === 'ECONNREFUSED') {
      console.error('\n💡 MySQL server is not running or not accessible.');
      console.error('   Make sure MySQL service is started.');
    } else if (err.code === 'ER_BAD_DB_ERROR') {
      console.error(`\n💡 Database '${config.database}' does not exist.`);
      console.error('   Run the schema.sql file to create the database and tables.');
    } else {
      console.error('\n💡 Check the error details above and verify:');
      console.error('   - MySQL server is running');
      console.error('   - Database credentials are correct');
      console.error('   - Database exists (run schema.sql if needed)');
    }
    
    process.exit(1);
  }
}

testConnection();

