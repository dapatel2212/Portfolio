const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:Dhairya@2212@db.ztmyqgnppqbwkxcpvmgi.supabase.co:5432/postgres?sslmode=require'
});

const hash = bcrypt.hashSync('Dhairya@2212', 12);

pool.query(
  'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
  ['Admin', 'dapatel221206@gmail.com', hash, 'admin']
).then(() => {
  console.log('✅ Admin account created on Supabase!');
  console.log('Email: dapatel221206@gmail.com');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
