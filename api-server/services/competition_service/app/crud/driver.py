from app.schemas.driver import DriverCreate, DriverUpdate

from shared.crud_base import CRUDBase
from shared.models import Driver


class CRUDDriver(CRUDBase[Driver, DriverCreate, DriverUpdate]):
    pass

crud_driver = CRUDDriver(Driver)
