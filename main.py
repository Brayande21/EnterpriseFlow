
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from database.conexion import conectar
from datetime import date

app = FastAPI()


# Modelo de datos para registrar empleados
class Empleado(BaseModel):
    nombre: str
    puesto: str

class Proyecto(BaseModel):
    nombre: str
    descripcion: str
    estado: str = "Pendiente"
    responsable_id: int
    fecha_entrega: date

class Tarea(BaseModel):
    titulo: str
    descripcion: str
    estado: str = "Pendiente"
    prioridad: str = "Media"
    proyecto_id: int
    empleado_id: int
    fecha_entrega: date


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
    with conectar() as conexion:
        with conexion.cursor() as cursor:
            cursor.execute("""
                SELECT
                    p.id,
                    p.nombre,
                    p.descripcion,
                    p.estado,
                    e.nombre AS responsable,
                    p.fecha_inicio,
                    p.fecha_entrega
                FROM proyectos p
                LEFT JOIN empleados e
                    ON p.responsable_id = e.id
                ORDER BY p.id
            """)

            filas = cursor.fetchall()

    proyectos_db = []

    for fila in filas:
        proyectos_db.append({
            "id": fila[0],
            "nombre": fila[1],
            "descripcion": fila[2],
            "estado": fila[3],
            "responsable": fila[4],
            "fecha_inicio": fila[5],
            "fecha_entrega": fila[6]
        })

    return proyectos_db


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


@app.post("/proyectos", status_code=201)
def crear_proyecto(proyecto: Proyecto):
    with conectar() as conexion:
        with conexion.cursor() as cursor:
            cursor.execute("""
                INSERT INTO proyectos (
                    nombre,
                    descripcion,
                    estado,
                    responsable_id,
                    fecha_entrega
                )
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id
            """, (
                proyecto.nombre,
                proyecto.descripcion,
                proyecto.estado,
                proyecto.responsable_id,
                proyecto.fecha_entrega
            ))

            fila = cursor.fetchone()

    return {
        "id": fila[0],
        "mensaje": "Proyecto creado correctamente"
    }


@app.put("/proyectos/{proyecto_id}")
def actualizar_proyecto(proyecto_id: int, proyecto: Proyecto):
    with conectar() as conexion:
        with conexion.cursor() as cursor:
            cursor.execute("""
                UPDATE proyectos
                SET nombre = %s,
                    descripcion = %s,
                    estado = %s,
                    responsable_id = %s,
                    fecha_entrega = %s
                WHERE id = %s
                RETURNING id
            """, (
                proyecto.nombre,
                proyecto.descripcion,
                proyecto.estado,
                proyecto.responsable_id,
                proyecto.fecha_entrega,
                proyecto_id
            ))

            fila = cursor.fetchone()

    if fila is None:
        raise HTTPException(
            status_code=404,
            detail="Proyecto no encontrado"
        )

    return {
        "id": fila[0],
        "mensaje": "Proyecto actualizado correctamente"
    }


@app.delete("/proyectos/{proyecto_id}")
def eliminar_proyecto(proyecto_id: int):
    with conectar() as conexion:
        with conexion.cursor() as cursor:
            cursor.execute("""
                DELETE FROM proyectos
                WHERE id = %s
                RETURNING id
            """, (proyecto_id,))

            fila = cursor.fetchone()

    if fila is None:
        raise HTTPException(
            status_code=404,
            detail="Proyecto no encontrado"
        )

    return {
        "mensaje": "Proyecto eliminado correctamente"
    }


