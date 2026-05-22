<template>
  <div class="auth-layout">
    <div class="auth-card">
      <div class="auth-logo">
        <div class="auth-logo-icon">🌿</div>
        <span class="auth-logo-text">Eco Turismo</span>
      </div>
      <h1 class="auth-heading">Crear cuenta</h1>
      <p class="auth-subheading">Únete a nuestra comunidad ecoturística</p>
      <div class="auth-form">
        <div class="form-group">
          <label class="form-label">Nombre completo</label>
          <input v-model="form.nombre" class="form-control" placeholder="Tu nombre completo" autofocus />
        </div>
        <div class="form-group">
          <label class="form-label">Correo electrónico</label>
          <input v-model="form.email" type="email" class="form-control" placeholder="correo@ejemplo.com" />
        </div>
        <div class="form-group">
          <label class="form-label">Contraseña</label>
          <input v-model="form.password" type="password" class="form-control" placeholder="Mínimo 6 caracteres" />
        </div>
        <div class="form-group">
          <label class="form-label">Tipo de cuenta</label>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <div @click="form.rol='turista'" :class="['rol-opt', form.rol==='turista' && 'selected']">
              <span style="font-size:22px">🧳</span>
              <span style="font-size:13px;font-weight:600">Turista</span>
              <span style="font-size:11px;color:var(--text-2)">Explorar</span>
            </div>
            <div @click="form.rol='anfitrion'" :class="['rol-opt', form.rol==='anfitrion' && 'selected']">
              <span style="font-size:22px">🏡</span>
              <span style="font-size:13px;font-weight:600">Anfitrión</span>
              <span style="font-size:11px;color:var(--text-2)">Publicar</span>
            </div>
          </div>
        </div>
        <div v-if="error" class="alert alert-error">⚠️ {{ error }}</div>
        <div v-if="exito" class="alert alert-success">✅ ¡Cuenta creada! <RouterLink to="/login">Inicia sesión →</RouterLink></div>
        <button @click="handleRegistro" :disabled="cargando" class="btn btn-primary btn-block" style="margin-top:.5rem;padding:12px">
          <span v-if="cargando" class="spinner"></span>
          <span v-else>Crear cuenta →</span>
        </button>
      </div>
      <div class="auth-footer">¿Ya tienes cuenta? <RouterLink to="/login">Inicia sesión</RouterLink></div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore()
const form = reactive({ nombre:'', email:'', password:'', rol:'turista' })
const cargando = ref(false), error = ref(''), exito = ref(false)
const handleRegistro = async () => {
  cargando.value = true; error.value = ''
  try { await auth.registro(form); exito.value = true }
  catch (err) { error.value = err.response?.data?.error || 'Error al registrarse' }
  finally { cargando.value = false }
}
</script>
<style scoped>
.rol-opt { border:1.5px solid var(--border);border-radius:var(--radius-md);padding:12px 8px;cursor:pointer;transition:var(--transition);display:flex;flex-direction:column;align-items:center;gap:4px;background:var(--surface2) }
.rol-opt:hover { border-color:var(--brand); }
.rol-opt.selected { border-color:var(--brand);background:var(--brand-light);box-shadow:0 0 0 3px rgba(29,158,117,.1) }
.spinner { width:18px;height:18px;border-radius:50%;border:2px solid rgba(255,255,255,.3);border-top-color:white;animation:spin .7s linear infinite;display:inline-block }
@keyframes spin { to { transform:rotate(360deg) } }
</style>
