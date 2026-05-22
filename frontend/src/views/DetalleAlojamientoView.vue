<template>
  <div>
    <NavBar>
      <template #links>
        <button @click="router.back()" class="btn btn-ghost btn-sm">← Volver</button>
      </template>
    </NavBar>

    <div class="page-container" v-if="alojamiento">
      <div class="detalle-img">{{ emoji }}</div>

      <div style="display:grid;grid-template-columns:1fr 340px;gap:2rem;align-items:start">
        <!-- Columna izquierda -->
        <div>
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:.5rem;flex-wrap:wrap">
            <h1 style="font-size:26px;font-weight:700">{{ alojamiento.nombre }}</h1>
            <span class="badge" :class="alojamiento.disponible ? 'badge-success' : 'badge-danger'">
              {{ alojamiento.disponible ? '✓ Disponible' : 'No disponible' }}
            </span>
          </div>
          <p style="color:#666;font-size:15px;margin-bottom:1rem">
            📍 {{ alojamiento.ubicacion || 'Colombia' }}
          </p>
          <div class="detalle-precio">
            ${{ Number(alojamiento.precio).toLocaleString('es-CO') }}
            <span style="font-size:16px;font-weight:400;color:#888">/noche</span>
          </div>

          <hr class="divider mt-2 mb-2">
          <h3 style="font-weight:600;margin-bottom:.5rem">Descripción</h3>
          <p style="color:#555;line-height:1.7">{{ alojamiento.descripcion || 'Un hermoso lugar para conectar con la naturaleza.' }}</p>
          <p style="font-size:14px;color:#888;margin-top:.75rem">Publicado por <strong>{{ alojamiento.anfitrion }}</strong></p>

          <!-- Mapa de ubicación -->
          <hr class="divider mt-2 mb-2">
          <h3 style="font-weight:600;margin-bottom:.75rem">📍 Ubicación</h3>
          <MapaDetalle
            :latitud="alojamiento.latitud"
            :longitud="alojamiento.longitud"
            :nombre="alojamiento.nombre"
            :ubicacion="alojamiento.ubicacion"
            :apiKey="mapsKey"
          />
          <p v-if="alojamiento.latitud" style="font-size:12px;color:#aaa;margin-top:6px">
            Coordenadas: {{ alojamiento.latitud }}, {{ alojamiento.longitud }}
          </p>

          <!-- Reseñas -->
          <hr class="divider mt-2 mb-2">
          <div v-if="resenas.length">
            <h3 style="font-weight:600;margin-bottom:1rem">
              Reseñas <span style="color:#888;font-weight:400">({{ resenas.length }}) · ⭐ {{ promedio }}</span>
            </h3>
            <div v-for="r in resenas" :key="r.id" class="resena-card">
              <div class="resena-header">
                <div class="avatar" style="width:32px;height:32px;font-size:12px">{{ r.autor.slice(0,2).toUpperCase() }}</div>
                <div>
                  <p style="font-size:14px;font-weight:500;margin:0">{{ r.autor }}</p>
                  <div class="resena-stars">{{ '⭐'.repeat(r.calificacion) }}</div>
                </div>
              </div>
              <p style="font-size:14px;color:#555;margin:0">{{ r.comentario }}</p>
            </div>
          </div>
          <div v-else class="mt-2">
            <p style="color:#bbb;font-size:14px">Aún no hay reseñas para este alojamiento.</p>
          </div>
        </div>

        <!-- Columna derecha: formulario de reserva sticky -->
        <div style="position:sticky;top:80px">
          <ReservaForm
            v-if="auth.isLoggedIn && auth.rol==='turista'"
            :alojamientoId="alojamiento.id"
            :precioPorNoche="Number(alojamiento.precio)"
          />
          <div v-if="!auth.isLoggedIn" class="card card-body" style="text-align:center">
            <p style="color:#666;margin-bottom:1rem;font-size:14px">Inicia sesión para reservar</p>
            <RouterLink to="/login" class="btn btn-primary btn-block">Iniciar sesión</RouterLink>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="page-container"><p class="text-muted">Cargando...</p></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'
import NavBar from '@/components/NavBar.vue'
import ReservaForm from '@/components/ReservaForm.vue'
import MapaDetalle from '@/components/MapaDetalle.vue'
import { GOOGLE_MAPS_API_KEY } from '@/config.js'

const route = useRoute(), router = useRouter(), auth = useAuthStore()
const alojamiento = ref(null), resenas = ref([]), promedio = ref(0)
const mapsKey = GOOGLE_MAPS_API_KEY
const emojis = ['🏕️','🌲','🏡','🌿','🏔️','🌊']
const emoji = emojis[Math.floor(Math.random() * emojis.length)]

onMounted(async () => {
  const id = route.params.id
  try {
    const [a, r] = await Promise.all([
      axios.get('/api/alojamientos/' + id),
      axios.get('/api/resenas/alojamiento/' + id)
    ])
    alojamiento.value = a.data
    resenas.value = r.data.resenas
    promedio.value = r.data.promedio
  } catch {}
})
</script>
