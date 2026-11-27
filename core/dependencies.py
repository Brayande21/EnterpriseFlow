
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from core.security import verificar_token
from database.conexion import conectar


bearer_scheme = HTTPBearer(auto_error=False)


def obtener_usuario_actual(
    credenciales: HTTPAuthorizationCredentials = Depends(bearer_scheme)
):
    if credenciales is None:
        raise HTTPException(
            status_code=401,
            detail="Debes iniciar sesión",
            headers={"WWW-Authenticate": "Bearer"}
        )

    token = credenciales.credentials
    usuario_id = verificar_token(token)

    if usuario_id is None:
        raise HTTPException(
            status_code=401,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"}
        )

    with conectar() as conexion:
        with conexion.cursor() as cursor:

            cursor.execute("""
                SELECT id, nombre, email, rol, activo
                FROM usuarios
                WHERE id = %s
            """, (usuario_id,))

            fila = cursor.fetchone()

    if fila is None:
        raise HTTPException(
            status_code=401,
            detail="Usuario no encontrado",
            headers={"WWW-Authenticate": "Bearer"}
        )

    if not fila[4]:
        raise HTTPException(
            status_code=403,
            detail="Usuario desactivado"
        )

    return {
        "id": fila[0],
        "nombre": fila[1],
        "email": fila[2],
        "rol": fila[3],
        "activo": fila[4]
    }


def requerir_admin(
    usuario: dict = Depends(obtener_usuario_actual)
):
    if usuario["rol"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos de administrador"
        )

    return usuario
