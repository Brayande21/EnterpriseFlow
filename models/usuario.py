
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Literal


class UsuarioRegistro(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    nombre: str = Field(min_length=3, max_length=100)
    email: EmailStr = Field(max_length=150)
    password: str = Field(
        min_length=8,
        max_length=128,
        strip_whitespace=False
    )


class UsuarioLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class UsuarioRespuesta(BaseModel):
    id: int
    nombre: str
    email: EmailStr
    rol: Literal["admin", "usuario"]
    activo: bool


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
