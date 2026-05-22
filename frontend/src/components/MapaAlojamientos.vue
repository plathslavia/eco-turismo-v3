<template>
  <div class="mapa-wrapper">
    <div ref="mapRef" class="mapa-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps(['alojamientos', 'apiKey'])
const emit = defineEmits(['seleccionar'])
const mapRef = ref(null)
let map = null
let markers = []

const cargarScript = () => new Promise((resolve) => {
  if (window.google) { resolve(); return }
  const s = document.createElement('script')
  s.src = `https://maps.googleapis.com/maps/api/js?key=${props.apiKey}&libraries=marker`
  s.async = true
  s.defer = true
  s.onload = resolve
  document.head.appendChild(s)
})

const iniciarMapa = async () => {
  await cargarScript()
  map = new google.maps.Map(mapRef.value, {
    center: { lat: 4.570868, lng: -74.297333 }, // Colombia
    zoom: 6,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    styles: [
      { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
      { featureType: 'transit', stylers: [{ visibility: 'off' }] }
    ]
  })
  ponerMarcadores()
}

const ponerMarcadores = () => {
  markers.forEach(m => m.setMap(null))
  markers = []

  props.alojamientos.forEach(aloj => {
    const lat = parseFloat(aloj.latitud)
    const lng = parseFloat(aloj.longitud)
    if (!lat || !lng) return

    const precio = Number(aloj.precio).toLocaleString('es-CO')

    const marker = new google.maps.Marker({
      position: { lat, lng },
      map,
      title: aloj.nombre,
      icon: {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="120" height="36">
            <rect x="0" y="0" width="120" height="32" rx="16" fill="#1D9E75"/>
            <text x="60" y="21" text-anchor="middle" font-family="Arial" font-size="13" font-weight="bold" fill="white">$${precio}</text>
            <polygon points="50,32 60,40 70,32" fill="#1D9E75"/>
          </svg>`)}`,
        scaledSize: new google.maps.Size(120, 44),
        anchor: new google.maps.Point(60, 44)
      }
    })

    const info = new google.maps.InfoWindow({
      content: `
        <div style="font-family:sans-serif;padding:4px;min-width:180px">
          <p style="font-weight:700;font-size:15px;margin:0 0 4px">${aloj.nombre}</p>
          <p style="color:#666;font-size:13px;margin:0 0 4px">📍 ${aloj.ubicacion || 'Colombia'}</p>
          <p style="color:#1D9E75;font-weight:700;font-size:14px;margin:0 0 8px">$${precio}/noche</p>
          <a href="/alojamientos/${aloj.id}" style="background:#1D9E75;color:white;padding:5px 12px;border-radius:6px;text-decoration:none;font-size:13px">Ver detalles</a>
        </div>
      `
    })

    marker.addListener('click', () => {
      info.open(map, marker)
      emit('seleccionar', aloj)
    })

    markers.push(marker)
  })

  if (markers.length > 0) {
    const bounds = new google.maps.LatLngBounds()
    markers.forEach(m => bounds.extend(m.getPosition()))
    map.fitBounds(bounds)
  }
}

onMounted(iniciarMapa)
watch(() => props.alojamientos, () => { if (map) ponerMarcadores() }, { deep: true })
</script>

<style scoped>
.mapa-wrapper {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #eee;
  box-shadow: 0 1px 3px rgba(0,0,0,.06);
}
.mapa-container {
  width: 100%;
  height: 420px;
}
</style>
