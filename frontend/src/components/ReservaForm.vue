<template>
  <div class="reserva-form">
    <h3 style="font-size:16px;font-weight:600;margin-bottom:1rem">📅 Hacer reserva</h3>
    <div class="form-group mb-2">
      <label class="form-label">Fecha de llegada</label>
      <input type="date" v-model="form.fecha_inicio" :min="hoy" class="form-control" @change="validarFechas" />
    </div>
    <div class="form-group mb-2">
      <label class="form-label">Fecha de salida</label>
      <input type="date" v-model="form.fecha_fin" :min="minFechaFin" class="form-control" @change="validarFechas" />
    </div>

    <div v-if="errorFecha" class="alert alert-error mb-2" style="font-size:13px">{{ errorFecha }}</div>

    <div v-if="noches > 0 && !errorFecha" class="reserva-total">
      <span>{{ noches }} noche{{ noches > 1 ? 's' : '' }}</span>
      <strong>${{ total.toLocaleString('es-CO') }}</strong>
    </div>

    <div v-if="error" class="alert alert-error mb-2">{{ error }}</div>

    <button @click="enviar" :disabled="cargando || noches <= 0 || !!errorFecha" class="btn btn-primary btn-block" style="margin-top:.5rem">
      {{ cargando ? 'Reservando...' : '✓ Confirmar reserva' }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const props = defineProps(['alojamientoId', 'precioPorNoche'])
const router = useRouter()
const form = ref({ fecha_inicio: '', fecha_fin: '' })
const cargando = ref(false), error = ref(''), errorFecha = ref('')
const hoy = new Date().toISOString().split('T')[0]

const minFechaFin = computed(() => form.value.fecha_inicio || hoy)

const noches = computed(() => {
  if (!form.value.fecha_inicio || !form.value.fecha_fin) return 0
  const d = Math.ceil((new Date(form.value.fecha_fin) - new Date(form.value.fecha_inicio)) / 86400000)
  return d > 0 ? d : 0
})
const total = computed(() => noches.value * props.precioPorNoche)

const validarFechas = () => {
  errorFecha.value = ''
  if (form.value.fecha_inicio && form.value.fecha_inicio < hoy) {
    errorFecha.value = 'La fecha de llegada no puede ser en el pasado.'
    return
  }
  if (form.value.fecha_inicio && form.value.fecha_fin && form.value.fecha_fin <= form.value.fecha_inicio) {
    errorFecha.value = 'La fecha de salida debe ser posterior a la llegada.'
  }
}

const enviar = async () => {
  validarFechas()
  if (errorFecha.value || noches.value <= 0) return
  cargando.value = true; error.value = ''
  try {
    const res = await axios.post('/api/reservas',
      { alojamiento_id: props.alojamientoId, ...form.value },
      { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } }
    )
    router.push({ name: 'Pago', params: { reservaId: res.data.id } })
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al crear la reserva'
  } finally { cargando.value = false }
}
</script>
