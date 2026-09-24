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

### Usuários

- POST /usuarios
- PUT /usuarios/:id
- DELETE /usuarios/:id
- validação de mensagens e payloads de erro

## Cobertura de rotas

A cobertura foi analisada considerando rotas específicas testadas na API.

| Rota / Endpoint | Cobertura                                                                                      | Status            |
| :-------------- | :--------------------------------------------------------------------------------------------- | :---------------- |
| `/login`        | POST /login                                                                                    | 🟢 Coberto        |
| `/usuarios`     | GET /usuarios                                                                                  | ⚪ Não coberto    |
| `/usuarios`     | POST /usuarios                                                                                 | 🟢 Coberto        |
| `/usuarios/:id` | GET /usuarios/:id                                                                              | ⚪ Não coberto    |
| `/usuarios/:id` | PUT /usuarios/:id                                                                              | 🟢 Coberto        |
| `/usuarios/:id` | DELETE /usuarios/:id                                                                           | 🟢 Coberto        |
| `/produtos`     | GET /produtos                                                                                  | 🟢 Coberto        |
| `/produtos`     | GET /produtos?nome=...                                                                         | 🟢 Coberto        |
| `/produtos`     | POST /produtos                                                                                 | 🟢 Coberto        |
| `/produtos/:id` | GET /produtos/:id                                                                              | 🟢 Coberto        |
| `/produtos/:id` | PUT /produtos/:id                                                                              | 🟢 Coberto        |
| `/produtos/:id` | DELETE /produtos/:id                                                                           | 🟢 Coberto        |
| `/carrinhos`    | GET /carrinhos, GET /carrinhos/:id, POST /carrinhos, PUT /carrinhos/:id, DELETE /carrinhos/:id | ⚪ Fora do escopo |

### Lista de cenários cobertos

#### Login

- login com credenciais válidas
- login com email em letras maiúsculas
- login com espaços laterais no email
- login com email não cadastrado
- login com senha incorreta
- login sem informar email
- login sem informar senha
- login com email nulo
- login com senha nula
- login sem informar campos obrigatórios
- login sem enviar body
- login com JSON inválido
- login com email em formato inválido
- login com content-type incompatível
- login com método HTTP não suportado
- login com payload de SQL injection
- login com payload excessivamente grande

#### Produtos

- GET /produtos retorna 200 e lista de produtos
- GET /produtos aceita filtros por query params
- POST /produtos cadastra produto com admin válido
- POST /produtos rejeita produto duplicado
- POST /produtos exige token de autenticação
- POST /produtos rejeita usuário não administrador
- GET /produtos/:id retorna produto existente
- GET /produtos/:id retorna 400 quando o id for inválido
- PUT /produtos/:id atualiza produto com admin válido
- DELETE /produtos/:id remove produto com admin
- DELETE /produtos/:id rejeita produto que faz parte de carrinho

#### Usuários

- POST /usuarios cadastra usuário válido com sucesso
- POST /usuarios rejeita payload inválido
- PUT /usuarios/:id atualiza usuário com sucesso
- DELETE /usuarios/:id remove usuário com sucesso

### Resumo da cobertura por recurso

| Recurso      | Rotas cobertas | Cobertura           |
| :----------- | :------------- | :------------------ |
| `/login`     | 1/1            | 100%                |
| `/usuarios`  | 3/5            | 60%                 |
| `/produtos`  | 5/5            | 100%                |
| `/carrinhos` | 0/5            | 0% (fora do escopo) |

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
