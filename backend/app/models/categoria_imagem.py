from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class CategoriaImagem(Base):
    __tablename__ = "categoria_imagens"

    categoria: Mapped[str] = mapped_column(String(255), primary_key=True)
    link: Mapped[str] = mapped_column(String(1000))

    produtos: Mapped[list["Produto"]] = relationship(
        "Produto",
        primaryjoin="Produto.categoria_produto == foreign(CategoriaImagem.categoria)",
        viewonly=True,
        back_populates="categoria_imagem",
    )
