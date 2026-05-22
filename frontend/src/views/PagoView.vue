<template>
  <div>
    <NavBar>
      <template #links>
        <button @click="router.back()" class="btn btn-ghost btn-sm">← Volver</button>
      </template>
    </NavBar>

    <div class="page-container" style="max-width:560px">
      <div v-if="!exito">
        <div class="page-header">
          <h1 class="page-title">Completar pago</h1>
          <p class="page-subtitle">Reserva #{{ reservaId?.slice(0,8) }}...</p>
        </div>

        <div class="card card-body mb-2">
          <h3 style="font-size:15px;font-weight:600;margin-bottom:1rem">Selecciona método de pago</h3>
          <div style="display:flex;flex-direction:column;gap:10px">
            <div v-for="m in metodos" :key="m.value"
              class="pago-metodo" :class="{ selected: metodoSel === m.value }"
              @click="metodoSel = m.value">
              <div class="pago-metodo-icon">{{ m.icon }}</div>
              <div style="flex:1">
                <p style="font-weight:500;font-size:14px;margin:0">{{ m.label }}</p>
                <p style="font-size:12px;color:#888;margin:2px 0 0">{{ m.desc }}</p>
              </div>
              <div :style="metodoSel===m.value
                ? 'width:20px;height:20px;border-radius:50%;background:var(--brand);border:3px solid white;box-shadow:0 0 0 2px var(--brand);flex-shrink:0'
                : 'width:20px;height:20px;border-radius:50%;border:2px solid #ddd;flex-shrink:0'">
              </div>
            </div>
          </div>
        </div>

        <div v-if="error" class="alert alert-error mb-2">{{ error }}</div>
        <button @click="pagar" :disabled="cargando" class="btn btn-primary btn-block" style="font-size:15px;padding:13px">
          {{ cargando ? 'Procesando...' : '💳 Confirmar pago' }}
        </button>
      </div>

      <div v-else style="text-align:center;padding:4rem 2rem">
        <div style="width:80px;height:80px;background:var(--brand-light);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:40px;margin:0 auto 1.5rem">🎉</div>
        <h2 style="font-size:24px;font-weight:700;margin-bottom:.5rem">¡Pago exitoso!</h2>
        <p style="color:#666;margin-bottom:2rem">Tu pago fue procesado exitosamente. ¡Prepárate para tu aventura!</p>
        <RouterLink to="/reservas" class="btn btn-primary">Ver mis reservas</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import NavBar from '@/components/NavBar.vue'

const route = useRoute(), router = useRouter()
const reservaId = route.params.reservaId
const metodoSel = ref('tarjeta'), cargando = ref(false), exito = ref(false), error = ref('')

const metodos = [
  { value: 'tarjeta', icon: '💳', label: 'Tarjeta de crédito/débito', desc: 'Visa, Mastercard, American Express' },
  { value: 'efectivo', icon: '💵', label: 'Pago en efectivo', desc: 'Simulado — solo para demostración' },
  { value: 'transferencia', icon: '🏦', label: 'Transferencia bancaria', desc: 'Simulado — solo para demostración' },
]

const pagar = async () => {
  cargando.value = true; error.value = ''
  try {
    await axios.post('/api/pagos',
      { reserva_id: reservaId, metodo: metodoSel.value },
      { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } }
    )
    exito.value = true
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al procesar el pago. Intenta de nuevo.'
  } finally { cargando.value = false }
}
</script>
