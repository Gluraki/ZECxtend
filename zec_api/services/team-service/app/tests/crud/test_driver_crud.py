import pytest
from app.crud.driver import (
    get_driver,
    get_drivers,
    delete_driver,
)
from app.exceptions.exceptions import EntityDoesNotExistError

def test_get_driver(db, seeded_data):
    driver = seeded_data["drivers"][0]
    fetched = get_driver(db=db, driver_id=driver.id)
    assert fetched.name == driver.name

def test_list_drivers(db, seeded_data):
    drivers = get_drivers(db=db)
    assert len(drivers) == 2

def test_delete_driver(db, seeded_data):
    driver = seeded_data["drivers"][0]
    deleted = delete_driver(db=db, driver_id=driver.id)
    assert deleted.id == driver.id

def test_get_driver_not_found(db):
    with pytest.raises(EntityDoesNotExistError):
        get_driver(db=db, driver_id=999)
