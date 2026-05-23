# Eco Turismo Experiencial

Plataforma web para descubrir y reservar alojamientos ecoturísticos en Colombia. Permite explorar destinos en un mapa interactivo, ver reseñas, hacer reservas y gestionar publicaciones como anfitrión.

**Demo en vivo:** https://stupendous-chimera-c44b75.netlify.app

---

## Tecnologías

### Frontend
- **Vue 3** + Vite — componentes reactivos con Composition API
- **Vue Router 4** — navegación con guardas de autenticación y roles
- **Pinia** — manejo de estado global (sesión, usuario, tema)
- **Axios** — peticiones HTTP al backend
- **Google Maps API** — mapa interactivo con marcadores de precio

### Backend
- **Node.js** + **Express** — API REST
- **PostgreSQL** — base de datos relacional
- **JWT** — autenticación sin estado
- **bcryptjs** — hash de contraseñas

### Infraestructura (producción)
| Capa | Servicio |
|---|---|
| Frontend | Netlify (deploy automático desde GitHub) |
| Backend | Railway (deploy automático desde GitHub) |
| Base de datos | Supabase (PostgreSQL gestionado) |

---

## Arquitectura

```
Usuario → Netlify (Vue 3)
               ↓ VITE_API_URL
         Railway (Express API)
               ↓ DATABASE_URL
          Supabase (PostgreSQL)
```

Cada push a `master` redespliega automáticamente tanto el frontend (Netlify) como el backend (Railway).

---

## Funcionalidades

### Roles de usuario
| Rol | Capacidades |
|---|---|
| **Turista** | Explorar alojamientos, hacer reservas, dejar reseñas |
| **Anfitrión** | Publicar y gestionar alojamientos, confirmar/cancelar reservas |
| **Admin** | Panel de administración con métricas, gestión de usuarios y contenido |

### Módulos principales
- **Mapa con filtros** — página principal pública, filtro por ubicación y precio, vista lista/mapa
- **Panel de alojamiento** — slide-in con fotos, descripción, mapa de ubicación, reseñas y formulario de reserva
- **Autenticación** — registro, login, persistencia de sesión con JWT en localStorage
- **Reservas** — creación, historial con estados (pendiente / confirmada / cancelada), flujo de pago
- **Reseñas** — calificación con estrellas, promedio visible, una reseña por usuario por alojamiento
- **Dashboard** — métricas personalizadas según rol del usuario
- **Panel admin** — gestión completa de usuarios, alojamientos y reservas

---

## Base de datos

### Esquema de tablas

```
usuarios
  id, nombre, email, password_hash, rol, activo, created_at

alojamientos
  id, anfitrion_id → usuarios, nombre, descripcion, precio,
  ubicacion, latitud, longitud, disponible, created_at

reservas
  id, usuario_id → usuarios, alojamiento_id → alojamientos,
  fecha_inicio, fecha_fin, estado, created_at

pagos
  id, reserva_id → reservas, monto, metodo, estado, fecha

resenas
  id, usuario_id → usuarios, alojamiento_id → alojamientos,
  calificacion (1-5), comentario, created_at
  UNIQUE(usuario_id, alojamiento_id)

actividades
  id, anfitrion_id → usuarios, nombre, descripcion, precio, ubicacion
```

### Relaciones
```
usuarios ──< alojamientos
usuarios ──< reservas >── alojamientos
usuarios ──< resenas  >── alojamientos
reservas ──< pagos
```

---

## Correr localmente

### Requisitos
- Node.js 18+
- PostgreSQL 14+

### 1. Clonar el repo
```bash
git clone https://github.com/plathslavia/eco-turismo-v3.git
cd eco-turismo-v3
```

### 2. Base de datos local
Crear la base de datos `ecoturismo_db` en PostgreSQL y ejecutar el schema:
```bash
psql -U postgres -d ecoturismo_db -f backend/database.sql
```

### 3. Backend
```bash
cd backend
```
Crear el archivo `.env`:
```env
PORT=3000
JWT_SECRET=eco_turismo_secret_2026
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ecoturismo_db
DB_USER=postgres
DB_PASSWORD=tu_password
```
```bash
npm install
npm run dev
# Corre en http://localhost:3000
```

### 4. Frontend
```bash
cd frontend
```
Crear el archivo `.env.local`:
```env
VITE_GOOGLE_MAPS_KEY=tu_api_key_de_google_maps
```
```bash
npm install
npm run dev
# Corre en http://localhost:5173
```

### 5. Seed de datos de prueba
```bash
cd backend
node seed.js
```

---

## Datos de prueba

### Admin
| Email | Contraseña |
|---|---|
| admin@ecoturismo.com | admin123 |

### Anfitriones (contraseña: `host123`)
| Email |
|---|
| maria@eco.com |
| carlos@eco.com |
| laura@eco.com |

### Turistas (contraseña: `user123`)
| Email |
|---|
| andres@eco.com |
| valentina@eco.com |
| santiago@eco.com |
| camila@eco.com |
| felipe@eco.com |

---

## Despliegue en producción

### Variables de entorno requeridas

**Railway (backend):**
```
DATABASE_URL=postgresql://...   # Connection string de Supabase
JWT_SECRET=...
CORS_ORIGIN=https://tu-sitio.netlify.app
```

**Netlify (frontend):**
```
VITE_API_URL=https://tu-backend.up.railway.app
VITE_GOOGLE_MAPS_KEY=...
```

### Flujo de actualización
```bash
git add .
git commit -m "descripción del cambio"
git push
# Railway y Netlify redesployean automáticamente
```

---

## Estructura del proyecto

```
eco-turismo-v3/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── NavBar.vue
│   │   │   ├── MapaAlojamientos.vue   # Mapa general con múltiples marcadores
│   │   │   ├── MapaDetalle.vue        # Mapa individual en el panel lateral
│   │   │   └── ReservaForm.vue
│   │   ├── views/
│   │   │   ├── AlojamientosView.vue   # Página principal (pública)
│   │   │   ├── DashboardView.vue
│   │   │   ├── LoginView.vue / RegistroView.vue
│   │   │   ├── MisReservasView.vue
│   │   │   ├── PerfilView.vue
│   │   │   ├── AdminView.vue
│   │   │   └── PagoView.vue
│   │   ├── stores/
│   │   │   └── auth.js                # Estado global: sesión, rol, tema
│   │   └── router/
│   │       └── index.js               # Rutas + guardas de autenticación
│   └── public/
│       └── _redirects                 # SPA redirect para Netlify
├── backend/
│   └── src/
│       ├── app.js                     # Entry point Express
│       ├── routes/                    # Definición de endpoints
│       ├── controllers/               # Lógica de negocio
│       ├── middleware/
│       │   └── authMiddleware.js      # verificarToken, soloAdmin, soloAnfitrion
│       └── db/
│           └── index.js               # Pool de conexión PostgreSQL
├── netlify.toml                       # Config de build para Netlify
└── database.sql                       # Schema completo de la DB
```
