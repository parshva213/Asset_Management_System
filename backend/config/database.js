import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory or parent directory
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Validate required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  console.error('Please check your .env file in the backend directory or root directory.');
  process.exit(1);
}

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection on startup
pool.getConnection()
  .then(connection => {
    console.log('✅ Database connected successfully!');
    console.log(`   Host: ${process.env.DB_HOST}`);
    console.log(`   Database: ${process.env.DB_NAME}`);
    console.log(`   User: ${process.env.DB_USER}`);
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed!');
    console.error('Error details:', err.message);
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Troubleshooting tips:');
      console.error('   1. Check if your MySQL password is correct');
      console.error('   2. Verify DB_USER and DB_PASSWORD in your .env file');
      console.error('   3. Make sure MySQL server is running');
      console.error('   4. Try resetting MySQL root password if needed');
    }
    // Don't exit here - let the app start and show errors on first request
  });

export default pool;
