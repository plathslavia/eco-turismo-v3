const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/actividadController');
const { verificarToken, soloAnfitrion } = require('../middleware/authMiddleware');
router.get('/', ctrl.listarActividades);
router.get('/mis-actividades', verificarToken, soloAnfitrion, ctrl.misActividades);
router.post('/', verificarToken, soloAnfitrion, ctrl.crearActividad);
module.exports = router;
