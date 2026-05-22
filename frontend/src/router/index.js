import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  { path: '/', redirect: '/alojamientos' },
  { path: '/login', name: 'Login', component: () => import('@/views/LoginView.vue') },
  { path: '/registro', name: 'Registro', component: () => import('@/views/RegistroView.vue') },
  { path: '/dashboard', name: 'Dashboard', component: () => import('@/views/DashboardView.vue'), meta: { requiresAuth: true } },
  { path: '/perfil', name: 'Perfil', component: () => import('@/views/PerfilView.vue'), meta: { requiresAuth: true } },
  { path: '/alojamientos', name: 'Alojamientos', component: () => import('@/views/AlojamientosView.vue') },
  { path: '/alojamientos/nuevo', name: 'CrearAlojamiento', component: () => import('@/views/CrearAlojamientoView.vue'), meta: { requiresAuth: true } },
  { path: '/alojamientos/:id', name: 'DetalleAlojamiento', component: () => import('@/views/DetalleAlojamientoView.vue') },
  { path: '/alojamientos/:id/editar', name: 'EditarAlojamiento', component: () => import('@/views/CrearAlojamientoView.vue'), meta: { requiresAuth: true } },
  { path: '/reservas', name: 'MisReservas', component: () => import('@/views/MisReservasView.vue'), meta: { requiresAuth: true } },
  { path: '/pago/:reservaId', name: 'Pago', component: () => import('@/views/PagoView.vue'), meta: { requiresAuth: true } },
  { path: '/admin', name: 'Admin', component: () => import('@/views/AdminView.vue'), meta: { requiresAuth: true, rol: 'admin' } },
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isLoggedIn) return '/login'
  if (to.meta.rol && auth.rol !== to.meta.rol) return '/dashboard'
})

export default router
