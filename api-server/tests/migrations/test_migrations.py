import os
from pathlib import Path

from alembic import command
from alembic.autogenerate import compare_metadata
from alembic.config import Config
from alembic.runtime.migration import MigrationContext
from sqlalchemy import create_engine, inspect

from shared.database import Base

MIGRATIONS = Path(__file__).resolve().parents[2] / "migrations"


def _config(connection) -> Config:
    config = Config()
    config.set_main_option("script_location", str(MIGRATIONS))
    config.attributes["connection"] = connection
    return config


def _engine(tmp_path):
    return create_engine(os.environ.get("TEST_DATABASE_URL") or f"sqlite:///{tmp_path / 'migrations.db'}")


def test_migrations_match_models(tmp_path):
    engine = _engine(tmp_path)

    with engine.begin() as connection:
        command.upgrade(_config(connection), "head")
        diff = compare_metadata(MigrationContext.configure(connection), Base.metadata)
        command.downgrade(_config(connection), "base")

    engine.dispose()
    assert diff == [], "models changed without a migration, run: alembic revision --autogenerate"


def test_downgrade_to_base_removes_everything(tmp_path):
    engine = _engine(tmp_path)

    with engine.begin() as connection:
        command.upgrade(_config(connection), "head")
        command.downgrade(_config(connection), "base")
        tables = set(inspect(connection).get_table_names())

    engine.dispose()
    assert tables == {"alembic_version"}
