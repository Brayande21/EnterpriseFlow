
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


# Modelo de datos para registrar empleados
class Empleado(BaseModel):
    nombre: str
    puesto: str


# Datos de ejemplo
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


@app.post("/empleados", status_code=201)
def crear_empleado(empleado: Empleado):

    nuevo_empleado = {
        "id": max((e["id"] for e in empleados), default=0) + 1,
        "nombre": empleado.nombre,
        "puesto": empleado.puesto
    }

    empleados.append(nuevo_empleado)

    return {
        "mensaje": "Empleado registrado correctamente",
        "empleado": nuevo_empleado
    }


from fastapi import HTTPException

@app.get("/empleados/{empleado_id}")
def buscar_empleado(empleado_id: int):

    for empleado in empleados:
        if empleado["id"] == empleado_id:
            return empleado

    raise HTTPException(
        status_code=404,
        detail="Empleado no encontrado"
    )

@app.put("/empleados/{empleado_id}")
def actualizar_empleado(empleado_id: int, datos: Empleado):

    for empleado in empleados:
        if empleado["id"] == empleado_id:

            empleado["nombre"] = datos.nombre
            empleado["puesto"] = datos.puesto

            return {
                "mensaje": "Empleado actualizado correctamente",
                "empleado": empleado
            }

    raise HTTPException(
        status_code=404,
        detail="Empleado no encontrado"
    )

@app.delete("/empleados/{empleado_id}")
def eliminar_empleado(empleado_id: int):

    for empleado in empleados:
        if empleado["id"] == empleado_id:

            empleados.remove(empleado)

            return {
                "mensaje": "Empleado eliminado correctamente"
            }

    raise HTTPException(
        status_code=404,
        detail="Empleado no encontrado"
    )
