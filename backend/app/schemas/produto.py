from pydantic import BaseModel, Field, field_validator


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