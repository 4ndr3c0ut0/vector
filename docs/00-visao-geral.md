# V.E.C.T.O.R. - Visao Geral

## Conceito

**V.E.C.T.O.R.** e um jogo web de acao, exploracao e resgate em cavernas industriais instaveis. O jogador controla uma unidade de resposta equipada com um propulsor vetorial, scanner de vida, cortador de plasma e cargas de demolicao para localizar sobreviventes, atravessar tuneis perigosos e escapar antes que a estrutura colapse.

O jogo usa inspiracao mecanica ampla de jogos classicos de resgate em cavernas: movimentacao precisa, risco constante, gerenciamento de recursos, exploracao de mapas compactos e objetivo claro de salvamento. A identidade, narrativa, personagens, arte, fases, inimigos, nomes e audio devem ser completamente originais.

## Publico-alvo

- Jogadores que gostam de plataformas 2D com desafio arcade.
- Fas de jogos retro com apresentacao moderna.
- Jogadores casuais que querem fases curtas e rejogaveis.
- Jogadores competitivos interessados em ranking, tempo, pontuacao e rotas otimizadas.

## Proposta

Criar uma experiencia rapida, legivel e tensa:

- Entrar em uma zona subterranea.
- Mapear ameacas.
- Resgatar sobreviventes.
- Gerenciar energia e ferramentas.
- Escapar com a melhor pontuacao possivel.

Cada fase deve durar poucos minutos, mas permitir dominio progressivo por meio de rotas alternativas, uso eficiente do propulsor e escolhas de risco.

## Diferencial

- **Propulsor vetorial**: movimento com impulso limitado e direcional, mais expressivo que um pulo comum.
- **Scanner de vida e estrutura**: leitura parcial do mapa, sobreviventes, instabilidade e itens ocultos.
- **Ambientes destrutiveis controlados**: blocos e barreiras removiveis por ferramentas, criando atalhos e riscos.
- **Iluminacao dinamica em pixel art**: cavernas escuras, lanternas, fagulhas, plasma, lava fria, poeira e alarmes.
- **Fases curtas com ranking**: foco em tempo, eficiencia, sobreviventes, energia restante e dano sofrido.

## Visao do Produto

O produto deve nascer como um prototipo local divertido antes de ganhar backend. A primeira prioridade e validar o loop:

1. Mover.
2. Pular.
3. Usar propulsor.
4. Remover obstaculo.
5. Resgatar.
6. Escapar.
7. Pontuar.

Depois disso, entram ranking online, progresso, upgrades, conquistas e fases adicionais.

## Direcao Tecnica

- Frontend: TypeScript, Phaser 3 e Vite.
- Backend futuro: Go com Gin.
- Banco futuro: PostgreSQL.
- Cache opcional: Redis.
- Deploy frontend: Cloudflare Pages, Vercel ou S3/CloudFront.
- Deploy backend: Docker em App Runner, Fly.io, Render ou ECS.

## Principio Pratico

Frontend primeiro. O jogo precisa ficar divertido antes de depender de backend.
