from pydantic import BaseModel, Field, EmailStr
from typing import Literal


# Registro de usuarios

class UsuarioRegistro(BaseModel):
    nombre: str = Field(min_length=3, max_length=100)
    email: EmailStr = Field(max_length=150)
    password: str = Field(min_length=8, max_length=128)


# Inicio de sesión

class UsuarioLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


# Información del usuario

class UsuarioRespuesta(BaseModel):
    id: int
    nombre: str
    email: EmailStr
    rol: Literal["admin", "usuario"]
    activo: bool


# Token de autenticación

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# Actualizar rol

class UsuarioRol(BaseModel):
    rol: Literal["admin", "usuario"]


# Actualizar estado de la cuenta

class UsuarioEstado(BaseModel):
    activo: bool


# Cambiar contraseña

class CambiarPassword(BaseModel):
    password_actual: str = Field(
        min_length=1,
        max_length=128
    )

    password_nueva: str = Field(
        min_length=8,
        max_length=128
    )