from typing import Annotated

from fastapi import Depends

from shared.exceptions import NotEnoughPermissionsError
from shared.user_role import UserRole


def get_current_user():
    #payload: dict = Depends(decode_keycloak_token)
    #roles = extract_roles_from_payload(payload)
    payload: dict = {}
    roles = []
    if not roles:
        raise NotEnoughPermissionsError("User does not have any roles assigned")
    return {
        "sub": payload.get("sub"),
        "email": payload.get("email"),
        "username": payload.get("preferred_username"),
        "roles": roles,
        "token_payload": payload
    }
ROLE_HIERARCHY = {
    UserRole.VIEWER: {
        UserRole.VIEWER,
        UserRole.TEAM_LEAD,
        UserRole.ADMIN,
    },
    UserRole.TEAM_LEAD: {
        UserRole.TEAM_LEAD,
        UserRole.ADMIN,
    },
    UserRole.ADMIN: {
        UserRole.ADMIN,
    },
}

def require_role(required_role: UserRole):
    def role_checker(user: dict = Depends(get_current_user)):
        user_roles = {UserRole(role) for role in user["roles"]}
        allowed_roles = ROLE_HIERARCHY[required_role]
        if user_roles.isdisjoint(allowed_roles):
            raise NotEnoughPermissionsError("User does not have sufficient permissions")
        return user
    return role_checker

AdminUser = Annotated[dict, Depends(require_role(UserRole.ADMIN))]
TeamLeadUser = Annotated[dict, Depends(require_role(UserRole.TEAM_LEAD))]
ViewerUser = Annotated[dict, Depends(require_role(UserRole.VIEWER))]
