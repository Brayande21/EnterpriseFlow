
from pydantic import BaseModel, Field, ConfigDict
from datetime import date
from typing import Literal


class Proyecto(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    nombre: str = Field(min_length=3, max_length=150)
    descripcion: str = Field(min_length=5, max_length=1000)
    estado: Literal[
        "Pendiente",
        "En progreso",
        "Completado",
        "Cancelado"
    ] = "Pendiente"
    responsable_id: int = Field(gt=0)
    fecha_entrega: date
