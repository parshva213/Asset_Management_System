import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

async function checkAdminUser() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    const [rows] = await pool.query(
      "SELECT id, email, password, role FROM users WHERE role = 'Super Admin' OR email = 'admin@example.com'"
    );
    console.log("Admin user records:", rows);
  } catch (err) {
    console.error("Error querying admin user:", err);
  } finally {
    await pool.end();
  }
}

checkAdminUser();
