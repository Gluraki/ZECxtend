from sqlalchemy.orm import Session

from app.models.drivers import Driver as model_driv
from app.schemas.drivers import Driver as schema_driv

def get_drivers(db: Session) -> schema_driv:
    drivers = db.query(model_driv).all()

    driver_names = []

    for driver in drivers:
        driver_names.append(driver.name)

    return schema_driv(name=driver_names)
