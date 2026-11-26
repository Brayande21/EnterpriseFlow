
# EnterpriseFlow

Sistema de gestión empresarial diseñado para administrar empleados, proyectos y tareas mediante una API REST.

## Características implementadas

- Gestión de empleados (CRUD).
- Gestión de proyectos (CRUD).
- Gestión de tareas (CRUD).
- Dashboard con indicadores de rendimiento.
- Cálculo del porcentaje de tareas completadas.
- Asignación de empleados a proyectos y tareas.
- Validación de datos con Pydantic.
- Validación de integridad referencial.
- Protección contra eliminación de registros relacionados.
- Manejo de errores HTTP 404, 409 y 422.
- Arquitectura modular y escalable.
- Variables de entorno para la conexión a la base de datos.
- Documentación interactiva con Swagger UI.

## Tecnologías utilizadas

- Python
- FastAPI
- PostgreSQL
- Psycopg
- Pydantic
- Uvicorn
- Python-dotenv
- Git y GitHub

## Estructura del proyecto

```text
EnterpriseFlow/
├── database/
│   └── conexion.py
├── models/
│   ├── empleado.py
│   ├── proyecto.py
│   └── tarea.py
├── routes/
│   ├── empleados.py
│   ├── proyectos.py
│   ├── tareas.py
│   └── dashboard.py
├── main.py
├── .gitignore
└── README.md
```

## Módulos de la API

| Módulo | Endpoint |
|---|---|
| Empleados | /empleados |
| Proyectos | /proyectos |
| Tareas | /tareas |
| Dashboard | /dashboard |

## Documentación de la API

Con el servidor en ejecución:

http://127.0.0.1:8000/docs

## Seguridad e integridad

- Consultas SQL parametrizadas.
- Credenciales almacenadas en variables de entorno.
- Validación de campos obligatorios.
- Control de estados y prioridades.
- Verificación de registros relacionados.
- Protección de claves foráneas.

## Roadmap

- [x] Configuración del backend.
- [x] Integración con PostgreSQL.
- [x] CRUD de empleados.
- [x] CRUD de proyectos.
- [x] CRUD de tareas.
- [x] Dashboard de indicadores.
- [x] Arquitectura modular.
- [x] Validaciones básicas de datos.
- [x] Protección de registros relacionados.
- [ ] Manejo avanzado de excepciones.
- [ ] Pruebas automatizadas.
- [ ] Autenticación con JWT.
- [ ] Roles y permisos.
- [ ] Frontend con React.
- [ ] Despliegue en la nube.

## Estado del proyecto

En desarrollo activo.

Proyecto de portafolio profesional orientado al desarrollo de software y soluciones empresariales.
