from core.dependencies import obtener_usuario_actual, requerir_admin
from fastapi import APIRouter, HTTPException, Depends
from psycopg.errors import UniqueViolation

from database.conexion import conectar
from models.usuario import (
    UsuarioRegistro,
    UsuarioRespuesta,
    UsuarioLogin,
    UsuarioRol,
    UsuarioEstado,
    CambiarPassword,
    Token
)
from core.security import (
    generar_hash,
    verificar_password,
    crear_token
)


router = APIRouter(
    prefix="/auth",
    tags=["Autenticación"]
)


# Registrar usuario

@router.post(
    "/registro",
    status_code=201,
    response_model=UsuarioRespuesta,
    dependencies=[Depends(requerir_admin)]
)
def registrar_usuario(usuario: UsuarioRegistro):

    email = usuario.email.lower()
    password_seguro = generar_hash(usuario.password)

    try:
        with conectar() as conexion:
            with conexion.cursor() as cursor:

                cursor.execute("""
                    INSERT INTO usuarios (
                        nombre,
                        email,
                        password_hash
                    )
                    VALUES (%s, %s, %s)
                    RETURNING id, nombre, email, rol, activo
                """, (
                    usuario.nombre,
                    email,
                    password_seguro
                ))

                fila = cursor.fetchone()

    except UniqueViolation:
        raise HTTPException(
            status_code=409,
            detail="El correo electrónico ya está registrado"
        )

    return {
        "id": fila[0],
        "nombre": fila[1],
        "email": fila[2],
        "rol": fila[3],
        "activo": fila[4]
    }


# Iniciar sesión

@router.post("/login", response_model=Token)
def iniciar_sesion(usuario: UsuarioLogin):

    email = usuario.email.lower()

    with conectar() as conexion:
        with conexion.cursor() as cursor:

            cursor.execute("""
                SELECT id, password_hash, activo
                FROM usuarios
                WHERE email = %s
            """, (email,))

            fila = cursor.fetchone()

    if fila is None:
        raise HTTPException(
            status_code=401,
            detail="Credenciales incorrectas"
        )

    if not verificar_password(usuario.password, fila[1]):
        raise HTTPException(
            status_code=401,
            detail="Credenciales incorrectas"
        )

    if not fila[2]:
        raise HTTPException(
            status_code=403,
            detail="Usuario desactivado"
        )

    token = crear_token(fila[0])

    return {
        "access_token": token,
        "token_type": "bearer"
    }


# Consultar perfil personal

@router.get("/me", response_model=UsuarioRespuesta)
def obtener_perfil(
    usuario: dict = Depends(obtener_usuario_actual)
):
    return usuario


# Listar usuarios

@router.get(
    "/usuarios",
    response_model=list[UsuarioRespuesta],
    dependencies=[Depends(requerir_admin)]
)
def obtener_usuarios():

    with conectar() as conexion:
        with conexion.cursor() as cursor:

            cursor.execute("""
                SELECT id, nombre, email, rol, activo
                FROM usuarios
                ORDER BY id
            """)

            filas = cursor.fetchall()

    usuarios = []

    for fila in filas:
        usuarios.append({
            "id": fila[0],
            "nombre": fila[1],
            "email": fila[2],
            "rol": fila[3],
            "activo": fila[4]
        })

    return usuarios


# Cambiar rol de usuario

@router.put("/usuarios/{usuario_id}/rol")
def cambiar_rol(
    usuario_id: int,
    datos: UsuarioRol,
    administrador: dict = Depends(requerir_admin)
):

    if usuario_id == administrador["id"]:
        raise HTTPException(
            status_code=403,
            detail="No puedes modificar tu propio rol"
        )

    with conectar() as conexion:
        with conexion.cursor() as cursor:

            cursor.execute("""
                UPDATE usuarios
                SET rol = %s
                WHERE id = %s
                RETURNING id
            """, (
                datos.rol,
                usuario_id
            ))

            fila = cursor.fetchone()

    if fila is None:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )

    return {
        "mensaje": "Rol actualizado correctamente"
    }


# Activar o desactivar usuario

@router.put("/usuarios/{usuario_id}/estado")
def cambiar_estado(
    usuario_id: int,
    datos: UsuarioEstado,
    administrador: dict = Depends(requerir_admin)
):

    if usuario_id == administrador["id"] and not datos.activo:
        raise HTTPException(
            status_code=403,
            detail="No puedes desactivar tu propia cuenta"
        )

    with conectar() as conexion:
        with conexion.cursor() as cursor:

            cursor.execute("""
                UPDATE usuarios
                SET activo = %s
                WHERE id = %s
                RETURNING id
            """, (
                datos.activo,
                usuario_id
            ))

            fila = cursor.fetchone()

    if fila is None:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )

    return {
        "mensaje": (
            "Usuario activado correctamente"
            if datos.activo
            else "Usuario desactivado correctamente"
        )
    }


# Cambiar contraseña personal

@router.put("/password")
def cambiar_password(
    datos: CambiarPassword,
    usuario: dict = Depends(obtener_usuario_actual)
):

    with conectar() as conexion:
        with conexion.cursor() as cursor:

            cursor.execute("""
                SELECT password_hash
                FROM usuarios
                WHERE id = %s
                FOR UPDATE
            """, (usuario["id"],))

            fila = cursor.fetchone()

            if fila is None:
                raise HTTPException(
                    status_code=404,
                    detail="Usuario no encontrado"
                )

            if not verificar_password(
                datos.password_actual,
                fila[0]
            ):
                raise HTTPException(
                    status_code=400,
                    detail="La contraseña actual es incorrecta"
                )

            if datos.password_actual == datos.password_nueva:
                raise HTTPException(
                    status_code=400,
                    detail="La nueva contraseña debe ser diferente"
                )

            password_seguro = generar_hash(
                datos.password_nueva
            )

            cursor.execute("""
                UPDATE usuarios
                SET password_hash = %s
                WHERE id = %s
            """, (
                password_seguro,
                usuario["id"]
            ))

    return {
        "mensaje": "Contraseña actualizada correctamente"
    }