<template>
  <div>
    <NavBar>
      <template #links>
        <span class="badge badge-warning" style="font-size:12px">⚙️ Admin</span>
        <RouterLink to="/dashboard" class="btn btn-ghost btn-sm">← Inicio</RouterLink>
      </template>
    </NavBar>

    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Panel Administrativo</h1>
        <p class="page-subtitle">Vista completa del sistema</p>
      </div>

      <!-- Métricas -->
      <div class="metrics-grid mb-3">
        <div v-for="(m,i) in metricasCards" :key="m.label" class="metric-card" :class="m.clase" :style="`animation-delay:${i*.05}s`">
          <div class="metric-icon">{{ m.icon }}</div>
          <div class="metric-value">{{ m.valor }}</div>
          <div class="metric-label">{{ m.label }}</div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs animate-fade-up" style="animation-delay:.2s">
        <button v-for="t in tabs" :key="t.id" @click="tab=t.id" :class="['tab-btn', tab===t.id && 'active']">{{ t.label }}</button>
      </div>

      <!-- Resumen -->
      <div v-if="tab==='resumen'" class="animate-fade-in">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem">
          <div class="card card-body">
            <h3 style="font-size:15px;font-weight:700;margin-bottom:1rem">Distribucion de usuarios</h3>
            <div v-for="r in rolesData" :key="r.label" style="margin-bottom:10px">
              <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px">
                <span style="font-weight:500">{{ r.label }}</span>
                <span style="color:var(--text-2)">{{ r.count }} ({{ r.pct }}%)</span>
              </div>
              <div class="stat-bar"><div class="stat-bar-fill" :style="`width:${r.pct}%;background:${r.color}`"></div></div>
            </div>
          </div>
          <div class="card card-body">
            <h3 style="font-size:15px;font-weight:700;margin-bottom:1rem">Reservas por estado</h3>
            <div v-for="e in estadosData" :key="e.label" style="margin-bottom:10px">
              <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px">
                <span style="font-weight:500">{{ e.label }}</span>
                <span style="color:var(--text-2)">{{ e.count }}</span>
              </div>
              <div class="stat-bar"><div class="stat-bar-fill" :style="`width:${e.pct}%;background:${e.color}`"></div></div>
            </div>
            <div v-if="!reservas.length" style="color:var(--text-3);font-size:13px;text-align:center;padding:1rem">Sin reservas aun</div>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><h3 class="card-title">Actividad reciente</h3><span class="badge badge-success">En vivo</span></div>
          <div>
            <div v-if="!actividadReciente.length" style="padding:1.5rem;text-align:center;color:var(--text-3);font-size:14px">Sin actividad aun</div>
            <div v-for="(a,i) in actividadReciente" :key="i" :class="['act-row', i%2===0 && 'alt']">
              <span style="font-size:20px">{{ a.icon }}</span>
              <div style="flex:1"><p style="font-size:14px;font-weight:500;margin:0">{{ a.texto }}</p><p style="font-size:12px;color:var(--text-3);margin:2px 0 0">{{ a.tiempo }}</p></div>
              <span class="badge" :class="a.badge">{{ a.estado }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Usuarios -->
      <div v-if="tab==='usuarios'" class="animate-fade-in">
        <input v-model="busqU" class="form-control mb-2" placeholder="Buscar por nombre o email..." style="max-width:400px" />
        <div class="card">
          <div class="card-header"><h3 class="card-title">Usuarios registrados</h3><span class="badge badge-gray">{{ usuariosFiltAll.length }}</span></div>
          <div style="overflow-x:auto">
            <table class="data-table">
              <thead><tr><th>Usuario</th><th>Email</th><th>Rol</th><th>Estado</th><th>Registro</th><th>Accion</th></tr></thead>
              <tbody>
                <tr v-for="u in usuariosFilt" :key="u.id">
                  <td><div style="display:flex;align-items:center;gap:10px"><div class="avatar" style="width:32px;height:32px;font-size:11px;flex-shrink:0">{{ u.nombre.slice(0,2).toUpperCase() }}</div><span style="font-weight:600">{{ u.nombre }}</span></div></td>
                  <td style="color:var(--text-2);font-size:13px">{{ u.email }}</td>
                  <td><span class="badge" :class="rolBadge(u.rol)">{{ u.rol }}</span></td>
                  <td><span class="badge" :class="u.activo ? 'badge-success' : 'badge-danger'">{{ u.activo ? 'Activo' : 'Inactivo' }}</span></td>
                  <td style="font-size:12px;color:var(--text-3)">{{ fmt(u.created_at) }}</td>
                  <td><button @click="toggleU(u)" class="btn btn-sm" :class="u.activo ? 'btn-danger' : 'btn-secondary'">{{ u.activo ? 'Desactivar' : 'Activar' }}</button></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="totalPagU > 1" class="pag-ctrl">
            <button @click="paginaU--" :disabled="paginaU===1" class="btn btn-sm btn-secondary">‹</button>
            <span style="font-size:13px;color:var(--text-2)">{{ paginaU }} / {{ totalPagU }}</span>
            <button @click="paginaU++" :disabled="paginaU===totalPagU" class="btn btn-sm btn-secondary">›</button>
          </div>
        </div>
      </div>

      <!-- Alojamientos -->
      <div v-if="tab==='alojamientos'" class="animate-fade-in">

        <input v-model="busqA" class="form-control mb-2" placeholder="Buscar alojamiento..." style="max-width:400px" />
        <div class="card">
          <div class="card-header"><h3 class="card-title">Alojamientos</h3><span class="badge badge-gray">{{ alojFiltAll.length }}</span></div>
          <div style="overflow-x:auto">
            <table class="data-table">
              <thead><tr><th>Nombre</th><th>Ubicacion</th><th>Precio/noche</th><th>Anfitrion</th><th>Estado</th><th></th></tr></thead>
              <tbody>
                <tr v-for="a in alojFilt" :key="a.id">
                  <td style="font-weight:600">{{ a.nombre }}</td>
                  <td style="color:var(--text-2);font-size:13px">{{ a.ubicacion || '—' }}</td>
                  <td style="color:var(--brand);font-weight:700">${{ Number(a.precio).toLocaleString('es-CO') }}</td>
                  <td style="font-size:13px;color:var(--text-2)">{{ a.anfitrion }}</td>
                  <td><span class="badge" :class="a.disponible ? 'badge-success' : 'badge-danger'">{{ a.disponible ? 'Disponible' : 'No disponible' }}</span></td>
                  <td><button @click="eliminarAloj(a)" class="btn btn-sm btn-danger">🗑</button></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="totalPagA > 1" class="pag-ctrl">
            <button @click="paginaA--" :disabled="paginaA===1" class="btn btn-sm btn-secondary">‹</button>
            <span style="font-size:13px;color:var(--text-2)">{{ paginaA }} / {{ totalPagA }}</span>
            <button @click="paginaA++" :disabled="paginaA===totalPagA" class="btn btn-sm btn-secondary">›</button>
          </div>
        </div>
      </div>

      <!-- Reservas -->
      <div v-if="tab==='reservas'" class="animate-fade-in">
        <div style="display:flex;gap:8px;margin-bottom:1rem;flex-wrap:wrap">
          <button v-for="f in filtrosR" :key="f.v" @click="filtroR=f.v" :class="['btn btn-sm', filtroR===f.v ? 'btn-primary' : 'btn-secondary']">{{ f.l }} ({{ cntR(f.v) }})</button>
        </div>
        <div class="card">
          <div class="card-header"><h3 class="card-title">Reservas</h3><span class="badge badge-gray">{{ reservasFiltAll.length }}</span></div>
          <div style="overflow-x:auto">
            <table class="data-table">
              <thead><tr><th>Turista</th><th>Alojamiento</th><th>Desde</th><th>Hasta</th><th>Noches</th><th>Estado</th><th></th></tr></thead>
              <tbody>
                <tr v-for="r in reservasFilt" :key="r.id">
                  <td style="font-weight:500">{{ r.turista }}</td>
                  <td>{{ r.alojamiento }}</td>
                  <td style="font-size:13px;color:var(--text-2)">{{ fmt(r.fecha_inicio) }}</td>
                  <td style="font-size:13px;color:var(--text-2)">{{ fmt(r.fecha_fin) }}</td>
                  <td style="font-size:13px;color:var(--text-2)">{{ nch(r) }}</td>
                  <td><span class="badge" :class="eBadge(r.estado)">{{ r.estado }}</span></td>
                  <td><button @click="eliminarReserva(r)" class="btn btn-sm btn-danger">🗑</button></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="totalPagR > 1" class="pag-ctrl">
            <button @click="paginaR--" :disabled="paginaR===1" class="btn btn-sm btn-secondary">‹</button>
            <span style="font-size:13px;color:var(--text-2)">{{ paginaR }} / {{ totalPagR }}</span>
            <button @click="paginaR++" :disabled="paginaR===totalPagR" class="btn btn-sm btn-secondary">›</button>
          </div>
        </div>
      </div>

      <!-- Resenas -->
      <div v-if="tab==='resenas'" class="animate-fade-in">
        <div class="card">
          <div class="card-header"><h3 class="card-title">Todas las reseñas</h3><span class="badge badge-gray">{{ resenas.length }}</span></div>
          <div style="overflow-x:auto">
            <table class="data-table">
              <thead><tr><th>Autor</th><th>Alojamiento</th><th>Calificacion</th><th>Comentario</th><th>Fecha</th><th></th></tr></thead>
              <tbody>
                <tr v-for="r in resenasPag" :key="r.id">
                  <td style="font-weight:500">{{ r.autor }}</td>
                  <td style="font-size:13px">{{ r.alojamiento_nombre }}</td>
                  <td><span style="color:#F59E0B">{{ '⭐'.repeat(r.calificacion) }}</span></td>
                  <td style="font-size:13px;color:var(--text-2);max-width:220px" class="truncate">{{ r.comentario }}</td>
                  <td style="font-size:12px;color:var(--text-3)">{{ fmt(r.created_at) }}</td>
                  <td><button @click="eliminarResena(r)" class="btn btn-sm btn-danger">🗑</button></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="totalPagRe > 1" class="pag-ctrl">
            <button @click="paginaRe--" :disabled="paginaRe===1" class="btn btn-sm btn-secondary">‹</button>
            <span style="font-size:13px;color:var(--text-2)">{{ paginaRe }} / {{ totalPagRe }}</span>
            <button @click="paginaRe++" :disabled="paginaRe===totalPagRe" class="btn btn-sm btn-secondary">›</button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import NavBar from '@/components/NavBar.vue'

const tab = ref('resumen')
const busqU = ref(''), busqA = ref(''), filtroR = ref('todas')
const metricas = ref({ total_usuarios:0, total_reservas:0, total_alojamientos:0 })
const usuarios = ref([]), reservas = ref([]), alojamientos = ref([]), resenas = ref([])

const POR_PAG = 10
const paginaU = ref(1), paginaA = ref(1), paginaR = ref(1), paginaRe = ref(1)

const tabs = [
  { id:'resumen', label:'Resumen' },
  { id:'usuarios', label:'Usuarios' },
  { id:'alojamientos', label:'Alojamientos' },
  { id:'reservas', label:'📅 Reservas' },
  { id:'resenas', label:'⭐ Reseñas' },
]

const filtrosR = [
  { v:'todas', l:'Todas' }, { v:'pendiente', l:'Pendientes' },
  { v:'confirmada', l:'Confirmadas' }, { v:'cancelada', l:'Canceladas' }
]

const metricasCards = computed(() => [
  { icon:'👥', label:'Usuarios', valor:metricas.value.total_usuarios, clase:'metric-green' },
  { icon:'📅', label:'Reservas', valor:metricas.value.total_reservas, clase:'metric-purple' },
  { icon:'🏡', label:'Alojamientos', valor:metricas.value.total_alojamientos, clase:'metric-coral' },
  { icon:'⭐', label:'Reseñas', valor:resenas.value.length, clase:'metric-amber' },
])

const rolesData = computed(() => {
  const t = usuarios.value.length || 1
  return ['turista','anfitrion','admin'].map((r,i) => {
    const count = usuarios.value.filter(u=>u.rol===r).length
    return { label:r.charAt(0).toUpperCase()+r.slice(1), count, pct:Math.round(count/t*100), color:['#1D9E75','#7F77DD','#D85A30'][i] }
  })
})

const estadosData = computed(() => {
  const t = reservas.value.length || 1
  return [
    { label:'Confirmadas', count:reservas.value.filter(r=>r.estado==='confirmada').length, color:'#1D9E75' },
    { label:'Pendientes', count:reservas.value.filter(r=>r.estado==='pendiente').length, color:'#F59E0B' },
    { label:'Canceladas', count:reservas.value.filter(r=>r.estado==='cancelada').length, color:'#DC2626' },
  ].map(e => ({ ...e, pct:Math.round(e.count/t*100) }))
})

const actividadReciente = computed(() => {
  const items = []
  reservas.value.slice(0,5).forEach(r => items.push({ icon:'📅', texto:`${r.turista} reservo "${r.alojamiento}"`, tiempo:r.fecha_inicio, estado:r.estado, badge:eBadge(r.estado) }))
  resenas.value.slice(0,3).forEach(r => items.push({ icon:'⭐', texto:`${r.autor} dejó una reseña`, tiempo:r.created_at?.slice(0,10)||'—', estado:`${r.calificacion}/5`, badge:'badge-warning' }))
  return items.slice(0,8)
})

const usuariosFiltAll = computed(() => {
  if (!busqU.value) return usuarios.value
  const q = busqU.value.toLowerCase()
  return usuarios.value.filter(u => u.nombre.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
})
const usuariosFilt = computed(() => paginar(usuariosFiltAll.value, paginaU.value))
const totalPagU = computed(() => Math.ceil(usuariosFiltAll.value.length / POR_PAG))

const alojFiltAll = computed(() => {
  if (!busqA.value) return alojamientos.value
  const q = busqA.value.toLowerCase()
  return alojamientos.value.filter(a => a.nombre.toLowerCase().includes(q) || (a.ubicacion||'').toLowerCase().includes(q))
})
const alojFilt = computed(() => paginar(alojFiltAll.value, paginaA.value))
const totalPagA = computed(() => Math.ceil(alojFiltAll.value.length / POR_PAG))

const reservasFiltAll = computed(() => filtroR.value === 'todas' ? reservas.value : reservas.value.filter(r=>r.estado===filtroR.value))
const reservasFilt = computed(() => paginar(reservasFiltAll.value, paginaR.value))
const totalPagR = computed(() => Math.ceil(reservasFiltAll.value.length / POR_PAG))

const resenasPag = computed(() => paginar(resenas.value, paginaRe.value))
const totalPagRe = computed(() => Math.ceil(resenas.value.length / POR_PAG))

const paginar = (arr, pag) => arr.slice((pag-1)*POR_PAG, pag*POR_PAG)
const cntR = (v) => v==='todas' ? reservas.value.length : reservas.value.filter(r=>r.estado===v).length
const nch = (r) => Math.max(1, Math.ceil((new Date(r.fecha_fin)-new Date(r.fecha_inicio))/86400000))
const rolBadge = (r) => ({ turista:'badge-success', anfitrion:'badge-info', admin:'badge-warning' }[r]||'badge-gray')
const eBadge = (e) => ({ pendiente:'badge-warning', confirmada:'badge-success', cancelada:'badge-danger' }[e]||'badge-gray')
const fmt = (f) => f ? new Date(f).toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'}) : '—'

const h = () => ({ Authorization:'Bearer '+localStorage.getItem('token') })
const toggleU = async (u) => { await axios.patch('/api/admin/usuarios/'+u.id+'/estado',{activo:!u.activo},{headers:h()}); u.activo=!u.activo }

const eliminarAloj = async (a) => {
  if (!confirm(`¿Eliminar "${a.nombre}"? Se borrarán también sus reservas y reseñas.`)) return
  await axios.delete('/api/admin/alojamientos/'+a.id, { headers:h() })
  alojamientos.value = alojamientos.value.filter(x => x.id !== a.id)
}

const eliminarReserva = async (r) => {
  if (!confirm('¿Eliminar esta reserva permanentemente?')) return
  await axios.delete('/api/admin/reservas/'+r.id, { headers:h() })
  reservas.value = reservas.value.filter(x => x.id !== r.id)
}

const eliminarResena = async (r) => {
  if (!confirm('¿Eliminar esta reseña?')) return
  await axios.delete('/api/admin/resenas/'+r.id, { headers:h() })
  resenas.value = resenas.value.filter(x => x.id !== r.id)
}

onMounted(async () => {
  const [m,u,r,a,re] = await Promise.all([
    axios.get('/api/admin/metricas',{headers:h()}),
    axios.get('/api/admin/usuarios',{headers:h()}),
    axios.get('/api/admin/reservas',{headers:h()}),
    axios.get('/api/alojamientos'),
    axios.get('/api/admin/resenas',{headers:h()}),
  ])
  metricas.value=m.data; usuarios.value=u.data; reservas.value=r.data; alojamientos.value=a.data; resenas.value=re.data
})
</script>

<style scoped>
.act-row { display:flex; align-items:center; gap:12px; padding:12px 16px; transition:var(--transition); }
.act-row.alt { background:var(--surface2); }
.act-row:hover { background:var(--brand-light); }
.pag-ctrl { display:flex; align-items:center; justify-content:center; gap:12px; padding:12px; border-top:1px solid var(--border); }
</style>
