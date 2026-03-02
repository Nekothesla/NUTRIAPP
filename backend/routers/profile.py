from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from models.profile import UserProfile
from schemas.profile import ProfileCreate, ProfileResponse
from core.security import decode_access_token

router = APIRouter(prefix="/profile", tags=["profile"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    username = decode_access_token(token)
    if not username:
        raise HTTPException(status_code=401, detail="Token inválido o expirado.")
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
    return user


@router.get("/", response_model=ProfileResponse)
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Perfil no encontrado.")
    return profile


@router.post("/", response_model=ProfileResponse, status_code=201)
def create_profile(
    payload: ProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="El perfil ya existe. Usa PUT para actualizarlo.")
    profile = UserProfile(user_id=current_user.id, **payload.model_dump())
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@router.put("/", response_model=ProfileResponse)
def update_profile(
    payload: ProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        # Create on first PUT
        profile = UserProfile(user_id=current_user.id, **payload.model_dump())
        db.add(profile)
    else:
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return profile
