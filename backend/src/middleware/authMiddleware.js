const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requerido' });
  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalido o expirado' });
  }
};

const soloAdmin = (req, res, next) => {
  if (req.usuario?.rol !== 'admin')
    return res.status(403).json({ error: 'Se requiere rol admin' });
  next();
};

const soloAnfitrion = (req, res, next) => {
  if (!['anfitrion', 'admin'].includes(req.usuario?.rol))
    return res.status(403).json({ error: 'Se requiere rol anfitrion' });
  next();
};

module.exports = { verificarToken, soloAdmin, soloAnfitrion };
