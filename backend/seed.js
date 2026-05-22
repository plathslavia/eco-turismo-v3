const bcrypt = require('bcryptjs')
const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
})

const anfitriones = [
  { nombre: 'María Ospina',    email: 'maria@eco.com',   password: 'host123' },
  { nombre: 'Carlos Rincón',   email: 'carlos@eco.com',  password: 'host123' },
  { nombre: 'Laura Bermúdez',  email: 'laura@eco.com',   password: 'host123' },
]

const turistas = [
  { nombre: 'Andrés Molina',    email: 'andres@eco.com',   password: 'user123' },
  { nombre: 'Valentina Cruz',   email: 'valentina@eco.com', password: 'user123' },
  { nombre: 'Santiago Peña',    email: 'santiago@eco.com',  password: 'user123' },
  { nombre: 'Camila Torres',    email: 'camila@eco.com',    password: 'user123' },
  { nombre: 'Felipe Herrera',   email: 'felipe@eco.com',    password: 'user123' },
]

const alojamientos = [
  {
    anfitrion: 'maria@eco.com',
    nombre: 'Cabaña en el Cocora',
    descripcion: 'Cabaña de madera rodeada de palmas de cera en el corazón del Eje Cafetero. Desayuno incluido, fogón y vistas al valle.',
    precio: 180000,
    ubicacion: 'Salento, Quindío',
    latitud: 4.6361,
    longitud: -75.5686,
  },
  {
    anfitrion: 'maria@eco.com',
    nombre: 'Finca Cafetera La Aurora',
    descripcion: 'Finca centenaria con cultivos de café. Tour de cosecha y preparación incluido. Hamacas y piscina natural.',
    precio: 220000,
    ubicacion: 'Montenegro, Quindío',
    latitud: 4.5676,
    longitud: -75.7571,
  },
  {
    anfitrion: 'carlos@eco.com',
    nombre: 'Hostal Bahía Taganga',
    descripcion: 'A pasos del mar Caribe. Snorkel, kayak y acceso directo a la playa. Hamacas frente al mar incluidas.',
    precio: 95000,
    ubicacion: 'Taganga, Santa Marta',
    latitud: 11.2675,
    longitud: -74.1911,
  },
  {
    anfitrion: 'carlos@eco.com',
    nombre: 'Ecolodge Tayrona',
    descripcion: 'Glamping dentro del Parque Natural Tayrona. Bungalows con mosquitero, baño privado y acceso exclusivo a Cabo San Juan.',
    precio: 320000,
    ubicacion: 'Parque Tayrona, Magdalena',
    latitud: 11.3207,
    longitud: -74.0271,
  },
  {
    anfitrion: 'laura@eco.com',
    nombre: 'Casa Colonial Villa de Leyva',
    descripcion: 'Casa del siglo XVIII en el centro histórico. Patio interior, biblioteca y chimenea. A dos cuadras de la plaza mayor.',
    precio: 260000,
    ubicacion: 'Villa de Leyva, Boyacá',
    latitud: 5.6343,
    longitud: -73.5268,
  },
  {
    anfitrion: 'laura@eco.com',
    nombre: 'Posada Barichara',
    descripcion: 'Posada boutique en el pueblo más lindo de Colombia. Terrazas con vista al cañón del Chicamocha. Desayuno artesanal.',
    precio: 195000,
    ubicacion: 'Barichara, Santander',
    latitud: 6.6465,
    longitud: -73.2192,
  },
  {
    anfitrion: 'maria@eco.com',
    nombre: 'Refugio Guatapé',
    descripcion: 'Cabaña frente al embalse con terraza y kayaks. Desde aquí puedes ver La Piedra del Peñol al amanecer.',
    precio: 240000,
    ubicacion: 'Guatapé, Antioquia',
    latitud: 6.2319,
    longitud: -75.1611,
  },
  {
    anfitrion: 'carlos@eco.com',
    nombre: 'Carpa Glamping Tatacoa',
    descripcion: 'Noche estrellada en el desierto de la Tatacoa. Carpa climatizada, telescopio y guía nocturno incluidos.',
    precio: 145000,
    ubicacion: 'Desierto de la Tatacoa, Huila',
    latitud: 3.2314,
    longitud: -75.1514,
  },
  {
    anfitrion: 'laura@eco.com',
    nombre: 'Suite Caribe San Andrés',
    descripcion: 'Suite frente al mar en isla de San Andrés. Aguas cristalinas de siete colores, buceo y snorkel a 50m.',
    precio: 450000,
    ubicacion: 'San Andrés, Archipiélago',
    latitud: 12.5567,
    longitud: -81.7185,
  },
  {
    anfitrion: 'maria@eco.com',
    nombre: 'Casa Amazónica Leticia',
    descripcion: 'Cabaña sobre palafitos en la selva amazónica. Avistamiento de delfines rosados, pesca de pirañas y paseos en canoa.',
    precio: 280000,
    ubicacion: 'Leticia, Amazonas',
    latitud: -4.2153,
    longitud: -69.9406,
  },
  {
    anfitrion: 'carlos@eco.com',
    nombre: 'Glamping Los Nevados',
    descripcion: 'Domo acrílico con vista al volcán Nevado del Ruiz. Ropa de cama térmica, desayuno caliente y tour al volcán disponible.',
    precio: 390000,
    ubicacion: 'Villamaría, Caldas',
    latitud: 4.8800,
    longitud: -75.3684,
  },
  {
    anfitrion: 'laura@eco.com',
    nombre: 'Ecocabaña Cocuy',
    descripcion: 'Base de montaña para el trekking al Cocuy. Estufas de leña, morrales y guías certificados disponibles.',
    precio: 130000,
    ubicacion: 'El Cocuy, Boyacá',
    latitud: 6.4075,
    longitud: -72.4488,
  },
]

