const db = require('../db');

const crearActividad = async (req, res) => {
  const { nombre, descripcion, precio, ubicacion } = req.body;
  const r = await db.query(
    'INSERT INTO actividades (anfitrion_id,nombre,descripcion,precio,ubicacion) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [req.usuario.id, nombre, descripcion, precio, ubicacion]
  );
  res.status(201).json(r.rows[0]);
};

const listarActividades = async (req, res) => {
  const r = await db.query(
    'SELECT a.*, u.nombre AS anfitrion FROM actividades a JOIN usuarios u ON u.id = a.anfitrion_id ORDER BY a.created_at DESC'
  );
  res.json(r.rows);
};

const misActividades = async (req, res) => {
  const r = await db.query(
    'SELECT * FROM actividades WHERE anfitrion_id=$1 ORDER BY created_at DESC',
    [req.usuario.id]
  );
  res.json(r.rows);
};

module.exports = { crearActividad, listarActividades, misActividades };
