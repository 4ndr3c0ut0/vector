# Arquitetura Backend

## Papel do Backend

O backend nao e obrigatorio no MVP 1. O primeiro prototipo deve ser jogavel localmente apenas com frontend.

Mesmo assim, a arquitetura deve ser planejada desde o comeco para evitar retrabalho quando entrarem ranking online, progresso, saves, conquistas e telemetria.

## Tecnologias

- Go.
- Gin.
- PostgreSQL.
- Migrations SQL.
- Docker.
- Redis opcional para cache e rate limit.

## Escopo Inicial do Backend

Para o primeiro prototipo com backend, manter apenas:

- `GET /health`
- `POST /api/v1/runs`
- `GET /api/v1/leaderboard`

Os demais endpoints podem ser preparados no contrato, mas implementados depois.

## Modulos

- `cmd/server`: ponto de entrada.
- `internal/config`: variaveis de ambiente.
- `internal/http`: rotas e handlers.
- `internal/models`: modelos de dominio.
- `migrations`: SQL versionado.

## PostgreSQL

Usar PostgreSQL como fonte de verdade para:

- Jogadores.
- Fases.
- Tentativas.
- Ranking.
- Progresso.
- Conquistas.

## Migrations

Migrations devem ser arquivos SQL versionados:

- `000001_init.up.sql`
- `000001_init.down.sql`

Ferramentas possiveis:

- `golang-migrate/migrate`
- `pressly/goose`
- `atlas`

## REST API

A API deve ser simples, versionada e previsivel:

- Prefixo: `/api/v1`
- JSON como formato padrao.
- Status HTTP semanticos.
- IDs UUID.
- Timestamps em ISO 8601.

## Autenticacao Futura

No inicio, permitir jogador anonimo. Depois:

- Login por email magic link.
- OAuth opcional.
- Vinculo de jogador anonimo a conta real.
- Tokens JWT ou sessoes assinadas.

## Ranking

Ranking deve aceitar filtros:

- Fase.
- Periodo.
- Versao da fase.
- Tipo de ranking: pontuacao, tempo, resgates.

Validacoes importantes:

- Rejeitar score negativo.
- Registrar versao do cliente.
- Registrar duracao da run.
- Preparar telemetria anti-abuso futura.

## Saves e Progresso

Salvar:

- Fases desbloqueadas.
- Melhor pontuacao por fase.
- Melhor tempo por fase.
- Upgrades comprados.
- Conquistas.

## Telemetria Basica

Eventos futuros:

- Inicio de fase.
- Fim de fase.
- Morte e causa.
- Uso de ferramenta.
- Resgate.
- Tempo ate abandono.

Telemetria deve ser agregada e respeitar privacidade.

## Deploy

Opcoes:

- Docker + AWS App Runner.
- Fly.io.
- Render.
- ECS.

Configurar por ambiente:

- `PORT`
- `DATABASE_URL`
- `REDIS_URL`
- `CORS_ORIGINS`
- `ENV`
