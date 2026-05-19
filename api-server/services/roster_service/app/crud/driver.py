from app.models.driver import Driver
from app.schemas.driver import DriverCreate, DriverUpdate

from shared.crud_base import CRUDBase


class CRUDDriver(CRUDBase[Driver, DriverCreate, DriverUpdate]):
    pass

crud_driver = CRUDDriver(Driver)
