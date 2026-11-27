import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import {
  Users,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  LoaderCircle
} from 'lucide-react'
import axios from 'axios'
import api from '../services/api'

interface Empleado {
  id: number
  nombre: string
  puesto: string
}

interface EmpleadosProps {
  token: string
  rol: string
}

export default function Empleados({ token, rol }: EmpleadosProps) {
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState<number | null>(null)
  const [nombre, setNombre] = useState('')
  const [puesto, setPuesto] = useState('')

  const esAdmin = rol === 'admin'

  function obtenerError(err: unknown) {
    if (axios.isAxiosError(err)) {
      const detalle = err.response?.data?.detail

      if (typeof detalle === 'string') {
        return detalle
      }
    }

    return 'No se pudo completar la operación.'
  }

  async function cargarEmpleados() {
    setCargando(true)

    try {
      const respuesta = await api.get<Empleado[]>('/empleados', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      setEmpleados(respuesta.data)
    } catch (err) {
      setError(obtenerError(err))
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarEmpleados()
  }, [token])

  function nuevoEmpleado() {
    setEditando(null)
    setNombre('')
    setPuesto('')
    setError('')
    setMensaje('')
    setModal(true)
  }

  function editarEmpleado(empleado: Empleado) {
    setEditando(empleado.id)
    setNombre(empleado.nombre)
    setPuesto(empleado.puesto)
    setError('')
    setMensaje('')
    setModal(true)
  }

  async function guardarEmpleado(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!esAdmin || guardando) return

    setGuardando(true)
    setError('')
    setMensaje('')

    const datos = {
      nombre: nombre.trim(),
      puesto: puesto.trim()
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }

    try {
      if (editando !== null) {
        await api.put(`/empleados/${editando}`, datos, config)
        setMensaje('Empleado actualizado correctamente.')
      } else {
        await api.post('/empleados', datos, config)
        setMensaje('Empleado registrado correctamente.')
      }

      setModal(false)
      await cargarEmpleados()
    } catch (err) {
      setError(obtenerError(err))
    } finally {
      setGuardando(false)
    }
  }

  async function eliminarEmpleado(empleado: Empleado) {
    if (!esAdmin) return

    const confirmar = window.confirm(
      `¿Deseas eliminar a ${empleado.nombre}?`
    )

    if (!confirmar) return

    setError('')
    setMensaje('')

    try {
      await api.delete(`/empleados/${empleado.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      setMensaje('Empleado eliminado correctamente.')
      await cargarEmpleados()
    } catch (err) {
      setError(obtenerError(err))
    }
  }

  const empleadosFiltrados = empleados.filter(empleado =>
    `${empleado.nombre} ${empleado.puesto}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  )

  return (
    <main className="p-4 sm:p-6 lg:p-8 space-y-6">

      {/* Encabezado */}
      <div className="flex flex-wrap items-center justify-between gap-4">

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Gestión de empleados
          </h1>

          <p className="text-slate-500 mt-2">
            Administra el personal de tu empresa.
          </p>
        </div>

        {esAdmin && (
          <button
            onClick={nuevoEmpleado}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-medium cursor-pointer"
          >
            <Plus size={20} />
            Nuevo empleado
          </button>
        )}

      </div>

      {/* Mensajes */}
      {error && !modal && (
        <div role="alert" className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
          {error}
        </div>
      )}

      {mensaje && (
        <div role="status" className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl">
          {mensaje}
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

        <div className="p-6 flex flex-wrap items-center justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
              <Users size={24} />
            </div>

            <div>
              <h2 className="font-bold">
                Lista de empleados
              </h2>

              <p className="text-sm text-slate-500">
                {empleados.length} empleados registrados
              </p>
            </div>

          </div>

          <div className="relative">

            <Search
              size={20}
              className="absolute left-3 top-3 text-slate-400"
            />

            <input
              type="search"
              aria-label="Buscar empleados"
              placeholder="Buscar empleado..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="border border-slate-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>

        </div>

        {cargando ? (

          <div className="flex justify-center p-12">
            <LoaderCircle
              size={35}
              className="animate-spin text-blue-600"
            />
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead className="bg-slate-50 border-y border-slate-200">

                <tr className="text-sm text-slate-500">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Nombre</th>
                  <th className="px-6 py-4">Puesto</th>

                  {esAdmin && (
                    <th className="px-6 py-4 text-right">
                      Acciones
                    </th>
                  )}
                </tr>

              </thead>

              <tbody>

                {empleadosFiltrados.map(empleado => (

                  <tr
                    key={empleado.id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >

                    <td className="px-6 py-5 text-slate-500">
                      #{empleado.id}
                    </td>

                    <td className="px-6 py-5">

                      <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                          {empleado.nombre.charAt(0).toUpperCase()}
                        </div>

                        <span className="font-semibold">
                          {empleado.nombre}
                        </span>

                      </div>

                    </td>

                    <td className="px-6 py-5 text-slate-600">
                      {empleado.puesto}
                    </td>

                    {esAdmin && (
                      <td className="px-6 py-5">

                        <div className="flex justify-end gap-2">

                          <button
                            title="Editar empleado"
                            aria-label={`Editar a ${empleado.nombre}`}
                            onClick={() => editarEmpleado(empleado)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg cursor-pointer"
                          >
                            <Pencil size={18} />
                          </button>

                          <button
                            title="Eliminar empleado"
                            aria-label={`Eliminar a ${empleado.nombre}`}
                            onClick={() => eliminarEmpleado(empleado)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg cursor-pointer"
                          >
                            <Trash2 size={18} />
                          </button>

                        </div>

                      </td>
                    )}

                  </tr>

                ))}

                {empleadosFiltrados.length === 0 && (
                  <tr>
                    <td
                      colSpan={esAdmin ? 4 : 3}
                      className="text-center p-10 text-slate-400"
                    >
                      No se encontraron empleados.
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* Modal de registro y edición */}
      {modal && esAdmin && (

        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal"
            className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-xl"
          >

            <div className="flex items-center justify-between mb-6">

              <h2 id="titulo-modal" className="text-2xl font-bold">
                {editando !== null
                  ? 'Editar empleado'
                  : 'Nuevo empleado'}
              </h2>

              <button
                disabled={guardando}
                aria-label="Cerrar formulario"
                onClick={() => setModal(false)}
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
              onSubmit={guardarEmpleado}
              className="space-y-5"
            >

              <div>

                <label htmlFor="nombre" className="block text-sm font-semibold mb-2">
                  Nombre completo
                </label>

                <input
                  id="nombre"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  required
                  minLength={2}
                  maxLength={100}
                  placeholder="Nombre del empleado"
                  className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

              <div>

                <label htmlFor="puesto" className="block text-sm font-semibold mb-2">
                  Puesto de trabajo
                </label>

                <input
                  id="puesto"
                  value={puesto}
                  onChange={e => setPuesto(e.target.value)}
                  required
                  minLength={2}
                  maxLength={100}
                  placeholder="Ej. Analista de datos"
                  className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

              <div className="flex justify-end gap-3 pt-4">

                <button
                  type="button"
                  disabled={guardando}
                  onClick={() => setModal(false)}
                  className="border border-slate-300 px-5 py-3 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={guardando}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-3 rounded-xl cursor-pointer"
                >
                  {guardando ? 'Guardando...' : 'Guardar empleado'}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </main>
  )
}