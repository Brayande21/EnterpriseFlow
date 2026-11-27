import { useEffect, useState, lazy, Suspense } from 'react'
import { LoaderCircle } from 'lucide-react'

import Login from './pages/Login'
import Sidebar from './components/Sidebar'
import Header from './components/Header'

import { obtenerPerfil } from './services/auth'

// Carga diferida de módulos

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Empleados = lazy(() => import('./pages/Empleados'))
const Proyectos = lazy(() => import('./pages/Proyectos'))
const Tareas = lazy(() => import('./pages/Tareas'))
const Configuracion = lazy(() => import('./pages/Configuracion'))

interface Usuario {
  id: number
  nombre: string
  email: string
  rol: string
  activo: boolean
}

const TOKEN_KEY = 'enterpriseflow_token'

// Indicador de carga de módulos

function CargandoModulo() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">

      <LoaderCircle
        size={36}
        className="animate-spin text-blue-600"
      />

      <p className="text-sm text-slate-500">
        Cargando módulo...
      </p>

    </div>
  )
}

function App() {
  const [token, setToken] = useState('')
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [paginaActiva, setPaginaActiva] = useState('Dashboard')
  const [cargando, setCargando] = useState(true)
  const [menuAbierto, setMenuAbierto] = useState(false)

  function manejarSesion(tokenRecibido: string, perfil: Usuario) {
    sessionStorage.setItem(TOKEN_KEY, tokenRecibido)

    setToken(tokenRecibido)
    setUsuario(perfil)
    setPaginaActiva('Dashboard')
    setMenuAbierto(false)
  }

  function cerrarSesion() {
    sessionStorage.removeItem(TOKEN_KEY)

    setToken('')
    setUsuario(null)
    setPaginaActiva('Dashboard')
    setMenuAbierto(false)
  }

  // Recuperar sesión

  useEffect(() => {
    let cancelado = false

    async function recuperarSesion() {
      const tokenGuardado = sessionStorage.getItem(TOKEN_KEY)

      if (!tokenGuardado) {
        setCargando(false)
        return
      }

      try {
        const perfil = await obtenerPerfil(tokenGuardado)

        if (!cancelado) {
          setToken(tokenGuardado)
          setUsuario(perfil)
        }

      } catch {
        if (!cancelado) {
          cerrarSesion()
        }

      } finally {
        if (!cancelado) {
          setCargando(false)
        }
      }
    }

    recuperarSesion()

    return () => {
      cancelado = true
    }
  }, [])

  // Detectar sesiones expiradas

  useEffect(() => {
    window.addEventListener(
      'enterpriseflow:sesion-expirada',
      cerrarSesion
    )

    return () => {
      window.removeEventListener(
        'enterpriseflow:sesion-expirada',
        cerrarSesion
      )
    }
  }, [])

  // Controlar expiración del token

  useEffect(() => {
    if (!token) return

    let temporizador: ReturnType<typeof setTimeout> | undefined

    try {
      const contenido = token.split('.')[1]

      const base64 = contenido
        .replace(/-/g, '+')
        .replace(/_/g, '/')

      const datos = JSON.parse(atob(base64))

      if (typeof datos.exp !== 'number') {
        cerrarSesion()
        return
      }

      const tiempoRestante = datos.exp * 1000 - Date.now()

      if (tiempoRestante <= 0) {
        cerrarSesion()
        return
      }

      temporizador = setTimeout(
        cerrarSesion,
        tiempoRestante
      )

    } catch {
      cerrarSesion()
    }

    return () => {
      clearTimeout(temporizador)
    }
  }, [token])

  // Cerrar menú con la tecla Escape

  useEffect(() => {
    function manejarTecla(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMenuAbierto(false)
      }
    }

    window.addEventListener('keydown', manejarTecla)

    return () => {
      window.removeEventListener('keydown', manejarTecla)
    }
  }, [])

  // Pantalla de carga inicial

  if (cargando) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-4">

        <LoaderCircle
          size={42}
          className="animate-spin text-blue-500"
        />

        <h1 className="text-2xl font-bold">
          EnterpriseFlow
        </h1>

        <p className="text-slate-400">
          Verificando sesión...
        </p>

      </div>
    )
  }

  // Inicio de sesión

  if (!token || !usuario) {
    return <Login onLogin={manejarSesion} />
  }

  // Navegación entre módulos

  function mostrarPagina() {
    switch (paginaActiva) {

      case 'Dashboard':
        return <Dashboard token={token} />

      case 'Empleados':
        return (
          <Empleados
            token={token}
            rol={usuario!.rol}
          />
        )

      case 'Proyectos':
        return (
          <Proyectos
            token={token}
            rol={usuario!.rol}
          />
        )

      case 'Tareas':
        return (
          <Tareas
            token={token}
            rol={usuario!.rol}
          />
        )

      case 'Configuración':
        return (
          <Configuracion
            token={token}
            usuario={usuario!}
          />
        )

      default:
        return <Dashboard token={token} />
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">

      <Sidebar
        paginaActiva={paginaActiva}
        cambiarPagina={setPaginaActiva}
        cerrarSesion={cerrarSesion}
        abierto={menuAbierto}
        cerrarMenu={() => setMenuAbierto(false)}
      />

      <div className="flex-1 min-w-0 w-full">

        <Header
          nombre={usuario.nombre}
          rol={usuario.rol}
          paginaActiva={paginaActiva}
          abrirMenu={() => setMenuAbierto(true)}
          menuAbierto={menuAbierto}
        />

        <Suspense fallback={<CargandoModulo />}>

          {mostrarPagina()}

        </Suspense>

      </div>

    </div>
  )
}

export default App