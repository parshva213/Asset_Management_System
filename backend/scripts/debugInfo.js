import pool from '../config/database.js';

async function check() {
  try {
    const [users] = await pool.query('DESCRIBE users');
    console.log('Users Columns:', users.map(u => u.Field));
    
    const [vault] = await pool.query('DESCRIBE key_vault');
    console.log('Key Vault Columns:', vault.map(k => k.Field));

    const [orgs] = await pool.query('SELECT name, member FROM organizations');
    console.log('Organizations:', JSON.stringify(orgs, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit();
  }
}

check();
