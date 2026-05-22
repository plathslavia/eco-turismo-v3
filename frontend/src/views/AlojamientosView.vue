<template>
  <div>
    <NavBar>
      <template #links>
        <RouterLink v-if="auth.isLoggedIn && auth.rol==='turista'" to="/reservas" class="btn btn-ghost btn-sm">📅 Mis reservas</RouterLink>
        <RouterLink v-if="auth.isLoggedIn" to="/dashboard" class="btn btn-ghost btn-sm">← Inicio</RouterLink>
        <template v-else>
          <RouterLink to="/login" class="btn btn-ghost btn-sm">Iniciar sesión</RouterLink>
          <RouterLink to="/registro" class="btn btn-primary btn-sm">Registrarse</RouterLink>
        </template>
      </template>
    </NavBar>

    <div class="page-container" style="max-width:1200px">
      <div class="page-header">
        <h1 class="page-title">Alojamientos</h1>
        <p class="page-subtitle">Descubre experiencias únicas en la naturaleza</p>
      </div>

      <!-- Filtros -->
      <div class="search-bar">
        <div class="form-group">
          <label class="form-label">Ubicación</label>
          <input v-model="filtros.ubicacion" class="form-control" placeholder="Ej: Boyacá, Huila..." />
        </div>
        <div class="form-group">
          <label class="form-label">Precio mínimo</label>
          <input v-model="filtros.precio_min" type="number" class="form-control" placeholder="$0" />
        </div>
        <div class="form-group">
          <label class="form-label">Precio máximo</label>
          <input v-model="filtros.precio_max" type="number" class="form-control" placeholder="Sin límite" />
        </div>
        <div style="display:flex;gap:8px;align-items:flex-end">
          <button @click="buscar" class="btn btn-primary">🔍 Buscar</button>
          <button @click="limpiar" class="btn btn-secondary">Limpiar</button>
          <button @click="vistaActiva = vistaActiva === 'grid' ? 'mapa' : 'grid'" class="btn btn-secondary">
            {{ vistaActiva === 'grid' ? '🗺️ Ver mapa' : '⊞ Ver lista' }}
          </button>
        </div>
      </div>

      <!-- Mapa general -->
      <div v-if="vistaActiva === 'mapa'" class="mb-3">
        <MapaAlojamientos
          :alojamientos="alojamientoConCoordenadas"
          :apiKey="mapsKey"
          @seleccionar="abrirPanel($event.id)"
        />
        <p v-if="alojamientoConCoordenadas.length === 0" style="color:#aaa;font-size:13px;margin-top:.5rem;text-align:center">
          Ningún alojamiento tiene coordenadas registradas aún.
        </p>
      </div>

      <!-- Grid de cards -->
      <div v-if="vistaActiva === 'grid'">
        <p v-if="cargando" class="text-muted">Cargando alojamientos...</p>
        <div class="aloj-grid" v-else-if="alojamientos.length">
          <div v-for="(a, idx) in alojamientos" :key="a.id" class="aloj-card" @click="abrirPanel(a.id)">
            <div class="aloj-card-img" :style="`background:${fondos[idx % fondos.length]}`">{{ emojis[idx % emojis.length] }}</div>
            <div class="aloj-card-body">
              <div class="aloj-card-title">{{ a.nombre }}</div>
              <div class="aloj-card-location">📍 {{ a.ubicacion || 'Colombia' }}</div>
              <div class="aloj-card-price">
                ${{ Number(a.precio).toLocaleString('es-CO') }}
                <span style="font-size:13px;font-weight:400;color:#888">/noche</span>
              </div>
              <div class="aloj-card-footer">
                <span class="badge" :class="a.disponible ? 'badge-success' : 'badge-danger'">
                  {{ a.disponible ? '✓ Disponible' : 'No disponible' }}
                </span>
                <span style="font-size:12px;color:#888">{{ a.anfitrion }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else style="text-align:center;padding:4rem 2rem">
          <p style="font-size:52px">🌾</p>
          <p style="color:#888;margin-top:.5rem">No se encontraron alojamientos.</p>
          <button @click="limpiar" class="btn btn-secondary" style="margin-top:1rem">Ver todos</button>
        </div>
      </div>
    </div>

    <!-- Backdrop -->
    <div v-if="panelAbierto" class="panel-backdrop" @click="cerrarPanel" />

    <!-- Panel lateral -->
    <transition name="panel-slide">
      <div v-if="panelAbierto" class="panel-lateral">
        <!-- Cabecera -->
        <div class="panel-header">
          <button @click="cerrarPanel" class="panel-close">✕</button>
          <div v-if="detalle" class="panel-img" :style="`background:${fondos[idxDetalle % fondos.length]}`">
            {{ emojis[idxDetalle % emojis.length] }}
          </div>
          <div v-if="detalle" class="panel-title-block">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
              <h2 class="panel-nombre">{{ detalle.nombre }}</h2>
              <span class="badge" :class="detalle.disponible ? 'badge-success' : 'badge-danger'">
                {{ detalle.disponible ? '✓ Disponible' : 'No disponible' }}
              </span>
            </div>
            <p class="panel-ubicacion">📍 {{ detalle.ubicacion || 'Colombia' }}</p>
            <p class="panel-precio">${{ Number(detalle.precio).toLocaleString('es-CO') }}<span style="font-size:14px;font-weight:400;color:#888"> /noche</span></p>
          </div>
          <div v-else style="padding:2rem;text-align:center;color:var(--text-3)">Cargando...</div>
        </div>

        <!-- Cuerpo -->
        <div v-if="detalle" class="panel-body">
          <!-- Descripción -->
          <p style="font-size:14px;color:var(--text-2);line-height:1.7">
            {{ detalle.descripcion || 'Un hermoso lugar para conectar con la naturaleza.' }}
          </p>
          <p style="font-size:13px;color:var(--text-3);margin-top:.5rem">
            Publicado por <strong style="color:var(--text)">{{ detalle.anfitrion }}</strong>
          </p>

          <!-- Mapa de ubicación -->
          <div style="margin-top:1.25rem">
            <MapaDetalle
              :latitud="detalle.latitud"
              :longitud="detalle.longitud"
              :nombre="detalle.nombre"
              :ubicacion="detalle.ubicacion"
              :apiKey="mapsKey"
            />
          </div>

          <!-- Reserva inline (solo turistas) -->
          <div v-if="auth.isLoggedIn && auth.rol === 'turista'" style="margin-top:1.25rem">
            <hr style="border:none;border-top:1px solid var(--border);margin-bottom:1.25rem" />
            <ReservaForm :alojamientoId="detalle.id" :precioPorNoche="Number(detalle.precio)" />
          </div>
          <div v-else-if="!auth.isLoggedIn" style="margin-top:1.25rem;text-align:center">
            <hr style="border:none;border-top:1px solid var(--border);margin-bottom:1.25rem" />
            <p style="font-size:14px;color:var(--text-2);margin-bottom:.75rem">Inicia sesión para reservar</p>
            <RouterLink to="/login" class="btn btn-primary btn-block">Iniciar sesión</RouterLink>
          </div>

          <!-- Reseñas -->
          <div style="margin-top:1.5rem">
            <hr style="border:none;border-top:1px solid var(--border);margin-bottom:1rem" />
            <h3 style="font-size:14px;font-weight:700;margin-bottom:.75rem">
              Reseñas
              <span v-if="resenas.length" style="font-weight:400;color:var(--text-3)">
                ({{ resenas.length }}) · ⭐ {{ promedio }}
              </span>
            </h3>

            <!-- Formulario nueva reseña -->
            <div v-if="auth.isLoggedIn && auth.rol === 'turista'" class="resena-form">
              <p style="font-size:12px;font-weight:600;color:var(--text-2);margin-bottom:.5rem">Dejar reseña</p>
              <div class="estrellas-sel">
                <span
                  v-for="n in 5" :key="n"
                  @click="nuevaResena.calificacion = n"
                  :style="{ opacity: n <= nuevaResena.calificacion ? 1 : 0.3, cursor:'pointer', fontSize:'22px' }"
                >⭐</span>
              </div>
              <textarea
                v-model="nuevaResena.comentario"
                class="form-control"
                rows="2"
                placeholder="Cuéntanos tu experiencia..."
                style="margin-top:.5rem;font-size:13px;resize:none"
              />
              <div style="display:flex;align-items:center;gap:.5rem;margin-top:.5rem">
                <button @click="enviarResena" class="btn btn-primary btn-sm" :disabled="enviandoResena || !nuevaResena.calificacion">
                  {{ enviandoResena ? 'Enviando...' : 'Publicar reseña' }}
                </button>
                <span v-if="resenaMsg" :style="{ fontSize:'12px', color: resenaError ? '#DC2626' : 'var(--brand)' }">
                  {{ resenaMsg }}
                </span>
              </div>
            </div>

            <div v-if="resenas.length" style="display:flex;flex-direction:column;gap:.75rem;margin-top:.75rem">
              <div v-for="r in resenas" :key="r.id" class="resena-mini">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
                  <div class="avatar" style="width:28px;height:28px;font-size:11px;flex-shrink:0">{{ r.autor.slice(0,2).toUpperCase() }}</div>
                  <span style="font-size:13px;font-weight:600">{{ r.autor }}</span>
                  <span style="font-size:12px;color:#F59E0B">{{ '⭐'.repeat(r.calificacion) }}</span>
                </div>
                <p style="font-size:13px;color:var(--text-2);margin:0;padding-left:36px">{{ r.comentario }}</p>
              </div>
            </div>
            <p v-else style="font-size:13px;color:var(--text-3);margin-top:.5rem">Aún no hay reseñas.</p>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'
import NavBar from '@/components/NavBar.vue'
import MapaAlojamientos from '@/components/MapaAlojamientos.vue'
import MapaDetalle from '@/components/MapaDetalle.vue'
import ReservaForm from '@/components/ReservaForm.vue'
import { GOOGLE_MAPS_API_KEY } from '@/config.js'

const auth = useAuthStore()
const alojamientos = ref([])
const cargando = ref(false)
const filtros = ref({ ubicacion: '', precio_min: '', precio_max: '' })
const vistaActiva = ref('grid')
const mapsKey = GOOGLE_MAPS_API_KEY

const panelAbierto = ref(false)
const detalle = ref(null)
const resenas = ref([])
const promedio = ref(0)
const idxDetalle = ref(0)

const nuevaResena = ref({ calificacion: 0, comentario: '' })
const enviandoResena = ref(false)
const resenaMsg = ref('')
const resenaError = ref(false)

const emojis = ['🏕️','🌲','🏡','🌿','🏔️','🌊']
const fondos = [
  'linear-gradient(135deg,#E1F5EE,#9FE1CB)',
  'linear-gradient(135deg,#EEEDFE,#CECBF6)',
  'linear-gradient(135deg,#E6F1FB,#B5D4F4)',
  'linear-gradient(135deg,#FAEEDA,#FAC775)',
  'linear-gradient(135deg,#EAF3DE,#C0DD97)',
  'linear-gradient(135deg,#FAECE7,#F5C4B3)',
]

const alojamientoConCoordenadas = computed(() =>
  alojamientos.value.filter(a => a.latitud && a.longitud)
)

const abrirPanel = async (id) => {
  const idx = alojamientos.value.findIndex(a => a.id === id)
  idxDetalle.value = idx >= 0 ? idx : 0
  detalle.value = null
  resenas.value = []
  resenaMsg.value = ''
  nuevaResena.value = { calificacion: 0, comentario: '' }
  panelAbierto.value = true
  document.body.style.overflow = 'hidden'
  try {
    const [a, r] = await Promise.all([
      axios.get('/api/alojamientos/' + id),
      axios.get('/api/resenas/alojamiento/' + id),
    ])
    detalle.value = a.data
    resenas.value = r.data.resenas
    promedio.value = r.data.promedio
  } catch {}
}

const cerrarPanel = () => {
  panelAbierto.value = false
  document.body.style.overflow = ''
}

const enviarResena = async () => {
  if (!nuevaResena.value.calificacion) return
  enviandoResena.value = true
  resenaMsg.value = ''
  try {
    await axios.post('/api/resenas', {
      alojamiento_id: detalle.value.id,
      calificacion: nuevaResena.value.calificacion,
      comentario: nuevaResena.value.comentario,
    }, { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } })
    nuevaResena.value = { calificacion: 0, comentario: '' }
    resenaError.value = false
    resenaMsg.value = '¡Reseña publicada!'
    const r = await axios.get('/api/resenas/alojamiento/' + detalle.value.id)
    resenas.value = r.data.resenas
    promedio.value = r.data.promedio
  } catch (err) {
    resenaError.value = true
    resenaMsg.value = err.response?.data?.error || 'Error al publicar'
  } finally {
    enviandoResena.value = false
  }
}

