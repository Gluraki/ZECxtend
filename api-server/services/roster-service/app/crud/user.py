from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate

from shared.crud_base import CRUDBase


class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    pass

crud_user = CRUDUser(User)
