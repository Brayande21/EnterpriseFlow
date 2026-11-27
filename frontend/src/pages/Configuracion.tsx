import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import {
  User,
  Users,
  Shield,
  Lock,
  Mail,
  Plus,
  X,
  LoaderCircle,
  CheckCircle,
  Search
} from 'lucide-react'
import axios from 'axios'
import api from '../services/api'

interface Usuario {
  id: number
  nombre: string
  email: string
  rol: string
  activo: boolean
}

interface ConfiguracionProps {
  token: string
  usuario: Usuario
}

const formularioInicial = {
  nombre: '',
  email: '',
  password: ''
}

const passwordInicial = {
  actual: '',
  nueva: '',
  confirmar: ''
}

function obtenerError(err: unknown) {
  if (axios.isAxiosError(err)) {
    const detalle = err.response?.data?.detail

    if (typeof detalle === 'string') {
      return detalle
    }
  }

  return 'No se pudo completar la operación.'
}

const estiloInput =
  'w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500'

export default function Configuracion({
  token,
  usuario
}: ConfiguracionProps) {

  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(false)
  const [guardando, setGuardando] = useState(false)

  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  const [modal, setModal] = useState(false)
  const [formulario, setFormulario] = useState(formularioInicial)
  const [password, setPassword] = useState(passwordInicial)

  const esAdmin = usuario.rol === 'admin'

  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }

  async function cargarUsuarios() {
    if (!esAdmin) return

    setCargando(true)

    try {
      const respuesta = await api.get<Usuario[]>(
        '/auth/usuarios',
        config
      )

      setUsuarios(respuesta.data)

    } catch (err) {
      setError(obtenerError(err))
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarUsuarios()
  }, [token, esAdmin])

  function abrirModal() {
    setFormulario(formularioInicial)
    setError('')
    setMensaje('')
    setModal(true)
  }

  async function registrarUsuario(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!esAdmin || guardando) return

    setGuardando(true)
    setError('')
    setMensaje('')

    try {
      await api.post(
        '/auth/registro',
        {
          nombre: formulario.nombre.trim(),
          email: formulario.email.trim(),
          password: formulario.password
        },
        config
      )

      setMensaje('Usuario registrado correctamente.')
      setFormulario(formularioInicial)
      setModal(false)

      await cargarUsuarios()

    } catch (err) {
      setError(obtenerError(err))
    } finally {
      setGuardando(false)
    }
  }

  async function cambiarRol(
    usuarioId: number,
    nuevoRol: string
  ) {
    if (!esAdmin || usuarioId === usuario.id || guardando) return

    if (!window.confirm(
      `¿Deseas cambiar el rol de este usuario a ${nuevoRol}?`
    )) return

    setGuardando(true)
    setError('')
    setMensaje('')

    try {
      await api.put(
        `/auth/usuarios/${usuarioId}/rol`,
        { rol: nuevoRol },
        config
      )

      setMensaje('Rol actualizado correctamente.')

      await cargarUsuarios()

    } catch (err) {
      setError(obtenerError(err))
    } finally {
      setGuardando(false)
    }
  }

  async function cambiarEstado(cuenta: Usuario) {
    if (!esAdmin || cuenta.id === usuario.id || guardando) return

    const nuevoEstado = !cuenta.activo

    if (!window.confirm(
      `¿Deseas ${nuevoEstado ? 'activar' : 'desactivar'} a ${cuenta.nombre}?`
    )) return

    setGuardando(true)
    setError('')
    setMensaje('')

    try {
      await api.put(
        `/auth/usuarios/${cuenta.id}/estado`,
        { activo: nuevoEstado },
        config
      )

      setMensaje(
        nuevoEstado
          ? 'Usuario activado correctamente.'
          : 'Usuario desactivado correctamente.'
      )

      await cargarUsuarios()

    } catch (err) {
      setError(obtenerError(err))
    } finally {
      setGuardando(false)
    }
  }

  async function cambiarPassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (guardando) return

    setError('')
    setMensaje('')

    if (password.nueva !== password.confirmar) {
      setError('Las contraseñas nuevas no coinciden.')
      return
    }

    if (password.actual === password.nueva) {
      setError('La nueva contraseña debe ser diferente.')
      return
    }

    setGuardando(true)

    try {
      await api.put(
        '/auth/password',
        {
          password_actual: password.actual,
          password_nueva: password.nueva
        },
        config
      )

      setPassword(passwordInicial)
      setMensaje('Contraseña actualizada correctamente.')

    } catch (err) {
      setError(obtenerError(err))
    } finally {
      setGuardando(false)
    }
  }

  const usuariosFiltrados = usuarios.filter(cuenta =>
    `${cuenta.nombre} ${cuenta.email} ${cuenta.rol}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  )

  return (
    <main className="p-4 sm:p-6 lg:p-8 space-y-6">

      {/* Encabezado */}

      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Configuración
        </h1>

        <p className="text-slate-500 mt-2">
          Administra tu perfil, seguridad y usuarios del sistema.
        </p>
      </div>

      {/* Mensajes */}

      {error && !modal && (
        <div role="alert" className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
          {error}
        </div>
      )}

      {mensaje && (
        <div role="status" className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl">
          <CheckCircle size={20} />
          {mensaje}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Perfil personal */}

        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

          <div className="flex items-center gap-3 mb-6">

            <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
              <User size={24} />
            </div>

            <div>
              <h2 className="text-xl font-bold">
                Mi perfil
              </h2>

              <p className="text-sm text-slate-500">
                Información de tu cuenta
              </p>
            </div>

          </div>

          <div className="flex items-center gap-4 mb-6">

            <div className="w-20 h-20 rounded-full bg-slate-900 text-white flex items-center justify-center text-3xl font-bold">
              {usuario.nombre.charAt(0).toUpperCase()}
            </div>

            <div>
              <h3 className="text-xl font-bold">
                {usuario.nombre}
              </h3>

              <span className="text-sm text-slate-500">
                {esAdmin ? 'Administrador' : 'Usuario'}
              </span>
            </div>

          </div>

          <div className="space-y-4">

            <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-4">

              <Mail size={20} className="text-slate-500" />

              <div className="min-w-0">
                <p className="text-xs text-slate-500">
                  Correo electrónico
                </p>

                <p className="font-medium break-all">
                  {usuario.email}
                </p>
              </div>

            </div>

            <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-4">

              <Shield size={20} className="text-slate-500" />

              <div>
                <p className="text-xs text-slate-500">
                  Rol de acceso
                </p>

                <p className="font-medium">
                  {esAdmin ? 'Administrador' : 'Usuario estándar'}
                </p>
              </div>

            </div>

            <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-4">

              <CheckCircle size={20} className="text-green-600" />

              <div>
                <p className="text-xs text-slate-500">
                  Estado de la cuenta
                </p>

                <p className="font-medium text-green-600">
                  {usuario.activo ? 'Activa' : 'Inactiva'}
                </p>
              </div>

            </div>

          </div>

        </section>

        {/* Seguridad */}

        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

          <div className="flex items-center gap-3 mb-6">

            <div className="bg-purple-100 text-purple-600 p-3 rounded-xl">
              <Lock size={24} />
            </div>

            <div>
              <h2 className="text-xl font-bold">
                Seguridad
              </h2>

              <p className="text-sm text-slate-500">
                Cambia tu contraseña de acceso
              </p>
            </div>

          </div>

          <form onSubmit={cambiarPassword} className="space-y-4">

            <div>
              <label htmlFor="password-actual" className="block text-sm font-semibold mb-2">
                Contraseña actual
              </label>

              <input
                id="password-actual"
                type="password"
                autoComplete="current-password"
                required
                maxLength={128}
                value={password.actual}
                onChange={e => setPassword({
                  ...password,
                  actual: e.target.value
                })}
                className={estiloInput}
              />
            </div>

            <div>
              <label htmlFor="password-nueva" className="block text-sm font-semibold mb-2">
                Nueva contraseña
              </label>

              <input
                id="password-nueva"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={128}
                value={password.nueva}
                onChange={e => setPassword({
                  ...password,
                  nueva: e.target.value
                })}
                className={estiloInput}
              />

              <p className="text-xs text-slate-500 mt-2">
                Debe contener al menos 8 caracteres.
              </p>
            </div>

            <div>
              <label htmlFor="confirmar-password" className="block text-sm font-semibold mb-2">
                Confirmar nueva contraseña
              </label>

              <input
                id="confirmar-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={128}
                value={password.confirmar}
                onChange={e => setPassword({
                  ...password,
                  confirmar: e.target.value
                })}
                className={estiloInput}
              />
            </div>

            <button
              type="submit"
              disabled={guardando}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl py-3 font-medium cursor-pointer"
            >
              Actualizar contraseña
            </button>

          </form>

        </section>

      </div>

      {/* Administración de usuarios */}

      {esAdmin && (

        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm">

          <div className="p-6 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4">

            <div className="flex items-center gap-3">

              <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
                <Users size={24} />
              </div>

              <div>
                <h2 className="text-xl font-bold">
                  Administración de usuarios
                </h2>

                <p className="text-sm text-slate-500">
                  Gestiona las cuentas y permisos del sistema
                </p>
              </div>

            </div>

            <button
              onClick={abrirModal}
              disabled={guardando}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-3 rounded-xl cursor-pointer"
            >
              <Plus size={20} />
              Nuevo usuario
            </button>

          </div>

          {/* Estadísticas */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6">

            {[
              {
                titulo: 'Total de usuarios',
                valor: usuarios.length,
                color: 'text-slate-900'
              },
              {
                titulo: 'Administradores',
                valor: usuarios.filter(u => u.rol === 'admin').length,
                color: 'text-purple-600'
              },
              {
                titulo: 'Cuentas activas',
                valor: usuarios.filter(u => u.activo).length,
                color: 'text-green-600'
              },
              {
                titulo: 'Cuentas inactivas',
                valor: usuarios.filter(u => !u.activo).length,
                color: 'text-red-600'
              }
            ].map(item => (

              <div
                key={item.titulo}
                className="bg-slate-50 border border-slate-200 rounded-xl p-4"
              >
                <p className="text-sm text-slate-500">
                  {item.titulo}
                </p>

                <p className={`text-3xl font-bold mt-2 ${item.color}`}>
                  {item.valor}
                </p>
              </div>

            ))}

          </div>

          {/* Buscador */}

          <div className="px-6 pb-6">

            <div className="relative max-w-md">

              <Search
                size={20}
                className="absolute left-3 top-3 text-slate-400"
              />

              <input
                type="search"
                aria-label="Buscar usuarios"
                placeholder="Buscar usuario..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                className="w-full border border-slate-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

          </div>

          {/* Tabla */}

          {cargando ? (

            <div className="flex justify-center p-10">
              <LoaderCircle
                size={32}
                className="animate-spin text-blue-600"
              />
            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead className="bg-slate-50 text-slate-500 text-sm">

                  <tr>
                    <th className="p-4">Usuario</th>
                    <th className="p-4">Correo electrónico</th>
                    <th className="p-4">Rol</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4">Acciones</th>
                  </tr>

                </thead>

                <tbody>

                  {usuariosFiltrados.map(cuenta => (

                    <tr
                      key={cuenta.id}
                      className="border-t border-slate-100 hover:bg-slate-50"
                    >

                      <td className="p-4">

                        <div className="flex items-center gap-3">

                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">
                            {cuenta.nombre.charAt(0).toUpperCase()}
                          </div>

                          <div>
                            <p className="font-semibold">
                              {cuenta.nombre}
                            </p>

                            {cuenta.id === usuario.id && (
                              <span className="text-xs text-blue-600">
                                Tu cuenta
                              </span>
                            )}
                          </div>

                        </div>

                      </td>

                      <td className="p-4 text-sm text-slate-600">
                        {cuenta.email}
                      </td>

                      <td className="p-4">

                        <select
                          aria-label={`Rol de ${cuenta.nombre}`}
                          value={cuenta.rol}
                          disabled={
                            cuenta.id === usuario.id ||
                            guardando
                          }
                          onChange={e => cambiarRol(
                            cuenta.id,
                            e.target.value
                          )}
                          className="border border-slate-200 rounded-lg p-2 text-sm bg-white disabled:opacity-50"
                        >
                          <option value="admin">
                            Administrador
                          </option>

                          <option value="usuario">
                            Usuario
                          </option>
                        </select>

                      </td>

                      <td className="p-4">

                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          cuenta.activo
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {cuenta.activo ? 'Activo' : 'Inactivo'}
                        </span>

                      </td>

                      <td className="p-4">

                        {cuenta.id !== usuario.id ? (

                          <button
                            disabled={guardando}
                            onClick={() => cambiarEstado(cuenta)}
                            className={`text-sm font-medium px-3 py-2 rounded-lg cursor-pointer disabled:opacity-50 ${
                              cuenta.activo
                                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                : 'bg-green-50 text-green-600 hover:bg-green-100'
                            }`}
                          >
                            {cuenta.activo ? 'Desactivar' : 'Activar'}
                          </button>

                        ) : (

                          <span className="text-xs text-slate-400">
                            Cuenta protegida
                          </span>

                        )}

                      </td>

                    </tr>

                  ))}

                  {usuariosFiltrados.length === 0 && (

                    <tr>
                      <td
                        colSpan={5}
                        className="p-10 text-center text-slate-400"
                      >
                        No se encontraron usuarios.
                      </td>
                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

      )}

      {/* Modal de registro */}

      {modal && esAdmin && (

        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal-usuario"
            className="bg-white rounded-2xl w-full max-w-md p-8 shadow-xl max-h-[90vh] overflow-y-auto"
          >

            <div className="flex justify-between items-center mb-6">

              <h2 id="titulo-modal-usuario" className="text-2xl font-bold">
                Nuevo usuario
              </h2>

              <button
                disabled={guardando}
                aria-label="Cerrar formulario"
                onClick={() => {
                  setModal(false)
                  setFormulario(formularioInicial)
                }}
                className="text-slate-400 hover:text-slate-900 cursor-pointer"
              >
                <X size={24} />
              </button>

            </div>

            {error && (
              <div role="alert" className="bg-red-50 text-red-700 p-3 rounded-xl mb-4">
                {error}
              </div>
            )}

            <form
              onSubmit={registrarUsuario}
              autoComplete="off"
              className="space-y-5"
            >

              <div>
                <label htmlFor="nombre-usuario" className="block text-sm font-semibold mb-2">
                  Nombre completo
                </label>

                <input
                  id="nombre-usuario"
                  required
                  minLength={3}
                  maxLength={100}
                  value={formulario.nombre}
                  onChange={e => setFormulario({
                    ...formulario,
                    nombre: e.target.value
                  })}
                  className={estiloInput}
                />
              </div>

              <div>
                <label htmlFor="email-usuario" className="block text-sm font-semibold mb-2">
                  Correo electrónico
                </label>

                <input
                  id="email-usuario"
                  type="email"
                  required
                  maxLength={150}
                  value={formulario.email}
                  onChange={e => setFormulario({
                    ...formulario,
                    email: e.target.value
                  })}
                  className={estiloInput}
                />
              </div>

              <div>
                <label htmlFor="password-usuario" className="block text-sm font-semibold mb-2">
                  Contraseña
                </label>

                <input
                  id="password-usuario"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  maxLength={128}
                  value={formulario.password}
                  onChange={e => setFormulario({
                    ...formulario,
                    password: e.target.value
                  })}
                  className={estiloInput}
                />
              </div>

              <div className="bg-blue-50 text-blue-700 text-sm p-4 rounded-xl">
                Las cuentas nuevas se crean con el rol de usuario.
                Puedes modificar sus permisos posteriormente.
              </div>

              <div className="flex justify-end gap-3 pt-3">

                <button
                  type="button"
                  disabled={guardando}
                  onClick={() => {
                    setModal(false)
                    setFormulario(formularioInicial)
                  }}
                  className="border border-slate-300 px-4 py-3 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={guardando}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-3 rounded-xl cursor-pointer"
                >
                  {guardando ? 'Guardando...' : 'Crear usuario'}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </main>
  )
}