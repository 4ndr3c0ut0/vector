import Phaser from 'phaser';
import { PALETTE } from '../constants';
import type { HazardKind } from '../types';

// Perigo ambiental. `fatal` mata por contato (lava fria, poco); `damage` causa
// dano continuo (acido, cabo energizado).

export class Hazard extends Phaser.GameObjects.Rectangle {
  readonly kind: HazardKind;
  readonly label: string;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    kind: HazardKind,
    label: string,
  ) {
    const color = kind === 'fatal' ? PALETTE.plasma : PALETTE.toxic;
    super(scene, x, y, width, height, color, kind === 'fatal' ? 0.55 : 0.4);
    this.kind = kind;
    this.label = label;
    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.setDepth(8);

    // Brilho pulsante para sinalizar perigo.
    scene.tweens.add({
      targets: this,
      alpha: kind === 'fatal' ? { from: 0.45, to: 0.75 } : { from: 0.3, to: 0.55 },
      duration: kind === 'fatal' ? 520 : 780,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });

    // Borda de alerta no topo da area perigosa.
    const stripe = scene.add.rectangle(
      x,
      y - height / 2 + 2,
      width,
      4,
      kind === 'fatal' ? PALETTE.alert : PALETTE.energy,
      0.9,
    );
    stripe.setDepth(9);
  }
}
