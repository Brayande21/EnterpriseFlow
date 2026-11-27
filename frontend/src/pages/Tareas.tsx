import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  LoaderCircle,
  CalendarDays,
  FolderKanban,
  User,
  Flag
} from 'lucide-react'
import axios from 'axios'
import api from '../services/api'

interface Tarea {
  id: number
  titulo: string
  descripcion: string | null
  estado: string
  prioridad: string
  proyecto: string
  empleado: string | null
  proyecto_id: number
  empleado_id: number | null
  fecha_entrega: string | null
}

interface Proyecto {
  id: number
  nombre: string
}

interface Empleado {
  id: number
  nombre: string
  puesto: string
}

interface TareasProps {
  token: string
  rol: string
}

const estados = [
  'Pendiente',
  'En progreso',
  'Completada',
  'Cancelada'
]

const prioridades = [
  'Baja',
  'Media',
  'Alta',
  'Urgente'
]

const coloresEstado: Record<string, string> = {
  Pendiente: 'bg-amber-500',
  'En progreso': 'bg-blue-500',
  Completada: 'bg-green-500',
  Cancelada: 'bg-red-500'
}

const coloresPrioridad: Record<string, string> = {
  Baja: 'bg-slate-100 text-slate-600',
  Media: 'bg-blue-100 text-blue-700',
  Alta: 'bg-orange-100 text-orange-700',
  Urgente: 'bg-red-100 text-red-700'
}

