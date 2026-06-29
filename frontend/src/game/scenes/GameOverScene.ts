import Phaser from 'phaser';
import { CSS, FONT, GAME_WIDTH, GAME_HEIGHT } from '../constants';
import type { GameOverData } from '../types';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create(data: Partial<GameOverData>): void {
    const reason = data.reason ?? 'Operador perdido';
    const partialScore = data.partialScore ?? 0;
    const timeLeft = data.timeLeft ?? 0;
    const rescued = data.rescued ?? 0;
    const total = data.totalSurvivors ?? 1;

    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'vignette').setDepth(50);

    this.add
      .text(GAME_WIDTH / 2, 150, 'MISSAO FALHOU', { fontFamily: FONT, fontSize: '44px', color: CSS.alert })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 212, reason, { fontFamily: FONT, fontSize: '20px', color: CSS.textLight })
      .setOrigin(0.5);

    this.add
      .text(
        GAME_WIDTH / 2,
        286,
        [
          `Pontuacao parcial: ${partialScore}`,
          `Sobreviventes resgatados: ${rescued}/${total}`,
          `Tempo restante: ${Math.max(0, Math.floor(timeLeft))}s`,
        ],
        { fontFamily: FONT, fontSize: '16px', color: CSS.metalWorn, align: 'center', lineSpacing: 8 },
      )
      .setOrigin(0.5);

    const retry = this.add
      .text(GAME_WIDTH / 2, 392, 'ENTER para tentar novamente', {
        fontFamily: FONT,
        fontSize: '20px',
        color: CSS.visorLight,
      })
      .setOrigin(0.5);
    this.tweens.add({ targets: retry, alpha: { from: 1, to: 0.4 }, duration: 700, yoyo: true, repeat: -1 });

    this.add
      .text(GAME_WIDTH / 2, 432, 'Esc para o menu', { fontFamily: FONT, fontSize: '15px', color: CSS.metalWorn })
      .setOrigin(0.5);

    this.input.keyboard?.once('keydown-ENTER', () => this.scene.start('GameScene'));
    this.input.keyboard?.once('keydown-ESC', () => this.scene.start('MenuScene'));
  }
}
