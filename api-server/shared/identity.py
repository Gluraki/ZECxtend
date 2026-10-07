from dataclasses import dataclass
from typing import Annotated

from fastapi import Depends, Header

import shared.exceptions as exc
from shared.user_role import UserRole


@dataclass(frozen=True)
class CurrentUser:
    id: int
    username: str
    role: UserRole
    team_id: int | None

    @property
    def is_admin(self) -> bool:
        return self.role == UserRole.ADMIN

    def can_manage_team(self, team_id: int | None) -> bool:
        if self.is_admin:
            return True
        return self.role == UserRole.TEAMLEAD and team_id is not None and team_id == self.team_id


def get_current_user(
    x_user_id: Annotated[str | None, Header()] = None,
    x_username: Annotated[str | None, Header()] = None,
    x_role: Annotated[str | None, Header()] = None,
    x_team_id: Annotated[str | None, Header()] = None,
) -> CurrentUser:
    if not x_user_id or not x_username or not x_role:
        raise exc.AuthenticationFailed("Not authenticated")
    try:
        return CurrentUser(
            id=int(x_user_id),
            username=x_username,
            role=UserRole(x_role),
            team_id=int(x_team_id) if x_team_id else None,
        )
    except ValueError:
        raise exc.AuthenticationFailed("Malformed identity headers")


CurrentUserDep = Annotated[CurrentUser, Depends(get_current_user)]


def get_optional_user(
    x_user_id: Annotated[str | None, Header()] = None,
    x_username: Annotated[str | None, Header()] = None,
    x_role: Annotated[str | None, Header()] = None,
    x_team_id: Annotated[str | None, Header()] = None,
) -> CurrentUser | None:
    if not x_user_id:
        return None
    return get_current_user(x_user_id, x_username, x_role, x_team_id)


OptionalUserDep = Annotated[CurrentUser | None, Depends(get_optional_user)]


def require_roles(*roles: UserRole):
    def dependency(user: CurrentUserDep) -> CurrentUser:
        if user.role not in roles:
            raise exc.NotEnoughPermissionsError("Insufficient role")
        return user

    return Depends(dependency)
