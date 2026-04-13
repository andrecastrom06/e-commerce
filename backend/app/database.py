from sqlalchemy import create_engine, event
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False},
)

# Otimizações para SQLite: WAL mode, pragma cache, etc.
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA journal_mode=WAL")  # Write-Ahead Logging
    cursor.execute("PRAGMA cache_size=10000")  # Cache maior
    cursor.execute("PRAGMA synchronous=NORMAL")  # Menos sync (mais rápido, seguro em WAL)
    cursor.execute("PRAGMA temp_store=MEMORY")  # Temp em memória
    cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
