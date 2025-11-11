from fastapi import APIRouter, HTTPException, Depends
import requests
from app.models.user import User
#from app.core.auth import get_current_user

#Komplet WIP nix geht hier
#sammlung an zeug das es gehen würde

KC_ADMIN_URL = "http://localhost:8090/admin/realms/myapp/users"
KC_ADMIN_TOKEN = "YOUR_ADMIN_ACCESS_TOKEN" 

router = APIRouter()


@router.post("/users")
def create_user(username: str, email: str, password: str):
    headers = {
        "Authorization": f"Bearer {KC_ADMIN_TOKEN}",
        "Content-Type": "application/json"
    }
    data = {
        "username": username,
        "email": email,
        "enabled": True,
        "credentials": [
            {
                "type": "password",
                "value": password,
                "temporary": False
            }
        ]
    }
    response = requests.post(KC_ADMIN_URL, json=data, headers=headers)
    
    if response.status_code == 201:
        return {"message": f"User {username} created successfully"}
    elif response.status_code == 409:
        raise HTTPException(status_code=409, detail="User already exists")
    else:
        raise HTTPException(status_code=response.status_code, detail=response.text)
    