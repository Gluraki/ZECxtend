from fastapi import APIRouter

router = APIRouter()

@router.post("/")
async def create_user():
    pass

@router.put("/{user_id}")
async def update_user():
    pass

@router.delete("/{user_id}")
async def delete_user():
    pass

@router.get("/{user_id}")
async def get_user():
    pass

@router.get("/")
async def get_all_users():
    pass

@router.post("/{user_id}/roles")
async def assign_client_roles_to_user():
    pass

@router.delete("/{user_id}/roles")
async def remove_roles_from_user():
    pass
