import requests
from app.core.config import settings
from app.schemas.user import CreateUserKC

#temporary constants for Keycloak admin client
KC_TOKEN_URL = settings.KEYCLOAK_TOKEN_URL
KC_USER_URL = settings.KEYCLOAK_USER_URL
KC_CLIENT_ID = "admin-cli"
KC_CLIENT_SECRET = "iLNBNaJwfV2paV8jCtneGF2tM3IKH4Fj"

def get_token():
    response = requests.post(
        KC_TOKEN_URL,
        data={
            "client_id": KC_CLIENT_ID,
            "client_secret": KC_CLIENT_SECRET,
            "grant_type": "client_credentials",
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
    token_data = response.json()
    access_token = token_data.get("access_token")
    return access_token

def create_user(request: CreateUserKC):
    acces_token = get_token()
    bearer_token = f"Bearer {acces_token}"

    user_data = {
        "username": request.username,
        "email": request.email,
        #needed due to a bug in Keycloak
        "firstName": "placeholder",
        "lastName": "placeholder",
        "emailVerified": request.emailVerified,
        "enabled": request.enabled,
    }

    if request.credentials:
        user_data["credentials"] = [cred.dict() for cred in request.credentials]

    headers = {
        "Authorization": bearer_token,
        "Content-Type": "application/json",
    }

    response = requests.post(KC_USER_URL, json=user_data, headers=headers)
    return {"status": response.status_code}