from typing import Optional
from pydantic import BaseModel


class ProfileCreate(BaseModel):
    peso: Optional[float] = None
    talla: Optional[float] = None
    edad: Optional[int] = None
    sexo: Optional[str] = None
    masa_grasa: Optional[float] = None
    masa_muscular: Optional[float] = None
    grasa_visceral: Optional[float] = None


class ProfileResponse(ProfileCreate):
    id: int
    user_id: int

    model_config = {"from_attributes": True}
