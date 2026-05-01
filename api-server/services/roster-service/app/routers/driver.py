from typing import List

from app.crud.driver import crud_driver as crud
from app.schemas.driver import DriverCreate, DriverResponse, DriverUpdate
from fastapi import APIRouter

from shared.database import SessionDep

router = APIRouter()

@router.post("/", response_model=DriverResponse)
async def create_driver(db: SessionDep, driver: DriverCreate):
    db_driver = await crud.create(db=db, obj_in=driver)
    return db_driver

@router.put("/{driver_id}", response_model=DriverResponse)
async def update_driver(db: SessionDep, driver_id: int, driver_update: DriverUpdate):
    db_driver = await crud.update(db=db, id=driver_id, obj_in=driver_update)
    return db_driver

@router.delete("/{driver_id}", response_model=DriverResponse)
async def delete_driver(db: SessionDep, driver_id: int):
    db_driver = await crud.delete(db=db, id=driver_id)
    return db_driver

@router.get("/{driver_id}", response_model=DriverResponse)
async def get_driver(db: SessionDep, driver_id: int):
    db_driver = await crud.get(db=db, id=driver_id)
    return db_driver

@router.get("/", response_model=List[DriverResponse])
async def get_all_drivers(db: SessionDep):
    db_drivers = await crud.get_multi(db=db)
    return db_drivers
