import Phaser from 'phaser';
import { PALETTE } from '../constants';

// Obstaculo removivel. Blocos `cuttable` cedem ao cortador de plasma; os demais
// (reforcados) so caem com carga de demolicao.

export class BreakableBlock extends Phaser.Physics.Arcade.Sprite {
  readonly cuttable: boolean;

  constructor(scene: Phaser.Scene, x: number, y: number, cuttable = true) {
    super(scene, x, y, cuttable ? 'breakable' : 'reinforced');
    this.cuttable = cuttable;
    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.setDepth(10);
  }

  /** Quebra o bloco com um pequeno estilhacar de particulas. */
  break(): void {
    if (!this.active) {
      return;
    }
    this.emitDebris();
    this.disableBody(true, true);
    this.destroy();
  }

  private emitDebris(): void {
    const color = this.cuttable ? PALETTE.toxic : PALETTE.metalWorn;
    for (let i = 0; i < 8; i += 1) {
      const shard = this.scene.add.rectangle(
        this.x + Phaser.Math.Between(-12, 12),
        this.y + Phaser.Math.Between(-12, 12),
        Phaser.Math.Between(3, 7),
        Phaser.Math.Between(3, 7),
        color,
      );
      shard.setDepth(25);
      this.scene.tweens.add({
        targets: shard,
        x: shard.x + Phaser.Math.Between(-40, 40),
        y: shard.y + Phaser.Math.Between(-50, 10),
        alpha: 0,
        angle: Phaser.Math.Between(-180, 180),
        duration: 420,
        ease: 'Quad.out',
        onComplete: () => shard.destroy(),
      });
    }
  }
}
