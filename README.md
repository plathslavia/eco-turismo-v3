# Eco Turismo Experiencial — v2 (Diseño mejorado)

## Requisitos
- Node.js 18+  |  PostgreSQL 14+

## Iniciar el proyecto

### 1. Base de datos
Ejecutar `backend/database.sql` en pgAdmin sobre `ecoturismo_db`

### 2. Backend
```bash
cd backend
# Editar .env con tus credenciales de PostgreSQL
npm install
npm run dev
```
Corre en: http://localhost:3000

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
Corre en: http://localhost:5173

## Usuario admin de prueba
- Email: admin@ecoturismo.com
- Password: admin123

## Novedades v2
- Navbar fija con avatar del usuario
- Cards de alojamientos con imagen y colores
- Dashboard con métricas y accesos rápidos
- Formularios con validación visual
- Badges de estado en reservas
- Panel admin con tablas estilizadas
- Pantalla de pago con selección visual de método
- Pantalla de éxito animada
