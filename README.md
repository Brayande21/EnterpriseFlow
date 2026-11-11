# EnterpriseFlow

EnterpriseFlow es un proyecto personal en desarrollo que tiene como objetivo crear una plataforma web para gestionar empleados, proyectos y tareas dentro de una empresa.

## Tecnologías

- Python
- FastAPI
- Uvicorn

## Funcionalidades actuales

- API REST básica con FastAPI.
- Consulta de empleados.
- Consulta de proyectos.
- Documentación interactiva de la API.

Actualmente los datos se manejan mediante listas en Python. Más adelante se incorporará una base de datos.

## Próximas funcionalidades

- Registro de empleados y proyectos.
- Base de datos PostgreSQL.
- Autenticación de usuarios.
- Gestión de tareas.
- Interfaz web con React.

## Ejecución local

Con las dependencias instaladas en un entorno virtual, ejecutar:

```bash
python -m uvicorn main:app --reload
```

La documentación interactiva estará disponible en:

`http://127.0.0.1:8000/docs`

## Estado

Proyecto en desarrollo.