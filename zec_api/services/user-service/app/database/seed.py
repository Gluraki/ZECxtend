from app.database.dependency import SessionDep
from app.schemas.user import CreateUserKC
from app.crud.user import create_user
from app.models.user import User

def seed_user(db: SessionDep):
    predefined_user = [
        {"username": "admin", "password": "changeme"},
    ]
    for user_data in predefined_user:
        exists = db.query(User).filter(User.username == user_data["username"]).first()
        
        if not exists:
            create_user(db, CreateUserKC(**user_data))