const db = require('../db');

const procesarPago = async (req, res) => {
  const { reserva_id, metodo } = req.body;
  try {
    const reserva = await db.query(
      'SELECT * FROM reservas WHERE id=$1 AND usuario_id=$2',
      [reserva_id, req.usuario.id]
    );
    if (!reserva.rows.length) return res.status(404).json({ error: 'Reserva no encontrada' });
    if (reserva.rows[0].estado === 'cancelada')
      return res.status(400).json({ error: 'Esta reserva fue cancelada' });
    if (reserva.rows[0].estado !== 'confirmada')
      return res.status(400).json({ error: 'Espera a que el anfitrión confirme tu reserva antes de pagar' });
    const aloj = await db.query('SELECT precio FROM alojamientos WHERE id=$1', [reserva.rows[0].alojamiento_id]);
    const dias = Math.ceil(
      (new Date(reserva.rows[0].fecha_fin) - new Date(reserva.rows[0].fecha_inicio)) / 86400000
    );
    const monto = aloj.rows[0].precio * dias;
    if (Math.random() < 0.1)
      return res.status(402).json({ error: 'Pago rechazado. Intente de nuevo.' });
    const pago = await db.query(
      "INSERT INTO pagos (reserva_id,monto,metodo,estado) VALUES ($1,$2,$3,'completado') RETURNING *",
      [reserva_id, monto, metodo]
    );
    res.status(201).json({ mensaje: 'Pago exitoso', pago: pago.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al procesar pago' });
  }
};

module.exports = { procesarPago };
