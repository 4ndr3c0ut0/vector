# V.E.C.T.O.R.

**V.E.C.T.O.R.** e um jogo web de acao, plataforma e resgate subterraneo com pixel art moderna, iluminacao dinamica e foco em fases curtas e rejogaveis.

O projeto comeca pelo frontend. O backend em Go existe como esqueleto para o MVP 2, quando ranking online e persistencia fizerem sentido.

## Stack

- Frontend: TypeScript, Phaser 3, Vite.
- Backend futuro: Go, Gin.
- Banco futuro: PostgreSQL.
- Cache opcional futuro: Redis.

## Estrutura

```text
docs/
frontend/
backend/
docker-compose.yml
README.md
```

## Rodar Frontend

```bash
cd frontend
npm install
npm run dev
```

Build de producao: `npm run build` (saida em `frontend/dist`, pronta para deploy estatico).

### Controles

- `A` / `D` ou setas: mover.
- `W` / `Espaco` / seta cima: pular (com coyote time e buffer).
- `Shift`: propulsor vetorial (gasta energia, superaquece).
- `E`: resgatar sobrevivente proximo.
- `F`: cortador de plasma (remove blocos cortaveis por perto).
- `Q`: scanner (revela itens, blocos e perigos no alcance).
- `R`: posicionar carga de demolicao (quebra ate blocos reforcados).
- `Esc` / `P`: pausar.
- `M`: ligar/desligar som.

### Objetivo da fase

Resgate o sobrevivente e alcance a zona de extracao antes do timer zerar.
Cuidado com a lava (fatal), o acido e o cabo energizado (dano), a energia e o
calor do propulsor. A pontuacao final soma resgate, cortes, tempo restante,
energia restante, integridade perfeita e cargas economizadas. O melhor placar
fica salvo localmente (localStorage).

### Backend opcional no frontend

O MVP roda 100% offline. Para enviar runs e buscar ranking de um backend, defina
`VITE_API_URL` ao rodar/buildar o frontend (ex.: `VITE_API_URL=http://localhost:8080 npm run dev`).
Sem essa variavel, o jogo ignora o backend e usa apenas o ranking local.

## Rodar Backend Futuro

O backend esta planejado para o MVP 2. Por enquanto ele expoe apenas rotas basicas de contrato.

```bash
cd backend
go mod tidy
go run ./cmd/server
```

## Banco Local Futuro

```bash
docker compose up -d postgres
```

## Documentacao

- [Visao geral](docs/00-visao-geral.md)
- [Game design](docs/01-game-design.md)
- [MVP](docs/02-mvp.md)
- [Arquitetura frontend](docs/03-arquitetura-frontend.md)
- [Arquitetura backend](docs/04-arquitetura-backend.md)
- [API](docs/05-api.md)
- [Banco de dados](docs/06-banco-de-dados.md)
- [Identidade visual](docs/07-identidade-visual.md)
- [Roadmap](docs/08-roadmap.md)
- [Criterios de copyright](docs/09-criterios-copyright.md)
- [Tarefas iniciais](docs/10-tarefas-iniciais.md)

## Diretriz

Faça o jogo ficar divertido antes de investir em backend. Ranking, progresso e conquistas entram depois que o loop principal estiver validado.
