# Arquitetura Frontend

## Tecnologias

- TypeScript.
- Phaser 3.
- Vite.
- Canvas/WebGL pelo runtime do Phaser.
- Assets em pixel art moderna.

## Responsabilidades

O frontend e responsavel pelo jogo no MVP 1:

- Renderizacao.
- Input.
- Fisica.
- Colisoes.
- Estados de cena.
- HUD.
- Pontuacao local.
- Regras da fase.

Backend e persistencia entram depois.

## Cenas do Phaser

- `BootScene`: inicializa configuracoes basicas.
- `PreloadScene`: carrega sprites, tilemaps, audio e fontes.
- `MenuScene`: tela inicial.
- `GameScene`: gameplay principal.
- `GameOverScene`: tela de morte.
- `VictoryScene`: tela de vitoria.

## Entidades

- `Player`: movimento, pulo, propulsor, energia e interacoes.
- `Enemy`: base para inimigos futuros.
- `Survivor`: sobrevivente resgatavel.
- `BreakableBlock`: obstaculo removivel por ferramenta.

## Sistemas

- `EnergySystem`: consumo, recarga e limites de energia.
- `ScoreSystem`: calcula pontuacao.
- `RescueSystem`: controla estado de sobreviventes.
- `CollisionSystem`: centraliza regras de colisao especiais.

## Sistema de Input

O input deve ficar centralizado para facilitar suporte futuro a controle e mobile.

Acoes logicas:

- `moveLeft`
- `moveRight`
- `jump`
- `thrust`
- `interact`
- `scan`
- `tool`
- `pause`

## Fisica

Usar Arcade Physics no MVP:

- Gravidade vertical.
- Corpo retangular do jogador.
- Colisao com tiles solidos.
- Overlap com sobrevivente, saida, perigos e itens.

Matter.js pode ser considerado depois se fases futuras exigirem fisica mais complexa.

## Assets

Tipos de assets:

- Spritesheets de personagem.
- Tileset de caverna industrial.
- Objetos interativos.
- Particulas do propulsor.
- Efeitos de plasma.
- UI pixel art.
- Audio curto para acoes.
- Musica ambiente em loop.

## Audio

Audio deve reforcar leitura de estado:

- Propulsor ativo.
- Energia baixa.
- Resgate concluido.
- Perigo proximo.
- Timer critico.
- Vitoria.
- Morte.

## HUD

O HUD deve mostrar:

- Energia.
- Tempo restante.
- Pontuacao.
- Sobreviventes resgatados.
- Ferramenta ativa.

No MVP, usar texto e barras simples. Depois, substituir por UI pixel art.

## Mapa e Tilemap

O MVP pode comecar com mapa programatico simples ou tilemap JSON exportado de Tiled/LDTK. A arquitetura deve permitir migrar para tilemap real.

Camadas sugeridas:

- `background`
- `terrain`
- `breakables`
- `hazards`
- `objects`
- `foreground`

## Estrutura de Pastas

```text
frontend/
  index.html
  package.json
  tsconfig.json
  vite.config.ts
  src/
    main.ts
    game/
      config.ts
      scenes/
        BootScene.ts
        PreloadScene.ts
        MenuScene.ts
        GameScene.ts
        GameOverScene.ts
        VictoryScene.ts
      entities/
        Player.ts
        Enemy.ts
        Survivor.ts
        BreakableBlock.ts
      systems/
        EnergySystem.ts
        ScoreSystem.ts
        RescueSystem.ts
        CollisionSystem.ts
      ui/
        HUD.ts
      maps/
      assets/
```

## Principios

- Gameplay primeiro.
- Cenas pequenas e objetivas.
- Entidades com responsabilidades claras.
- Sistemas reutilizaveis sem excesso de abstracao.
- Nenhum acoplamento obrigatorio com backend no MVP 1.
