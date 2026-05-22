const db = require('../db');

const crearResena = async (req, res) => {
  const { alojamiento_id, calificacion, comentario } = req.body;
  try {
    const reserva = await db.query(
      "SELECT id FROM reservas WHERE usuario_id=$1 AND alojamiento_id=$2 AND estado='confirmada'",
      [req.usuario.id, alojamiento_id]
    );
    if (!reserva.rows.length)
      return res.status(403).json({ error: 'Solo puedes resenar alojamientos donde te hospedaste' });
    const existente = await db.query(
      'SELECT id FROM resenas WHERE usuario_id=$1 AND alojamiento_id=$2',
      [req.usuario.id, alojamiento_id]
    );
    if (existente.rows.length)
      return res.status(409).json({ error: 'Ya dejaste una resena para este alojamiento' });
    const r = await db.query(
      'INSERT INTO resenas (usuario_id,alojamiento_id,calificacion,comentario) VALUES ($1,$2,$3,$4) RETURNING *',
      [req.usuario.id, alojamiento_id, calificacion, comentario]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear resena' });
  }
};

const obtenerResenas = async (req, res) => {
  const r = await db.query(
    'SELECT r.*, u.nombre AS autor FROM resenas r JOIN usuarios u ON u.id = r.usuario_id WHERE r.alojamiento_id=$1 ORDER BY r.created_at DESC',
    [req.params.id]
  );
  const promedio = await db.query(
    'SELECT ROUND(AVG(calificacion)::numeric,1) AS promedio FROM resenas WHERE alojamiento_id=$1',
    [req.params.id]
  );
  res.json({ resenas: r.rows, promedio: promedio.rows[0].promedio || 0 });
};

module.exports = { crearResena, obtenerResenas };

// Reseñas que publicó el usuario autenticado
const misResenas = async (req, res) => {
  try {
    const r = await db.query(
      `SELECT res.*, a.nombre AS alojamiento_nombre FROM resenas res
       JOIN alojamientos a ON a.id = res.alojamiento_id
       WHERE res.usuario_id = $1 ORDER BY res.created_at DESC`,
      [req.usuario.id]
    )
    res.json(r.rows)
  } catch (err) { res.status(500).json({ error: 'Error al obtener resenas' }) }
}

// Reseñas recibidas en los alojamientos del anfitrión
const resenasDeAlojamientos = async (req, res) => {
  try {
    const r = await db.query(
      `SELECT res.*, u.nombre AS autor, a.nombre AS alojamiento_nombre
       FROM resenas res
       JOIN usuarios u ON u.id = res.usuario_id
       JOIN alojamientos a ON a.id = res.alojamiento_id
       WHERE a.anfitrion_id = $1
       ORDER BY res.created_at DESC`,
      [req.usuario.id]
    )
    res.json(r.rows)
  } catch (err) { res.status(500).json({ error: 'Error al obtener resenas' }) }
}

module.exports = { crearResena, obtenerResenas, misResenas, resenasDeAlojamientos }
