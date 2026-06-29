# Game Design

## Historia

Em um futuro proximo, redes subterraneas de mineracao automatizada foram abandonadas depois de falhas geotecnicas. Quando uma cadeia de cavernas industriais entra em colapso, equipes humanas ficam presas em setores isolados.

O jogador assume o papel de um operador da unidade **V.E.C.T.O.R.**: **Veiculo de Extracao, Contencao Tatica e Operacao de Resgate**. A missao e entrar em areas instaveis, localizar sobreviventes, abrir caminho e sair antes do colapso final.

## Personagem Principal

O protagonista e um resgatista tecnico com traje pressurizado compacto, visor luminoso, mochila de propulsao vetorial e ferramentas de corte. O personagem deve parecer funcional, agil e vulneravel, sem capa, helicoptero pessoal, roupa ou silhueta que remeta a personagens existentes.

## Controles

- `A` / seta esquerda: mover para esquerda.
- `D` / seta direita: mover para direita.
- `W` / seta cima / `Espaco`: pular.
- `Shift`: acionar propulsor vetorial.
- `E`: interagir ou resgatar.
- `F`: usar cortador de plasma.
- `Q`: acionar scanner.
- `R`: posicionar carga de demolicao.
- `Esc`: pausar.

No mobile, o jogo pode usar controles virtuais em fase posterior.

## Mecanicas Principais

- Movimento lateral com aceleracao curta e resposta precisa.
- Pulo com controle no ar.
- Propulsor limitado por energia.
- Ferramentas para remover ou contornar obstaculos.
- Resgate de sobreviventes.
- Timer de colapso.
- Pontuacao por tempo, resgate, eficiencia e coleta.
- Perigos ambientais que exigem planejamento.

## Propulsor Vetorial

O propulsor permite aplicar impulso em direcoes controladas. No MVP, ele pode funcionar como impulso vertical ou diagonal simples. Em versoes futuras, pode permitir vetores mais granulares.

Regras:

- Consome energia enquanto ativo.
- Nao pode ser usado sem carga minima.
- Superaquece se usado continuamente por muito tempo.
- Pode ser melhorado com upgrades.
- Gera luz, particulas e ruido que podem atrair inimigos em fases futuras.

## Energia

Energia alimenta propulsor, scanner e ferramentas avancadas.

Fontes de consumo:

- Propulsor vetorial.
- Scanner.
- Cortador de plasma.
- Sistemas de protecao futuros.

Recuperacao:

- Baterias no mapa.
- Estacoes de recarga raras.
- Bonus ao resgatar sobreviventes.

## Scanner

O scanner revela informacoes proximas por alguns segundos:

- Sobreviventes.
- Blocos fragilizados.
- Rotas alternativas.
- Perigos ocultos.
- Itens de energia.

O scanner deve ter alcance limitado e custo de energia para evitar uso constante.

## Cortador de Plasma

Ferramenta de curto alcance usada para remover certos obstaculos.

Regras:

- Funciona apenas em blocos marcados como cortaveis.
- Consome energia ou possui cooldown.
- Gera calor, luz e particulas.
- Pode abrir atalhos, mas tambem liberar perigos.

## Cargas de Demolicao

Explosivos controlados para quebrar barreiras resistentes.

Regras:

- Quantidade limitada por fase.
- Tempo de armamento curto.
- Area de efeito clara no HUD ou no mapa.
- Pode causar dano ao jogador se usado de perto.
- Pode alterar rotas e criar atalhos de alto risco.

## Inimigos

Os inimigos devem ser originais e ligados ao universo do jogo:

- **Drones de manutencao corrompidos**: patrulham trilhos e disparam arcos eletricos.
- **Enxames de sensores quebrados**: seguem fontes de calor.
- **Brocas autonomas**: atravessam blocos em linhas previsiveis.
- **Fungos condutores**: crescem em paredes e causam dano por contato.

No MVP, inimigos podem ficar fora do escopo.

## Perigos Ambientais

- Queda de rochas.
- Gases toxicos.
- Cabos energizados.
- Vapor pressurizado.
- Agua condutiva.
- Acido industrial.
- Areas sem oxigenio.
- Lava fria ou material fundido ficticio.
- Plataformas instaveis.

## Sistema de Resgate

Sobreviventes ficam presos em pontos especificos do mapa. Para resgatar:

1. Localizar com exploracao ou scanner.
2. Alcancar o sobrevivente.
3. Interagir por um curto periodo.
4. Confirmar extração local ou escolta simplificada.

No MVP, o resgate pode ser instantaneo ao pressionar `E` perto do sobrevivente.

## Pontuacao

Pontuacao sugerida:

- Sobrevivente resgatado: +1000.
- Tempo restante: +10 por segundo.
- Energia restante: +5 por ponto.
- Dano evitado: bonus perfeito.
- Ferramentas economizadas: bonus.
- Morte: pontuacao nao entra no ranking padrao.

## Progressao

Progressao futura:

- Fases em setores subterraneos.
- Dificuldade crescente.
- Rotas alternativas.
- Novos perigos.
- Novas ferramentas.
- Objetivos secundarios.

## Upgrades

Upgrades possiveis:

- Tanque de energia maior.
- Propulsor mais eficiente.
- Scanner com maior alcance.
- Cortador de plasma mais rapido.
- Armadura termica.
- Maior capacidade de cargas.

Upgrades devem aumentar opcoes sem eliminar o desafio principal.

## Game Over

O jogador perde quando:

- Vida chega a zero.
- Timer chega a zero.
- Fica preso em condicao sem saida detectavel.
- Falha uma condicao critica da fase.

A tela de morte mostra tempo, pontuacao parcial, causa da falha e opcao de tentar novamente.

## Vitoria de Fase

A fase termina com vitoria quando:

- O sobrevivente obrigatorio foi resgatado.
- O jogador alcançou a zona de extracao.
- O timer ainda esta ativo.

A tela de vitoria mostra pontuacao, tempo restante, energia restante, sobreviventes resgatados e rank local.
