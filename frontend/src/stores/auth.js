import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const usuario = ref(JSON.parse(localStorage.getItem('usuario') || 'null'))
  const darkMode = ref(localStorage.getItem('darkMode') === 'true')

  const isLoggedIn = computed(() => !!token.value)
  const rol = computed(() => usuario.value?.rol)

  // Aplicar tema al document
  const aplicarTema = (dark) => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    localStorage.setItem('darkMode', dark)
  }

  const toggleDark = () => {
    darkMode.value = !darkMode.value
    aplicarTema(darkMode.value)
  }

  // Aplicar al cargar
  aplicarTema(darkMode.value)

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password })
    token.value = res.data.token
    usuario.value = res.data.usuario
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('usuario', JSON.stringify(res.data.usuario))
  }

  const registro = async (datos) => {
    await axios.post('/api/auth/registro', datos)
  }

  const logout = () => {
    token.value = null
    usuario.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
  }

  return { token, usuario, isLoggedIn, rol, darkMode, toggleDark, login, registro, logout }
})
