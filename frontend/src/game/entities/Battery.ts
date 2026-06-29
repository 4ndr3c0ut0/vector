import Phaser from 'phaser';
import { PALETTE } from '../constants';

// Bateria de recarga. Recupera energia ao ser coletada por contato.

export class Battery extends Phaser.Physics.Arcade.Sprite {
  collected = false;
  private readonly halo: Phaser.GameObjects.Arc;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'battery');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(12);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);

    this.halo = scene.add.circle(x, y, 18, PALETTE.energy, 0.2).setDepth(11);
    scene.tweens.add({
      targets: [this, this.halo],
      y: y - 6,
      duration: 1100,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });
  }

  collect(): void {
    if (this.collected) {
      return;
    }
    this.collected = true;
    this.halo.destroy();
    const flash = this.scene.add.circle(this.x, this.y, 10, PALETTE.energy, 0.7).setDepth(26);
    this.scene.tweens.add({
      targets: flash,
      scale: 3,
      alpha: 0,
      duration: 320,
      onComplete: () => flash.destroy(),
    });
    this.disableBody(true, true);
    this.destroy();
  }
}
