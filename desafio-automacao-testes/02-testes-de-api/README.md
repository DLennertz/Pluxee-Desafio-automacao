# Tarefa 2 - Testes de API com Playwright

Este módulo automatiza testes de API usando Playwright e a API pública Serverest.

## Objetivo

Validar endpoints, status code, headers e payloads em cenários positivos e negativos para GET, POST, PUT e DELETE.

## Estrutura

- package.json
- playwright.config.ts
- tests/helpers.ts
- tests/produtos.spec.ts
- tests/usuarios.spec.ts
- tests/login.spec.ts
- playwright-report/

## Como executar

1. Acesse a pasta do módulo:
   cd desafio-automacao-testes/02-testes-de-api
2. Instale as dependências:
   npm install
3. Execute os testes:
   npx playwright test
4. Abra o relatório HTML:
   npx playwright show-report

## Cobertura implementada

- GET /produtos em produtos.spec.ts
- POST /usuarios, PUT /usuarios/:id e DELETE /usuarios/:id em usuarios.spec.ts
- POST /login em login.spec.ts com cenários válidos e inválidos
- helpers.ts para geração de e-mail único

Cada teste valida:

- status code
- header Content-Type
- corpo JSON esperado
- mensagens e campos de resposta

## API utilizada

https://serverest.dev

## Organização por endpoint

Os testes estão separados por recurso para facilitar manutenção e leitura:

- produtos.spec.ts → testes do endpoint de produtos
- usuarios.spec.ts → testes do endpoint de usuários
