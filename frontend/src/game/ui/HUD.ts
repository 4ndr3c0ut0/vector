import Phaser from 'phaser';
import { CSS, FONT, GAME_WIDTH, GAME_HEIGHT, PALETTE } from '../constants';
import type { HUDState, ToolKind } from '../types';

// HUD diegetico com barras de integridade, energia e calor, alem de timer de
// colapso, pontuacao, sobreviventes, ferramenta ativa e avisos de estado.

const BAR_X = 66;
const BAR_W = 168;

const TOOL_LABEL: Record<ToolKind, string> = {
  plasma: 'PLASMA',
  charge: 'DEMOLICAO',
  scanner: 'SCANNER',
};

export class HUD {
  private readonly bars: Phaser.GameObjects.Graphics;
  private readonly labelInt: Phaser.GameObjects.Text;
  private readonly labelEne: Phaser.GameObjects.Text;
  private readonly labelHeat: Phaser.GameObjects.Text;
  private readonly timer: Phaser.GameObjects.Text;
  private readonly score: Phaser.GameObjects.Text;
  private readonly rescue: Phaser.GameObjects.Text;
  private readonly tool: Phaser.GameObjects.Text;
  private readonly mute: Phaser.GameObjects.Text;
  private readonly warning: Phaser.GameObjects.Text;
  private readonly hint: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    const small = { fontFamily: FONT, fontSize: '12px', color: CSS.textLight };

    // Painel de fundo dos medidores.
    scene.add
      .rectangle(8, 8, 250, 66, PALETTE.uiDark, 0.55)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(90);

    this.bars = scene.add.graphics().setScrollFactor(0).setDepth(91);

    this.labelInt = scene.add.text(16, 14, 'INT', small).setScrollFactor(0).setDepth(92);
    this.labelEne = scene.add.text(16, 33, 'ENE', small).setScrollFactor(0).setDepth(92);
    this.labelHeat = scene.add.text(16, 52, 'CAL', small).setScrollFactor(0).setDepth(92);

    this.timer = scene.add
      .text(GAME_WIDTH / 2, 18, '', { fontFamily: FONT, fontSize: '26px', color: CSS.textLight })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(92);

    const right = { fontFamily: FONT, fontSize: '14px', color: CSS.textLight };
    this.score = scene.add
      .text(GAME_WIDTH - 16, 14, '', right)
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(92);
    this.rescue = scene.add
      .text(GAME_WIDTH - 16, 34, '', right)
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(92);
    this.tool = scene.add
      .text(GAME_WIDTH - 16, 54, '', right)
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(92);
    this.mute = scene.add
      .text(GAME_WIDTH - 16, 74, '', { fontFamily: FONT, fontSize: '12px', color: CSS.metalWorn })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(92);

    this.warning = scene.add
      .text(GAME_WIDTH / 2, 92, '', { fontFamily: FONT, fontSize: '16px', color: CSS.alert })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(92);

    this.hint = scene.add
      .text(
        GAME_WIDTH / 2,
        GAME_HEIGHT - 18,
        'A/D mover  W/Espaco pular  Shift propulsor  E resgatar  F plasma  Q scanner  R carga  Esc pausar',
        { fontFamily: FONT, fontSize: '11px', color: CSS.metalWorn },
      )
      .setOrigin(0.5, 1)
      .setScrollFactor(0)
      .setDepth(92);
  }

  update(s: HUDState): void {
    this.drawBars(s);

    const mm = Math.floor(Math.max(0, s.timeLeft) / 60);
    const ss = Math.floor(Math.max(0, s.timeLeft) % 60);
    this.timer.setText(`${mm}:${ss.toString().padStart(2, '0')}`);
    this.timer.setColor(s.timerCritical ? CSS.alert : CSS.textLight);
    this.timer.setScale(s.timerCritical ? 1.08 : 1);

    this.score.setText(`SCORE ${s.score}`);
    this.rescue.setText(`RESGATE ${s.rescued}/${s.totalSurvivors}`);
    this.tool.setText(`${TOOL_LABEL[s.activeTool]}  CARGAS ${s.charges}`);
    this.mute.setText(s.muted ? 'SOM: OFF (M)' : 'SOM: ON (M)');

    if (s.overheated) {
      this.warning.setText('PROPULSOR SUPERAQUECIDO');
      this.warning.setColor(CSS.plasma);
      this.warning.setVisible(true);
    } else if (s.lowEnergy) {
      this.warning.setText('ENERGIA BAIXA');
      this.warning.setColor(CSS.alert);
      this.warning.setVisible(true);
    } else {
      this.warning.setVisible(false);
    }
  }

  private drawBars(s: HUDState): void {
    const g = this.bars;
    g.clear();

    const intColor =
      s.integrity / s.integrityMax > 0.6
        ? PALETTE.toxic
        : s.integrity / s.integrityMax > 0.3
          ? PALETTE.plasma
          : PALETTE.alert;
    this.bar(g, BAR_X, 16, s.integrity / s.integrityMax, intColor);

    const eneColor = s.lowEnergy ? PALETTE.alert : PALETTE.energy;
    this.bar(g, BAR_X, 35, s.energy / s.energyMax, eneColor);

    const heatColor = s.overheated ? PALETTE.alert : PALETTE.plasma;
    this.bar(g, BAR_X, 54, s.heat / s.heatMax, heatColor, 8);
  }

  private bar(
    g: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    ratio: number,
    color: number,
    height = 12,
  ): void {
    const clamped = Phaser.Math.Clamp(ratio, 0, 1);
    g.fillStyle(PALETTE.bgDeep, 0.9);
    g.fillRect(x, y, BAR_W, height);
    g.fillStyle(color, 1);
    g.fillRect(x, y, BAR_W * clamped, height);
    g.lineStyle(1, PALETTE.metalWorn, 0.8);
    g.strokeRect(x, y, BAR_W, height);
  }
}
