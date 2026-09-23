# Relatório de Teste de Carga - API ServeRest

## 1. Objetivo e Cenário

- Alvo: Endpoint GET `/produtos`
- Usuários simultâneos (VUs): 100
- Duração: 5 minutos
- Objetivo: Avaliar a estabilidade e o tempo de resposta da API sob carga contínua.

## 2. Resumo das Métricas

| Métrica                          | Valor Obtido | SLA / Expectativa | Status     |
| :------------------------------- | :----------- | :---------------- | :--------- |
| Requisições Totais               | 28.500 reqs  | N/A               | -          |
| Vazão (Throughput)               | ~95 req/s    | > 50 req/s        | Aprovado   |
| Taxa de Erro (`http_req_failed`) | 0.2%         | < 1%              | Aprovado   |
| Tempo Médio (`avg`)              | 180ms        | < 300ms           | Aprovado   |
| Percentil 95 (`p95`)             | 420ms        | < 500ms           | Aprovado   |
| Tempo Máximo (`max`)             | 2.1s         | N/A               | Observação |

## 3. Análise de Desempenho e Gargalos

- Estabilidade: a API manteve uma vazão constante de ~95 RPS durante a maior parte dos 5 minutos, sem quedas abruptas de desempenho.
- Comportamento dos percentis: o tempo médio ficou em 180ms e o `p(95)` permaneceu dentro do limite aceitável (420ms).
- Identificação de gargalos potenciais:
  - Picos isolados (spikes): foi observado um pico isolado de 2.1s no minuto 3. Isso pode indicar concorrência no banco de dados, escassez momentânea de conexões no pool ou atuação de garbage collection do servidor.
  - Erros 5xx / 429: a taxa de falha de 0.2% esteve associada a respostas com status HTTP 503 (Service Unavailable) sob pico de acessos, sugerindo necessidade de ajuste nas configurações de rate limiting ou no auto-scaling da infraestrutura.

## 4. Recomendações

1. Investigar os logs do servidor no intervalo correspondente ao pico de 2.1s.
2. Realizar testes de estresse progressivo (ramp-up) para identificar o ponto exato em que a API atinge a quebra (break-point).
3. Monitorar a utilização de CPU, memória e conexões de banco durante a execução.
4. Validar políticas de rate limit e elasticidade do ambiente para evitar quedas sob picos de acesso.

## 5. Conclusão

O cenário testado demonstrou que a API se comportou de forma estável e dentro dos limites esperados para a maior parte da execução. O percentual de erro e o tempo de resposta no percentil 95 ficaram dentro do SLA proposto. O principal ponto de atenção está no pico isolado de latência, o que indica que a aplicação pode sofrer degradação em momentos de maior concorrência e merece investigação adicional em testes de estresse e observabilidade.
