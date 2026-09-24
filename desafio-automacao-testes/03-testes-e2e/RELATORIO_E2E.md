# Relatório de Automação de Testes End-to-End (E2E) - SauceDemo

## 1. Informações Gerais

- Aplicação alvo: SauceDemo (`https://www.saucedemo.com/`)
- Framework: Playwright + TypeScript
- Arquitetura: Page Object Model (POM)
- Ambiente de execução: Chromium em modo headless
- Data da execução: 24/09/2026
- Duração estimada da suíte: ~10 segundos

---

## 2. Resumo da Execução

| Status            | Quantidade | Percentual |
| :---------------- | :--------: | :--------: |
| Passaram (Passed) |     3      |    100%    |
| Falharam (Failed) |     0      |     0%     |
| Flaky / Instáveis |     0      |     0%     |
| Total de testes   |     3      |    100%    |

---

## 3. Objetivo da Automação

O objetivo deste módulo foi validar os fluxos críticos de navegação, autenticação e compra de forma end-to-end na aplicação SauceDemo. Os testes automatizados verificam comportamento real do usuário em cenários de login, ordenação, seleção de itens, carrinho, checkout e retorno à home após finalização da compra.

---

## 4. Estrutura da Suíte e Boas Práticas

### Arquitetura Page Object Model (POM)

A solução foi organizada com separação de responsabilidades para facilitar manutenção e reutilização:

- `pages/LoginPage.ts`: contém a navegação até a tela de login e métodos de autenticação.
- `pages/InventoryPage.ts`: encapsula ações da página de produtos, como ordenação por preço e acesso ao carrinho.
- `tests/login-e2e.spec.ts`: centraliza os cenários de teste e as validações de negócio.

### Boas práticas aplicadas

- Uso de `expect` do Playwright para validações de URL, visibilidade, textos e contagem de itens.
- Locators estáveis para elementos da interface.
- Ausência de `waitForTimeout` desnecessários, aproveitando o auto-wait nativo do Playwright.
- Captura automática de evidências com screenshots, vídeos e traces em falhas.
- Relatório HTML gerado pela ferramenta nativa, facilitando a análise de execução.

---

## 5. Cenários Testados

| ID   | Cenário                                                                                                             | Tipo     | Resultado |
| :--- | :------------------------------------------------------------------------------------------------------------------ | :------- | :-------- |
| TC01 | Login com sucesso, ordenação por preço, seleção das duas opções mais baratas, checkout e retorno com carrinho vazio | Positivo | ✅ Passed |
| TC02 | Remoção do item mais caro do carrinho, continuidade da compra e finalização do fluxo                                | Positivo | ✅ Passed |
| TC03 | Login com credenciais inválidas e validação da mensagem de erro                                                     | Negativo | ✅ Passed |

### Detalhamento dos testes

#### TC01 - Fluxo principal de compra

- Acessa a página de login da SauceDemo.
- Realiza autenticação com usuário válido.
- Ordena os produtos por preço do menor para o maior.
- Seleciona os dois itens mais baratos.
- Verifica o badge do carrinho e a navegação até o checkout.
- Completa o formulário de checkout com dados válidos.
- Valida subtotal, imposto e total calculados.
- Finaliza a compra e confirma a página de sucesso.
- Retorna à página de produtos e valida que o carrinho ficou vazio.

#### TC02 - Fluxo de remoção e continuidade da compra

- Abre a página de produtos.
- Seleciona o produto mais caro e outro item relevante.
- Adiciona os itens ao carrinho.
- Remove o produto mais caro.
- Confirma que o carrinho foi atualizado corretamente.
- Continua comprando e conclui a compra com o item restante.
- Verifica que o carrinho volta ao estado vazio.

#### TC03 - Login com credenciais inválidas

- Tenta autenticar com senha incorreta.
- Verifica que a mensagem de erro aparece na interface.
- Confirma que a aplicação permanece na página de login.

---

## 6. Evidências de Teste e Artefatos

Os artefatos gerados pela execução dos testes incluem:

- Relatório interativo HTML em `playwright-report/index.html`
- Saída detalhada no console via reporter `list`
- Screenshots em falhas
- Vídeos em falhas
- Trace de execução em falhas

Esses artefatos permitem auditoria completa do comportamento da aplicação durante os cenários automatizados.

---

## 7. Configuração do Relatório Playwright

A configuração já foi ajustada no arquivo `playwright.config.ts` para gerar relatório HTML e registrar evidências:

```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "https://www.saucedemo.com/v1",
    headless: true,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
});
```

Essa configuração atende ao requisito de gerar e apresentar relatório detalhado dos testes E2E, combinando:

1. relatório técnico interativo do Playwright; 2.凭 análise analítica documentada no repositório.

---

## 8. Como Executar e Visualizar o Relatório

### Executar os testes

```bash
cd desafio-automacao-testes/03-testes-e2e
npm install
npx playwright test
```

### Abrir o relatório HTML

```bash
npx playwright show-report
```

---

## 9. Conclusão

A automação E2E desenvolvida para a aplicação SauceDemo demonstrou cobertura funcional dos fluxos mais relevantes da experiência do usuário, com foco em autenticação, navegação, seleção de produtos, carrinho e checkout. O uso do Playwright, aliado ao Page Object Model, proporcionou um código estruturado, reutilizável e com evidências de execução claras para análise e documentação.

O conjunto de testes atende ao requisito de relatório detalhado, com evidências automáticas geradas no relatório HTML e com a análise dos cenários documentada neste arquivo.
