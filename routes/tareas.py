from fastapi import APIRouter, HTTPException, Depends
from database.conexion import conectar
from models.tarea import Tarea
from core.dependencies import requerir_admin

router = APIRouter(
    prefix="/tareas",
    tags=["Tareas"],
    responses={
        404: {"description": "Tarea, proyecto o empleado no encontrado"},
        500: {"description": "Error interno de la base de datos"}
    }
)


# Consultar tareas

@router.get("")
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
                    t.fecha_entrega,
                    t.proyecto_id,
                    t.empleado_id
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
            "fecha_entrega": fila[7],
            "proyecto_id": fila[8],
            "empleado_id": fila[9]
        })

    return tareas_db


# Crear tarea

@router.post(
    "",
    status_code=201,
    dependencies=[Depends(requerir_admin)]
)
def crear_tarea(tarea: Tarea):
    with conectar() as conexion:
        with conexion.cursor() as cursor:

            # Verificar que el proyecto existe
            cursor.execute(
                "SELECT id FROM proyectos WHERE id = %s",
                (tarea.proyecto_id,)
            )

            if cursor.fetchone() is None:
                raise HTTPException(
                    status_code=404,
                    detail="El proyecto no existe"
                )

            # Verificar que el empleado existe
            cursor.execute(
                "SELECT id FROM empleados WHERE id = %s",
                (tarea.empleado_id,)
            )

            if cursor.fetchone() is None:
                raise HTTPException(
                    status_code=404,
                    detail="El empleado no existe"
                )

            # Crear la tarea
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


# Actualizar tarea

@router.put(
    "/{tarea_id}",
    dependencies=[Depends(requerir_admin)]
)
def actualizar_tarea(tarea_id: int, tarea: Tarea):
    with conectar() as conexion:
        with conexion.cursor() as cursor:

            # Verificar que la tarea existe
            cursor.execute(
                "SELECT id FROM tareas WHERE id = %s",
                (tarea_id,)
            )

            if cursor.fetchone() is None:
                raise HTTPException(
                    status_code=404,
                    detail="Tarea no encontrada"
                )

            # Verificar que el proyecto existe
            cursor.execute(
                "SELECT id FROM proyectos WHERE id = %s",
                (tarea.proyecto_id,)
            )

            if cursor.fetchone() is None:
                raise HTTPException(
                    status_code=404,
                    detail="El proyecto no existe"
                )

            # Verificar que el empleado existe
            cursor.execute(
                "SELECT id FROM empleados WHERE id = %s",
                (tarea.empleado_id,)
            )

            if cursor.fetchone() is None:
                raise HTTPException(
                    status_code=404,
                    detail="El empleado no existe"
                )

            # Actualizar tarea
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


# Eliminar tarea

@router.delete(
    "/{tarea_id}",
    dependencies=[Depends(requerir_admin)]
)
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