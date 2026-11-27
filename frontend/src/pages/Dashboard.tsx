import { useEffect, useState } from 'react'
import {
  Users,
  FolderKanban,
  ListTodo,
  CheckCircle,
  TrendingUp,
  Clock,
  LoaderCircle
} from 'lucide-react'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

import api from '../services/api'

interface DashboardProps {
  token: string
}

interface Estadisticas {
  total_empleados: number
  total_proyectos: number
  total_tareas: number
  tareas_pendientes: number
  tareas_completadas: number
  porcentaje_avance: number
}

export default function Dashboard({ token }: DashboardProps) {
  const [datos, setDatos] = useState<Estadisticas | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function cargarEstadisticas() {
      try {
        const respuesta = await api.get<Estadisticas>('/dashboard', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        setDatos(respuesta.data)
      } catch {
        setError('No se pudieron cargar las estadísticas.')
      } finally {
        setCargando(false)
      }
    }

    cargarEstadisticas()
  }, [token])

  if (cargando) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoaderCircle
          size={40}
          className="animate-spin text-blue-600"
        />
      </div>
    )
  }

  if (error || !datos) {
    return (
      <div className="p-8 text-red-600">
        {error || 'No hay datos disponibles.'}
      </div>
    )
  }

  const tarjetas = [
    {
      titulo: 'Total de empleados',
      valor: datos.total_empleados,
      icono: Users,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      titulo: 'Total de proyectos',
      valor: datos.total_proyectos,
      icono: FolderKanban,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      titulo: 'Total de tareas',
      valor: datos.total_tareas,
      icono: ListTodo,
      color: 'bg-orange-100 text-orange-600'
    },
    {
      titulo: 'Tareas completadas',
      valor: datos.tareas_completadas,
      icono: CheckCircle,
      color: 'bg-green-100 text-green-600'
    }
  ]

  const grafico = [
    {
      name: 'Completadas',
      value: datos.tareas_completadas,
      color: '#22c55e'
    },
    {
      name: 'Pendientes',
      value: datos.tareas_pendientes,
      color: '#f59e0b'
    },
    {
      name: 'Otros estados',
      value: Math.max(
        0,
        datos.total_tareas -
        datos.tareas_completadas -
        datos.tareas_pendientes
      ),
      color: '#3b82f6'
    }
  ].filter(item => item.value > 0)

  return (
    <main className="p-4 sm:p-6 lg:p-8 space-y-6">

      {/* Bienvenida */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Resumen empresarial
        </h1>

        <p className="text-slate-500 mt-2">
          Monitorea el rendimiento y las actividades de tu empresa.
        </p>
      </div>

      {/* Tarjetas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

        {tarjetas.map(({ titulo, valor, icono: Icono, color }) => (
          <div
            key={titulo}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">

              <div className={`p-3 rounded-xl ${color}`}>
                <Icono size={24} />
              </div>

              <TrendingUp size={18} className="text-slate-400" />

            </div>

            <p className="text-sm text-slate-500 mt-5">
              {titulo}
            </p>

            <h2 className="text-3xl font-bold text-slate-900 mt-2">
              {valor}
            </h2>
          </div>
        ))}

      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

          <h2 className="text-lg font-bold">
            Distribución de tareas
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Estado actual de las actividades
          </p>

          <div className="h-72 mt-4">

            {grafico.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={grafico}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={65}
                    outerRadius={100}
                    paddingAngle={4}
                  >
                    {grafico.map(item => (
                      <Cell
                        key={item.name}
                        fill={item.color}
                      />
                    ))}
                  </Pie>

                  <Tooltip />
                  <Legend />

                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                No hay tareas registradas.
              </div>
            )}

          </div>

        </div>

        {/* Progreso general */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

          <h2 className="text-lg font-bold">
            Progreso general
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Porcentaje de tareas completadas
          </p>

          <div className="mt-10">

            <div className="flex items-center justify-between mb-4">

              <span className="text-sm font-medium text-slate-500">
                Avance total
              </span>

              <span className="text-3xl font-bold text-blue-600">
                {datos.porcentaje_avance}%
              </span>

            </div>

            <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">

              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-700"
                style={{
                  width: `${datos.porcentaje_avance}%`
                }}
              />

            </div>

          </div>

          <div className="mt-10 space-y-5">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3 text-slate-600">
                <CheckCircle className="text-green-500" size={22} />
                Tareas completadas
              </div>

              <span className="font-bold">
                {datos.tareas_completadas}
              </span>

            </div>

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3 text-slate-600">
                <Clock className="text-orange-500" size={22} />
                Tareas pendientes
              </div>

              <span className="font-bold">
                {datos.tareas_pendientes}
              </span>

            </div>

          </div>

        </div>

      </div>

    </main>
  )
}