import argparse
import csv
import sqlite3
from datetime import datetime, date
from pathlib import Path

from sqlalchemy.exc import IntegrityError

from app.database import Base, SessionLocal, engine
from app.models import (
    AvaliacaoPedido,
    CategoriaImagem,
    Consumidor,
    ItemPedido,
    Pedido,
    Produto,
    Vendedor,
)

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
DB_PATH = BASE_DIR / "database.db"


def is_produtos_categoria_nullable(db_path: Path) -> bool:
    if not db_path.exists():
        return True

    try:
        with sqlite3.connect(str(db_path)) as conn:
            cursor = conn.cursor()
            cursor.execute("PRAGMA table_info(produtos)")
            for column in cursor.fetchall():
                if column[1] == "categoria_produto":
                    return column[3] == 0
    except sqlite3.OperationalError:
        return True

    return True

MODEL_CONFIG = {
    "dim_produtos.csv": {
        "model": Produto,
        "fields": [
            "id_produto",
            "nome_produto",
            "categoria_produto",
            "peso_produto_gramas",
            "comprimento_centimetros",
            "altura_centimetros",
            "largura_centimetros",
        ],
        "converters": {
            "peso_produto_gramas": float,
            "comprimento_centimetros": float,
            "altura_centimetros": float,
            "largura_centimetros": float,
        },
    },
    "dim_consumidores.csv": {
        "model": Consumidor,
        "fields": [
            "id_consumidor",
            "prefixo_cep",
            "nome_consumidor",
            "cidade",
            "estado",
        ],
    },
    "dim_vendedores.csv": {
        "model": Vendedor,
        "fields": [
            "id_vendedor",
            "nome_vendedor",
            "prefixo_cep",
            "cidade",
            "estado",
        ],
    },
    "fat_pedidos.csv": {
        "model": Pedido,
        "fields": [
            "id_pedido",
            "id_consumidor",
            "status",
            "pedido_compra_timestamp",
            "pedido_entregue_timestamp",
            "data_estimada_entrega",
            "tempo_entrega_dias",
            "tempo_entrega_estimado_dias",
            "diferenca_entrega_dias",
            "entrega_no_prazo",
        ],
        "converters": {
            "pedido_compra_timestamp": lambda v: parse_datetime(v),
            "pedido_entregue_timestamp": lambda v: parse_datetime(v),
            "data_estimada_entrega": lambda v: parse_date(v),
            "tempo_entrega_dias": float,
            "tempo_entrega_estimado_dias": float,
            "diferenca_entrega_dias": float,
        },
    },
    "fat_itens_pedidos.csv": {
        "model": ItemPedido,
        "fields": [
            "id_pedido",
            "id_item",
            "id_produto",
            "id_vendedor",
            "preco_BRL",
            "preco_frete",
        ],
        "converters": {
            "id_item": int,
            "preco_BRL": float,
            "preco_frete": float,
        },
    },
    "fat_avaliacoes_pedidos.csv": {
        "model": AvaliacaoPedido,
        "fields": [
            "id_avaliacao",
            "id_pedido",
            "avaliacao",
            "titulo_comentario",
            "comentario",
            "data_comentario",
            "data_resposta",
        ],
        "converters": {
            "avaliacao": int,
            "data_comentario": lambda v: parse_datetime(v),
            "data_resposta": lambda v: parse_datetime(v),
        },
    },
    "dim_categoria_imagens.csv": {
        "model": CategoriaImagem,
        "fields": [
            "categoria",
            "link",
        ],
        "csv_fields": {
            "categoria": "Categoria",
            "link": "Link",
        },
    },
}


def parse_datetime(value: str):
    if value is None or value.strip() == "":
        return None
    for fmt in ["%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M", "%Y-%m-%d"]:
        try:
            return datetime.fromisoformat(value)
        except ValueError:
            continue
    return None


def parse_date(value: str):
    if value is None or value.strip() == "":
        return None
    try:
        return date.fromisoformat(value)
    except ValueError:
        return None


def normalize(value, converter=None):
    if value is None:
        return None
    trimmed = value.strip()
    if trimmed == "":
        return None
    if converter:
        try:
            return converter(trimmed)
        except ValueError:
            return None
    return trimmed


def load_csv(filename, model_info, session):
    file_path = DATA_DIR / filename
    if not file_path.exists():
        print(f"Arquivo não encontrado: {file_path}")
        return 0

    count = 0
    with file_path.open(newline="", encoding="utf-8") as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            data = {}
            for field in model_info["fields"]:
                csv_field = model_info.get("csv_fields", {}).get(field, field)
                converter = model_info.get("converters", {}).get(field)
                data[field] = normalize(row.get(csv_field, ""), converter)
            obj = model_info["model"](**data)
            try:
                session.merge(obj)
                session.flush()
                count += 1
            except IntegrityError as exc:
                session.rollback()
                print(
                    f"Falha ao importar registro em {filename}: {data} | erro: {exc.orig if hasattr(exc, 'orig') else exc}"
                )
    return count


def main(reset: bool = False):
    if not DATA_DIR.exists():
        DATA_DIR.mkdir(parents=True, exist_ok=True)
    print(f"Lendo CSVs em: {DATA_DIR}")

    if reset and DB_PATH.exists():
        print(f"Resetando banco de dados existente: {DB_PATH}")
        DB_PATH.unlink()

    if DB_PATH.exists() and not is_produtos_categoria_nullable(DB_PATH):
        raise SystemExit(
            "O banco de dados existente usa um esquema antigo para produtos. "
            "Execute novamente com --reset ou remova backend/database.db antes de importar."
        )

    Base.metadata.create_all(bind=engine)

    with SessionLocal() as session:
        total = 0
        for filename, model_info in MODEL_CONFIG.items():
            count = load_csv(filename, model_info, session)
            if count:
                print(f"Importados {count} registros de {filename}")
            total += count
        session.commit()

    print(f"Importação concluída. Total de registros importados: {total}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Import data from CSV files into the SQLite backend database.")
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Remover o banco de dados existente e recriar as tabelas antes de importar.",
    )
    args = parser.parse_args()
    main(reset=args.reset)
