import os

from dotenv import load_dotenv
from fastapi import FastAPI, Depends
from psycopg import Error
from fastapi.middleware.cors import CORSMiddleware

from routes.empleados import router as empleados_router
from routes.proyectos import router as proyectos_router
from routes.tareas import router as tareas_router
from routes.dashboard import router as dashboard_router
from routes.auth import router as auth_router

from core.exceptions import database_exception_handler
from core.dependencies import obtener_usuario_actual

load_dotenv()

app = FastAPI(
    title="EnterpriseFlow API",
    description="Sistema de gestión empresarial",
    version="1.0.0"
)

# Configuración de CORS

origenes_permitidos = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

frontend_url = os.getenv("FRONTEND_URL", "").strip().rstrip("/")

if frontend_url:
    origenes_permitidos.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origenes_permitidos,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"]
)

# Manejo centralizado de excepciones

app.add_exception_handler(Error, database_exception_handler)

# Rutas protegidas

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

# Autenticación

app.include_router(auth_router)


@app.get("/", tags=["Inicio"])
def inicio():
    return {"mensaje": "Bienvenido a EnterpriseFlow"}


# Verificación del estado del servidor

@app.get("/health", tags=["Sistema"])
def health():
    return {
        "status": "ok",
        "service": "EnterpriseFlow API",
        "version": "1.0.0"
    }