const formularioInicial = {
  titulo: '',
  descripcion: '',
  estado: 'Pendiente',
  prioridad: 'Media',
  proyecto_id: '',
  empleado_id: '',
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

export default function Tareas({ token, rol }: TareasProps) {

  const [tareas, setTareas] = useState<Tarea[]>([])
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [empleados, setEmpleados] = useState<Empleado[]>([])

  const [busqueda, setBusqueda] = useState('')
  const [filtroPrioridad, setFiltroPrioridad] = useState('')
  const [filtroProyecto, setFiltroProyecto] = useState('')

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

      const [resTareas, resProyectos, resEmpleados] =
        await Promise.all([
          api.get<Tarea[]>('/tareas', config),
          api.get<Proyecto[]>('/proyectos', config),
          api.get<Empleado[]>('/empleados', config)
        ])

      setTareas(resTareas.data)
      setProyectos(resProyectos.data)
      setEmpleados(resEmpleados.data)

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

  function nuevaTarea(estado = 'Pendiente') {
    setEditando(null)
    setFormulario({
      ...formularioInicial,
      estado
    })
    setError('')
    setMensaje('')
    setModal(true)
  }

  function editarTarea(tarea: Tarea) {
    setEditando(tarea.id)

    setFormulario({
      titulo: tarea.titulo,
      descripcion: tarea.descripcion ?? '',
      estado: tarea.estado,
      prioridad: tarea.prioridad,
      proyecto_id: String(tarea.proyecto_id),
      empleado_id: String(tarea.empleado_id ?? ''),
      fecha_entrega: tarea.fecha_entrega ?? ''
    })

    setError('')
    setMensaje('')
    setModal(true)
  }

  async function guardarTarea(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!esAdmin || guardando) return

    setGuardando(true)
    setError('')
    setMensaje('')

    const datos = {
      titulo: formulario.titulo.trim(),
      descripcion: formulario.descripcion.trim(),
      estado: formulario.estado,
      prioridad: formulario.prioridad,
      proyecto_id: Number(formulario.proyecto_id),
      empleado_id: Number(formulario.empleado_id),
      fecha_entrega: formulario.fecha_entrega
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }

    try {
      if (editando !== null) {
        await api.put(`/tareas/${editando}`, datos, config)
        setMensaje('Tarea actualizada correctamente.')
      } else {
        await api.post('/tareas', datos, config)
        setMensaje('Tarea creada correctamente.')
      }

      setModal(false)
      await cargarDatos()

    } catch (err) {
      setError(obtenerError(err))
    } finally {
      setGuardando(false)
    }
  }

  async function eliminarTarea(tarea: Tarea) {
    if (!esAdmin) return

    if (!window.confirm(
      `¿Deseas eliminar la tarea "${tarea.titulo}"?`
    )) return

    setError('')
    setMensaje('')

    try {
      await api.delete(`/tareas/${tarea.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      setMensaje('Tarea eliminada correctamente.')
      await cargarDatos()

    } catch (err) {
      setError(obtenerError(err))
    }
  }

  const tareasFiltradas = tareas.filter(tarea => {

    const coincideBusqueda =
      `${tarea.titulo} ${tarea.descripcion ?? ''} ${tarea.empleado ?? ''} ${tarea.proyecto}`
        .toLowerCase()
        .includes(busqueda.toLowerCase())

    const coincidePrioridad =
      !filtroPrioridad ||
      tarea.prioridad === filtroPrioridad

    const coincideProyecto =
      !filtroProyecto ||
      String(tarea.proyecto_id) === filtroProyecto

    return coincideBusqueda &&
      coincidePrioridad &&
      coincideProyecto
  })

  return (
    <main className="p-4 sm:p-6 lg:p-8 space-y-6">

      {/* Encabezado */}

      <div className="flex flex-wrap items-center justify-between gap-4">

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Gestión de tareas
          </h1>

          <p className="text-slate-500 mt-2">
            Organiza y supervisa las actividades de tu equipo.
          </p>
        </div>

        {esAdmin && (
          <button
            onClick={() => nuevaTarea()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-medium cursor-pointer"
          >
            <Plus size={20} />
            Nueva tarea
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

      {/* Filtros */}

      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">

        <div>
          <h2 className="font-bold">
            Tablero de tareas
          </h2>

          <p className="text-sm text-slate-500">
            {tareas.length} tareas registradas
          </p>
        </div>

        <div className="flex flex-wrap gap-3">

          <div className="relative">

            <Search
              size={20}
              className="absolute left-3 top-3 text-slate-400"
            />

            <input
              type="search"
              aria-label="Buscar tareas"
              placeholder="Buscar tarea..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="border border-slate-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>

          <select
            aria-label="Filtrar por prioridad"
            value={filtroPrioridad}
            onChange={e => setFiltroPrioridad(e.target.value)}
            className="border border-slate-200 rounded-xl px-4 py-3 bg-white"
          >

            <option value="">Todas las prioridades</option>

            {prioridades.map(prioridad => (
              <option key={prioridad} value={prioridad}>
                {prioridad}
              </option>
            ))}

          </select>

          <select
            aria-label="Filtrar por proyecto"
            value={filtroProyecto}
            onChange={e => setFiltroProyecto(e.target.value)}
            className="border border-slate-200 rounded-xl px-4 py-3 bg-white"
          >

            <option value="">Todos los proyectos</option>

            {proyectos.map(proyecto => (
              <option key={proyecto.id} value={proyecto.id}>
                {proyecto.nombre}
              </option>
            ))}

          </select>

        </div>

      </div>

      {/* Tablero Kanban */}

      {cargando ? (

        <div className="flex justify-center p-12">
          <LoaderCircle
            size={35}
            className="animate-spin text-blue-600"
          />
        </div>

      ) : (

        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-5 items-start">

          {estados.map(estado => {

            const tareasColumna = tareasFiltradas.filter(
              tarea => tarea.estado === estado
            )

            return (
              <section
                key={estado}
                className="bg-slate-100 border border-slate-200 rounded-2xl p-4 min-h-[420px]"
              >

                {/* Encabezado de columna */}

                <div className="flex items-center justify-between mb-5">

                  <div className="flex items-center gap-2">

                    <div className={`w-3 h-3 rounded-full ${coloresEstado[estado]}`} />

                    <h2 className="font-semibold text-slate-700">
                      {estado}
                    </h2>

                    <span className="bg-slate-200 text-slate-600 rounded-full px-2 py-0.5 text-xs">
                      {tareasColumna.length}
                    </span>

                  </div>

                  {esAdmin && (
                    <button
                      title="Agregar tarea"
                      aria-label={`Agregar tarea en ${estado}`}
                      onClick={() => nuevaTarea(estado)}
                      className="p-1.5 text-slate-500 hover:bg-slate-200 rounded-lg cursor-pointer"
                    >
                      <Plus size={18} />
                    </button>
                  )}

                </div>

                {/* Tarjetas */}

                <div className="space-y-4">

                  {tareasColumna.map(tarea => (

                    <article
                      key={tarea.id}
                      className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                    >

                      <div className="flex items-center justify-between gap-2">

                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${coloresPrioridad[tarea.prioridad] ?? 'bg-slate-100 text-slate-600'}`}>
                          <Flag size={12} />
                          {tarea.prioridad}
                        </span>

                        <span className="text-xs text-slate-400">
                          #{tarea.id}
                        </span>

                      </div>

                      <h3 className="font-bold text-slate-900 mt-4 break-words">
                        {tarea.titulo}
                      </h3>

                      <p className="text-sm text-slate-500 mt-2 break-words">
                        {tarea.descripcion || 'Sin descripción'}
                      </p>

                      <div className="flex items-center gap-2 text-sm text-slate-500 mt-4">

                        <FolderKanban size={16} className="shrink-0" />

                        <span>
                          {tarea.proyecto}
                        </span>

                      </div>

                      <div className="border-t border-slate-100 mt-4 pt-4 space-y-3">

                        <div className="flex items-center gap-2">

                          <div className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center">

                            <User size={17} />

                          </div>

                          <span className="text-sm text-slate-600">
                            {tarea.empleado ?? 'Sin asignar'}
                          </span>

                        </div>

                        <div className="flex items-center gap-2 text-sm text-slate-500">

                          <CalendarDays size={16} />

                          {formatearFecha(tarea.fecha_entrega)}

                        </div>

                      </div>

                      {esAdmin && (

                        <div className="flex justify-end gap-2 border-t border-slate-100 mt-4 pt-3">

                          <button
                            title="Editar tarea"
                            aria-label={`Editar ${tarea.titulo}`}
                            onClick={() => editarTarea(tarea)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg cursor-pointer"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            title="Eliminar tarea"
                            aria-label={`Eliminar ${tarea.titulo}`}
                            onClick={() => eliminarTarea(tarea)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg cursor-pointer"
                          >
                            <Trash2 size={17} />
                          </button>

                        </div>

                      )}

                    </article>

                  ))}

                  {tareasColumna.length === 0 && (

                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center text-sm text-slate-400">
                      Sin tareas
                    </div>

                  )}

                </div>

              </section>
            )
          })}

        </div>

      )}

      {/* Formulario */}

      {modal && esAdmin && (

        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal-tarea"
            className="bg-white rounded-2xl w-full max-w-xl p-8 shadow-xl max-h-[90vh] overflow-y-auto"
          >

            <div className="flex items-center justify-between mb-6">

              <h2 id="titulo-modal-tarea" className="text-2xl font-bold">
                {editando !== null ? 'Editar tarea' : 'Nueva tarea'}
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
              onSubmit={guardarTarea}
              className="space-y-5"
            >

              <div>

                <label htmlFor="titulo-tarea" className="block text-sm font-semibold mb-2">
                  Título de la tarea
                </label>

                <input
                  id="titulo-tarea"
                  value={formulario.titulo}
                  onChange={e => cambiarCampo('titulo', e.target.value)}
                  required
                  minLength={3}
                  maxLength={150}
                  placeholder="Ej. Diseñar base de datos"
                  className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

              <div>

                <label htmlFor="descripcion-tarea" className="block text-sm font-semibold mb-2">
                  Descripción
                </label>

                <textarea
                  id="descripcion-tarea"
                  value={formulario.descripcion}
                  onChange={e => cambiarCampo('descripcion', e.target.value)}
                  required
                  minLength={5}
                  maxLength={1000}
                  rows={3}
                  placeholder="Describe la actividad..."
                  className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div>

                  <label htmlFor="estado-tarea" className="block text-sm font-semibold mb-2">
                    Estado
                  </label>

                  <select
                    id="estado-tarea"
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

                  <label htmlFor="prioridad-tarea" className="block text-sm font-semibold mb-2">
                    Prioridad
                  </label>

                  <select
                    id="prioridad-tarea"
                    value={formulario.prioridad}
                    onChange={e => cambiarCampo('prioridad', e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-3 bg-white"
                  >

                    {prioridades.map(prioridad => (
                      <option key={prioridad} value={prioridad}>
                        {prioridad}
                      </option>
                    ))}

                  </select>

                </div>

              </div>

              <div>

                <label htmlFor="proyecto-tarea" className="block text-sm font-semibold mb-2">
                  Proyecto
                </label>

                <select
                  id="proyecto-tarea"
                  value={formulario.proyecto_id}
                  onChange={e => cambiarCampo('proyecto_id', e.target.value)}
                  required
                  className="w-full border border-slate-300 rounded-xl p-3 bg-white"
                >

                  <option value="">
                    Selecciona un proyecto
                  </option>

                  {proyectos.map(proyecto => (
                    <option key={proyecto.id} value={proyecto.id}>
                      {proyecto.nombre}
                    </option>
                  ))}

                </select>

              </div>

              <div>

                <label htmlFor="empleado-tarea" className="block text-sm font-semibold mb-2">
                  Empleado asignado
                </label>

                <select
                  id="empleado-tarea"
                  value={formulario.empleado_id}
                  onChange={e => cambiarCampo('empleado_id', e.target.value)}
                  required
                  className="w-full border border-slate-300 rounded-xl p-3 bg-white"
                >

                  <option value="">
                    Selecciona un empleado
                  </option>

                  {empleados.map(empleado => (
                    <option key={empleado.id} value={empleado.id}>
                      {empleado.nombre} — {empleado.puesto}
                    </option>
                  ))}

                </select>

              </div>

              <div>

                <label htmlFor="fecha-tarea" className="block text-sm font-semibold mb-2">
                  Fecha de entrega
                </label>

                <input
                  id="fecha-tarea"
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
                  {guardando ? 'Guardando...' : 'Guardar tarea'}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </main>
  )
}