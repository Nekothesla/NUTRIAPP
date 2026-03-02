from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from schemas.calculator import CalculatorRequest, CalculatorResponse, MacroResult
from core.security import decode_access_token

router = APIRouter(prefix="/calculator", tags=["calculator"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

MACRO_MODES = {
    "mantenimiento": {"ch": 0.50, "pro": 0.25, "fat": 0.25},
    "volumen":        {"ch": 0.55, "pro": 0.25, "fat": 0.20},
    "definicion":     {"ch": 0.35, "pro": 0.40, "fat": 0.25},
}


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    username = decode_access_token(token)
    if not username:
        raise HTTPException(status_code=401, detail="Token inválido o expirado.")
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
    return user


def harris_benedict(peso: float, talla: float, edad: int, sexo: str) -> float:
    if sexo == "masculino":
        return 88.362 + (13.397 * peso) + (4.799 * talla) - (5.677 * edad)
    else:
        return 447.593 + (9.247 * peso) + (3.098 * talla) - (4.330 * edad)


@router.post("/calculate", response_model=CalculatorResponse)
def calculate(
    payload: CalculatorRequest,
    _: User = Depends(get_current_user),
):
    geb = harris_benedict(payload.peso, payload.talla, payload.edad, payload.sexo)
    get_val = round(geb * 1.55, 2)
    geb = round(geb, 2)

    mode = MACRO_MODES.get(payload.modo)
    if not mode:
        raise HTTPException(status_code=400, detail="Modo no válido.")

    ch_kcal  = get_val * mode["ch"]
    pro_kcal = get_val * mode["pro"]
    fat_kcal = get_val * mode["fat"]

    macros = MacroResult(
        carbohidratos_g=round(ch_kcal / 4, 1),
        proteinas_g=round(pro_kcal / 4, 1),
        grasas_g=round(fat_kcal / 9, 1),
        carbohidratos_pct=mode["ch"] * 100,
        proteinas_pct=mode["pro"] * 100,
        grasas_pct=mode["fat"] * 100,
    )

    return CalculatorResponse(geb=geb, get=get_val, macros=macros, modo=payload.modo)
