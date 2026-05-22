// Ejecutar una sola vez: node setup-admin.js
// Crea o actualiza el usuario admin con la contrasena correcta

require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function setupAdmin() {
  const email = 'admin@ecoturismo.com';
  const password = 'admin123';
  const nombre = 'Administrador';

  const hash = await bcrypt.hash(password, 10);

  await pool.query(`
    INSERT INTO usuarios (nombre, email, password_hash, rol)
    VALUES ($1, $2, $3, 'admin')
    ON CONFLICT (email)
    DO UPDATE SET rol = 'admin', password_hash = $3, activo = TRUE
  `, [nombre, email, hash]);

  console.log('Admin listo:');
  console.log('  Email:    admin@ecoturismo.com');
  console.log('  Password: admin123');
  console.log('  Rol:      admin');
  await pool.end();
}

setupAdmin().catch(err => { console.error(err); process.exit(1); });
