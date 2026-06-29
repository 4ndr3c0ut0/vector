import Phaser from 'phaser';
import { PALETTE } from '../constants';

// Sobrevivente preso no mapa. Pulsa um halo para ser legivel mesmo no escuro
// (criterio de sucesso do MVP: o jogador precisa enxergar onde resgatar).

export class Survivor extends Phaser.Physics.Arcade.Sprite {
  rescued = false;
  private readonly halo: Phaser.GameObjects.Arc;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'survivor');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(15);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);

    this.halo = scene.add.circle(x, y, 26, PALETTE.plasma, 0.18).setDepth(14);
    scene.tweens.add({
      targets: this.halo,
      scale: { from: 0.8, to: 1.25 },
      alpha: { from: 0.22, to: 0.08 },
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });
  }

  /** Sinal luminoso ascendente ao concluir o resgate. */
  rescue(): void {
    this.rescued = true;
    const beam = this.scene.add
      .rectangle(this.x, this.y, 10, 40, PALETTE.visorLight, 0.8)
      .setDepth(30);
    this.scene.tweens.add({
      targets: beam,
      y: this.y - 90,
      alpha: 0,
      scaleX: 0.2,
      duration: 600,
      ease: 'Cubic.out',
      onComplete: () => beam.destroy(),
    });
    this.halo.destroy();
    this.setVisible(false);
    this.disableBody(true, true);
  }
}
