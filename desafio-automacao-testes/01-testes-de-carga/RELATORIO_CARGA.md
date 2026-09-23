# Relatório de Teste de Carga - API ServeRest

## 1. Objetivo e Cenário

- Alvo: endpoint GET /produtos
- Usuários simultâneos: 100 VUs
- Duração planejada: 5 minutos
- Objetivo: verificar o comportamento da API sob carga contínua e identificar gargalos de desempenho e estabilidade.

## 2. Evidência da Execução

O teste foi executado com o cenário definido em k6 e gerou o relatório em HTML no diretório de relatórios. A evidência do resumo da execução mostrou que o cenário foi submetido a 100 usuários simultâneos e que a API não sustentou o volume de requisições sem falhas.

## 3. Resumo das Métricas Obtenidas

| Métrica                        | Valor Obtido     | SLA / Expectativa | Status            |
| :----------------------------- | :--------------- | :---------------- | :---------------- |
| Requisições totais             | 23.239           | N/A               | -                 |
| Throughput                     | 77,13 req/s      | > 50 req/s        | Observação        |
| Taxa de erro (http_req_failed) | 87,09%           | < 1%              | Reprovado         |
| Tempo médio (avg)              | 291,54 ms        | < 300 ms          | Observação        |
| Percentil 95 (p95)             | 355,07 ms        | < 500 ms          | Aprovado          |
| Tempo máximo (max)             | 1509,50 ms       | N/A               | Atenção           |
| Checks aprovados               | 3.000            | 100%              | Reprovado         |
| Checks falhados                | 20.239           | 0%                | Reprovado         |
| Usuários virtuais              | min 22 / max 100 | 100 simultâneos   | Parcial           |

## 4. Análise Crítica do Resultado

### 4.1 Estabilidade da API

A API teve uma vazão de aproximadamente 77,13 requisições por segundo, o que atende ao critério mínimo de throughput, mas isso não foi suficiente para garantir estabilidade durante o cenário de carga. A falha mais importante foi a taxa de erro de 87,09%, muito acima do limite aceitável de 1%.

### 4.2 Tempo de resposta

O tempo médio de resposta ficou em 291,54 ms, muito perto do limite de 300 ms, e o percentil 95 ficou em 355,07 ms, ainda dentro do critério de 500 ms. Isso indica que, em parte do cenário, a API manteve tempos aceitáveis, mas não conseguiu sustentar a experiência em todos os acessos simultâneos.

### 4.3 Identificação de gargalos

Os dados mostram que o problema principal não foi apenas latência, mas a falha massiva na validação do status HTTP. O check "status code é 200" passou apenas 12,91% das vezes e falhou em 87,09% dos casos. Esse comportamento sugere que a API alvo ficou indisponível, respondeu com erro ou não conseguiu processar a demanda durante o pico de concorrência.

Os gargalos mais prováveis são:

- saturação do servidor durante os picos de concorrência;
- indisponibilidade temporária da API pública;
- rate limiting ou rejeição de requisições em momentos de alta carga;
- latência de rede ou de infraestrutura externa ao ambiente local.

A presença de um máximo de 1509,50 ms também indica picos de latência persistentes, que reforçam a hipótese de degradação sob carga.

## 5. Comparação com os Critérios de Aceite

O objetivo do teste foi validar que a API cumprisse:

- menos de 1% de falhas;
- 95% das requisições com tempo abaixo de 500 ms;
- estabilidade com 100 usuários simultâneos.

Resultado observado:

- Falha de 87,09% → não atendido;
- P95 de 355,07 ms → atendido;
- Estabilidade com 100 VUs → não atendido;

Conclusão: o cenário foi reprovado do ponto de vista de disponibilidade e confiabilidade sob carga.

## 6. Recomendações

1. Validar se o endpoint público escolhido está estável o suficiente para suportar 100 VUs em ambiente real.
2. Reexecutar o teste em uma API local ou em um ambiente controlado, para separar falha de infraestrutura externa da aplicação.
3. Monitorar CPU, memória, conexões de banco e consumo de rede durante a execução.
4. Ajustar políticas de rate limiting e escalabilidade para evitar queda em picos de concorrência.
5. Realizar testes progressivos de carga e pico para identificar o ponto exato em que a aplicação começa a falhar.

## 7. Conclusão

O resultado do teste evidencia que a API não suportou 100 usuários simultâneos de forma estável. Embora o tempo de resposta no percentil 95 tenha ficado abaixo do limite de 500 ms, a taxa de falhas foi extremamente alta, indicando que o sistema entrou em degradação ou indisponibilidade durante a execução.

Esse cenário mostra de forma clara que a disponibilidade sob carga é o principal ponto de atenção. A API não atende ao critério de aceite para o teste de carga proposto, e as próximas ações devem focar em diagnóstico de infraestrutura, limites de concorrência e reforço da capacidade de processamento do serviço.
