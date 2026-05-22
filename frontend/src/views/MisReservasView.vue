<template>
  <div>
    <NavBar>
      <template #links>
        <RouterLink to="/alojamientos" class="btn btn-ghost btn-sm">Explorar</RouterLink>
        <RouterLink to="/dashboard" class="btn btn-ghost btn-sm">← Inicio</RouterLink>
      </template>
    </NavBar>
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Mis reservas</h1>
        <p class="page-subtitle">Historial y estado de tus reservas</p>
      </div>

      <!-- Filtro rápido -->
      <div v-if="reservas.length" style="display:flex;gap:8px;margin-bottom:1.5rem;flex-wrap:wrap">
        <button v-for="f in filtros" :key="f.val"
          @click="filtroActivo=f.val"
          :class="['btn btn-sm', filtroActivo===f.val ? 'btn-primary' : 'btn-secondary']">
          {{ f.label }} <span v-if="conteo(f.val)" style="background:rgba(255,255,255,.25);border-radius:99px;padding:1px 7px;font-size:11px">{{ conteo(f.val) }}</span>
        </button>
      </div>

      <div v-if="errorCarga" class="alert alert-error mb-2">{{ errorCarga }}</div>
      <p v-if="cargando" class="text-muted">Cargando...</p>

      <div v-else-if="reservasFiltradas.length === 0" class="empty-state">
        <div class="empty-state-icon">🗓️</div>
        <div class="empty-state-title">Sin reservas {{ filtroActivo !== 'todas' ? filtroActivo+'s' : '' }}</div>
        <div class="empty-state-text">{{ filtroActivo==='todas' ? 'Aún no tienes reservas.' : 'No hay reservas con este estado.' }}</div>
        <RouterLink v-if="filtroActivo==='todas'" to="/alojamientos" class="btn btn-primary">Explorar alojamientos</RouterLink>
      </div>

      <div v-else style="display:flex;flex-direction:column;gap:.875rem">
        <div v-for="(r, idx) in reservasFiltradas" :key="r.id"
          class="reserva-item animate-fade-up"
          :style="`animation-delay:${idx*.05}s`">
          <div class="reserva-emoji">🏕️</div>
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;flex-wrap:wrap">
              <div>
                <h3 style="font-size:15px;font-weight:700;margin-bottom:3px">{{ r.alojamiento_nombre }}</h3>
                <p style="font-size:13px;color:var(--text-2)">📍 {{ r.ubicacion || 'Colombia' }}</p>
              </div>
              <span class="badge" :class="estadoBadge(r.estado)">{{ r.estado }}</span>
            </div>
            <div style="display:flex;align-items:center;gap:16px;margin-top:10px;flex-wrap:wrap">
              <div style="font-size:13px;color:var(--text-2);display:flex;align-items:center;gap:6px">
                <i class="ti ti-calendar"></i>
                {{ formatFecha(r.fecha_inicio) }} → {{ formatFecha(r.fecha_fin) }}
              </div>
              <span v-if="r.estado==='pendiente'" style="font-size:12px;color:var(--text-3);font-style:italic">
                ⏳ Esperando confirmación del anfitrión
              </span>
              <RouterLink v-if="r.estado==='confirmada' && !r.pago_id" :to="'/pago/'+r.id" class="btn btn-primary btn-sm">
                💳 Pagar ahora
              </RouterLink>
              <span v-if="r.estado==='confirmada' && r.pago_id" style="font-size:13px;color:var(--brand);font-weight:600">
                ✅ Pagado
              </span>
              <button
                v-if="r.estado !== 'cancelada'"
                @click="cancelarReserva(r)"
                :disabled="r._cancelando"
                class="btn btn-sm"
                style="border:1px solid #DC2626;color:#DC2626;background:transparent">
                {{ r._cancelando ? '...' : 'Cancelar' }}
              </button>
            </div>
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
const reservas = ref([]), cargando = ref(true), filtroActivo = ref('todas'), errorCarga = ref('')
const filtros = [
  { val:'todas', label:'Todas' },
  { val:'pendiente', label:'Pendientes' },
  { val:'confirmada', label:'Confirmadas' },
  { val:'cancelada', label:'Canceladas' },
]
const conteo = (v) => v==='todas' ? reservas.value.length : reservas.value.filter(r=>r.estado===v).length
const reservasFiltradas = computed(() => filtroActivo.value==='todas' ? reservas.value : reservas.value.filter(r=>r.estado===filtroActivo.value))
const formatFecha = (f) => new Date(f).toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'})
const estadoBadge = (e) => ({ pendiente:'badge-warning', confirmada:'badge-success', cancelada:'badge-danger' }[e]||'badge-gray')
const cancelarReserva = async (reserva) => {
  if (!confirm('¿Seguro que quieres cancelar esta reserva?')) return
  reserva._cancelando = true
  try {
    await axios.delete(`/api/reservas/${reserva.id}`, { headers:{ Authorization:'Bearer '+localStorage.getItem('token') } })
    reserva.estado = 'cancelada'
  } catch (e) {
    alert(e.response?.data?.error || 'Error al cancelar')
  } finally {
    reserva._cancelando = false
  }
}

onMounted(async () => {
  try {
    const res = await axios.get('/api/reservas/mis-reservas', { headers:{ Authorization:'Bearer '+localStorage.getItem('token') } })
    reservas.value = res.data
  } catch (e) {
    errorCarga.value = e.response?.data?.error || 'No se pudieron cargar las reservas.'
  } finally { cargando.value = false }
})
</script>
<style scoped>
.reserva-item {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 1.1rem 1.25rem;
  display: flex; align-items: flex-start; gap: 14px;
  box-shadow: var(--shadow-sm); transition: var(--transition);
}
.reserva-item:hover { box-shadow: var(--shadow-md); border-color: var(--brand); transform: translateX(2px); }
.reserva-emoji { font-size:28px; flex-shrink:0; width:46px; height:46px; background:var(--brand-light); border-radius:12px; display:flex; align-items:center; justify-content:center; }
</style>
