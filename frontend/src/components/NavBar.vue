<template>
  <nav class="navbar">
    <RouterLink to="/" class="navbar-brand">
      <div class="navbar-logo">🌿</div>
      <span class="navbar-title">Eco Turismo</span>
    </RouterLink>

    <div class="navbar-actions">
      <slot name="links" />

      <!-- Toggle tema -->
      <button @click="auth.toggleDark()" class="theme-toggle" :title="auth.darkMode ? 'Modo claro' : 'Modo oscuro'">
        {{ auth.darkMode ? '☀️' : '🌙' }}
      </button>

      <!-- Avatar + nombre + badge notificaciones -->
      <div v-if="auth.isLoggedIn" class="navbar-user">
        <RouterLink to="/perfil" style="text-decoration:none;display:flex;align-items:center;gap:8px;position:relative">
          <div style="position:relative">
            <div class="avatar">{{ iniciales }}</div>
            <span v-if="pendientes > 0" class="notif-badge">{{ pendientes }}</span>
          </div>
          <span style="font-size:14px;font-weight:500;color:var(--text)">{{ auth.usuario?.nombre?.split(' ')[0] }}</span>
        </RouterLink>
      </div>

      <button @click="cerrarSesion" class="btn btn-ghost btn-sm" v-if="auth.isLoggedIn">Salir</button>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import axios from 'axios'

const auth = useAuthStore()
const router = useRouter()
const pendientes = ref(0)

const iniciales = computed(() =>
  (auth.usuario?.nombre || '').split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
)

const cerrarSesion = () => { auth.logout(); router.push('/') }

const cargarPendientes = async () => {
  if (auth.rol !== 'anfitrion') return
  try {
    const res = await axios.get('/api/reservas/anfitrion', {
      headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
    })
    pendientes.value = res.data.filter(r => r.estado === 'pendiente').length
  } catch {}
}

onMounted(cargarPendientes)
watch(() => auth.rol, cargarPendientes)
</script>

<style scoped>
.notif-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #DC2626;
  color: white;
  font-size: 10px;
  font-weight: 700;
  border-radius: 99px;
  min-width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border: 2px solid var(--surface);
}
</style>
