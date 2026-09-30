import pytest

import shared.exceptions as exc
from shared.user_role import UserRole


@pytest.fixture
def schemas(crud_user):
    import app.schemas.user as schemas

    return schemas


@pytest.fixture
def make_user(db, crud_user, schemas, password):
    async def _make_user(username="alice", role=UserRole.USER, team_id=None, **extra):
        return await crud_user.create(
            db=db,
            obj_in=schemas.UserCreate(username=username, password=password, role=role, team_id=team_id, **extra),
        )

    return _make_user


@pytest.mark.asyncio
async def test_create_hashes_password_and_sets_defaults(make_user, password):
    from app.crud.auth import verify_password

    user = await make_user()

    assert user.id is not None
    assert user.password_hash != password
    assert verify_password(password, user.password_hash)
    assert user.role == UserRole.USER
    assert user.token_version == 0
    assert user.must_change_password is False
    assert user.created_at is not None
    assert user.updated_at is None


@pytest.mark.asyncio
async def test_create_sets_role_team_and_must_change(make_user, team_id):
    user = await make_user(role=UserRole.TEAMLEAD, team_id=team_id, must_change_password=True)

    assert user.role == UserRole.TEAMLEAD
    assert user.team_id == team_id
    assert user.must_change_password is True


@pytest.mark.asyncio
async def test_create_timestamps_are_per_row(make_user):
    first = await make_user("alice")
    second = await make_user("bob")

    assert second.created_at > first.created_at


@pytest.mark.asyncio
async def test_create_duplicate_username(make_user):
    await make_user("alice")

    with pytest.raises(exc.EntityAlreadyExistsError):
        await make_user("alice")


@pytest.mark.asyncio
async def test_create_teamlead_without_team(make_user):
    with pytest.raises(exc.InvalidOperationError):
        await make_user(role=UserRole.TEAMLEAD)


@pytest.mark.asyncio
async def test_get_and_get_multi(db, crud_user, make_user):
    alice = await make_user("alice")
    bob = await make_user("bob")

    assert (await crud_user.get(db=db, id=alice.id)).username == "alice"
    assert [u.id for u in await crud_user.get_multi(db=db)] == [alice.id, bob.id]


@pytest.mark.asyncio
async def test_get_unknown(db, crud_user):
    with pytest.raises(exc.EntityDoesNotExistError):
        await crud_user.get(db=db, id=999)


@pytest.mark.asyncio
async def test_update_password_rehashes_clears_must_change_and_bumps_version(db, crud_user, schemas, make_user):
    from app.crud.auth import verify_password

    user = await make_user(must_change_password=True)

    updated = await crud_user.update(db=db, id=user.id, obj_in=schemas.UserUpdate(password="new-password-456"))

    assert verify_password("new-password-456", updated.password_hash)
    assert updated.must_change_password is False
    assert updated.token_version == 1
    assert updated.updated_at is not None


@pytest.mark.asyncio
@pytest.mark.parametrize("field", ["role", "team_id"])
async def test_update_role_or_team_bumps_version(db, crud_user, schemas, make_user, team_id, field):
    user = await make_user()
    value = {"role": UserRole.ADMIN, "team_id": team_id}[field]

    updated = await crud_user.update(db=db, id=user.id, obj_in=schemas.UserUpdate(**{field: value}))

    assert updated.token_version == 1


@pytest.mark.asyncio
async def test_update_username_keeps_version(db, crud_user, schemas, make_user):
    user = await make_user()

    updated = await crud_user.update(db=db, id=user.id, obj_in=schemas.UserUpdate(username="alice2"))

    assert updated.username == "alice2"
    assert updated.token_version == 0


@pytest.mark.asyncio
@pytest.mark.parametrize("field", ["username", "password", "role"])
async def test_update_rejects_null_for_required_fields(db, crud_user, schemas, make_user, field):
    user = await make_user()

    with pytest.raises(exc.InvalidOperationError):
        await crud_user.update(db=db, id=user.id, obj_in=schemas.UserUpdate(**{field: None}))


@pytest.mark.asyncio
async def test_update_can_clear_team(db, crud_user, schemas, make_user, team_id):
    user = await make_user(team_id=team_id)

    updated = await crud_user.update(db=db, id=user.id, obj_in=schemas.UserUpdate(team_id=None))

    assert updated.team_id is None


@pytest.mark.asyncio
async def test_update_duplicate_username(db, crud_user, schemas, make_user):
    await make_user("alice")
    bob = await make_user("bob")

    with pytest.raises(exc.EntityAlreadyExistsError):
        await crud_user.update(db=db, id=bob.id, obj_in=schemas.UserUpdate(username="alice"))


@pytest.mark.asyncio
async def test_update_unknown(db, crud_user, schemas):
    with pytest.raises(exc.EntityDoesNotExistError):
        await crud_user.update(db=db, id=999, obj_in=schemas.UserUpdate(username="nobody"))


@pytest.mark.asyncio
@pytest.mark.parametrize("initial, fields", [
    ({}, {"role": UserRole.TEAMLEAD}),
    ({"role": UserRole.TEAMLEAD, "team_id": "existing"}, {"team_id": None}),
])
async def test_update_teamlead_without_team(db, crud_user, schemas, make_user, team_id, initial, fields):
    if initial.get("team_id") == "existing":
        initial = {**initial, "team_id": team_id}
    user = await make_user(**initial)

    with pytest.raises(exc.InvalidOperationError):
        await crud_user.update(db=db, id=user.id, obj_in=schemas.UserUpdate(**fields))


@pytest.mark.asyncio
async def test_update_cannot_demote_last_admin(db, crud_user, schemas, make_user):
    admin = await make_user(role=UserRole.ADMIN)

    with pytest.raises(exc.InvalidOperationError):
        await crud_user.update(db=db, id=admin.id, obj_in=schemas.UserUpdate(role=UserRole.USER))


@pytest.mark.asyncio
async def test_update_can_demote_admin_when_another_exists(db, crud_user, schemas, make_user):
    admin = await make_user("root", role=UserRole.ADMIN)
    await make_user("root2", role=UserRole.ADMIN)

    updated = await crud_user.update(db=db, id=admin.id, obj_in=schemas.UserUpdate(role=UserRole.USER))

    assert updated.role == UserRole.USER


@pytest.mark.asyncio
async def test_delete(db, crud_user, make_user):
    user = await make_user()

    await crud_user.delete(db=db, id=user.id)

    assert await crud_user.get_or_none(db=db, id=user.id) is None


@pytest.mark.asyncio
async def test_delete_unknown(db, crud_user):
    with pytest.raises(exc.EntityDoesNotExistError):
        await crud_user.delete(db=db, id=999)


@pytest.mark.asyncio
async def test_delete_last_admin(db, crud_user, make_user):
    admin = await make_user(role=UserRole.ADMIN)

    with pytest.raises(exc.InvalidOperationError):
        await crud_user.delete(db=db, id=admin.id)


@pytest.mark.asyncio
async def test_authenticate_success(db, crud_user, make_user, password):
    user = await make_user()

    assert (await crud_user.authenticate_user(db=db, username="alice", password=password)).id == user.id


@pytest.mark.asyncio
@pytest.mark.parametrize("username, attempt", [("alice", "wrong-password"), ("nobody", "password123")])
async def test_authenticate_failure(db, crud_user, make_user, username, attempt):
    await make_user()

    with pytest.raises(exc.AuthenticationFailed):
        await crud_user.authenticate_user(db=db, username=username, password=attempt)
