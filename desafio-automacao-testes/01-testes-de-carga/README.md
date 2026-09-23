# Tarefa 1 - Testes de carga com k6

## Objetivo

Simular 100 usuários virtuais por 5 minutos para validar o comportamento da aplicação sob carga.

## Requisitos

- k6 instalado
- Acesso à API alvo (neste exemplo: https://serverest.dev/produtos)

## Instalação

### Linux / WSL

```bash
sudo apt-get update
sudo apt-get install -y gnupg
curl -s https://dl.k6.io/key.gpg | sudo gpg --dearmor -o /etc/apt/keyrings/k6.gpg
echo 'deb [signed-by=/etc/apt/keyrings/k6.gpg] https://dl.k6.io/deb stable main' | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install -y k6
```

### Windows

```powershell
winget install grafana.k6
```

## Execução

```bash
cd desafio-automacao-testes/01-testes-de-carga
k6 run scripts/load-test.js
```

## Critérios de aceite

- `vus`: 100
- `duration`: 5m
- `http_req_failed` menor que 1%
- `http_req_duration` p(95) menor que 500ms
- Verificação do status HTTP 200

## Métricas principais

- `http_req_duration`
- `http_req_failed`
- `http_reqs`
- `vus_max`
