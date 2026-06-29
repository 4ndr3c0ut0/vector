import Phaser from 'phaser';
import { CSS, FONT, GAME_WIDTH, GAME_HEIGHT, LEVEL_ID, PALETTE } from '../constants';
import { getBestScore } from '../util/storage';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create(): void {
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'vignette').setDepth(50);

    this.add
      .text(GAME_WIDTH / 2, 120, 'V.E.C.T.O.R.', {
        fontFamily: FONT,
        fontSize: '56px',
        color: CSS.visorLight,
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 168, 'Veiculo de Extracao, Contencao Tatica e Operacao de Resgate', {
        fontFamily: FONT,
        fontSize: '14px',
        color: CSS.textLight,
      })
      .setOrigin(0.5);

    this.add
      .text(
        GAME_WIDTH / 2,
        236,
        [
          'A galeria colapsa. Encontre o sobrevivente, abra caminho e extraia',
          'antes do tempo acabar. Cuidado com a energia, o calor e a lava.',
        ],
        { fontFamily: FONT, fontSize: '13px', color: CSS.metalWorn, align: 'center', lineSpacing: 6 },
      )
      .setOrigin(0.5);

    this.add
      .text(
        GAME_WIDTH / 2,
        318,
        [
          'A/D mover    W ou Espaco pular    Shift propulsor',
          'E resgatar    F cortar plasma    Q scanner    R carga',
          'Esc pausar    M som',
        ],
        { fontFamily: FONT, fontSize: '14px', color: CSS.textLight, align: 'center', lineSpacing: 8 },
      )
      .setOrigin(0.5);

    const best = getBestScore(LEVEL_ID);
    if (best > 0) {
      this.add
        .text(GAME_WIDTH / 2, 400, `Melhor pontuacao local: ${best}`, {
          fontFamily: FONT,
          fontSize: '15px',
          color: CSS.plasma,
        })
        .setOrigin(0.5);
    }

    const start = this.add
      .text(GAME_WIDTH / 2, 452, 'ENTER para iniciar a operacao', {
        fontFamily: FONT,
        fontSize: '20px',
        color: CSS.visorLight,
      })
      .setOrigin(0.5);
    this.tweens.add({
      targets: start,
      alpha: { from: 1, to: 0.35 },
      duration: 700,
      yoyo: true,
      repeat: -1,
    });

    const begin = (): void => {
      this.scene.start('GameScene');
    };
    this.input.keyboard?.once('keydown-ENTER', begin);
    this.input.keyboard?.once('keydown-SPACE', begin);
    this.input.once('pointerdown', begin);

    // Marca d'agua de versao.
    this.add
      .text(GAME_WIDTH - 8, GAME_HEIGHT - 6, 'MVP 0.1.0', {
        fontFamily: FONT,
        fontSize: '11px',
        color: CSS.metalWorn,
      })
      .setOrigin(1, 1);

    // Copyright.
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 6, 'Copyright 2026 - Yordan.com.br - Andre Couto', {
        fontFamily: FONT,
        fontSize: '12px',
        color: CSS.textLight,
      })
      .setOrigin(0.5, 1);

    // Pequeno detalhe visual: faiscas de energia subindo.
    this.add.particles(GAME_WIDTH / 2, GAME_HEIGHT, 'particle', {
      x: { min: 0, max: GAME_WIDTH },
      y: GAME_HEIGHT + 8,
      lifespan: 4200,
      speedY: { min: -40, max: -16 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.5, end: 0 },
      tint: PALETTE.energy,
      frequency: 320,
      quantity: 1,
    }).setDepth(40);
  }
}
