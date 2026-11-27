import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  Layers,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  LoaderCircle
} from 'lucide-react'

import { iniciarSesion, obtenerPerfil } from '../services/auth'
import axios from 'axios'

interface Usuario {
  id: number
  nombre: string
  email: string
  rol: string
  activo: boolean
}

interface LoginProps {
  onLogin: (token: string, usuario: Usuario) => void
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  async function manejarLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setCargando(true)

    try {
      const respuesta = await iniciarSesion(email, password)
      const usuario = await obtenerPerfil(respuesta.access_token)

      onLogin(respuesta.access_token, usuario)

    } catch (err) {
      if (axios.isAxiosError(err)) {
        const detalle = err.response?.data?.detail

        setError(
          typeof detalle === 'string'
            ? detalle
            : 'No se pudo iniciar sesión. Verifica tus datos y la conexión.'
        )
      } else {
        setError('Ocurrió un error inesperado.')
      }
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">

      {/* Panel izquierdo */}
      <div className="hidden lg:flex flex-col justify-between bg-slate-950 text-white p-16">

        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-3 rounded-xl">
            <Layers size={28} />
          </div>

          <span className="text-2xl font-bold">
            EnterpriseFlow
          </span>
        </div>

        <div className="max-w-xl">

          <span className="text-blue-400 font-semibold tracking-widest text-sm">
            ENTERPRISE MANAGEMENT
          </span>

          <h1 className="text-5xl font-bold leading-tight mt-6">
            Gestiona tu empresa desde un solo lugar.
          </h1>

          <p className="text-slate-400 text-lg mt-6 leading-relaxed">
            Centraliza tus empleados, proyectos y tareas
            en una plataforma moderna, segura y eficiente.
          </p>

          <div className="grid grid-cols-3 gap-4 mt-12">

            {['Empleados', 'Proyectos', 'Tareas'].map(item => (
              <div
                key={item}
                className="border border-slate-800 bg-slate-900 rounded-xl p-4 text-center"
              >
                <span className="text-sm text-slate-300">
                  {item}
                </span>
              </div>
            ))}

          </div>
        </div>

        <p className="text-slate-500 text-sm">
          © 2026 EnterpriseFlow. Todos los derechos reservados.
        </p>

      </div>

      {/* Panel derecho */}
      <div className="flex items-center justify-center bg-slate-50 p-8">

        <div className="w-full max-w-md">

          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="bg-blue-600 text-white p-3 rounded-xl">
              <Layers size={24} />
            </div>

            <span className="text-xl font-bold">
              EnterpriseFlow
            </span>
          </div>

          <h2 className="text-4xl font-bold text-slate-900">
            Bienvenido
          </h2>

          <p className="text-slate-500 mt-3 mb-10">
            Inicia sesión para acceder a tu espacio de trabajo.
          </p>

          {error && (
            <div
              role="alert"
              className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm"
            >
              {error}
            </div>
          )}

          <form
            className="space-y-6"
            onSubmit={manejarLogin}
          >

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold mb-2"
              >
                Correo electrónico
              </label>

              <div className="relative">

                <Mail
                  className="absolute left-4 top-4 text-slate-400"
                  size={20}
                />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@empresa.com"
                  autoComplete="email"
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>
            </div>

            <div>

              <label
                htmlFor="password"
                className="block text-sm font-semibold mb-2"
              >
                Contraseña
              </label>

              <div className="relative">

                <Lock
                  className="absolute left-4 top-4 text-slate-400"
                  size={20}
                />

                <input
                  id="password"
                  type={mostrarPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Introduce tu contraseña"
                  autoComplete="current-password"
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl py-4 pl-12 pr-12 outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                  type="button"
                  aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute right-4 top-4 text-slate-400 cursor-pointer"
                >
                  {mostrarPassword
                    ? <EyeOff size={20} />
                    : <Eye size={20} />
                  }
                </button>

              </div>
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors cursor-pointer"
            >
              {cargando
                ? <LoaderCircle size={20} className="animate-spin" />
                : <ArrowRight size={20} />
              }

              <span>
                {cargando ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </span>

            </button>

          </form>

          <p className="text-center text-sm text-slate-400 mt-10">
            Acceso exclusivo para personal autorizado.
          </p>

        </div>
      </div>
    </div>
  )
}