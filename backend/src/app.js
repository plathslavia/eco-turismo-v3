const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/alojamientos', require('./routes/alojamientos'));
app.use('/api/actividades', require('./routes/actividades'));
app.use('/api/reservas', require('./routes/reservas'));
app.use('/api/pagos', require('./routes/pagos'));
app.use('/api/resenas', require('./routes/resenas'));
app.use('/api/admin', require('./routes/admin'));

app.get('/', (req, res) => res.json({ mensaje: 'Eco Turismo API funcionando' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Servidor en http://localhost:' + PORT));
