import Phaser from 'phaser';
import { CSS, FONT, GAME_WIDTH, GAME_HEIGHT, PALETTE } from '../constants';
import type { VictoryData } from '../types';

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super('VictoryScene');
  }

  create(data: Partial<VictoryData>): void {
    const d: VictoryData = {
      baseScore: data.baseScore ?? 0,
      finalScore: data.finalScore ?? 0,
      timeLeft: data.timeLeft ?? 0,
      energyRemaining: data.energyRemaining ?? 0,
      integrity: data.integrity ?? 0,
      rescued: data.rescued ?? 0,
      totalSurvivors: data.totalSurvivors ?? 0,
      unusedCharges: data.unusedCharges ?? 0,
      perfectIntegrity: data.perfectIntegrity ?? false,
      durationMs: data.durationMs ?? 0,
      localRank: data.localRank ?? 0,
      isRecord: data.isRecord ?? false,
    };

    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'vignette').setDepth(50);

    this.add
      .text(GAME_WIDTH / 2, 92, 'EXTRACAO CONCLUIDA', {
        fontFamily: FONT,
        fontSize: '40px',
        color: CSS.visorLight,
      })
      .setOrigin(0.5);

    if (d.isRecord) {
      const rec = this.add
        .text(GAME_WIDTH / 2, 138, 'NOVO RECORDE LOCAL!', {
          fontFamily: FONT,
          fontSize: '18px',
          color: CSS.plasma,
        })
        .setOrigin(0.5);
      this.tweens.add({ targets: rec, scale: { from: 1, to: 1.12 }, duration: 500, yoyo: true, repeat: -1 });
    }

    const line = (label: string, value: string): string => `${label.padEnd(26, '.')} ${value}`;
    const perfect = d.perfectIntegrity ? '+500' : '0';
    this.add
      .text(
        GAME_WIDTH / 2,
        250,
        [
          line('Base (resgate/cortes)', `${d.baseScore}`),
          line('Bonus de tempo', `+${d.timeLeft * 10}`),
          line('Bonus de energia', `+${Math.round(d.energyRemaining) * 5}`),
          line('Bonus integridade perfeita', perfect),
          line('Cargas economizadas', `+${d.unusedCharges * 100}`),
        ],
        { fontFamily: FONT, fontSize: '15px', color: CSS.textLight, lineSpacing: 8 },
      )
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 330, `PONTUACAO FINAL: ${d.finalScore}`, {
        fontFamily: FONT,
        fontSize: '26px',
        color: CSS.plasma,
      })
      .setOrigin(0.5);

    this.add
      .text(
        GAME_WIDTH / 2,
        372,
        `Resgatados ${d.rescued}/${d.totalSurvivors}   Tempo ${Math.floor(d.timeLeft)}s   Energia ${Math.round(
          d.energyRemaining,
        )}   Rank local #${d.localRank}`,
        { fontFamily: FONT, fontSize: '14px', color: CSS.metalWorn },
      )
      .setOrigin(0.5);

    const retry = this.add
      .text(GAME_WIDTH / 2, 432, 'ENTER para jogar novamente', {
        fontFamily: FONT,
        fontSize: '20px',
        color: CSS.visorLight,
      })
      .setOrigin(0.5);
    this.tweens.add({ targets: retry, alpha: { from: 1, to: 0.4 }, duration: 700, yoyo: true, repeat: -1 });

    this.add
      .text(GAME_WIDTH / 2, 470, 'Esc para o menu', { fontFamily: FONT, fontSize: '15px', color: CSS.metalWorn })
      .setOrigin(0.5);

    // Comemoracao: faiscas de extracao.
    this.add.particles(GAME_WIDTH / 2, 92, 'particle', {
      lifespan: 1400,
      speed: { min: 40, max: 160 },
      angle: { min: 200, max: 340 },
      scale: { start: 0.7, end: 0 },
      alpha: { start: 0.9, end: 0 },
      tint: [PALETTE.visorLight, PALETTE.plasma],
      frequency: 120,
      quantity: 2,
    }).setDepth(55);

    this.input.keyboard?.once('keydown-ENTER', () => this.scene.start('GameScene'));
    this.input.keyboard?.once('keydown-ESC', () => this.scene.start('MenuScene'));
  }
}