// [turista, alojamiento_nombre, fecha_inicio, fecha_fin, estado]
const reservas = [
  // Pasadas confirmadas
  ['andres@eco.com',    'Cabaña en el Cocora',        '2026-03-10', '2026-03-13', 'confirmada'],
  ['valentina@eco.com', 'Ecolodge Tayrona',           '2026-03-20', '2026-03-24', 'confirmada'],
  ['santiago@eco.com',  'Posada Barichara',           '2026-04-01', '2026-04-04', 'confirmada'],
  ['camila@eco.com',    'Hostal Bahía Taganga',       '2026-04-08', '2026-04-12', 'confirmada'],
  ['felipe@eco.com',    'Refugio Guatapé',            '2026-04-15', '2026-04-17', 'confirmada'],
  ['andres@eco.com',    'Casa Colonial Villa de Leyva','2026-04-22', '2026-04-25', 'confirmada'],
  // Pasadas canceladas
  ['valentina@eco.com', 'Glamping Los Nevados',       '2026-02-14', '2026-02-17', 'cancelada'],
  ['santiago@eco.com',  'Suite Caribe San Andrés',    '2026-03-05', '2026-03-10', 'cancelada'],
  ['camila@eco.com',    'Casa Amazónica Leticia',     '2026-04-28', '2026-05-02', 'cancelada'],
  // Actuales / próximas pendientes
  ['felipe@eco.com',    'Finca Cafetera La Aurora',   '2026-05-18', '2026-05-21', 'pendiente'],
  ['andres@eco.com',    'Carpa Glamping Tatacoa',     '2026-05-23', '2026-05-25', 'pendiente'],
  ['valentina@eco.com', 'Ecocabaña Cocuy',            '2026-05-30', '2026-06-03', 'pendiente'],
  // Próximas confirmadas
  ['santiago@eco.com',  'Cabaña en el Cocora',        '2026-06-06', '2026-06-09', 'confirmada'],
  ['camila@eco.com',    'Refugio Guatapé',            '2026-06-12', '2026-06-15', 'confirmada'],
  ['felipe@eco.com',    'Ecolodge Tayrona',           '2026-07-01', '2026-07-05', 'confirmada'],
]

