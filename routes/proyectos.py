
from fastapi import APIRouter, HTTPException, Depends
from database.conexion import conectar
from models.proyecto import Proyecto
from psycopg.errors import ForeignKeyViolation
from core.dependencies import requerir_admin

router = APIRouter(
    prefix="/proyectos",
    tags=["Proyectos"],
    responses={
        404: {"description": "Proyecto o empleado no encontrado"},
        500: {"description": "Error interno de la base de datos"}
    }
)


# Consultar proyectos
@router.get("")
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


# Crear proyecto

@router.post("", status_code=201, dependencies=[Depends(requerir_admin)])
def crear_proyecto(proyecto: Proyecto):
    with conectar() as conexion:
        with conexion.cursor() as cursor:

            # Verificar que el responsable existe
            cursor.execute(
                "SELECT id FROM empleados WHERE id = %s",
                (proyecto.responsable_id,)
            )

            if cursor.fetchone() is None:
                raise HTTPException(
                    status_code=404,
                    detail="El empleado responsable no existe"
                )

            # Crear el proyecto
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



# Actualizar proyecto

@router.put("/{proyecto_id}", dependencies=[Depends(requerir_admin)])
def actualizar_proyecto(proyecto_id: int, proyecto: Proyecto):
    with conectar() as conexion:
        with conexion.cursor() as cursor:

            # Verificar que el proyecto existe
            cursor.execute(
                "SELECT id FROM proyectos WHERE id = %s",
                (proyecto_id,)
            )

            if cursor.fetchone() is None:
                raise HTTPException(
                    status_code=404,
                    detail="Proyecto no encontrado"
                )

            # Verificar que el responsable existe
            cursor.execute(
                "SELECT id FROM empleados WHERE id = %s",
                (proyecto.responsable_id,)
            )

            if cursor.fetchone() is None:
                raise HTTPException(
                    status_code=404,
                    detail="El empleado responsable no existe"
                )

            # Actualizar proyecto
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

# Eliminar proyecto

@router.delete(
    "/{proyecto_id}",
    dependencies=[Depends(requerir_admin)],
    responses={409: {"description": "El proyecto tiene tareas asociadas"}
    }
)
def eliminar_proyecto(proyecto_id: int):
    try:
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

    except ForeignKeyViolation:
        raise HTTPException(
            status_code=409,
            detail="No se puede eliminar el proyecto porque tiene tareas asociadas"
        )

    return {
        "mensaje": "Proyecto eliminado correctamente"
    }
