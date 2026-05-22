const db = require('../db');

const crearReserva = async (req, res) => {
  const { alojamiento_id, fecha_inicio, fecha_fin } = req.body;
  try {
    const solapamiento = await db.query(
      "SELECT id FROM reservas WHERE alojamiento_id=$1 AND estado!='cancelada' AND (fecha_inicio, fecha_fin) OVERLAPS ($2::date, $3::date)",
      [alojamiento_id, fecha_inicio, fecha_fin]
    );
    if (solapamiento.rows.length > 0)
      return res.status(409).json({ error: 'Las fechas no estan disponibles' });
    const r = await db.query(
      'INSERT INTO reservas (usuario_id,alojamiento_id,fecha_inicio,fecha_fin) VALUES ($1,$2,$3,$4) RETURNING *',
      [req.usuario.id, alojamiento_id, fecha_inicio, fecha_fin]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear reserva' });
  }
};

const misReservas = async (req, res) => {
  try {
    const r = await db.query(
      `SELECT r.*,
              r.fecha_inicio::text AS fecha_inicio,
              r.fecha_fin::text    AS fecha_fin,
              a.nombre AS alojamiento_nombre,
              a.ubicacion,
              (SELECT id FROM pagos WHERE reserva_id = r.id AND estado = 'completado' LIMIT 1) AS pago_id
       FROM reservas r
       JOIN alojamientos a ON a.id = r.alojamiento_id
       WHERE r.usuario_id = $1
       ORDER BY r.fecha_inicio DESC`,
      [req.usuario.id]
    );
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al cargar reservas' });
  }
};

const cancelarReserva = async (req, res) => {
  try {
    const r = await db.query(
      'SELECT id, estado FROM reservas WHERE id=$1 AND usuario_id=$2',
      [req.params.id, req.usuario.id]
    );
    if (!r.rows.length)
      return res.status(404).json({ error: 'Reserva no encontrada' });
    if (r.rows[0].estado === 'cancelada')
      return res.status(400).json({ error: 'La reserva ya está cancelada' });
    await db.query("UPDATE reservas SET estado='cancelada' WHERE id=$1", [req.params.id]);
    res.json({ mensaje: 'Reserva cancelada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al cancelar' });
  }
};

const disponibilidad = async (req, res) => {
  const r = await db.query(
    "SELECT fecha_inicio, fecha_fin FROM reservas WHERE alojamiento_id=$1 AND estado!='cancelada' AND fecha_fin >= CURRENT_DATE",
    [req.params.id]
  );
  res.json(r.rows);
};

const reservasDeAnfitrion = async (req, res) => {
  try {
    const r = await db.query(
      `SELECT res.id, res.estado, res.created_at,
              res.fecha_inicio::text AS fecha_inicio,
              res.fecha_fin::text   AS fecha_fin,
              u.nombre AS turista_nombre, u.email AS turista_email,
              a.nombre AS alojamiento_nombre,
              (SELECT id FROM pagos WHERE reserva_id = res.id AND estado = 'completado' LIMIT 1) AS pago_id
       FROM reservas res
       JOIN usuarios u ON u.id = res.usuario_id
       JOIN alojamientos a ON a.id = res.alojamiento_id
       WHERE a.anfitrion_id = $1
       ORDER BY res.created_at DESC`,
      [req.usuario.id]
    );
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
};

const cambiarEstadoReserva = async (req, res) => {
  const { estado } = req.body;
  if (!['confirmada', 'cancelada'].includes(estado))
    return res.status(400).json({ error: 'Estado inválido' });
  try {
    const check = await db.query(
      `SELECT res.id FROM reservas res
       JOIN alojamientos a ON a.id = res.alojamiento_id
       WHERE res.id = $1 AND (a.anfitrion_id = $2 OR $3 = 'admin')`,
      [req.params.id, req.usuario.id, req.usuario.rol]
    );
    if (!check.rows.length)
      return res.status(403).json({ error: 'No autorizado' });
    const r = await db.query(
      'UPDATE reservas SET estado=$1 WHERE id=$2 RETURNING *',
      [estado, req.params.id]
    );
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar reserva' });
  }
};

module.exports = { crearReserva, misReservas, cancelarReserva, disponibilidad, reservasDeAnfitrion, cambiarEstadoReserva };
