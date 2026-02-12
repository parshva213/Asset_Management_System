const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

async function checkSchema() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  const [rows] = await connection.execute('DESCRIBE assets');
  console.log(JSON.stringify(rows, null, 2));
  await connection.end();
}

checkSchema().catch(console.error);
