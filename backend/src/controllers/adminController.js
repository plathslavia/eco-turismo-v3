const db = require('../db');

const obtenerMetricas = async (req, res) => {
  const [u, r, a] = await Promise.all([
    db.query('SELECT COUNT(*) FROM usuarios'),
    db.query('SELECT COUNT(*) FROM reservas'),
    db.query('SELECT COUNT(*) FROM alojamientos'),
  ]);
  res.json({
    total_usuarios: parseInt(u.rows[0].count),
    total_reservas: parseInt(r.rows[0].count),
    total_alojamientos: parseInt(a.rows[0].count),
  });
};

const listarUsuarios = async (req, res) => {
  const r = await db.query(
    'SELECT id,nombre,email,rol,activo,created_at FROM usuarios ORDER BY created_at DESC'
  );
  res.json(r.rows);
};

const cambiarEstadoUsuario = async (req, res) => {
  await db.query('UPDATE usuarios SET activo=$1 WHERE id=$2', [req.body.activo, req.params.id]);
  res.json({ mensaje: 'Estado actualizado' });
};

const listarReservas = async (req, res) => {
  const r = await db.query(
    `SELECT r.id, r.estado, r.created_at,
            r.fecha_inicio::text AS fecha_inicio,
            r.fecha_fin::text   AS fecha_fin,
            u.nombre AS turista,
            a.nombre AS alojamiento
     FROM reservas r
     JOIN usuarios u ON u.id = r.usuario_id
     JOIN alojamientos a ON a.id = r.alojamiento_id
     ORDER BY r.fecha_inicio DESC`
  );
  res.json(r.rows);
};

const listarResenas = async (req, res) => {
  const r = await db.query(
    `SELECT re.*, u.nombre AS autor, a.nombre AS alojamiento_nombre
     FROM resenas re
     JOIN usuarios u ON u.id = re.usuario_id
     JOIN alojamientos a ON a.id = re.alojamiento_id
     ORDER BY re.created_at DESC`
  );
  res.json(r.rows);
};

const eliminarAlojamiento = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('BEGIN');
    await db.query('DELETE FROM resenas WHERE alojamiento_id=$1', [id]);
    await db.query('DELETE FROM pagos WHERE reserva_id IN (SELECT id FROM reservas WHERE alojamiento_id=$1)', [id]);
    await db.query('DELETE FROM reservas WHERE alojamiento_id=$1', [id]);
    await db.query('DELETE FROM alojamientos WHERE id=$1', [id]);
    await db.query('COMMIT');
    res.json({ mensaje: 'Alojamiento eliminado' });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar alojamiento' });
  }
};

const eliminarReserva = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM pagos WHERE reserva_id=$1', [id]);
    await db.query('DELETE FROM reservas WHERE id=$1', [id]);
    res.json({ mensaje: 'Reserva eliminada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar reserva' });
  }
};

const eliminarResena = async (req, res) => {
  try {
    await db.query('DELETE FROM resenas WHERE id=$1', [req.params.id]);
    res.json({ mensaje: 'Reseña eliminada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar reseña' });
  }
};

module.exports = { obtenerMetricas, listarUsuarios, cambiarEstadoUsuario, listarReservas, listarResenas, eliminarAlojamiento, eliminarReserva, eliminarResena };
