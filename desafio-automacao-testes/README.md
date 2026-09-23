# Desafio de Automação de Testes

Este repositório organiza o desafio em cinco tarefas principais, cobrindo testes de carga, API, E2E, mobile e integração contínua.

## Estrutura do projeto

```text
desafio-automacao-testes/
├── .github/
│   └── workflows/
│       └── main-ci.yml
├── 01-testes-de-carga/
│   ├── scripts/
│   │   └── load-test.js
│   ├── reports/
│   └── README.md
├── 02-testes-de-api/
│   ├── tests/
│   ├── package.json
│   └── README.md
├── 03-testes-e2e/
│   ├── pages/
│   ├── tests/
│   ├── playwright.config.ts
│   └── README.md
├── 04-testes-mobile/
│   ├── apps/
│   ├── tests/
│   ├── requirements.txt
│   └── README.md
├── .gitignore
└── README.md
```

## Tarefas

1. Testes de carga com k6
2. Automação de API
3. Automação Web com Playwright
4. Automação Mobile com Appium + Python
5. Pipeline CI/CD unificada em GitHub Actions

## Requisitos gerais

- k6 instalado para a Tarefa 1
- Node.js + npm para a Tarefa 2 e 3
- Python 3 + pip para a Tarefa 4
- GitHub Actions para pipeline

## Como começar

1. Clone o repositório.
2. Instale as ferramentas necessárias por tarefa.
3. Execute cada conjunto de testes em sua respectiva pasta.
4. Consulte os READMEs específicos de cada módulo.

## Observação

A estrutura foi criada para manter cada tipo de automação isolado, facilitando a manutenção e a geração de relatórios por tarefa.
