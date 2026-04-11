# 🛒 Sistema de Gerenciamento de E-Commerce (Rocket Lab 2026)

Repositório do **Sistema de Gerenciamento de E-Commerce**, um projeto Full Stack desenvolvido como parte da Atividade DEV do programa Rocket Lab 2026. 

Este sistema foi projetado para permitir que o gerente de uma loja administre seu catálogo de produtos, visualize métricas de desempenho (vendas e avaliações) e realize operações completas de gerenciamento (CRUD), tudo isso através de uma interface moderna, responsiva e otimizada.

---

## 🎯 Objetivo do Projeto
O objetivo principal é integrar de forma fluida uma base de dados tratada com uma API performática e uma interface de usuário escalável. O sistema permite:
- Visualização em catálogo de produtos com **paginação** e **filtros de busca**.
- Acesso a detalhes de cada produto (medidas, total de vendas e média de avaliações).
- Operações de Adicionar, Editar e Remover produtos (CRUD).
- Experiência fluida e responsiva em qualquer dispositivo.

---

## 🏗️ Arquitetura e Ferramentas

O projeto foi construído separando as responsabilidades em duas frentes principais (Frontend e Backend), adotando as melhores práticas do mercado para cada ecossistema.

### Backend (Python)
- **Framework:** FastAPI (Alta performance e documentação automática).
- **ORM:** SQLAlchemy (Mapeamento objeto-relacional).
- **Banco de Dados:** SQLite (Leve, arquivo único, ideal para o escopo).

### Frontend (React + TypeScript)
- **Build Tool:** Vite (Setup e Hot Module Replacement ultrarrápidos).
- **Estilização:** Tailwind CSS (Framework utilitário para responsividade e padronização visual).
- **Roteamento:** React Router DOM (Navegação SPA - Single Page Application).
- **Requisições HTTP:** Axios (Com instâncias pré-configuradas e tratamento de erros).
- **Metodologia de Componentização:** Atomic Design (Átomos, Moléculas, Organismos e Templates).
- **Gerenciador de Pacotes:** pnpm (Alta performance e economia de espaço).

---

## 📂 Estrutura do Projeto e Arquivos

O repositório está dividido em duas pastas principais: `/backend` e `/frontend`.

```text
e-commerce/
│
├── backend/                  # Servidor, API e Banco de Dados
│   ├── data/                 # 🗄️ Origem dos Dados: Contém os arquivos .csv tratados (dim_produtos, fat_itens_pedidos, etc.)
│   ├── main.py               # Ponto de entrada da API, definição das rotas (Endpoints)
│   ├── models.py             # Modelos do SQLAlchemy (Estrutura das tabelas relacionais)
│   ├── database.py           # Configuração de conexão com o SQLite
│   ├── seed.py               # Script ETL de população do banco de dados a partir dos CSVs
│   ├── database.db           # Banco de dados gerado automaticamente
│   └── requirements.txt      # Lista de dependências Python
│
└── frontend/                 # Interface de Usuário
    ├── src/
    │   ├── components/       # Componentes estruturados via Atomic Design
    │   │   ├── atoms/        # Botões, Inputs, Labels (Elementos indivisíveis)
    │   │   ├── molecules/    # Barras de busca, Cards simplificados
    │   │   ├── organisms/    # Grids de produtos, Formulários completos
    │   │   └── templates/    # Layouts base (Ex: Header + Conteúdo + Footer)
    │   ├── pages/            # Telas da aplicação (Home/Catálogo, Detalhes, Gerenciamento)
    │   ├── services/         # Configuração da API (Instância do Axios)
    │   ├── hooks/            # Custom Hooks (ex: useProducts para chamadas assíncronas)
    │   ├── types/            # Interfaces globais do TypeScript
    │   ├── App.tsx           # Configuração das rotas
    │   └── main.tsx          # Ponto de injeção do React no DOM
    ├── tailwind.config.js    # Configurações de tema e cores do Tailwind
    └── package.json          # Dependências e scripts do Node/pnpm
```

---

## 🚀 Como Instalar e Rodar o Projeto

Para executar este projeto localmente, certifique-se de ter instalado: **Python 3.9+**, **Node.js (v18+)** e o **pnpm**.

### 1. Configurando e Populando o Backend
Abra o terminal e navegue até a pasta `backend`:

```bash
# Entre na pasta do backend
cd backend

# Crie e ative um ambiente virtual (Recomendado)
python -m venv venv
source venv/bin/activate  # No Windows use: venv\Scripts\activate

# Instale as dependências
pip install -r requirements.txt

# Popule o banco de dados com os CSVs tratados
# Este comando lê a pasta /data e gera o arquivo database.db
python seed.py

# Inicie o servidor FastAPI
uvicorn main:app --reload
```

Servidor Backend: http://localhost:8000
Swagger (Documentação): http://localhost:8000/docs

### 2. Configurando o Frontend
Abra um novo terminal e navegue até a pasta frontend:

```bash
# Entre na pasta do frontend
cd frontend

# Instale as dependências usando pnpm
pnpm install

# Inicie o servidor de desenvolvimento
pnpm dev
```

Interface Web: Geralmente disponível em http://localhost:5173.

## 📡 Documentação da API (Endpoints)
A API foi documentada para facilitar a integração. Abaixo as rotas principais:

```text
GET /products: Retorna o catálogo paginado (suporta limit, skip e o filtro search).

GET /products/{id}: Retorna os detalhes do produto e métricas (vendas e média de nota).

POST /products: Cria um novo produto.

PUT /products/{id}: Atualiza os dados de um produto existente.

DELETE /products/{id}: Remove um produto do catálogo.

```

## ✨ Funcionalidades Extras Implementadas
Para elevar a qualidade da entrega e atender às sugestões da atividade, foram aplicados:

- Responsividade Avançada: Interface totalmente adaptável para dispositivos móveis utilizando Tailwind CSS.
- Paginação via Backend: O catálogo carrega dados sob demanda, garantindo performance mesmo com grandes volumes de produtos.
- Filtros de Busca: Barra de pesquisa funcional que filtra produtos diretamente no banco de dados.
- ETL Customizado: O arquivo seed.py utiliza Pandas com a lógica db.merge(), permitindo que a carga de dados seja re-executada sem duplicar registros ou quebrar o banco.
- Interface em Português: Toda a experiência do usuário foi traduzida para atender ao público-alvo (Gerente da Loja), conforme as diretrizes da monitoria.