# Roadmap

## Fase 1: Prototipo Jogavel Local

Objetivo: validar o loop principal no browser.

Entregas:

- Projeto Vite + TypeScript + Phaser.
- Cena principal jogavel.
- Movimento lateral.
- Pulo.
- Propulsor limitado.
- Energia.
- Obstaculo removivel.
- Sobrevivente.
- Timer.
- Vitoria e morte.
- Pontuacao local.

## Fase 2: MVP Browser Publicado

Objetivo: disponibilizar o jogo para testes externos.

Entregas:

- Build otimizado.
- Deploy em Cloudflare Pages, Vercel ou S3/CloudFront.
- Assets iniciais finalizados.
- Uma fase polida.
- HUD claro.
- Audio basico.
- Ajustes de responsividade.
- Coleta manual de feedback.

## Fase 3: Ranking Online

Objetivo: adicionar competicao e rejogabilidade.

Entregas:

- Backend Go + Gin.
- PostgreSQL.
- `GET /health`.
- `POST /api/v1/runs`.
- `GET /api/v1/leaderboard`.
- Ranking por fase.
- Deploy Docker.
- Validacao basica de runs.

## Fase 4: Progressao, Upgrades e Conquistas

Objetivo: criar retencao e metas de longo prazo.

Entregas:

- Jogadores anonimos persistentes.
- Progresso por jogador.
- Upgrades.
- Conquistas.
- Mais fases.
- Objetivos secundarios.
- Balanceamento de economia.

## Fase 5: Editor de Fases ou Geracao Procedural

Objetivo: ampliar conteudo.

Opcoes:

- Editor de fases interno.
- Importacao de mapas Tiled/LDTK.
- Fases proceduralmente geradas.
- Seeds compartilhaveis.
- Ranking por seed.

## Prioridade Geral

1. Diversao local.
2. Polimento visual e controle.
3. Publicacao browser.
4. Ranking.
5. Progressao.
6. Conteudo escalavel.
