<template>
  <div>
    <NavBar>
      <template #links>
        <RouterLink to="/alojamientos" class="btn btn-ghost btn-sm">Explorar</RouterLink>
      </template>
    </NavBar>

    <div class="page-container">
      <div class="hero-banner animate-fade-up">
        <div>
          <p style="font-size:13px;font-weight:700;color:var(--brand);margin-bottom:6px;letter-spacing:.06em;text-transform:uppercase">{{ rolLabel }}</p>
          <h1 style="font-size:28px;font-weight:800;letter-spacing:-.6px;margin-bottom:8px">Hola, {{ auth.usuario?.nombre?.split(' ')[0] }} 👋</h1>
          <p style="font-size:15px;color:var(--text-2)">¿Listo para tu próxima aventura?</p>
        </div>
        <div style="font-size:64px;opacity:.12;user-select:none">🌿</div>
      </div>

      <div class="metrics-grid mb-3">
        <div class="metric-card metric-green">
          <div class="metric-icon">🏕️</div>
          <div class="metric-value">{{ stats.total }}</div>
          <div class="metric-label">Alojamientos disponibles</div>
        </div>
        <div class="metric-card metric-purple" v-if="auth.rol==='turista'">
          <div class="metric-icon">📅</div>
          <div class="metric-value">{{ stats.reservas }}</div>
          <div class="metric-label">Mis reservas</div>
        </div>
      </div>

      <h2 style="font-size:15px;font-weight:700;margin-bottom:1rem;color:var(--text-2)">Accesos rápidos</h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1rem">
        <RouterLink to="/alojamientos" class="quick-card animate-fade-up" style="animation-delay:.05s">
          <div class="quick-icon" style="background:var(--brand-light)">🔍</div>
          <div><div style="font-weight:700;font-size:15px">Explorar</div><div style="font-size:12px;color:var(--text-2);margin-top:2px">Buscar alojamientos</div></div>
          <span style="margin-left:auto;color:var(--text-3);font-size:18px">›</span>
        </RouterLink>
        <RouterLink v-if="auth.rol==='turista'" to="/reservas" class="quick-card animate-fade-up" style="animation-delay:.1s">
          <div class="quick-icon" style="background:var(--purple-light)">📅</div>
          <div><div style="font-weight:700;font-size:15px">Mis reservas</div><div style="font-size:12px;color:var(--text-2);margin-top:2px">Ver mis viajes</div></div>
          <span style="margin-left:auto;color:var(--text-3);font-size:18px">›</span>
        </RouterLink>
        <RouterLink to="/perfil" class="quick-card animate-fade-up" style="animation-delay:.15s">
          <div class="quick-icon" style="background:#FEF3C7">👤</div>
          <div><div style="font-weight:700;font-size:15px">Mi perfil</div><div style="font-size:12px;color:var(--text-2);margin-top:2px">Reseñas y actividad</div></div>
          <span style="margin-left:auto;color:var(--text-3);font-size:18px">›</span>
        </RouterLink>
        <RouterLink v-if="auth.rol==='anfitrion'" to="/alojamientos/nuevo" class="quick-card animate-fade-up" style="animation-delay:.2s">
          <div class="quick-icon" style="background:var(--coral-light)">🏡</div>
          <div><div style="font-weight:700;font-size:15px">Publicar</div><div style="font-size:12px;color:var(--text-2);margin-top:2px">Nuevo alojamiento</div></div>
          <span style="margin-left:auto;color:var(--text-3);font-size:18px">›</span>
        </RouterLink>
        <RouterLink v-if="auth.rol==='admin'" to="/admin" class="quick-card animate-fade-up" style="animation-delay:.2s">
          <div class="quick-icon" style="background:var(--coral-light)">⚙️</div>
          <div><div style="font-weight:700;font-size:15px">Panel admin</div><div style="font-size:12px;color:var(--text-2);margin-top:2px">Gestion del sistema</div></div>
          <span style="margin-left:auto;color:var(--text-3);font-size:18px">›</span>
        </RouterLink>
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
const stats = ref({ reservas:0, total:0 })
const rolLabel = computed(() => ({ turista:'Turista', anfitrion:'Anfitrion', admin:'Administrador' }[auth.rol]||auth.rol))
onMounted(async () => {
  try {
    const res = await axios.get('/api/alojamientos')
    stats.value.total = res.data.length
    if (auth.rol==='turista') {
      const r = await axios.get('/api/reservas/mis-reservas', { headers:{ Authorization:'Bearer '+localStorage.getItem('token') } })
      stats.value.reservas = r.data.length
    }
  } catch {}
})
</script>
<style scoped>
.hero-banner { background:linear-gradient(135deg,var(--brand-light),rgba(127,119,221,.08)); border:1px solid rgba(29,158,117,.2); border-radius:var(--radius-xl); padding:2rem; margin-bottom:1.5rem; display:flex; align-items:center; justify-content:space-between; overflow:hidden; }
.quick-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-lg); padding:1rem 1.25rem; display:flex; align-items:center; gap:12px; text-decoration:none; color:var(--text); transition:var(--transition); box-shadow:var(--shadow-sm); }
.quick-card:hover { box-shadow:var(--shadow-md); transform:translateY(-2px); border-color:var(--brand); }
.quick-icon { width:38px; height:38px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
</style>