const onKeydown = (e) => { if (e.key === 'Escape') cerrarPanel() }
onMounted(() => {
  buscar()
  window.addEventListener('keydown', onKeydown)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})

const buscar = async () => {
  cargando.value = true
  const params = {}
  if (filtros.value.ubicacion) params.ubicacion = filtros.value.ubicacion
  if (filtros.value.precio_min) params.precio_min = filtros.value.precio_min
  if (filtros.value.precio_max) params.precio_max = filtros.value.precio_max
  try {
    const res = await axios.get('/api/alojamientos', { params })
    alojamientos.value = res.data
  } catch {} finally { cargando.value = false }
}

const limpiar = () => {
  filtros.value = { ubicacion: '', precio_min: '', precio_max: '' }
  buscar()
}
</script>

<style scoped>
.panel-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.45);
  z-index: 200;
}

.panel-lateral {
  position: fixed;
  top: 0;
  right: 0;
  width: 420px;
  max-width: 100vw;
  height: 100vh;
  background: var(--surface);
  z-index: 201;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 32px rgba(0,0,0,.18);
  overflow: hidden;
}

.panel-header {
  position: relative;
  flex-shrink: 0;
}

.panel-close {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1;
  background: rgba(0,0,0,.35);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background .15s;
}
.panel-close:hover { background: rgba(0,0,0,.55); }

.panel-img {
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 72px;
}

.panel-title-block {
  padding: 1rem 1.25rem .75rem;
  border-bottom: 1px solid var(--border);
}

.panel-nombre {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}

.panel-ubicacion {
  font-size: 13px;
  color: var(--text-2);
  margin: 4px 0 0;
}

.panel-precio {
  font-size: 22px;
  font-weight: 800;
  color: var(--brand);
  margin: 6px 0 0;
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem;
}

.resena-mini {
  background: var(--surface2);
  border-radius: var(--radius);
  padding: .75rem;
}

.resena-form {
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: .75rem;
  margin-bottom: .25rem;
}

.estrellas-sel {
  display: flex;
  gap: 2px;
  user-select: none;
}

/* Animación slide desde la derecha */
.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: transform .28s cubic-bezier(.4,0,.2,1);
}
.panel-slide-enter-from,
.panel-slide-leave-to {
  transform: translateX(100%);
}
</style>
