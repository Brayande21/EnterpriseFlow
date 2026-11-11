
from fastapi import FastAPI

app = FastAPI()

empleados = [
    {"id": 1, "nombre": "Carlos", "puesto": "Programador"},
    {"id": 2, "nombre": "Ana", "puesto": "Diseñadora"},
    {"id": 3, "nombre": "Luis", "puesto": "Gerente"}
]

proyectos = [
    {"id": 1, "nombre": "Pagina Web", "estado": "En proceso"},
    {"id": 2, "nombre": "Sistema de Ventas", "estado": "Pendiente"}
]


@app.get("/")
def inicio():
    return {"mensaje": "Bienvenido a EnterpriseFlow"}


@app.get("/empleados")
def obtener_empleados():
    return empleados


@app.get("/proyectos")
def obtener_proyectos():
    return proyectos
