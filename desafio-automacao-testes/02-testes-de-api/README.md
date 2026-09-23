# Tarefa 2 - Testes de API com Playwright

Este módulo automatiza testes de API usando Playwright contra a API pública do Serverest.

## Objetivo

Validar contratos de API para login, usuários, produtos e carrinhos, cobrindo cenários positivos, negativos e regras de negócio reais da aplicação.

## Estrutura do projeto

- package.json
- playwright.config.ts
- .env
- .env.example
- tests/helpers.ts
- tests/login.spec.ts
- tests/produtos.spec.ts
- tests/usuarios.spec.ts
- playwright-report/

## Pré-requisitos

- Node.js
- npm
- dependências instaladas

## Instalação

Acesse a pasta do módulo:

```bash
cd desafio-automacao-testes/02-testes-de-api
```

Instale as dependências:

```bash
npm install
```

Se o editor indicar erro em `process`, instale também as tipagens do Node:

```bash
npm i -D @types/node
```

## Variáveis de ambiente

Crie um arquivo `.env` com os usuários necessários para os testes:

```env
ADMIN_EMAIL=admin@qa.com
ADMIN_PASSWORD=teste
NON_ADMIN_EMAIL=user@qa.com
NON_ADMIN_PASSWORD=teste
```

> O arquivo `.env.example` contém o modelo base para esse setup.

## Como executar os testes

Executar todos os testes:

```bash
npx playwright test
```

Executar um arquivo específico:

```bash
npx playwright test tests/produtos.spec.ts
```

Executar em modo headless por linha:

```bash
npx playwright test tests/produtos.spec.ts --reporter=line
```

Abrir o relatório HTML:

```bash
npx playwright show-report
```

## Cobertura atual implementada

### Login

- POST /login
- login válido
- login inválido
- email obrigatório
- senha obrigatória
- payload malformado
- método não suportado
- payload com SQL injection / payloads agressivos
- validação de mensagens e headers

### Produtos

- GET /produtos
- GET /produtos?nome=...
- POST /produtos com admin válido
- POST /produtos duplicado
- POST /produtos sem token
- POST /produtos com usuário não administrador
- GET /produtos/:id com ID existente
- GET /produtos/:id com ID inválido
- PUT /produtos/:id com admin válido
- DELETE /produtos/:id com admin válido
- DELETE /produtos/:id quando o produto está em carrinho
- cenário end-to-end:
  - admin cria produto
  - usuário comum consulta
  - admin atualiza
  - admin exclui

### Usuários

- GET /usuarios
- POST /usuarios
- PUT /usuarios/:id
- DELETE /usuarios/:id
- validação de mensagens e payloads de erro

## Regras de negócio validadas

Os testes validam:

- status code
- Content-Type
- estrutura JSON esperada
- mensagens de sucesso/erro
- autorização por token
- regras de administrador vs usuário comum
- comportamento real do Serverest

## API utilizada

https://serverest.dev

## Organização por endpoint

Os testes estão separados por recurso para facilitar manutenção:

- login.spec.ts → autenticação
- produtos.spec.ts → produtos
- usuarios.spec.ts → usuários
- helpers.ts → utilitários de apoio
