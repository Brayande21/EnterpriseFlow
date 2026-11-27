
from fastapi import APIRouter
from database.conexion import conectar

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
    responses={
        500: {"description": "Error interno de la base de datos"}
    }
)

@router.get("")
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
