const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

const newEmail = 'gapatel0708@gmail.com';
const newPassword = 'Dhairya@2212';
const hash = bcrypt.hashSync(newPassword, 12);

pool.query(
  'UPDATE users SET email = $1, password = $2 WHERE role = $3',
  [newEmail, hash, 'admin']
).then(result => {
  if (result.rowCount > 0) {
    console.log('✅ Admin account updated successfully!');
    console.log('New Email:', newEmail);
    console.log('Password updated');
    console.log('\nYou can now log in with these credentials.');
  } else {
    console.log('⚠️ No admin account found!');
  }
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