// [turista, alojamiento_nombre, calificacion, comentario]
const resenas = [
  ['andres@eco.com',    'Cabaña en el Cocora',        5, 'Increíble experiencia. Las palmas de cera al amanecer son un espectáculo único. El desayuno casero fue delicioso.'],
  ['valentina@eco.com', 'Cabaña en el Cocora',        4, 'Muy bonito lugar, el fogón en la noche fue perfecto. El acceso al valle es un poco empinado pero vale la pena.'],
  ['santiago@eco.com',  'Finca Cafetera La Aurora',   5, 'El tour del café fue lo mejor del viaje. Aprendí todo el proceso desde la planta hasta la taza. 100% recomendado.'],
  ['camila@eco.com',    'Finca Cafetera La Aurora',   5, 'La piscina natural y las hamacas son el paraíso. La familia que atiende es muy cálida y atenta.'],
  ['felipe@eco.com',    'Hostal Bahía Taganga',       4, 'Ubicación perfecta frente al mar. El kayak al atardecer fue hermoso. Las instalaciones son sencillas pero limpias.'],
  ['andres@eco.com',    'Hostal Bahía Taganga',       5, 'El mejor precio en toda la bahía. Snorkel espectacular, vimos tortugas y barracudas. Volveré seguro.'],
  ['valentina@eco.com', 'Ecolodge Tayrona',           5, 'El glamping más bonito que he visto. Despertar escuchando el mar y los pájaros es algo que no olvidaré.'],
  ['camila@eco.com',    'Ecolodge Tayrona',           4, 'El acceso es largo pero completamente vale la pena. La playa de Cabo San Juan es de película.'],
  ['santiago@eco.com',  'Casa Colonial Villa de Leyva', 5, 'La casa es un pedazo de historia. La chimenea en las noches frías de Boyacá es perfecta. Muy bien conservada.'],
  ['felipe@eco.com',    'Casa Colonial Villa de Leyva', 4, 'Hermosa arquitectura colonial. Está muy bien ubicada, a pocos pasos de los mejores restaurantes de la plaza.'],
  ['andres@eco.com',    'Posada Barichara',           5, 'Barichara es el pueblo más hermoso de Colombia y esta posada es el mejor lugar para quedarse. Las vistas son brutales.'],
  ['valentina@eco.com', 'Posada Barichara',           5, 'El desayuno artesanal con productos locales fue una experiencia gastronómica. El camino real al Gallineral, imperdible.'],
  ['camila@eco.com',    'Refugio Guatapé',            5, 'Ver La Piedra del Peñol desde el kayak al amanecer es algo que no tiene precio. El refugio es muy acogedor.'],
  ['felipe@eco.com',    'Refugio Guatapé',            4, 'Buena cabaña frente al embalse. Los kayaks estaban en buen estado. Perfecta para desconectarse del ruido de Medellín.'],
  ['santiago@eco.com',  'Carpa Glamping Tatacoa',     5, 'El cielo nocturno del desierto de la Tatacoa es de otro mundo. El guía conocía cada constelación. Experiencia única.'],
  ['andres@eco.com',    'Carpa Glamping Tatacoa',     4, 'El calor de día es intenso pero la noche fresca y estrellada lo compensa con creces. El telescopio es de primera.'],
  ['valentina@eco.com', 'Suite Caribe San Andrés',    5, 'Las aguas de siete colores desde la ventana de la suite es algo que no se olvida. Isla mágica, lugar mágico.'],
  ['santiago@eco.com',  'Suite Caribe San Andrés',    5, 'El buceo fue lo mejor. La barrera de coral está en perfecto estado. La suite es lujosa y el servicio excelente.'],
  ['camila@eco.com',    'Casa Amazónica Leticia',     5, 'Ver los delfines rosados fue el momento más emocionante de mi vida. La cabaña sobre el río es una experiencia sin igual.'],
  ['felipe@eco.com',    'Casa Amazónica Leticia',     4, 'La selva amazónica te envuelve completamente. La pesca de pirañas fue una aventura. El entorno es absolutamente salvaje.'],
  ['andres@eco.com',    'Glamping Los Nevados',       5, 'Dormir en un domo viendo las estrellas con el nevado de fondo fue surrealista. El desayuno caliente a 3.500 metros, perfecto.'],
  ['valentina@eco.com', 'Glamping Los Nevados',       4, 'El frío es intenso pero la ropa de cama es suficiente. Las vistas al volcán al amanecer son impresionantes.'],
  ['santiago@eco.com',  'Ecocabaña Cocuy',            5, 'El trekking al Cocuy con el guía fue una de las mejores experiencias de montaña que he tenido. La cabaña es cálida y acogedora.'],
  ['felipe@eco.com',    'Ecocabaña Cocuy',            4, 'Base perfecta para explorar el Parque Nacional. Los guías son muy experimentados y conocen bien las rutas.'],
]

