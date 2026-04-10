from fastapi import FastAPI, Depends, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
import sys
from pathlib import Path

# Adiciona o diretório raiz ao path para importações relativas
sys.path.insert(0, str(Path(__file__).parent))

from app import models, database
from app.database import Base, engine

app = FastAPI(
    title="RocketLab 2026 - Sistema de Compras",
    description="API para gerenciamento de produtos, pedidos e vendedores",
    version="1.0.0",
)

@app.on_event("startup")
def create_tables_on_startup():
    Base.metadata.create_all(bind=engine)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # URLs do frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Endpoint de Health Check
@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "API rodando com sucesso!"}

# Endpoint de Catálogo com Busca e Paginação
@app.get("/products", tags=["Products"])
def get_products(
    db: Session = Depends(database.get_db),
    search: str = Query(None),
    skip: int = 0,
    limit: int = 12
):
    query = db.query(models.Produto)
    if search:
        query = query.filter(models.Produto.nome_produto.contains(search))
    
    total = query.count()
    products = query.offset(skip).limit(limit).all()
    
    return {"total": total, "products": products}

# Endpoint de Detalhes (Cálculo de Média e Vendas)
@app.get("/products/{product_id}", tags=["Products"])
def get_product_details(product_id: str, db: Session = Depends(database.get_db)):
    product = db.query(models.Produto).filter(models.Produto.id_produto == product_id).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    
    # Cálculo de Vendas
    total_vendas = db.query(models.ItemPedido).filter(models.ItemPedido.id_produto == product_id).count()
    
    # Cálculo de Média de Avaliações (Join entre Itens e Avaliações)
    media_nota = db.query(func.avg(models.AvaliacaoPedido.avaliacao))\
        .join(models.ItemPedido, models.ItemPedido.id_pedido == models.AvaliacaoPedido.id_pedido)\
        .filter(models.ItemPedido.id_produto == product_id).scalar()

    return {
        "info": product,
        "metrics": {
            "total_sales": total_vendas,
            "average_rating": round(media_nota, 2) if media_nota else 0
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)