import {
  Layers,
  LayoutDashboard,
  Users,
  FolderKanban,
  ListTodo,
  Settings,
  LogOut,
  X
} from 'lucide-react'

interface SidebarProps {
  paginaActiva: string
  cambiarPagina: (pagina: string) => void
  cerrarSesion: () => void
  abierto?: boolean
  cerrarMenu?: () => void
}

export default function Sidebar({
  paginaActiva,
  cambiarPagina,
  cerrarSesion,
  abierto = false,
  cerrarMenu = () => {}
}: SidebarProps) {

  const menu = [
    { nombre: 'Dashboard', icono: LayoutDashboard },
    { nombre: 'Empleados', icono: Users },
    { nombre: 'Proyectos', icono: FolderKanban },
    { nombre: 'Tareas', icono: ListTodo },
    { nombre: 'Configuración', icono: Settings }
  ]

  function seleccionarPagina(pagina: string) {
    cambiarPagina(pagina)
    cerrarMenu()
  }

  return (
    <>

      {/* Fondo oscuro para dispositivos móviles */}

      {abierto && (
        <div
          onClick={cerrarMenu}
          aria-hidden="true"
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}

      {/* Menú lateral */}

      <aside
        id="menu-lateral"
        className={`
          fixed inset-y-0 left-0 z-50
          w-64 h-dvh
          bg-slate-950 text-white
          flex flex-col shrink-0
          transition-transform duration-300 ease-in-out
          lg:sticky lg:top-0 lg:translate-x-0 lg:visible
          ${abierto
            ? 'translate-x-0 visible'
            : '-translate-x-full invisible'
          }
        `}
      >

        {/* Logo */}

        <div className="flex items-center gap-3 px-5 py-8">

          <div className="bg-blue-600 p-2.5 rounded-xl shrink-0">
            <Layers size={26} />
          </div>

          <div className="flex-1">

            <h1 className="text-lg font-bold">
              EnterpriseFlow
            </h1>

            <p className="text-xs text-slate-400">
              Enterprise Management
            </p>

          </div>

        </div>

        {/* Botón para cerrar menú en celulares */}

        <button
          onClick={cerrarMenu}
          aria-label="Cerrar menú"
          className="absolute top-2 right-2 p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="px-6 mt-6 mb-4">

          <p className="text-xs font-semibold text-slate-500 tracking-widest">
            MENÚ PRINCIPAL
          </p>

        </div>

        {/* Navegación */}

        <nav
          aria-label="Menú principal"
          className="flex-1 px-4 space-y-2 overflow-y-auto"
        >

          {menu.map(({ nombre, icono: Icono }) => (

            <button
              key={nombre}
              onClick={() => seleccionarPagina(nombre)}
              aria-current={
                paginaActiva === nombre
                  ? 'page'
                  : undefined
              }
              className={`
                w-full flex items-center gap-3
                px-4 py-3 rounded-xl
                text-sm font-medium
                transition-colors cursor-pointer
                ${paginaActiva === nombre
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }
              `}
            >

              <Icono size={20} />

              {nombre}

            </button>

          ))}

        </nav>

        {/* Cerrar sesión */}

        <div className="p-4 border-t border-slate-800">

          <button
            onClick={() => {
              cerrarMenu()
              cerrarSesion()
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer"
          >

            <LogOut size={20} />

            Cerrar sesión

          </button>

          <p className="text-center text-xs text-slate-600 mt-5">
            EnterpriseFlow v1.0
          </p>

        </div>

      </aside>

    </>
  )
}