async function seed() {
  const client = await pool.connect()
  try {
    console.log('Creando anfitriones...')
    const hostIds = {}
    for (const h of anfitriones) {
      const hash = await bcrypt.hash(h.password, 10)
      const res = await client.query(
        `INSERT INTO usuarios (nombre, email, password_hash, rol)
         VALUES ($1, $2, $3, 'anfitrion')
         ON CONFLICT (email) DO UPDATE SET nombre = EXCLUDED.nombre
         RETURNING id`,
        [h.nombre, h.email, hash]
      )
      hostIds[h.email] = res.rows[0].id
      console.log(`  ✓ ${h.nombre} (${h.email})`)
    }

    console.log('\nCreando turistas...')
    const turistaIds = {}
    for (const t of turistas) {
      const hash = await bcrypt.hash(t.password, 10)
      const res = await client.query(
        `INSERT INTO usuarios (nombre, email, password_hash, rol)
         VALUES ($1, $2, $3, 'turista')
         ON CONFLICT (email) DO UPDATE SET nombre = EXCLUDED.nombre
         RETURNING id`,
        [t.nombre, t.email, hash]
      )
      turistaIds[t.email] = res.rows[0].id
      console.log(`  ✓ ${t.nombre} (${t.email})`)
    }

    console.log('\nCreando alojamientos...')
    const alojamientoIds = {}
    for (const a of alojamientos) {
      const anfitrionId = hostIds[a.anfitrion]
      const res = await client.query(
        `INSERT INTO alojamientos (anfitrion_id, nombre, descripcion, precio, ubicacion, latitud, longitud, disponible)
         VALUES ($1, $2, $3, $4, $5, $6, $7, true)
         ON CONFLICT DO NOTHING
         RETURNING id, nombre`,
        [anfitrionId, a.nombre, a.descripcion, a.precio, a.ubicacion, a.latitud, a.longitud]
      )
      if (res.rows[0]) {
        alojamientoIds[a.nombre] = res.rows[0].id
        console.log(`  ✓ ${a.nombre} — ${a.ubicacion}`)
      } else {
        // Ya existía, buscarlo
        const ex = await client.query(`SELECT id FROM alojamientos WHERE nombre = $1`, [a.nombre])
        if (ex.rows[0]) alojamientoIds[a.nombre] = ex.rows[0].id
        console.log(`  ~ ${a.nombre} (ya existía)`)
      }
    }

    console.log('\nCreando reseñas...')
    let creadas = 0
    for (const [email, alojNombre, calificacion, comentario] of resenas) {
      const usuarioId = turistaIds[email]
      const alojamientoId = alojamientoIds[alojNombre]
      if (!usuarioId || !alojamientoId) continue
      await client.query(
        `INSERT INTO resenas (usuario_id, alojamiento_id, calificacion, comentario)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (usuario_id, alojamiento_id) DO NOTHING`,
        [usuarioId, alojamientoId, calificacion, comentario]
      )
      creadas++
      console.log(`  ✓ ${email.split('@')[0]} → ${alojNombre} (${'⭐'.repeat(calificacion)})`)
    }

    console.log('\nCreando reservas...')
    let reservasCreadas = 0
    for (const [email, alojNombre, fechaInicio, fechaFin, estado] of reservas) {
      const usuarioId = turistaIds[email]
      const alojamientoId = alojamientoIds[alojNombre]
      if (!usuarioId || !alojamientoId) continue
      await client.query(
        `INSERT INTO reservas (usuario_id, alojamiento_id, fecha_inicio, fecha_fin, estado)
         VALUES ($1, $2, $3, $4, $5)`,
        [usuarioId, alojamientoId, fechaInicio, fechaFin, estado]
      )
      reservasCreadas++
      const etiqueta = { confirmada: '✅', pendiente: '⏳', cancelada: '❌' }[estado]
      console.log(`  ${etiqueta} ${email.split('@')[0]} → ${alojNombre} (${fechaInicio} / ${estado})`)
    }

    console.log(`\n¡Seed completado!`)
    console.log(`  ${alojamientos.length} alojamientos, ${creadas} reseñas, ${reservasCreadas} reservas`)
    console.log('\nCredenciales de anfitriones (host123):')
    anfitriones.forEach(h => console.log(`  ${h.email}`))
    console.log('\nCredenciales de turistas (user123):')
    turistas.forEach(t => console.log(`  ${t.email}`))
  } catch (err) {
    console.error('Error en seed:', err.message)
  } finally {
    client.release()
    await pool.end()
  }
}

seed()
