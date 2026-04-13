# 🛒 Sistema de Gerenciamento de E-Commerce (Rocket Lab 2026)

Repositório do **Sistema de Gerenciamento de E-Commerce**, um projeto Full Stack desenvolvido como parte da Atividade DEV do programa Rocket Lab 2026.

Este sistema foi projetado para permitir que o gerente de uma loja administre seu catálogo de produtos, visualize métricas de desempenho (vendas e avaliações) e realize operações completas de gerenciamento (CRUD), tudo isso através de uma interface moderna, responsiva e otimizada.

---

## 🎯 Objetivo do Projeto
O objetivo principal é integrar de forma fluida uma base de dados tratada com uma API performática e uma interface de usuário escalável. O sistema permite:
- Visualização em catálogo de produtos com **paginação** e **filtros de busca**.
- Acesso a detalhes de cada produto (medidas, total de vendas e média de avaliações).
- Operações de Adicionar, Editar e Remover produtos (CRUD).
- Visualizar e expandir comentários/avaliações de clientes.
- Experiência fluida, responsiva e otimizada em qualquer dispositivo.

---

## 🏗️ Arquitetura e Ferramentas

O projeto foi construído separando as responsabilidades em duas frentes principais (Frontend e Backend), adotando as melhores práticas do mercado para cada ecossistema.

### Backend (Python)
- **Framework:** FastAPI (Alta performance e documentação automática).
- **ORM:** SQLAlchemy 2.0 (Mapeamento objeto-relacional moderno).
- **Banco de Dados:** SQLite com **WAL Mode** (Leve, arquivo único, otimizado para leitura).
- **Migrations:** Alembic (Versionamento do schema do banco).
- **Validação:** Pydantic 2.0 (Schemas robustos com type hints).

### Frontend (React + TypeScript)
- **Build Tool:** Vite (Setup e Hot Module Replacement ultrarrápidos).
- **UI Framework:** React 18 (Componentes modernos com hooks).
- **TypeScript:** Type safety completo.
- **Estilização:** Tailwind CSS (Framework utilitário para responsividade e padronização visual).
- **Roteamento:** React Router DOM 6 (Navegação SPA - Single Page Application).
- **Requisições HTTP:** Axios (Com tratamento de erros robusto).
- **Gerenciador de Pacotes:** npm/pnpm.

---

## 📂 Estrutura do Projeto

O repositório está dividido em duas pastas principais: `/backend` e `/frontend`.

```
rocketlab2026/
│
├── backend/                          # Servidor, API e Banco de Dados
│   ├── app/
│   │   ├── main.py                   # Ponto de entrada da API, configuração do FastAPI
│   │   ├── database.py               # Configuração do SQLite com otimizações (WAL, cache, etc)
│   │   ├── config.py                 # Variáveis de ambiente
│   │   ├── models/                   # 📦 Modelos do SQLAlchemy (com índices)
│   │   │   ├── __init__.py
│   │   │   ├── produto.py
│   │   │   ├── consumidor.py
│   │   │   ├── vendedor.py
│   │   │   ├── pedido.py
│   │   │   ├── item_pedido.py
│   │   │   ├── avaliacao_pedido.py
│   │   │   └── categoria_imagem.py
│   │   ├── schemas/                  # 📋 Schemas do Pydantic (Request/Response)
│   │   │   ├── produto.py            # ProductCreate, ProductResponse, etc
│   │   │   ├── consumidor.py
│   │   │   ├── vendedor.py
│   │   │   └── ...
│   │   └── routers/                  # 🛣️ Rotas da API (APIRouter modularizado)
│   │       ├── produtos.py           # Endpoints: GET/POST/PUT/DELETE /products
│   │       ├── consumidores.py
│   │       └── ...
│   │
│   ├── alembic/                      # Migrations do banco de dados
│   │   ├── versions/
│   │   └── env.py
│   ├── data/                         # 📊 Arquivos CSV (origem dos dados)
│   │   ├── dim_produtos.csv
│   │   ├── dim_consumidores.csv
│   │   └── ...
│   │
│   ├── import_from_csv.py            # Script ETL (importa CSVs → Database)
│   ├── alembic.ini                   # Config do Alembic
│   ├── requirements.txt              # Dependências Python
│   ├── .env.example                  # Variáveis de ambiente (exemplo)
│   ├── database.db                   # Banco de dados SQLite
│   └── README.md                     # Documentação do backend
│
└── frontend/                         # Interface de Usuário
    ├── src/
    │   ├── components/               # Componentes React reutilizáveis
    │   │   ├── ProductCard.tsx
    │   │   └── ...
    │   ├── pages/                    # Telas da aplicação
    │   │   ├── Home.tsx              # Catálogo com paginação e filtros
    │   │   ├── ProductDetail.tsx     # Detalhes do produto + comentários
    │   │   └── ProductForm.tsx       # Criar/Editar produto
    │   ├── types.ts                  # Interfaces TypeScript
    │   ├── App.tsx                   # Configuração de rotas (React Router)
    │   ├── main.tsx                  # Ponto de entrada
    │   └── globals.css               # Estilos globais
    │
    ├── package.json                  # Dependências e scripts
    ├── tsconfig.json                 # Configuração TypeScript
    ├── tailwind.config.js            # Tema e classe do Tailwind CSS
    ├── vite.config.ts                # Build config Vite
    └── README.md                     # Documentação do frontend
```

