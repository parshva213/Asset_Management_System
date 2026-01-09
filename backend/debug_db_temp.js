import mysql from 'mysql2/promise';

async function check() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Parshva@21',
            database: 'asset_management'
        });

        console.log("Connected to DB");

        const [rows] = await connection.execute('SELECT id, name, email, role, department FROM users WHERE email = ?', ['admin@gmail.com']);
        console.log("User data:");
        console.log(JSON.stringify(rows, null, 2));

        await connection.end();
    } catch (err) {
        console.error("Error:", err);
    }
}

check();

