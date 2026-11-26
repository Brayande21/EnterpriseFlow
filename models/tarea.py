
from pydantic import BaseModel, Field, ConfigDict
from datetime import date
from typing import Literal


class Tarea(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    titulo: str = Field(min_length=3, max_length=150)
    descripcion: str = Field(min_length=5, max_length=1000)

    estado: Literal[
        "Pendiente",
        "En progreso",
        "Completada",
        "Cancelada"
    ] = "Pendiente"

    prioridad: Literal[
        "Baja",
        "Media",
        "Alta",
        "Urgente"
    ] = "Media"

    proyecto_id: int = Field(gt=0)
    empleado_id: int = Field(gt=0)
    fecha_entrega: date
