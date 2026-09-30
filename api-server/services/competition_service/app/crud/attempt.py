from app.schemas.attempt import AttemptCreate, AttemptUpdate
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

import shared.exceptions as exc
from shared.crud_base import CRUDBase, _handle_integrity_error
from shared.models import Attempt, Challenge, Driver, Penalty

NON_NULLABLE_FIELDS = {"team_id", "driver_id", "challenge_id"}


class CRUDAttempt(CRUDBase[Attempt, AttemptCreate, AttemptUpdate]):
    async def create(self, db: AsyncSession, obj_in: AttemptCreate) -> Attempt:
        data = obj_in.model_dump(exclude={"penalty_count", "penalty_type"})
        challenge = await self._check_references(db, data["team_id"], data["driver_id"], data["challenge_id"])
        await self._check_max_attempts(db, data["team_id"], challenge)

        penalties = []
        if obj_in.penalty_type is not None:
            penalties.append(Penalty(penalty_type_id=obj_in.penalty_type, count=obj_in.penalty_count or 0))

        return await self._create_from_data(db, {**data, "penalties": penalties})

    async def update(self, db: AsyncSession, id: int, obj_in: AttemptUpdate) -> Attempt:
        db_attempt = await self.get(db, id)
        data = obj_in.model_dump(exclude_unset=True)

        for field in NON_NULLABLE_FIELDS:
            if field in data and data[field] is None:
                raise exc.InvalidOperationError(f"{field} cannot be null")

        start_time = data.get("start_time", db_attempt.start_time)
        end_time = data.get("end_time", db_attempt.end_time)
        if start_time is not None and end_time is not None and end_time <= start_time:
            raise exc.InvalidOperationError("end_time must be after start_time")

        if NON_NULLABLE_FIELDS & data.keys():
            team_id = data.get("team_id", db_attempt.team_id)
            driver_id = data.get("driver_id", db_attempt.driver_id)
            challenge_id = data.get("challenge_id", db_attempt.challenge_id)
            challenge = await self._check_references(db, team_id, driver_id, challenge_id)
            moved = team_id != db_attempt.team_id or challenge.id != db_attempt.challenge_id
            if db_attempt.is_valid and moved:
                await self._check_max_attempts(db, team_id, challenge, exclude_id=db_attempt.id)

        return await super().update(db=db, id=id, obj_in=obj_in)

    async def set_validity(self, db: AsyncSession, id: int, is_valid: bool) -> Attempt:
        db_attempt = await self.get(db, id)
        if is_valid and not db_attempt.is_valid:
            challenge = await db.get(Challenge, db_attempt.challenge_id)
            await self._check_max_attempts(db, db_attempt.team_id, challenge, exclude_id=db_attempt.id)

        db_attempt.is_valid = is_valid
        try:
            await db.commit()
            await db.refresh(db_attempt)
        except IntegrityError as e:
            await db.rollback()
            _handle_integrity_error(e, "Attempt", "updating")
        return db_attempt

    async def _check_references(self, db: AsyncSession, team_id: int, driver_id: int, challenge_id: int) -> Challenge:
        driver = await db.get(Driver, driver_id)
        if driver is None:
            raise exc.ForeignKeyViolationError(f"Driver with id {driver_id} does not exist")
        if driver.team_id != team_id:
            raise exc.InvalidOperationError(f"Driver {driver_id} does not belong to team {team_id}")

        challenge = await db.get(Challenge, challenge_id)
        if challenge is None:
            raise exc.ForeignKeyViolationError(f"Challenge with id {challenge_id} does not exist")
        return challenge

    async def _check_max_attempts(
        self, db: AsyncSession, team_id: int, challenge: Challenge | None, exclude_id: int | None = None
    ) -> None:
        if challenge is None or challenge.max_attempts is None:
            return

        query = select(func.count()).select_from(Attempt).where(
            Attempt.team_id == team_id,
            Attempt.challenge_id == challenge.id,
            Attempt.is_valid.is_(True),
        )
        if exclude_id is not None:
            query = query.where(Attempt.id != exclude_id)

        if (await db.scalar(query) or 0) >= challenge.max_attempts:
            raise exc.InvalidOperationError(
                f"Team {team_id} already has {challenge.max_attempts} valid attempts for challenge {challenge.id}"
            )

crud_attempt = CRUDAttempt(Attempt)
