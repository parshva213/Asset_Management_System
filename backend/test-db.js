import pool from './config/database.js';

async function test() {
  const [rows] = await pool.query('SELECT * FROM locations');
  console.log(rows);
  process.exit(0);
}

test();
