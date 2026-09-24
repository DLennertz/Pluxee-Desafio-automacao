# Relatório de Automação de Testes de API - ServeRest

## 1. Visão Geral e Ferramental

- API testada: ServeRest (`https://serverest.dev/`)
- Framework: Playwright + APIRequestContext
- Linguagem: TypeScript
- Data da execução: 24/09/2026
- Duração total: 9.0 segundos
- Ambiente: execução local em modo headless

---

## 2. Resumo da Execução

| Métrica                    | Quantidade | Percentual |
| :------------------------- | :--------: | :--------: |
| Total de testes executados |     32     |    100%    |
| Passaram (Passed)          |     32     |    100%    |
| Falharam (Failed)          |     0      |     0%     |
| Pulados (Skipped)          |     0      |     0%     |

### Evidência da execução

Comando executado:

```bash
cd "C:\GIT\Pluxee-Desafio-automacao\desafio-automacao-testes\02-testes-de-api"
npm test -- --reporter=list
```

Resultado verificado:

```text
Running 32 tests using 3 workers
32 passed (9.0s)
```

---

## 3. Matriz de Cobertura por Endpoint e Método HTTP

### Endpoint `/login`

- `POST /login`
  - ✅ Login com credenciais válidas
  - ✅ Login com email em letras maiúsculas
  - ✅ Login com espaços laterais no email
  - ✅ Login com senha incorreta
  - ✅ Login sem informar email
  - ✅ Login sem informar senha
  - ✅ Login sem informar campos obrigatórios
  - ✅ Login com email nulo
  - ✅ Login com senha nula
  - ✅ Login sem enviar body
  - ✅ Login com JSON inválido
  - ✅ Login com email em formato inválido
  - ✅ Login com Content-Type incompatível
  - ✅ Login com payload excessivamente grande
  - ✅ Login com método HTTP não suportado
  - ✅ Login com payload de SQL Injection

### Endpoint `/produtos`

- `GET /produtos`
  - ✅ Retorna lista com status 200
  - ✅ Aceita filtros por query params
  - ✅ Consulta produto por ID existente
  - ✅ Retorna 400 para ID inválido

- `POST /produtos`
  - ✅ Criação com admin válido
  - ✅ Rejeita produto duplicado
  - ✅ Exige token de autenticação
  - ✅ Rejeita usuário não administrador

- `PUT /produtos/:id`
  - ✅ Atualização com admin válido

- `DELETE /produtos/:id`
  - ✅ Exclusão com admin válido
  - ✅ Rejeita produto que está em carrinho

### Endpoint `/usuarios`

- `POST /usuarios`
  - ✅ Cadastro de usuário válido com sucesso
  - ✅ Rejeita payload inválido

- `PUT /usuarios/:id`
  - ✅ Atualização de usuário com sucesso

- `DELETE /usuarios/:id`
  - ✅ Remoção de usuário com sucesso

---

## 4. Validações Realizadas nos Testes

Cada cenário foi validado em três camadas:

1. Status Code
   - Verificação de códigos esperados como 200, 201, 400 e 401.
2. Headers
   - Confirmação de `Content-Type` e demais metadados relevantes.
3. Corpo da Resposta (Body)
   - Inspeção de mensagens, estrutura JSON, IDs retornados e regras de negócio.

Além disso, os testes cobraram:

- autenticação e autorização;
- regras de administrador vs. usuário comum;
- validação de payloads inválidos;
- cenários negativos e de segurança;
- integridade das respostas ao consumir endpoints da API.

---

## 5. Observações e Conclusão

A suíte de testes automatizados de API executou com sucesso todos os cenários previstos e não houve falhas na execução após a validação final. Isso demonstra que a implementação atual atende às regras principais do contrato da API Serverest para os endpoints abordados.

A cobertura incluída cobre fluxos reais de autenticação, criação, listagem, atualização, exclusão e validação de erros, evidenciando estabilidade funcional da API em cenários positivos e negativos.

---

## 6. Evidências e Artefatos

- Relatório HTML gerado pelo Playwright: `./playwright-report/index.html`
- Arquivo do relatório detalhado em Markdown: `./RELATORIO_API.md`

> O relatório HTML foi gerado pela suíte e pode ser aberto diretamente para visualizar o resultado interativo dos testes executados.
