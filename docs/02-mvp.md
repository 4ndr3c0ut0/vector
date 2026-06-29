# MVP Inicial

## Objetivo

Construir uma fase jogavel local no browser, sem backend obrigatorio. O MVP deve provar que o loop central de V.E.C.T.O.R. e divertido: movimentar, navegar, usar propulsor, remover obstaculo, resgatar e vencer antes do tempo acabar.

## Escopo do MVP

- Uma fase jogavel.
- Personagem com movimento lateral.
- Pulo.
- Propulsor limitado por energia.
- Colisao com mapa.
- Uma ferramenta para remover obstaculos.
- Um sobrevivente para resgatar.
- Timer.
- Pontuacao.
- Tela inicial.
- Tela de vitoria.
- Tela de morte.

## Fora do MVP

- Backend obrigatorio.
- Login.
- Ranking online.
- Saves persistentes.
- Sistema completo de upgrades.
- Editor de fases.
- Multiplas fases.
- Inimigos complexos.

## Loop de Jogo

1. Jogador inicia na tela inicial.
2. Entra na fase.
3. Explora o mapa.
4. Usa pulo e propulsor para atravessar.
5. Remove um bloco com ferramenta.
6. Resgata um sobrevivente.
7. Chega a zona de extracao.
8. Recebe tela de vitoria com pontuacao.

## Criterios de Aceite

- O projeto roda localmente com `npm run dev` dentro de `frontend`.
- A tela inicial permite iniciar a fase.
- O jogador se move para esquerda e direita com teclado.
- O jogador pula e colide com o chao.
- O propulsor consome energia visivel no HUD.
- Energia nao fica abaixo de zero.
- O jogador nao atravessa paredes solidas.
- Existe pelo menos um obstaculo removivel.
- A ferramenta remove o obstaculo apenas quando o jogador esta proximo.
- Existe um sobrevivente no mapa.
- O sobrevivente e marcado como resgatado ao interagir.
- O timer diminui durante a fase.
- Se o timer chega a zero, a tela de morte aparece.
- Se o jogador cai em uma area fatal, a tela de morte aparece.
- Se o jogador resgata o sobrevivente e alcança a saida, a tela de vitoria aparece.
- A tela de vitoria mostra pontuacao final.
- A tela de morte permite reiniciar.

## Medida de Sucesso

O MVP e bem-sucedido se uma pessoa consegue jogar uma fase completa sem instrucoes externas e entende visualmente:

- Onde esta o jogador.
- Quanta energia resta.
- Quanto tempo resta.
- Qual obstaculo pode ser removido.
- Onde esta o sobrevivente.
- Onde fica a saida.
