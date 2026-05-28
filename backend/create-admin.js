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

const hash = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 12);

pool.query(
  'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
  ['Admin', process.env.ADMIN_EMAIL, hash, 'admin']
).then(() => {
  console.log('✅ Admin account created!');
  console.log('Email:', process.env.ADMIN_EMAIL);
  console.log('You can now log in with these credentials.');
  process.exit(0);
}).catch(err => {
  if (err.code === '23505') {
    console.log('⚠️  Admin account already exists!');
  } else {
    console.error('❌ Error:', err.message);
  }
  process.exit(1);
});
