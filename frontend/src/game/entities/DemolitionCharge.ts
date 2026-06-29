import Phaser from 'phaser';
import { PALETTE } from '../constants';
import { AudioSystem } from '../systems/AudioSystem';

// Carga de demolicao: armada por um tempo curto, mostra raio de efeito e entao
// explode, quebrando barreiras na area e ferindo quem estiver perto.

export class DemolitionCharge {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    armMs: number,
    radius: number,
    audio: AudioSystem,
    onExplode: (x: number, y: number, radius: number) => void,
  ) {
    const device = scene.add.rectangle(x, y, 16, 16, PALETTE.alert, 1).setDepth(18);
    device.setStrokeStyle(2, PALETTE.plasma, 1);

    const ring = scene.add.circle(x, y, radius, PALETTE.alert, 0.07).setDepth(7);
    ring.setStrokeStyle(2, PALETTE.alert, 0.5);

    // Piscar acelerando ate explodir.
    const blink = scene.tweens.add({
      targets: device,
      alpha: { from: 1, to: 0.3 },
      duration: 220,
      yoyo: true,
      repeat: -1,
    });

    scene.time.delayedCall(armMs, () => {
      blink.remove();
      device.destroy();
      ring.destroy();

      const blast = scene.add.circle(x, y, 10, PALETTE.plasma, 0.8).setDepth(28);
      scene.tweens.add({
        targets: blast,
        radius,
        alpha: 0,
        duration: 320,
        ease: 'Quad.out',
        onComplete: () => blast.destroy(),
      });
      audio.explosion();
      onExplode(x, y, radius);
    });
  }
}
