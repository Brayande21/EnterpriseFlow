
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from database.conexion import conectar

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
    with conectar() as conexion:
        with conexion.cursor() as cursor:
            cursor.execute(
                "SELECT id, nombre, puesto FROM empleados ORDER BY id"
            )

            filas = cursor.fetchall()

    empleados_db = []

    for fila in filas:
        empleados_db.append({
            "id": fila[0],
            "nombre": fila[1],
            "puesto": fila[2]
        })

    return empleados_db



@app.get("/proyectos")
def obtener_proyectos():
    return proyectos



@app.post("/empleados", status_code=201)
def crear_empleado(empleado: Empleado):
    with conectar() as conexion:
        with conexion.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO empleados (nombre, puesto)
                VALUES (%s, %s)
                RETURNING id, nombre, puesto
                """,
                (empleado.nombre, empleado.puesto)
            )

            fila = cursor.fetchone()

    return {
        "id": fila[0],
        "nombre": fila[1],
        "puesto": fila[2]
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
def actualizar_empleado(empleado_id: int, empleado: Empleado):
    with conectar() as conexion:
        with conexion.cursor() as cursor:
            cursor.execute(
                """
                UPDATE empleados
                SET nombre = %s, puesto = %s
                WHERE id = %s
                RETURNING id, nombre, puesto
                """,
                (empleado.nombre, empleado.puesto, empleado_id)
            )

            fila = cursor.fetchone()

    if fila is None:
        raise HTTPException(
            status_code=404,
            detail="Empleado no encontrado"
        )

    return {
        "id": fila[0],
        "nombre": fila[1],
        "puesto": fila[2]
    }



@app.delete("/empleados/{empleado_id}")
def eliminar_empleado(empleado_id: int):
    with conectar() as conexion:
        with conexion.cursor() as cursor:
            cursor.execute(
                """
                DELETE FROM empleados
                WHERE id = %s
                RETURNING id
                """,
                (empleado_id,)
            )

            fila = cursor.fetchone()

    if fila is None:
        raise HTTPException(
            status_code=404,
            detail="Empleado no encontrado"
        )

    return {"mensaje": "Empleado eliminado correctamente"}
