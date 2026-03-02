from pydantic import BaseModel
from typing import Literal


class MacroResult(BaseModel):
    carbohidratos_g: float
    proteinas_g: float
    grasas_g: float
    carbohidratos_pct: float
    proteinas_pct: float
    grasas_pct: float


class CalculatorRequest(BaseModel):
    peso: float        # kg
    talla: float       # cm
    edad: int          # years
    sexo: Literal["masculino", "femenino"]
    modo: Literal["mantenimiento", "volumen", "definicion"]


class CalculatorResponse(BaseModel):
    geb: float
    get: float
    macros: MacroResult
    modo: str
