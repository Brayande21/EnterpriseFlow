import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 60000
})

// Agregar automáticamente el token a las peticiones

api.interceptors.request.use(
  config => {
    const token = sessionStorage.getItem('enterpriseflow_token')

    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  error => Promise.reject(error)
)

// Detectar sesiones inválidas o expiradas

api.interceptors.response.use(
  respuesta => respuesta,
  error => {
    const esLogin = error.config?.url === '/auth/login'

    if (error.response?.status === 401 && !esLogin) {
      sessionStorage.removeItem('enterpriseflow_token')

      window.dispatchEvent(
        new Event('enterpriseflow:sesion-expirada')
      )
    }

    return Promise.reject(error)
  }
)

export default api