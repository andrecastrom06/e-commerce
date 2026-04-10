# Backend — Sistema de Compras Online

API REST construída com **FastAPI** e **SQLite**, utilizando SQLAlchemy como ORM e Alembic para migrations.

---

## Requisitos

- Python 3.11+

---

## Instalação

**1. Crie e ative um ambiente virtual**

```bash
python -m venv venv
```

Windows:
```bash
venv\Scripts\activate
```

Mac/Linux:
```bash
source venv/bin/activate
```

**2. Instale as dependências**

```bash
pip install -r requirements.txt
```

**3. Configure as variáveis de ambiente**

Copie o arquivo de exemplo e ajuste se necessário:

```bash
cp .env.example .env
```

---

## Banco de dados

### Criar as tabelas

```bash
alembic upgrade head
```

Este comando lê os arquivos dentro de `alembic/versions/` e cria todas as tabelas no banco.

### Ver o estado atual

```bash
alembic current
```

### Criar uma nova migration (após alterar um model)

```bash
alembic revision -m "descricao da mudanca"
```

Depois edite o arquivo gerado em `alembic/versions/` adicionando as instruções em `upgrade()` e `downgrade()`.

### Desfazer a última migration

```bash
alembic downgrade -1
```

---

## Importar dados CSV

Coloque os arquivos CSV em `backend/data/` e use o script de importação:

```bash
cd backend
python import_from_csv.py
```

Os arquivos esperados são:
- `dim_produtos.csv`
- `dim_consumidores.csv`
- `dim_vendedores.csv`
- `fat_pedidos.csv`
- `fat_itens_pedidos.csv`
- `fat_avaliacoes_pedidos.csv`

Se o banco `backend/database.db` já existir com um esquema antigo, recrie-o antes de importar:

```bash
python import_from_csv.py --reset
```

O script cria as tabelas no SQLite e insere os registros do CSV no banco `database.db`.

---

## Rodando a API

```bash
python -m app.main
```

A API estará disponível em: [http://localhost:8000](http://localhost:8000)

Documentação: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Estrutura do projeto

```
backend/
├── app/
│   ├── main.py              # Ponto de entrada da aplicação
│   ├── database.py          # Configuração do banco de dados
│   ├── config.py            # Variáveis de ambiente
│   ├── models/              # Models do SQLAlchemy 
│   │   ├── consumidor.py
│   │   ├── produto.py
│   │   ├── vendedor.py
│   │   ├── pedido.py
│   │   ├── item_pedido.py
│   │   └── avaliacao_pedido.py
│   ├── schemas/             # Schemas do Pydantic
│   │   ├── consumidor.py
│   │   ├── produto.py
│   │   ├── vendedor.py
│   │   ├── pedido.py
│   │   ├── item_pedido.py
│   │   └── avaliacao_pedido.py
│   └── routers/             # Rotas da API
│       ├── consumidores.py
│       ├── produtos.py
│       ├── vendedores.py
│       ├── pedidos.py
│       ├── itens_pedidos.py
│       └── avaliacoes_pedidos.py
├── alembic/
│   ├── env.py               # Configuração do Alembic
│   └── versions/            # Arquivos de migration
├── alembic.ini              # Configuração principal do Alembic
├── requirements.txt
└── .env.example
```
