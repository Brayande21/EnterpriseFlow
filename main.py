
from fastapi import FastAPI
from routes.empleados import router as empleados_router
from routes.proyectos import router as proyectos_router
from routes.tareas import router as tareas_router
from routes.dashboard import router as dashboard_router

app = FastAPI(
    title="EnterpriseFlow API",
    description="Sistema de gestión empresarial",
    version="1.0.0"
)

app.include_router(empleados_router)
app.include_router(proyectos_router)
app.include_router(tareas_router)
app.include_router(dashboard_router)


@app.get("/")
def inicio():
    return {"mensaje": "Bienvenido a EnterpriseFlow"}
