const express = require('express')
const router = express.Router()
const { crearResena, obtenerResenas, misResenas, resenasDeAlojamientos } = require('../controllers/resenaController')
const { verificarToken } = require('../middleware/authMiddleware')

router.post('/', verificarToken, crearResena)
router.get('/alojamiento/:id', obtenerResenas)
router.get('/mis-resenas', verificarToken, misResenas)
router.get('/mis-alojamientos', verificarToken, resenasDeAlojamientos)

module.exports = router
