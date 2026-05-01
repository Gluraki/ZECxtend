from fastapi import APIRouter, Form

router = APIRouter()

@router.post("/login")
def login(username: str = Form(...), password: str = Form(...)):
    pass

@router.post("/refresh")
def refresh(refresh_token: str = Form(...)):
    pass

@router.get("/internal/verify/admin")
def verify_admin():
    #current_user AdminUser
    pass

@router.get("/internal/verify/teamlead")
def verify_teamlead():
    #current_user: TeamLeadUser
    pass

@router.get("/internal/verify/viewer")
def verify_viewer():
    #current_user: ViewerUser
    pass
