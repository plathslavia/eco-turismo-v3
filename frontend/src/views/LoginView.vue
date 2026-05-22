<template>
  <div class="auth-layout">
    <div class="auth-card">
      <div class="auth-logo">
        <div class="auth-logo-icon">🌿</div>
        <span class="auth-logo-text">Eco Turismo</span>
      </div>
      <h1 class="auth-heading">Bienvenido de nuevo</h1>
      <p class="auth-subheading">Inicia sesión para continuar tu aventura</p>
      <div class="auth-form">
        <div class="form-group">
          <label class="form-label">Correo electrónico</label>
          <input v-model="email" type="email" class="form-control" placeholder="correo@ejemplo.com" @keyup.enter="handleLogin" autofocus />
        </div>
        <div class="form-group">
          <label class="form-label">Contraseña</label>
          <div style="position:relative">
            <input v-model="password" :type="showPass ? 'text' : 'password'" class="form-control" placeholder="••••••••" @keyup.enter="handleLogin" style="padding-right:42px" />
            <button type="button" @click="showPass=!showPass" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--text-3);font-size:16px;padding:0">
              {{ showPass ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>
        <div v-if="error" class="alert alert-error">⚠️ {{ error }}</div>
        <button @click="handleLogin" :disabled="cargando" class="btn btn-primary btn-block" style="margin-top:.5rem;padding:12px">
          <span v-if="cargando" class="spinner"></span>
          <span v-else>Ingresar →</span>
        </button>
      </div>
      <div class="auth-footer">¿No tienes cuenta? <RouterLink to="/registro">Regístrate gratis</RouterLink></div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
const router = useRouter(), auth = useAuthStore()
const email = ref(''), password = ref(''), cargando = ref(false), error = ref(''), showPass = ref(false)
const handleLogin = async () => {
  if (!email.value || !password.value) { error.value = 'Completa todos los campos'; return }
  cargando.value = true; error.value = ''
  try { await auth.login(email.value, password.value); router.push('/dashboard') }
  catch (err) { error.value = err.response?.data?.error || 'Credenciales incorrectas' }
  finally { cargando.value = false }
}
</script>
<style scoped>
.spinner { width:18px;height:18px;border-radius:50%;border:2px solid rgba(255,255,255,.3);border-top-color:white;animation:spin .7s linear infinite;display:inline-block }
@keyframes spin { to { transform:rotate(360deg) } }
</style>
