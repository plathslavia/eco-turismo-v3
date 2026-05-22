const express = require('express');
const router = express.Router();
const { procesarPago } = require('../controllers/pagoController');
const { verificarToken } = require('../middleware/authMiddleware');
router.post('/', verificarToken, procesarPago);
module.exports = router;
