from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from app.core.config import settings

try:
    print(f"DEBUG: settings.DATABASE_URL={settings.DATABASE_URL.split('@')[-1]}") # Mask password
    print(f"DEBUG: settings.ASYNC_DATABASE_URL={settings.ASYNC_DATABASE_URL.split('@')[-1]}")
except:
    print("DEBUG: Could not print URLs")

engine = create_async_engine(settings.ASYNC_DATABASE_URL, echo=True)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
