const db = require('../db');

const crearAlojamiento = async (req, res) => {
  const { nombre, descripcion, precio, ubicacion, latitud, longitud } = req.body;
  if (!nombre || !precio)
    return res.status(400).json({ error: 'Nombre y precio son requeridos' });
  try {
    const r = await db.query(
      'INSERT INTO alojamientos (anfitrion_id,nombre,descripcion,precio,ubicacion,latitud,longitud) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [req.usuario.id, nombre, descripcion, precio, ubicacion, latitud, longitud]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear alojamiento' });
  }
};

const listarAlojamientos = async (req, res) => {
  const { ubicacion, precio_min, precio_max } = req.query;
  let query = 'SELECT a.*, u.nombre AS anfitrion FROM alojamientos a JOIN usuarios u ON u.id = a.anfitrion_id WHERE 1=1';
  const params = [];
  let i = 1;
  if (ubicacion) { query += ` AND a.ubicacion ILIKE $${i++}`; params.push('%' + ubicacion + '%'); }
  if (precio_min) { query += ` AND a.precio >= $${i++}`; params.push(precio_min); }
  if (precio_max) { query += ` AND a.precio <= $${i++}`; params.push(precio_max); }
  query += ' ORDER BY a.created_at DESC';
  try {
    const r = await db.query(query, params);
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al listar alojamientos' });
  }
};

const obtenerAlojamiento = async (req, res) => {
  try {
    const r = await db.query(
      'SELECT a.*, u.nombre AS anfitrion FROM alojamientos a JOIN usuarios u ON u.id = a.anfitrion_id WHERE a.id = $1',
      [req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'No encontrado' });
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener alojamiento' });
  }
};

const editarAlojamiento = async (req, res) => {
  const { nombre, descripcion, precio, ubicacion, disponible } = req.body;
  try {
    const existe = await db.query('SELECT anfitrion_id FROM alojamientos WHERE id=$1', [req.params.id]);
    if (!existe.rows.length) return res.status(404).json({ error: 'No encontrado' });
    if (existe.rows[0].anfitrion_id !== req.usuario.id && req.usuario.rol !== 'admin')
      return res.status(403).json({ error: 'No autorizado' });
    const r = await db.query(
      'UPDATE alojamientos SET nombre=$1,descripcion=$2,precio=$3,ubicacion=$4,disponible=$5 WHERE id=$6 RETURNING *',
      [nombre, descripcion, precio, ubicacion, disponible, req.params.id]
    );
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al editar' });
  }
};

const misAlojamientos = async (req, res) => {
  const r = await db.query(
    'SELECT * FROM alojamientos WHERE anfitrion_id=$1 ORDER BY created_at DESC',
    [req.usuario.id]
  );
  res.json(r.rows);
};

module.exports = { crearAlojamiento, listarAlojamientos, obtenerAlojamiento, editarAlojamiento, misAlojamientos };
