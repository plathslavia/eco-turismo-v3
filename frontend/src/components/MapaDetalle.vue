<template>
  <div>
    <div v-if="tieneCoordenadas">
      <div ref="mapRef" class="mapa-detalle"></div>
    </div>
    <div v-else class="mapa-placeholder">
      <span style="font-size:32px">📍</span>
      <p style="color:#888;margin:.5rem 0 0;font-size:14px">{{ ubicacion || 'Ubicación no disponible' }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps(['latitud', 'longitud', 'nombre', 'ubicacion', 'apiKey'])
const mapRef = ref(null)

const tieneCoordenadas = computed(() =>
  props.latitud && props.longitud &&
  !isNaN(parseFloat(props.latitud)) && !isNaN(parseFloat(props.longitud))
)

const cargarScript = () => new Promise((resolve) => {
  if (window.google) { resolve(); return }
  const s = document.createElement('script')
  s.src = `https://maps.googleapis.com/maps/api/js?key=${props.apiKey}`
  s.async = true; s.defer = true; s.onload = resolve
  document.head.appendChild(s)
})

onMounted(async () => {
  if (!tieneCoordenadas.value) return
  await cargarScript()

  const lat = parseFloat(props.latitud)
  const lng = parseFloat(props.longitud)

  const map = new google.maps.Map(mapRef.value, {
    center: { lat, lng },
    zoom: 14,
    mapTypeControl: false,
    streetViewControl: false,
    zoomControl: true,
    styles: [
      { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }
    ]
  })

  new google.maps.Marker({
    position: { lat, lng },
    map,
    title: props.nombre,
    animation: google.maps.Animation.DROP,
    icon: {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="48">
          <circle cx="20" cy="20" r="18" fill="#1D9E75" stroke="white" stroke-width="3"/>
          <text x="20" y="26" text-anchor="middle" font-size="18">🏕️</text>
          <polygon points="12,36 20,48 28,36" fill="#1D9E75"/>
        </svg>`)}`,
      scaledSize: new google.maps.Size(40, 48),
      anchor: new google.maps.Point(20, 48)
    }
  })
})
</script>

<style scoped>
.mapa-detalle {
  width: 100%;
  height: 260px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #eee;
}
.mapa-placeholder {
  height: 160px;
  background: #F1EFE8;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid #eee;
}
</style>
