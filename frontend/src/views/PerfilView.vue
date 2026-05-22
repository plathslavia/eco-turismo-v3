<template>
  <div>
    <NavBar>
      <template #links>
        <RouterLink to="/alojamientos" class="btn btn-ghost btn-sm">Explorar</RouterLink>
        <RouterLink to="/dashboard" class="btn btn-ghost btn-sm">← Inicio</RouterLink>
      </template>
    </NavBar>

    <div class="page-container" style="max-width:900px">
      <!-- Header de perfil -->
      <div class="perfil-header animate-fade-up">
        <div class="perfil-avatar">{{ iniciales }}</div>
        <div style="flex:1">
          <h1 style="font-size:22px;font-weight:800;letter-spacing:-.4px;margin-bottom:4px">{{ auth.usuario?.nombre }}</h1>
          <p style="font-size:14px;color:var(--text-2);margin-bottom:8px">{{ auth.usuario?.email }}</p>
          <span class="badge" :class="rolBadge">{{ rolLabel }}</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-end">
          <div style="text-align:center;padding:12px 20px;background:var(--surface2);border-radius:var(--radius-md);border:1px solid var(--border)">
            <div style="font-size:24px;font-weight:800;color:var(--brand)">{{ stats.totalReservas }}</div>
            <div style="font-size:12px;color:var(--text-2)">Reservas</div>
          </div>
          <div style="text-align:center;padding:12px 20px;background:var(--surface2);border-radius:var(--radius-md);border:1px solid var(--border)">
            <div style="font-size:24px;font-weight:800;color:var(--purple)">{{ stats.totalResenas }}</div>
            <div style="font-size:12px;color:var(--text-2)">Reseñas</div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs animate-fade-up" style="animation-delay:.1s">
        <button v-for="t in tabs" :key="t.id"
          @click="tabActivo = t.id"
          :class="['tab-btn', tabActivo === t.id && 'active']">
          {{ t.label }}
          <span v-if="t.count" style="background:var(--surface2);border:1px solid var(--border);border-radius:99px;padding:1px 7px;font-size:11px;margin-left:4px">{{ t.count }}</span>
          <span v-if="t.badge" style="background:#DC2626;color:white;border-radius:99px;padding:1px 6px;font-size:11px;margin-left:2px">{{ t.badge }}</span>
        </button>
      </div>

      <!-- Tab: Mis reservas -->
      <div v-if="tabActivo === 'reservas'" class="animate-fade-in">
        <div v-if="cargando" class="empty-state"><div class="empty-state-icon">⏳</div><div class="empty-state-text">Cargando...</div></div>
        <div v-else-if="reservas.length === 0" class="empty-state">
          <div class="empty-state-icon">📅</div>
          <div class="empty-state-title">Sin reservas aún</div>
          <div class="empty-state-text">Explora alojamientos y realiza tu primera reserva.</div>
          <RouterLink to="/alojamientos" class="btn btn-primary">Explorar</RouterLink>
        </div>
        <div v-else style="display:flex;flex-direction:column;gap:.875rem">
          <div v-for="(r, i) in reservas" :key="r.id" class="reserva-item animate-fade-up" :style="`animation-delay:${i*.05}s`">
            <div class="reserva-emoji">🏕️</div>
            <div style="flex:1">
              <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;flex-wrap:wrap">
                <div>
                  <h3 style="font-size:15px;font-weight:700;margin-bottom:3px">{{ r.alojamiento_nombre }}</h3>
                  <p style="font-size:13px;color:var(--text-2)">📍 {{ r.ubicacion || 'Colombia' }}</p>
                </div>
                <span class="badge" :class="estadoBadge(r.estado)">{{ r.estado }}</span>
              </div>
              <p style="font-size:13px;color:var(--text-2);margin-top:8px">
                📅 {{ formatFecha(r.fecha_inicio) }} → {{ formatFecha(r.fecha_fin) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab: Reseñas que publiqué -->
      <div v-if="tabActivo === 'mis-resenas'" class="animate-fade-in">
        <div v-if="cargando" class="empty-state"><div class="empty-state-icon">⏳</div></div>
        <div v-else-if="misResenas.length === 0" class="empty-state">
          <div class="empty-state-icon">⭐</div>
          <div class="empty-state-title">Aún no has publicado reseñas</div>
          <div class="empty-state-text">Después de completar una reserva podrás calificar el alojamiento.</div>
        </div>
        <div v-else style="display:flex;flex-direction:column;gap:.875rem">
          <div v-for="(r, i) in misResenas" :key="r.id" class="resena-card animate-fade-up" :style="`animation-delay:${i*.05}s`">
            <div class="resena-header">
              <div style="width:38px;height:38px;background:var(--brand-light);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">🏕️</div>
              <div style="flex:1">
                <p style="font-weight:700;font-size:14px;margin:0">{{ r.alojamiento_nombre || 'Alojamiento' }}</p>
                <div style="display:flex;align-items:center;gap:6px;margin-top:2px">
                  <span style="color:#F59E0B;font-size:13px">{{ '⭐'.repeat(r.calificacion) }}</span>
                  <span style="font-size:12px;color:var(--text-3)">{{ formatFecha(r.created_at) }}</span>
                </div>
              </div>
              <span class="badge badge-success">Publicada</span>
            </div>
            <p style="font-size:14px;color:var(--text-2);margin:0;line-height:1.6">{{ r.comentario }}</p>
          </div>
        </div>
      </div>

      <!-- Tab: Reservas recibidas (solo anfitrión) -->
      <div v-if="tabActivo === 'reservas-recibidas'" class="animate-fade-in">
        <div v-if="cargando" class="empty-state"><div class="empty-state-icon">⏳</div></div>
        <div v-else-if="reservasRecibidas.length === 0" class="empty-state">
          <div class="empty-state-icon">📥</div>
          <div class="empty-state-title">Sin reservas recibidas aún</div>
          <div class="empty-state-text">Cuando los turistas reserven tus alojamientos aparecerán aquí.</div>
        </div>
        <div v-else style="display:flex;flex-direction:column;gap:.875rem">
          <div v-for="(r, i) in reservasRecibidas" :key="r.id" class="reserva-item animate-fade-up" :style="`animation-delay:${i*.05}s`">
            <div class="reserva-emoji">🧳</div>
            <div style="flex:1;min-width:0">
              <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;flex-wrap:wrap">
                <div>
                  <h3 style="font-size:15px;font-weight:700;margin-bottom:2px">{{ r.turista_nombre }}</h3>
                  <p style="font-size:12px;color:var(--text-3);margin-bottom:2px">{{ r.turista_email }}</p>
                  <p style="font-size:13px;color:var(--text-2)">🏡 {{ r.alojamiento_nombre }}</p>
                </div>
                <span class="badge" :class="estadoBadge(r.estado)">{{ r.estado }}</span>
              </div>
              <p style="font-size:13px;color:var(--text-2);margin:8px 0">
                📅 {{ formatFecha(r.fecha_inicio) }} → {{ formatFecha(r.fecha_fin) }}
              </p>
              <div v-if="r.estado !== 'cancelada'" style="display:flex;gap:8px">
                <button v-if="r.estado === 'pendiente'" @click="cambiarEstado(r, 'confirmada')" class="btn btn-primary btn-sm" :disabled="r._cargando">
                  {{ r._cargando === 'confirmada' ? '...' : '✓ Confirmar' }}
                </button>
                <button @click="cambiarEstado(r, 'cancelada')" class="btn btn-danger btn-sm" :disabled="r._cargando">
                  {{ r._cargando === 'cancelada' ? '...' : '✕ Cancelar' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab: Reseñas en mis alojamientos (solo anfitrión) -->
      <div v-if="tabActivo === 'resenas-recibidas'" class="animate-fade-in">
        <div v-if="cargando" class="empty-state"><div class="empty-state-icon">⏳</div></div>
        <div v-else-if="resenasRecibidas.length === 0" class="empty-state">
          <div class="empty-state-icon">🏡</div>
          <div class="empty-state-title">Aún no hay reseñas en tus alojamientos</div>
          <div class="empty-state-text">Cuando los huéspedes califiquen sus estadías, aparecerán aquí.</div>
        </div>
        <div v-else>
          <!-- Promedio general -->
          <div class="card card-body mb-3" style="display:flex;align-items:center;gap:1.5rem;flex-wrap:wrap">
            <div style="text-align:center">
              <div style="font-size:48px;font-weight:800;color:var(--amber);letter-spacing:-2px">{{ promedioGeneral }}</div>
              <div style="color:#F59E0B;font-size:20px">{{ '⭐'.repeat(Math.round(promedioGeneral)) }}</div>
              <div style="font-size:13px;color:var(--text-2);margin-top:4px">Promedio general</div>
            </div>
            <div style="flex:1;min-width:200px">
              <div v-for="n in [5,4,3,2,1]" :key="n" style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
                <span style="font-size:12px;color:var(--text-2);width:8px">{{ n }}</span>
                <span style="font-size:12px;color:#F59E0B">⭐</span>
                <div class="stat-bar" style="flex:1">
                  <div class="stat-bar-fill" :style="`width:${pct(n)}%`"></div>
                </div>
                <span style="font-size:12px;color:var(--text-3);width:24px;text-align:right">{{ contoPorEstrellas(n) }}</span>
              </div>
            </div>
          </div>

          <div style="display:flex;flex-direction:column;gap:.875rem">
            <div v-for="(r, i) in resenasRecibidas" :key="r.id" class="resena-card animate-fade-up" :style="`animation-delay:${i*.05}s`">
              <div class="resena-header">
                <div class="avatar" style="width:36px;height:36px;font-size:13px;flex-shrink:0">{{ (r.autor||'?').slice(0,2).toUpperCase() }}</div>
                <div style="flex:1">
                  <p style="font-weight:700;font-size:14px;margin:0">{{ r.autor }}</p>
                  <div style="display:flex;align-items:center;gap:8px;margin-top:2px;flex-wrap:wrap">
                    <span style="color:#F59E0B;font-size:13px">{{ '⭐'.repeat(r.calificacion) }}</span>
                    <span style="font-size:12px;color:var(--text-3)">en <strong>{{ r.alojamiento_nombre }}</strong></span>
                    <span style="font-size:12px;color:var(--text-3)">· {{ formatFecha(r.created_at) }}</span>
                  </div>
                </div>
                <span class="badge" :class="r.calificacion >= 4 ? 'badge-success' : r.calificacion === 3 ? 'badge-warning' : 'badge-danger'">
                  {{ r.calificacion }}/5
                </span>
              </div>
              <p style="font-size:14px;color:var(--text-2);margin:0;line-height:1.6">{{ r.comentario }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'
import NavBar from '@/components/NavBar.vue'

const auth = useAuthStore()
const tabActivo = ref('reservas')
const cargando = ref(true)
const reservas = ref([])
const misResenas = ref([])
const resenasRecibidas = ref([])
const reservasRecibidas = ref([])

const iniciales = computed(() =>
  (auth.usuario?.nombre || '').split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
)
const rolLabel = computed(() => ({ turista:'Turista', anfitrion:'Anfitrión', admin:'Administrador' }[auth.rol] || auth.rol))
const rolBadge = computed(() => ({ turista:'badge-success', anfitrion:'badge-info', admin:'badge-warning' }[auth.rol] || 'badge-gray'))

const stats = computed(() => ({
  totalReservas: reservas.value.length,
  totalResenas: misResenas.value.length,
}))

const tabs = computed(() => {
  const base = [
    { id:'reservas', label:'📅 Mis reservas', count: reservas.value.length },
    { id:'mis-resenas', label:'⭐ Reseñas publicadas', count: misResenas.value.length },
  ]
  if (auth.rol === 'anfitrion') {
    const pendientes = reservasRecibidas.value.filter(r => r.estado === 'pendiente').length
    base.push({ id:'reservas-recibidas', label:'📥 Reservas recibidas', count: reservasRecibidas.value.length, badge: pendientes })
    base.push({ id:'resenas-recibidas', label:'🏡 Reseñas recibidas', count: resenasRecibidas.value.length })
  }
  return base
})

const promedioGeneral = computed(() => {
  if (!resenasRecibidas.value.length) return 0
  const sum = resenasRecibidas.value.reduce((a, r) => a + r.calificacion, 0)
  return (sum / resenasRecibidas.value.length).toFixed(1)
})

const contoPorEstrellas = (n) => resenasRecibidas.value.filter(r => r.calificacion === n).length
const pct = (n) => resenasRecibidas.value.length ? Math.round((contoPorEstrellas(n) / resenasRecibidas.value.length) * 100) : 0

const formatFecha = (f) => new Date(f).toLocaleDateString('es-CO', { day:'2-digit', month:'short', year:'numeric' })
const estadoBadge = (e) => ({ pendiente:'badge-warning', confirmada:'badge-success', cancelada:'badge-danger' }[e] || 'badge-gray')

const h = () => ({ Authorization: 'Bearer ' + localStorage.getItem('token') })

const cambiarEstado = async (reserva, nuevoEstado) => {
  reserva._cargando = nuevoEstado
  try {
    const r = await axios.patch(`/api/reservas/${reserva.id}/estado`, { estado: nuevoEstado }, { headers: h() })
    reserva.estado = r.data.estado
  } catch (e) {
    alert(e.response?.data?.error || 'Error al actualizar')
  } finally {
    reserva._cargando = null
  }
}

onMounted(async () => {
  try {
    const [res, resenas] = await Promise.all([
      axios.get('/api/reservas/mis-reservas', { headers: h() }),
      axios.get('/api/resenas/mis-resenas', { headers: h() }).catch(() => ({ data: [] })),
    ])
    reservas.value = res.data
    misResenas.value = resenas.data

    if (auth.rol === 'anfitrion') {
      const [rec, resRec] = await Promise.all([
        axios.get('/api/resenas/mis-alojamientos', { headers: h() }).catch(() => ({ data: [] })),
        axios.get('/api/reservas/anfitrion', { headers: h() }).catch(() => ({ data: [] })),
      ])
      resenasRecibidas.value = rec.data
      reservasRecibidas.value = resRec.data
    }
  } catch (e) {
    console.error(e)
  } finally {
    cargando.value = false
  }
})
</script>

<style scoped>
.perfil-header {
  background: linear-gradient(135deg, var(--brand-light), rgba(127,119,221,.08));
  border: 1px solid rgba(29,158,117,.2);
  border-radius: var(--radius-xl);
  padding: 2rem;
  display: flex; align-items: center; gap: 1.5rem;
  margin-bottom: 1.75rem; flex-wrap: wrap;
}
.perfil-avatar {
  width: 72px; height: 72px; border-radius: 50%;
  background: linear-gradient(135deg, var(--brand), var(--purple));
  color: white; font-size: 24px; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; box-shadow: var(--shadow-brand);
}
.reserva-item { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-lg); padding:1.1rem 1.25rem; display:flex; align-items:flex-start; gap:14px; box-shadow:var(--shadow-sm); transition:var(--transition); }
.reserva-item:hover { box-shadow:var(--shadow-md); border-color:var(--brand); transform:translateX(2px); }
.reserva-emoji { font-size:26px; flex-shrink:0; width:44px; height:44px; background:var(--brand-light); border-radius:12px; display:flex; align-items:center; justify-content:center; }
</style>
