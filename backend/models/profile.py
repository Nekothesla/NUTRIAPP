from sqlalchemy import Column, Integer, Float, String, ForeignKey
from sqlalchemy.orm import relationship

from database import Base


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    peso = Column(Float, nullable=True)          # kg
    talla = Column(Float, nullable=True)         # cm
    edad = Column(Integer, nullable=True)         # años
    sexo = Column(String(10), nullable=True)     # "masculino" | "femenino"
    masa_grasa = Column(Float, nullable=True)    # %
    masa_muscular = Column(Float, nullable=True) # %
    grasa_visceral = Column(Float, nullable=True)# nivel

    user = relationship("User", back_populates="profile")
