import {
  UserCircle,
  CalendarDays,
  Menu
} from 'lucide-react'

interface HeaderProps {
  nombre: string
  rol: string
  paginaActiva: string
  abrirMenu?: () => void
  menuAbierto?: boolean
}

export default function Header({
  nombre,
  rol,
  paginaActiva,
  abrirMenu,
  menuAbierto = false
}: HeaderProps) {

  const fecha = new Date().toLocaleDateString('es-DO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  return (
    <header className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-4 lg:py-5 flex items-center justify-between gap-3">

      {/* Menú y título */}

      <div className="flex items-center gap-3 min-w-0">

        <button
          onClick={abrirMenu}
          aria-label="Abrir menú"
          aria-controls="menu-lateral"
          aria-expanded={menuAbierto}
          className="lg:hidden shrink-0 p-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
        >
          <Menu size={26} />
        </button>

        <div className="min-w-0">

          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 truncate">
            {paginaActiva}
          </h2>

          <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500 mt-1">

            <CalendarDays size={16} />

            {fecha}

          </div>

        </div>

      </div>

      {/* Información del usuario */}

      <div className="flex items-center gap-4 shrink-0">

        <div className="sm:border-l border-slate-200 sm:pl-5 flex items-center gap-3">

          <div className="bg-blue-100 text-blue-600 rounded-full p-2">

            <UserCircle size={28} />

          </div>

          <div className="hidden sm:block">

            <p className="text-sm font-semibold text-slate-900 max-w-40 truncate">
              {nombre}
            </p>

            <p className="text-xs text-slate-500">
              {rol === 'admin' ? 'Administrador' : 'Usuario'}
            </p>

          </div>

        </div>

      </div>

    </header>
  )
}