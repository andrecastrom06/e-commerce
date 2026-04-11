from fastapi import FastAPI, Depends, Query, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app import models
from app.database import Base, SessionLocal, engine, get_db

class ProductBase(BaseModel):
    id_produto: str
    nome_produto: str
    categoria_produto: str | None = None
    peso_produto_gramas: float | None = None
    comprimento_centimetros: float | None = None
    altura_centimetros: float | None = None
    largura_centimetros: float | None = None

    model_config = {
        "extra": "forbid",
    }


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    nome_produto: str | None = None
    categoria_produto: str | None = None
    peso_produto_gramas: float | None = None
    comprimento_centimetros: float | None = None
    altura_centimetros: float | None = None
    largura_centimetros: float | None = None

    model_config = {
        "extra": "forbid",
    }


class ProductResponse(ProductBase):
    image_url: str | None = None

    model_config = {
        "from_attributes": True,
    }


class ProductMetrics(BaseModel):
    total_sales: int
    average_rating: float


class ProductDetailsResponse(BaseModel):
    info: ProductResponse
    metrics: ProductMetrics


class ProductsListResponse(BaseModel):
    total: int
    products: list[ProductResponse]


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


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "API rodando com sucesso!"}


@app.get("/products", response_model=ProductsListResponse, tags=["Products"])
def get_products(
    db: Session = Depends(get_db),
    search: str | None = Query(None),
    skip: int = 0,
    limit: int = 12,
):
    query = db.query(models.Produto).options(joinedload(models.Produto.categoria_imagem))
    if search:
        query = query.filter(models.Produto.nome_produto.contains(search))

    total = query.count()
    products = query.offset(skip).limit(limit).all()
    
    # Construir resposta manualmente para incluir image_url
    products_data = []
    for product in products:
        product_dict = {
            "id_produto": product.id_produto,
            "nome_produto": product.nome_produto,
            "categoria_produto": product.categoria_produto,
            "peso_produto_gramas": product.peso_produto_gramas,
            "comprimento_centimetros": product.comprimento_centimetros,
            "altura_centimetros": product.altura_centimetros,
            "largura_centimetros": product.largura_centimetros,
            "image_url": product.image_url,
        }
        products_data.append(product_dict)
    
    return {"total": total, "products": products_data}


@app.get("/products/{product_id}", response_model=ProductDetailsResponse, tags=["Products"])
def get_product_details(product_id: str, db: Session = Depends(get_db)):
    product = (
        db.query(models.Produto)
        .options(joinedload(models.Produto.categoria_imagem))
        .filter(models.Produto.id_produto == product_id)
        .first()
    )
    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    total_vendas = db.query(models.ItemPedido).filter(models.ItemPedido.id_produto == product_id).count()
    media_nota = (
        db.query(func.avg(models.AvaliacaoPedido.avaliacao))
        .join(models.ItemPedido, models.ItemPedido.id_pedido == models.AvaliacaoPedido.id_pedido)
        .filter(models.ItemPedido.id_produto == product_id)
        .scalar()
    )

    # Construir info manualmente para incluir image_url
    product_info = {
        "id_produto": product.id_produto,
        "nome_produto": product.nome_produto,
        "categoria_produto": product.categoria_produto,
        "peso_produto_gramas": product.peso_produto_gramas,
        "comprimento_centimetros": product.comprimento_centimetros,
        "altura_centimetros": product.altura_centimetros,
        "largura_centimetros": product.largura_centimetros,
        "image_url": product.image_url,
    }

    return {
        "info": product_info,
        "metrics": {
            "total_sales": total_vendas,
            "average_rating": round(media_nota or 0, 2),
        },
    }


@app.post("/products", response_model=ProductResponse, status_code=201, tags=["Products"])
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Produto).filter(models.Produto.id_produto == product.id_produto).first()
    if existing:
        raise HTTPException(status_code=400, detail="Produto com este ID já existe")

    new_product = models.Produto(**product.model_dump())
    db.add(new_product)
    db.commit()
    
    # Recarregar com joinedload para incluir categoria_imagem
    product_with_image = (
        db.query(models.Produto)
        .options(joinedload(models.Produto.categoria_imagem))
        .filter(models.Produto.id_produto == new_product.id_produto)
        .first()
    )
    
    # Retornar dados manuais incluindo image_url
    return {
        "id_produto": product_with_image.id_produto,
        "nome_produto": product_with_image.nome_produto,
        "categoria_produto": product_with_image.categoria_produto,
        "peso_produto_gramas": product_with_image.peso_produto_gramas,
        "comprimento_centimetros": product_with_image.comprimento_centimetros,
        "altura_centimetros": product_with_image.altura_centimetros,
        "largura_centimetros": product_with_image.largura_centimetros,
        "image_url": product_with_image.image_url,
    }


@app.put("/products/{product_id}", response_model=ProductResponse, tags=["Products"])
def update_product(product_id: str, product: ProductUpdate, db: Session = Depends(get_db)):
    existing = db.query(models.Produto).filter(models.Produto.id_produto == product_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    update_data = product.model_dump(exclude_none=True)
    for field, value in update_data.items():
        setattr(existing, field, value)

    db.commit()
    
    # Recarregar com joinedload para incluir categoria_imagem
    product_with_image = (
        db.query(models.Produto)
        .options(joinedload(models.Produto.categoria_imagem))
        .filter(models.Produto.id_produto == product_id)
        .first()
    )
    
    # Retornar dados manuais incluindo image_url
    return {
        "id_produto": product_with_image.id_produto,
        "nome_produto": product_with_image.nome_produto,
        "categoria_produto": product_with_image.categoria_produto,
        "peso_produto_gramas": product_with_image.peso_produto_gramas,
        "comprimento_centimetros": product_with_image.comprimento_centimetros,
        "altura_centimetros": product_with_image.altura_centimetros,
        "largura_centimetros": product_with_image.largura_centimetros,
        "image_url": product_with_image.image_url,
    }


@app.delete("/products/{product_id}", status_code=204, tags=["Products"])
def delete_product(product_id: str, db: Session = Depends(get_db)):
    existing = db.query(models.Produto).filter(models.Produto.id_produto == product_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    db.delete(existing)
    db.commit()
    return Response(status_code=204)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