@app.get("/tareas")
def obtener_tareas():
    with conectar() as conexion:
        with conexion.cursor() as cursor:
            cursor.execute("""
                SELECT
                    t.id,
                    t.titulo,
                    t.descripcion,
                    t.estado,
                    t.prioridad,
                    p.nombre AS proyecto,
                    e.nombre AS empleado,
                    t.fecha_entrega
                FROM tareas t
                JOIN proyectos p
                    ON t.proyecto_id = p.id
                LEFT JOIN empleados e
                    ON t.empleado_id = e.id
                ORDER BY t.id
            """)

            filas = cursor.fetchall()

    tareas_db = []

    for fila in filas:
        tareas_db.append({
            "id": fila[0],
            "titulo": fila[1],
            "descripcion": fila[2],
            "estado": fila[3],
            "prioridad": fila[4],
            "proyecto": fila[5],
            "empleado": fila[6],
            "fecha_entrega": fila[7]
        })

    return tareas_db


@app.post("/tareas", status_code=201)
def crear_tarea(tarea: Tarea):
    with conectar() as conexion:
        with conexion.cursor() as cursor:
            cursor.execute("""
                INSERT INTO tareas (
                    titulo,
                    descripcion,
                    estado,
                    prioridad,
                    proyecto_id,
                    empleado_id,
                    fecha_entrega
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (
                tarea.titulo,
                tarea.descripcion,
                tarea.estado,
                tarea.prioridad,
                tarea.proyecto_id,
                tarea.empleado_id,
                tarea.fecha_entrega
            ))

            fila = cursor.fetchone()

    return {
        "id": fila[0],
        "mensaje": "Tarea creada correctamente"
    }


@app.put("/tareas/{tarea_id}")
def actualizar_tarea(tarea_id: int, tarea: Tarea):
    with conectar() as conexion:
        with conexion.cursor() as cursor:
            cursor.execute("""
                UPDATE tareas
                SET titulo = %s,
                    descripcion = %s,
                    estado = %s,
                    prioridad = %s,
                    proyecto_id = %s,
                    empleado_id = %s,
                    fecha_entrega = %s
                WHERE id = %s
                RETURNING id
            """, (
                tarea.titulo,
                tarea.descripcion,
                tarea.estado,
                tarea.prioridad,
                tarea.proyecto_id,
                tarea.empleado_id,
                tarea.fecha_entrega,
                tarea_id
            ))

            fila = cursor.fetchone()

    if fila is None:
        raise HTTPException(
            status_code=404,
            detail="Tarea no encontrada"
        )

    return {
        "id": fila[0],
        "mensaje": "Tarea actualizada correctamente"
    }


@app.delete("/tareas/{tarea_id}")
def eliminar_tarea(tarea_id: int):
    with conectar() as conexion:
        with conexion.cursor() as cursor:
            cursor.execute("""
                DELETE FROM tareas
                WHERE id = %s
                RETURNING id
            """, (tarea_id,))

            fila = cursor.fetchone()

    if fila is None:
        raise HTTPException(
            status_code=404,
            detail="Tarea no encontrada"
        )

    return {
        "mensaje": "Tarea eliminada correctamente"
    }


@app.get("/dashboard")
def obtener_dashboard():
    with conectar() as conexion:
        with conexion.cursor() as cursor:

            cursor.execute("SELECT COUNT(*) FROM empleados")
            total_empleados = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM proyectos")
            total_proyectos = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM tareas")
            total_tareas = cursor.fetchone()[0]

            cursor.execute("""
                SELECT COUNT(*) FROM tareas
                WHERE estado = 'Pendiente'
            """)
            tareas_pendientes = cursor.fetchone()[0]

            cursor.execute("""
                SELECT COUNT(*) FROM tareas
                WHERE estado = 'Completada'
            """)
            tareas_completadas = cursor.fetchone()[0]

    porcentaje = 0

    if total_tareas > 0:
        porcentaje = round(
            tareas_completadas / total_tareas * 100, 2
        )

    return {
        "total_empleados": total_empleados,
        "total_proyectos": total_proyectos,
        "total_tareas": total_tareas,
        "tareas_pendientes": tareas_pendientes,
        "tareas_completadas": tareas_completadas,
        "porcentaje_avance": porcentaje
    }
