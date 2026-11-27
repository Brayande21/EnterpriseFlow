import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import {
  FolderKanban,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  LoaderCircle,
  CalendarDays,
  User
} from 'lucide-react'
import axios from 'axios'
import api from '../services/api'

interface Proyecto {
  id: number
  nombre: string
  descripcion: string | null
  estado: string
  responsable: string | null
  responsable_id: number | null
  fecha_inicio: string | null
  fecha_entrega: string | null
}

interface Empleado {
  id: number
  nombre: string
  puesto: string
}

interface ProyectosProps {
  token: string
  rol: string
}

const estados = [
  'Pendiente',
  'En progreso',
  'Completado',
  'Cancelado'
]

const coloresEstado: Record<string, string> = {
  Pendiente: 'bg-amber-100 text-amber-700',
  'En progreso': 'bg-blue-100 text-blue-700',
  Completado: 'bg-green-100 text-green-700',
  Cancelado: 'bg-red-100 text-red-700'
}

const formularioInicial = {
  nombre: '',
  descripcion: '',
  estado: 'Pendiente',
  responsable_id: '',
  fecha_entrega: ''
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

function formatearFecha(fecha: string | null) {
  if (!fecha) return 'Sin fecha'

  return new Date(`${fecha}T00:00:00`)
    .toLocaleDateString('es-DO')
}

export default function Proyectos({
  token,
  rol
}: ProyectosProps) {

  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState<number | null>(null)
  const [formulario, setFormulario] = useState(formularioInicial)

  const esAdmin = rol === 'admin'

  async function cargarDatos() {
    setCargando(true)

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }

      const [respuestaProyectos, respuestaEmpleados] =
        await Promise.all([
          api.get<Proyecto[]>('/proyectos', config),
          api.get<Empleado[]>('/empleados', config)
        ])

      setProyectos(respuestaProyectos.data)
      setEmpleados(respuestaEmpleados.data)

    } catch (err) {
      setError(obtenerError(err))
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [token])

  function cambiarCampo(
    campo: keyof typeof formularioInicial,
    valor: string
  ) {
    setFormulario(anterior => ({
      ...anterior,
      [campo]: valor
    }))
  }

  function nuevoProyecto() {
    setEditando(null)
    setFormulario(formularioInicial)
    setError('')
    setMensaje('')
    setModal(true)
  }

  function editarProyecto(proyecto: Proyecto) {
    setEditando(proyecto.id)

    setFormulario({
      nombre: proyecto.nombre,
      descripcion: proyecto.descripcion ?? '',
      estado: proyecto.estado,
      responsable_id: String(proyecto.responsable_id ?? ''),
      fecha_entrega: proyecto.fecha_entrega ?? ''
    })

    setError('')
    setMensaje('')
    setModal(true)
  }

  async function guardarProyecto(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!esAdmin || guardando) return

    setGuardando(true)
    setError('')
    setMensaje('')

    const datos = {
      nombre: formulario.nombre.trim(),
      descripcion: formulario.descripcion.trim(),
      estado: formulario.estado,
      responsable_id: Number(formulario.responsable_id),
      fecha_entrega: formulario.fecha_entrega
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }

    try {
      if (editando !== null) {
        await api.put(`/proyectos/${editando}`, datos, config)
        setMensaje('Proyecto actualizado correctamente.')
      } else {
        await api.post('/proyectos', datos, config)
        setMensaje('Proyecto creado correctamente.')
      }

      setModal(false)
      await cargarDatos()

    } catch (err) {
      setError(obtenerError(err))
    } finally {
      setGuardando(false)
    }
  }

  async function eliminarProyecto(proyecto: Proyecto) {
    if (!esAdmin) return

    if (!window.confirm(
      `¿Deseas eliminar el proyecto "${proyecto.nombre}"?`
    )) return

    setError('')
    setMensaje('')

    try {
      await api.delete(`/proyectos/${proyecto.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      setMensaje('Proyecto eliminado correctamente.')
      await cargarDatos()

    } catch (err) {
      setError(obtenerError(err))
    }
  }

  const proyectosFiltrados = proyectos.filter(proyecto => {
    const coincideBusqueda =
      `${proyecto.nombre} ${proyecto.descripcion ?? ''} ${proyecto.responsable ?? ''}`
        .toLowerCase()
        .includes(busqueda.toLowerCase())

    const coincideEstado =
      !filtroEstado || proyecto.estado === filtroEstado

    return coincideBusqueda && coincideEstado
  })

  return (
    <main className="p-4 sm:p-6 lg:p-8 space-y-6">

      {/* Encabezado */}

      <div className="flex flex-wrap items-center justify-between gap-4">

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Gestión de proyectos
          </h1>

          <p className="text-slate-500 mt-2">
            Organiza y supervisa los proyectos de tu empresa.
          </p>
        </div>

        {esAdmin && (
          <button
            onClick={nuevoProyecto}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-medium cursor-pointer"
          >
            <Plus size={20} />
            Nuevo proyecto
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

      {/* Resumen de estados */}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">

        {estados.map(estado => (
          <div
            key={estado}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
          >
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${coloresEstado[estado]}`}>
              {estado}
            </span>

            <p className="text-3xl font-bold mt-4">
              {proyectos.filter(p => p.estado === estado).length}
            </p>

            <p className="text-sm text-slate-500 mt-1">
              Proyectos
            </p>
          </div>
        ))}

      </div>

      {/* Buscador y filtros */}

      <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm">

        <div className="flex items-center gap-3">

          <div className="bg-purple-100 text-purple-600 p-3 rounded-xl">
            <FolderKanban size={24} />
          </div>

          <div>
            <h2 className="font-bold">
              Lista de proyectos
            </h2>

            <p className="text-sm text-slate-500">
              {proyectos.length} proyectos registrados
            </p>
          </div>

        </div>

        <div className="flex flex-wrap gap-3">

          <div className="relative">

            <Search
              size={20}
              className="absolute left-3 top-3 text-slate-400"
            />

            <input
              type="search"
              aria-label="Buscar proyectos"
              placeholder="Buscar proyecto..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="border border-slate-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>

          <select
            aria-label="Filtrar por estado"
            value={filtroEstado}
            onChange={e => setFiltroEstado(e.target.value)}
            className="border border-slate-200 rounded-xl px-4 py-3 bg-white outline-none"
          >
            <option value="">Todos los estados</option>

            {estados.map(estado => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}

          </select>

        </div>

      </div>

      {/* Tarjetas de proyectos */}

      {cargando ? (

        <div className="flex justify-center p-12">
          <LoaderCircle
            size={35}
            className="animate-spin text-blue-600"
          />
        </div>

      ) : (

        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">

          {proyectosFiltrados.map(proyecto => (

            <article
              key={proyecto.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >

              <div className="flex items-center justify-between gap-3">

                <div className="bg-purple-100 text-purple-600 p-3 rounded-xl">
                  <FolderKanban size={24} />
                </div>

                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${coloresEstado[proyecto.estado] ?? 'bg-slate-100 text-slate-600'}`}>
                  {proyecto.estado}
                </span>

              </div>

              <h2 className="text-xl font-bold mt-5">
                {proyecto.nombre}
              </h2>

              <p className="text-sm text-slate-500 mt-2 break-words">
                {proyecto.descripcion || 'Sin descripción'}
              </p>

              <div className="space-y-4 mt-6">

                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <User size={18} className="text-slate-400" />

                  <span>
                    Responsable: {proyecto.responsable ?? 'Sin asignar'}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <CalendarDays size={18} className="text-slate-400" />

                  <span>
                    Inicio: {formatearFecha(proyecto.fecha_inicio)}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <CalendarDays size={18} className="text-slate-400" />

                  <span>
                    Entrega: {formatearFecha(proyecto.fecha_entrega)}
                  </span>
                </div>

              </div>

              <div className="border-t border-slate-100 mt-6 pt-4 flex items-center justify-between">

                <span className="text-xs text-slate-400">
                  Proyecto #{proyecto.id}
                </span>

                {esAdmin && (
                  <div className="flex gap-2">

                    <button
                      title="Editar proyecto"
                      aria-label={`Editar ${proyecto.nombre}`}
                      onClick={() => editarProyecto(proyecto)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg cursor-pointer"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      title="Eliminar proyecto"
                      aria-label={`Eliminar ${proyecto.nombre}`}
                      onClick={() => eliminarProyecto(proyecto)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg cursor-pointer"
                    >
                      <Trash2 size={18} />
                    </button>

                  </div>
                )}

              </div>

            </article>

          ))}

          {proyectosFiltrados.length === 0 && (
            <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              No se encontraron proyectos.
            </div>
          )}

        </div>

      )}

      {/* Formulario de proyectos */}

      {modal && esAdmin && (

        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-proyecto"
            className="bg-white rounded-2xl w-full max-w-xl p-8 shadow-xl max-h-[90vh] overflow-y-auto"
          >

            <div className="flex items-center justify-between mb-6">

              <h2 id="titulo-proyecto" className="text-2xl font-bold">
                {editando !== null
                  ? 'Editar proyecto'
                  : 'Nuevo proyecto'}
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
              onSubmit={guardarProyecto}
              className="space-y-5"
            >

              <div>

                <label htmlFor="nombre-proyecto" className="block text-sm font-semibold mb-2">
                  Nombre del proyecto
                </label>

                <input
                  id="nombre-proyecto"
                  value={formulario.nombre}
                  onChange={e => cambiarCampo('nombre', e.target.value)}
                  required
                  minLength={3}
                  maxLength={150}
                  placeholder="Ej. Sistema de facturación"
                  className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

              <div>

                <label htmlFor="descripcion-proyecto" className="block text-sm font-semibold mb-2">
                  Descripción
                </label>

                <textarea
                  id="descripcion-proyecto"
                  value={formulario.descripcion}
                  onChange={e => cambiarCampo('descripcion', e.target.value)}
                  required
                  minLength={5}
                  maxLength={1000}
                  rows={4}
                  placeholder="Describe el objetivo del proyecto..."
                  className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />

              </div>

              <div>

                <label htmlFor="estado-proyecto" className="block text-sm font-semibold mb-2">
                  Estado
                </label>

                <select
                  id="estado-proyecto"
                  value={formulario.estado}
                  onChange={e => cambiarCampo('estado', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-3 bg-white"
                >

                  {estados.map(estado => (
                    <option key={estado} value={estado}>
                      {estado}
                    </option>
                  ))}

                </select>

              </div>

              <div>

                <label htmlFor="responsable-proyecto" className="block text-sm font-semibold mb-2">
                  Empleado responsable
                </label>

                <select
                  id="responsable-proyecto"
                  value={formulario.responsable_id}
                  onChange={e => cambiarCampo('responsable_id', e.target.value)}
                  required
                  className="w-full border border-slate-300 rounded-xl p-3 bg-white"
                >

                  <option value="">
                    Selecciona un empleado
                  </option>

                  {empleados.map(empleado => (
                    <option
                      key={empleado.id}
                      value={empleado.id}
                    >
                      {empleado.nombre} — {empleado.puesto}
                    </option>
                  ))}

                </select>

              </div>

              <div>

                <label htmlFor="fecha-entrega" className="block text-sm font-semibold mb-2">
                  Fecha de entrega
                </label>

                <input
                  id="fecha-entrega"
                  type="date"
                  value={formulario.fecha_entrega}
                  onChange={e => cambiarCampo('fecha_entrega', e.target.value)}
                  required
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
                  {guardando
                    ? 'Guardando...'
                    : 'Guardar proyecto'}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </main>
  )
}