from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models
from app.database import Base, engine
from app.routers.produtos import router as produtos_router


app = FastAPI(
    title="RocketLab 2026 - Sistema de Compras",
    description="API para gerenciamento de produtos, pedidos e vendedores",
    version="1.0.0",
)


@app.on_event("startup")
def create_tables_on_startup():
    Base.metadata.create_all(bind=engine)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(produtos_router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