---

## 🚀 Como Instalar e Rodar o Projeto

Para executar este projeto localmente, certifique-se de ter instalado: **Python 3.11+**, **Node.js (v18+)**.

### 1. Configurando o Backend
Abra o terminal e navegue até a pasta `backend`:

```bash
# Entre na pasta do backend
cd backend

# Crie e ative um ambiente virtual (Recomendado)
python -m venv venv

# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Instale as dependências
pip install -r requirements.txt

# Popule o banco de dados com os CSVs tratados
python import_from_csv.py --reset

# Inicie o servidor FastAPI
python -m app.main
# Ou com auto-reload:
uvicorn app.main:app --reload
```

**Backend rodando em:** http://localhost:8000  
**Documentação Swagger:** http://localhost:8000/docs  
**Documentação ReDoc:** http://localhost:8000/redoc

### 2. Configurando o Frontend
Abra um novo terminal e navegue até a pasta frontend:

```bash
# Entre na pasta do frontend
cd frontend

# Instale as dependências
npm install
# ou
pnpm install

# Inicie o servidor de desenvolvimento
npm run dev
# ou
pnpm dev
```

**Interface Web:** http://localhost:5173

---

## 📡 Endpoints da API

### Produtos
```
GET    /categories                      # Lista de categorias para filtro
GET    /products                        # Catálogo com paginação, busca, filtros e ordenação
GET    /products/{product_id}           # Detalhes do produto + métricas + comentários
POST   /products                        # Criar novo produto
PUT    /products/{product_id}           # Atualizar produto
DELETE /products/{product_id}           # Deletar produto
```

**Parâmetros GET /products:**
- `search` (string): Busca por nome
- `category` (string): Filtrar por categoria
- `sort_by` (string): Ordenar por `nome`, `avaliacao` ou `vendas`
- `skip` (int): Pagination offset
- `limit` (int): Items por página (padrão: 12)

**Exemplo:**
```
GET /products?search=telefone&category=eletrônicos&sort_by=avaliacao&skip=0&limit=12
```

---

## ⚡ Otimizações Implementadas

### Backend
- ✅ **WAL Mode SQLite**: Maior performance em leitura simultânea
- ✅ **Índices em BD**: Busca/filtro por `nome_produto` e `categoria_produto`
- ✅ **Cache SQLite**: 10.000 páginas (padrão aumentado)
- ✅ **Queries Otimizadas**: Uso de `distinct()` + joins eficientes
- ✅ **Serialização automática Pydantic**: Sem loops manuais
- ✅ **Arquitetura Modular**: Separação de concerns (schemas, routers, models)

### Frontend
- ✅ **Paginação no Backend**: Carrega dados sob demanda
- ✅ **Lazy Loading de Comentários**: Expande comentários conforme necessário
- ✅ **Responsividade Total**: Tailwind CSS com breakpoints
- ✅ **Hot Module Replacement (Vite)**: Reload instantâneo em dev

---

## 🔧 Stacks e Dependências

### Backend
```
fastapi>=0.104.0
sqlalchemy>=2.0.0
pydantic>=2.0.0
alembic>=1.12.0
uvicorn>=0.24.0
```

### Frontend
```
react@18
react-router-dom@6
axios@1.6
tailwindcss@3
typescript
```

---

## ✨ Funcionalidades Principais

- 🛍️ **Catálogo Dinâmico**: Paginação e busca em tempo real
- 🔍 **Filtros Avançados**: Por categoria, nome e ordenação customizada
- ⭐ **Sistema de Avaliações**: Visualize média de notas e comentários dos clientes
- 📊 **Métricas de Vendas**: Total de vendas por produto
- 🎯 **CRUD Completo**: Criar, editar, visualizar e deletar produtos
- 💬 **Comentários Expandíveis**: Carregue todos os comentários sob demanda
- 📱 **Responsivo**: Funciona perfeitamente em mobile, tablet e desktop
- 🚀 **Performance**: API otimizada e interface ágil

---

## 📝 Estrutura de Dados (Schema)

O banco contém 7 tabelas em um esquema dimensional (Data Warehouse):

**Dimensões (Reference):**
- `produtos` - Catálogo de produtos
- `consumidores` - Clientes
- `vendedores` - Vendedores
- `categoria_imagens` - Categorias com URLs de imagens

**Fatos (Transactional):**
- `pedidos` - Pedidos realizados
- `itens_pedidos` - Itens dentro de cada pedido
- `avaliacoes_pedidos` - Avaliações/comentários dos clientes