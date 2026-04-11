from fastapi import FastAPI, Depends, Query, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app import models
from app.database import Base, SessionLocal, engine, get_db

class ProductBase(BaseModel):
    id_produto: str
    nome_produto: str = Field(..., min_length=1)
    categoria_produto: str | None = None
    peso_produto_gramas: float | None = Field(None, gt=0)
    comprimento_centimetros: float | None = Field(None, gt=0)
    altura_centimetros: float | None = Field(None, gt=0)
    largura_centimetros: float | None = Field(None, gt=0)

    model_config = {
        "extra": "forbid",
    }

    @field_validator('nome_produto')
    @classmethod
    def nome_nao_vazio(cls, v):
        if not v or not v.strip():
            raise ValueError('Nome do produto não pode ser vazio')
        return v.strip()


class ProductCreate(ProductBase):
    nova_categoria: str | None = None
    categoria_imagem_url: str | None = None

    @field_validator('nova_categoria')
    @classmethod
    def validar_nova_categoria(cls, v, info):
        if info.data.get('categoria_produto') == 'outra' and (not v or not v.strip()):
            raise ValueError('Nome da nova categoria é obrigatório quando categoria é "outra"')
        return v.strip() if v else None


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


class ProductComment(BaseModel):
    id_avaliacao: str
    avaliacao: int
    titulo_comentario: str | None = None
    comentario: str
    data_comentario: str | None = None


class ProductDetailsResponse(BaseModel):
    info: ProductResponse
    metrics: ProductMetrics
    comentarios: list[ProductComment] | None = None
    total_comments: int | None = None


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


@app.get("/categories", tags=["Categories"])
def get_categories(db: Session = Depends(get_db)):
    """Retorna lista de categorias existentes para o dropdown"""
    categories = db.query(models.Produto.categoria_produto)\
        .filter(models.Produto.categoria_produto.isnot(None))\
        .distinct()\
        .order_by(models.Produto.categoria_produto)\
        .all()
    
    return {"categories": [cat[0] for cat in categories]}


@app.get("/products", response_model=ProductsListResponse, tags=["Products"])
def get_products(
    db: Session = Depends(get_db),
    search: str | None = Query(None),
    category: str | None = Query(None),
    sort_by: str = Query("nome", regex="^(nome|avaliacao|vendas)$"),
    skip: int = 0,
    limit: int = 12,
):
    # Query base com joins para avaliações e vendas
    query = db.query(models.Produto).options(joinedload(models.Produto.categoria_imagem))
    
    # Filtro por busca em nome
    if search:
        query = query.filter(models.Produto.nome_produto.contains(search))
    
    # Filtro por categoria
    if category and category != "todas":
        query = query.filter(models.Produto.categoria_produto == category)
    
    # Aplicar ordenação
    if sort_by == "nome":
        query = query.order_by(models.Produto.nome_produto.asc())
    elif sort_by == "avaliacao":
        # Left join com avaliações para ordenar por média
        avg_rating = db.query(
            models.ItemPedido.id_produto,
            func.avg(models.AvaliacaoPedido.avaliacao).label('media_nota')
        ).outerjoin(
            models.AvaliacaoPedido,
            models.ItemPedido.id_pedido == models.AvaliacaoPedido.id_pedido
        ).group_by(models.ItemPedido.id_produto).subquery()

        vendas = db.query(
            models.ItemPedido.id_produto,
            func.count(models.ItemPedido.id_item).label('num_vendas')
        ).group_by(models.ItemPedido.id_produto).subquery()

        query = query.outerjoin(avg_rating, models.Produto.id_produto == avg_rating.c.id_produto)\
                     .outerjoin(vendas, models.Produto.id_produto == vendas.c.id_produto)\
                     .order_by(
                         func.coalesce(avg_rating.c.media_nota, 0).desc(),
                         func.coalesce(vendas.c.num_vendas, 0).desc(),
                         models.Produto.nome_produto.asc(),
                     )
    elif sort_by == "vendas":
        # Contar vendas por produto
        vendas = db.query(
            models.ItemPedido.id_produto,
            func.count(models.ItemPedido.id_item).label('num_vendas')
        ).group_by(models.ItemPedido.id_produto).subquery()
        
        query = query.outerjoin(vendas, models.Produto.id_produto == vendas.c.id_produto)\
                     .order_by(func.coalesce(vendas.c.num_vendas, 0).desc())

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
def get_product_details(
    product_id: str,
    db: Session = Depends(get_db),
    load_all_comments: bool = Query(False),
):
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

    comentarios_query = (
        db.query(models.AvaliacaoPedido)
        .join(models.ItemPedido, models.ItemPedido.id_pedido == models.AvaliacaoPedido.id_pedido)
        .filter(models.ItemPedido.id_produto == product_id)
        .filter(models.AvaliacaoPedido.comentario != "Sem comentário")
        .filter(models.AvaliacaoPedido.comentario.isnot(None))
        .order_by(models.AvaliacaoPedido.data_comentario.desc())
    )

    total_comentarios = comentarios_query.count()
    comentarios = comentarios_query.limit(5).all() if not load_all_comments else comentarios_query.all()

    comentarios_list = [
        {
            "id_avaliacao": comentario.id_avaliacao,
            "avaliacao": comentario.avaliacao,
            "titulo_comentario": comentario.titulo_comentario,
            "comentario": comentario.comentario,
            "data_comentario": comentario.data_comentario.isoformat() if comentario.data_comentario else None,
        }
        for comentario in comentarios
    ]

    return {
        "info": product_info,
        "metrics": {
            "total_sales": total_vendas,
            "average_rating": round(media_nota or 0, 2),
        },
        "comentarios": comentarios_list,
        "total_comments": total_comentarios,
    }


@app.post("/products", response_model=ProductResponse, status_code=201, tags=["Products"])
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    # Verificar se ID já existe
    existing = db.query(models.Produto).filter(models.Produto.id_produto == product.id_produto).first()
    if existing:
        raise HTTPException(status_code=400, detail="Produto com este ID já existe")

    # Se categoria é "outra", criar nova categoria
    categoria_final = product.categoria_produto
    if product.categoria_produto == "outra":
        if not product.nova_categoria:
            raise HTTPException(status_code=400, detail="Nome da nova categoria é obrigatório")
        categoria_final = product.nova_categoria
        
        # Criar nova categoria_imagem se URL fornecida
        if product.categoria_imagem_url:
            existing_categoria = db.query(models.CategoriaImagem).filter(
                models.CategoriaImagem.categoria == categoria_final
            ).first()
            if not existing_categoria:
                nova_categoria_imagem = models.CategoriaImagem(
                    categoria=categoria_final,
                    link=product.categoria_imagem_url
                )
                db.add(nova_categoria_imagem)

    new_product = models.Produto(
        id_produto=product.id_produto,
        nome_produto=product.nome_produto,
        categoria_produto=categoria_final,
        peso_produto_gramas=product.peso_produto_gramas,
        comprimento_centimetros=product.comprimento_centimetros,
        altura_centimetros=product.altura_centimetros,
        largura_centimetros=product.largura_centimetros
    )
    
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
