<template>
  <div>
    <NavBar>
      <template #links>
        <button @click="router.back()" class="btn btn-ghost btn-sm">← Volver</button>
      </template>
    </NavBar>

    <div class="page-container" style="max-width:700px">
      <div class="page-header">
        <h1 class="page-title">{{ esEdicion ? 'Editar alojamiento' : 'Publicar alojamiento' }}</h1>
        <p class="page-subtitle">Completa la información y marca la ubicación en el mapa</p>
      </div>

      <div class="card card-body" style="display:flex;flex-direction:column;gap:1rem">
        <div class="form-group">
          <label class="form-label">Nombre del alojamiento</label>
          <input v-model="form.nombre" class="form-control" placeholder="Ej: Cabaña en el Bosque de Niebla" />
        </div>
        <div class="form-group">
          <label class="form-label">Descripción</label>
          <textarea v-model="form.descripcion" class="form-control" rows="3" placeholder="Describe tu alojamiento..." style="resize:vertical"></textarea>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
          <div class="form-group">
            <label class="form-label">Precio por noche (COP)</label>
            <input v-model="form.precio" type="number" class="form-control" placeholder="Ej: 120000" />
          </div>
          <div class="form-group">
            <label class="form-label">Ubicación (ciudad/región)</label>
            <input v-model="form.ubicacion" class="form-control" placeholder="Ej: Boyacá" />
          </div>
        </div>

        <!-- Mapa para seleccionar ubicación -->
        <div>
          <label class="form-label" style="margin-bottom:.5rem;display:block">
            📍 Ubicación en el mapa
            <span style="font-weight:400;color:#888;font-size:12px"> — haz clic para marcar</span>
          </label>
          <div ref="mapRef" style="width:100%;height:300px;border-radius:12px;border:1px solid #eee;overflow:hidden"></div>
          <div v-if="form.latitud" style="display:flex;gap:1rem;margin-top:.5rem">
            <div class="form-group" style="flex:1">
              <label class="form-label" style="font-size:12px">Latitud</label>
              <input v-model="form.latitud" class="form-control" style="font-size:13px" readonly />
            </div>
            <div class="form-group" style="flex:1">
              <label class="form-label" style="font-size:12px">Longitud</label>
              <input v-model="form.longitud" class="form-control" style="font-size:13px" readonly />
            </div>
          </div>
          <p v-else style="font-size:13px;color:#aaa;margin-top:.5rem">Haz clic en el mapa para seleccionar la ubicación exacta</p>
        </div>

        <div class="form-group">
          <label class="form-label">Disponibilidad</label>
          <select v-model="form.disponible" class="form-control">
            <option :value="true">Disponible</option>
            <option :value="false">No disponible</option>
          </select>
        </div>

        <div v-if="error" class="alert alert-error">{{ error }}</div>
        <div v-if="exito" class="alert alert-success">¡Alojamiento publicado exitosamente!</div>

        <button @click="guardar" :disabled="cargando" class="btn btn-primary btn-block" style="margin-top:.5rem">
          {{ cargando ? 'Guardando...' : (esEdicion ? 'Guardar cambios' : '🌿 Publicar alojamiento') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import NavBar from '@/components/NavBar.vue'
import { GOOGLE_MAPS_API_KEY } from '@/config.js'

const router = useRouter()
const route = useRoute()
const esEdicion = !!route.params.id
const mapRef = ref(null)
let map = null, marker = null

const form = reactive({
  nombre: '', descripcion: '', precio: '', ubicacion: '',
  latitud: '', longitud: '', disponible: true
})
const cargando = ref(false), error = ref(''), exito = ref(false)

const cargarScript = () => new Promise((resolve) => {
  if (window.google) { resolve(); return }
  const s = document.createElement('script')
  s.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`
  s.async = true; s.defer = true; s.onload = resolve
  document.head.appendChild(s)
})

onMounted(async () => {
  await cargarScript()
  map = new google.maps.Map(mapRef.value, {
    center: { lat: 4.570868, lng: -74.297333 },
    zoom: 6,
    mapTypeControl: false,
    streetViewControl: false,
  })

  map.addListener('click', (e) => {
    const lat = e.latLng.lat().toFixed(6)
    const lng = e.latLng.lng().toFixed(6)
    form.latitud = lat
    form.longitud = lng

    if (marker) marker.setMap(null)
    marker = new google.maps.Marker({
      position: { lat: parseFloat(lat), lng: parseFloat(lng) },
      map,
      animation: google.maps.Animation.DROP,
      title: 'Ubicación del alojamiento'
    })
  })

  if (esEdicion) {
    const token = localStorage.getItem('token')
    const res = await axios.get('/api/alojamientos/' + route.params.id, { headers: { Authorization: 'Bearer ' + token } })
    Object.assign(form, res.data)
    if (form.latitud && form.longitud) {
      const pos = { lat: parseFloat(form.latitud), lng: parseFloat(form.longitud) }
      map.setCenter(pos); map.setZoom(14)
      marker = new google.maps.Marker({ position: pos, map })
    }
  }
})

const guardar = async () => {
  if (!form.nombre || !form.precio) { error.value = 'Nombre y precio son obligatorios'; return }
  cargando.value = true; error.value = ''
  try {
    const token = localStorage.getItem('token')
    const headers = { Authorization: 'Bearer ' + token }
    if (esEdicion) {
      await axios.put('/api/alojamientos/' + route.params.id, form, { headers })
    } else {
      await axios.post('/api/alojamientos', form, { headers })
    }
    exito.value = true
    setTimeout(() => router.push('/alojamientos'), 1500)
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al guardar'
  } finally { cargando.value = false }
}
</script>
