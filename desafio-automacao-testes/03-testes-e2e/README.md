# Tarefa 3 - Testes E2E com Playwright

Este módulo automatiza testes end-to-end para aplicações web reais, utilizando Playwright com TypeScript e Page Object Model.

## Objetivo

Validar fluxos críticos de navegação e autenticação, cobrindo cenários de login, navegação e ações do usuário em um ambiente de produção-like.

## Estrutura do projeto

- package.json
- playwright.config.ts
- pages/
  - LoginPage.ts
  - InventoryPage.ts
- tests/
  - login-e2e.spec.ts
- playwright-report/
- test-results/

## Pré-requisitos

- Node.js
- npm
- dependências instaladas

## Instalação

Acesse a pasta do módulo:

```bash
cd desafio-automacao-testes/03-testes-e2e
```

Instale as dependências:

```bash
npm install
```

## Como executar os testes

Executar todos os testes:

```bash
npx playwright test
```

Executar em modo headed:

```bash
npx playwright test --headed
```

Abrir o relatório HTML:

```bash
npx playwright show-report
```

## Cenário coberto

O fluxo automatizado foi implementado para a aplicação SauceDemo:

- abertura da página de login
- autenticação com usuário válido
- navegação para a página de produtos
- validação da listagem de produtos
- inclusão de um item no carrinho
- navegação para o carrinho
- assertivas para verificar URL, textos e visibilidade de elementos

## Boas práticas aplicadas

- Page Object Model para separar ações e elementos da lógica dos testes
- assertivas com `expect` para validação de URL, textos e visibilidade
- uso de selectors estáveis em elementos da interface
- relatórios HTML gerados automaticamente
- cenário de erro também validado para credenciais inválidas

## Fluxo de testes implementado

### Login e navegação bem-sucedida

- abre a tela inicial do SauceDemo
- informa `standard_user` e `secret_sauce`
- navega para a página de produtos
- confirma que a URL e o título da página foram carregados corretamente
- adiciona o primeiro item ao carrinho
- valida que o item foi incluído e que o carrinho foi aberto

### Login inválido

- realiza login com senha incorreta
- valida que a mensagem de erro aparece
- garante que o usuário permanece na página de login

## Relatório de execução

Os testes geram relatório em formato HTML e também exibem saída em console via `list` reporter.

Comando para abrir o relatório:

```bash
npx playwright show-report
```

## URL utilizada

https://www.saucedemo.com/

## Observações

Este módulo foi estruturado para cumprir a demanda 3 do desafio, com foco em automação E2E escalável, legível e documentada, incluindo a ordenação por preço e a seleção das duas opções mais baratas.
