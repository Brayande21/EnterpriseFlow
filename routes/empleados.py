from fastapi import APIRouter, HTTPException, Depends
from database.conexion import conectar
from models.empleado import Empleado
from psycopg.errors import ForeignKeyViolation
from core.dependencies import requerir_admin

router = APIRouter(
    prefix="/empleados",
    tags=["Empleados"],
    responses={
        404: {"description": "Empleado no encontrado"},
        500: {"description": "Error interno de la base de datos"}
    }
)


# Consultar todos los empleados
@router.get("")
def obtener_empleados():
    with conectar() as conexion:
        with conexion.cursor() as cursor:
            cursor.execute(
                "SELECT id, nombre, puesto FROM empleados ORDER BY id"
            )
            filas = cursor.fetchall()

    return [
        {
            "id": fila[0],
            "nombre": fila[1],
            "puesto": fila[2]
        }
        for fila in filas
    ]


# Buscar un empleado por ID
@router.get("/{empleado_id}")
def buscar_empleado(empleado_id: int):
    with conectar() as conexion:
        with conexion.cursor() as cursor:
            cursor.execute(
                """
                SELECT id, nombre, puesto
                FROM empleados
                WHERE id = %s
                """,
                (empleado_id,)
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


# Crear empleado
@router.post("", status_code=201, dependencies=[Depends(requerir_admin)])
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


# Actualizar empleado
@router.put("/{empleado_id}", dependencies=[Depends(requerir_admin)])
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


# Eliminar empleado

@router.delete(
    "/{empleado_id}",
    dependencies=[Depends(requerir_admin)],
    responses={
        409: {
            "description": "El empleado tiene registros asociados"
        }
    }
)
def eliminar_empleado(empleado_id: int):
    try:
        with conectar() as conexion:
            with conexion.cursor() as cursor:

                cursor.execute("""
                    DELETE FROM empleados
                    WHERE id = %s
                    RETURNING id
                """, (empleado_id,))

                fila = cursor.fetchone()

                if fila is None:
                    raise HTTPException(
                        status_code=404,
                        detail="Empleado no encontrado"
                    )

    except ForeignKeyViolation:
        raise HTTPException(
            status_code=409,
            detail="No se puede eliminar el empleado porque tiene proyectos o tareas asignadas"
        )

    return {
        "mensaje": "Empleado eliminado correctamente"
    }
