const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registro = async (req, res) => {
  const { nombre, email, password, rol } = req.body;
  if (!nombre || !email || !password)
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  try {
    const existe = await db.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (existe.rows.length > 0)
      return res.status(409).json({ error: 'El correo ya esta registrado' });
    const rolValido = ['turista', 'anfitrion'].includes(rol) ? rol : 'turista';
    const hash = await bcrypt.hash(password, 10);
    const r = await db.query(
      'INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES ($1,$2,$3,$4) RETURNING id, nombre, email, rol',
      [nombre, email, hash, rolValido]
    );
    res.status(201).json({ mensaje: 'Usuario registrado', usuario: r.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email y contrasena requeridos' });
  try {
    const r = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (r.rows.length === 0)
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    const u = r.rows[0];
    if (!u.activo) return res.status(403).json({ error: 'Cuenta desactivada' });
    const ok = await bcrypt.compare(password, u.password_hash);
    if (!ok) return res.status(401).json({ error: 'Credenciales incorrectas' });
    const token = jwt.sign(
      { id: u.id, nombre: u.nombre, rol: u.rol },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({ token, usuario: { id: u.id, nombre: u.nombre, email: u.email, rol: u.rol } });
  } catch (err) {
    res.status(500).json({ error: 'Error al iniciar sesion' });
  }
};

const perfil = async (req, res) => {
  const r = await db.query(
    'SELECT id, nombre, email, rol, created_at FROM usuarios WHERE id = $1',
    [req.usuario.id]
  );
  res.json(r.rows[0]);
};

module.exports = { registro, login, perfil };
