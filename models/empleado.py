from pydantic import BaseModel, Field, ConfigDict


class Empleado(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    nombre: str = Field(min_length=2, max_length=100)
    puesto: str = Field(min_length=2, max_length=100)