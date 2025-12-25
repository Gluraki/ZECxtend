from collections.abc import Generator
from typing import Annotated
from sqlalchemy.orm import Session
from fastapi import Depends
from app.database.session import engine
from app.crud.auth import get_current_user
from app.models.user import UserRole
from fastapi import HTTPException, status

def get_db() -> Generator[Session, None, None]:
    db = Session(bind=engine)
    try:
        yield db
    finally:
        db.close()

SessionDep = Annotated[Session, Depends(get_db)]
