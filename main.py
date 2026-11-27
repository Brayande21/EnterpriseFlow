
from fastapi import FastAPI, Depends
from psycopg import Error

from routes.empleados import router as empleados_router
from routes.proyectos import router as proyectos_router
from routes.tareas import router as tareas_router
from routes.dashboard import router as dashboard_router
from routes.auth import router as auth_router

from core.exceptions import database_exception_handler
from core.dependencies import obtener_usuario_actual

app = FastAPI(
    title="EnterpriseFlow API",
    description="Sistema de gestión empresarial",
    version="1.0.0"
)

app.add_exception_handler(Error, database_exception_handler)

app.include_router(
    empleados_router,
    dependencies=[Depends(obtener_usuario_actual)]
)

app.include_router(
    proyectos_router,
    dependencies=[Depends(obtener_usuario_actual)]
)

app.include_router(
    tareas_router,
    dependencies=[Depends(obtener_usuario_actual)]
)

app.include_router(
    dashboard_router,
    dependencies=[Depends(obtener_usuario_actual)]
)

app.include_router(auth_router)


@app.get("/", tags=["Inicio"])
def inicio():
    return {"mensaje": "Bienvenido a EnterpriseFlow"}
