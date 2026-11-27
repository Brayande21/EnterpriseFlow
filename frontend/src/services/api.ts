import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
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