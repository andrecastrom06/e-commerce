from typing import Optional

from sqlalchemy import String, Float, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Produto(Base):
    __tablename__ = "produtos"

    id_produto: Mapped[str] = mapped_column(String(32), primary_key=True)
    nome_produto: Mapped[str] = mapped_column(String(255))
    categoria_produto: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    peso_produto_gramas: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    comprimento_centimetros: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    altura_centimetros: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    largura_centimetros: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    categoria_imagem: Mapped[Optional["CategoriaImagem"]] = relationship(
        "CategoriaImagem",
        primaryjoin="Produto.categoria_produto == foreign(CategoriaImagem.categoria)",
        viewonly=True,
        back_populates="produtos",
        uselist=False,
    )

    __table_args__ = (
        Index("idx_nome_produto", "nome_produto"),
        Index("idx_categoria_produto", "categoria_produto"),
    )

    @property
    def image_url(self) -> Optional[str]:
        return self.categoria_imagem.link if self.categoria_imagem else None