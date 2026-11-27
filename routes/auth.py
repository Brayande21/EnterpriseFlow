from core.dependencies import obtener_usuario_actual, requerir_admin
from fastapi import APIRouter, HTTPException, Depends
from psycopg.errors import UniqueViolation

from database.conexion import conectar
from models.usuario import (
    UsuarioRegistro,
    UsuarioRespuesta,
    UsuarioLogin,
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


@router.get("/me", response_model=UsuarioRespuesta)
def obtener_perfil(
    usuario: dict = Depends(obtener_usuario_actual)
):
    return usuario
