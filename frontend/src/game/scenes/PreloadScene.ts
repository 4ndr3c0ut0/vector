import Phaser from 'phaser';
import { PALETTE } from '../constants';

// Gera toda a arte do MVP proceduralmente (sem assets externos). Os sprites tem
// silhueta e paleta proprias, atendendo aos criterios de originalidade (docs/09).

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  create(): void {
    this.makePlayer();
    this.makeSurvivor();
    this.makeBreakable();
    this.makeReinforced();
    this.makeBattery();
    this.makeEnemy();
    this.makeParticle();
    this.makeVignette();
    this.scene.start('MenuScene');
  }

  private bake(key: string, w: number, h: number, draw: (g: Phaser.GameObjects.Graphics) => void): void {
    const g = this.add.graphics();
    draw(g);
    g.generateTexture(key, w, h);
    g.destroy();
  }

  // Operador: capacete com visor horizontal, mochila de propulsao a esquerda.
  private makePlayer(): void {
    this.bake('player', 28, 44, (g) => {
      g.fillStyle(PALETTE.energy, 1); // mochila de propulsao
      g.fillRect(1, 13, 6, 18);
      g.fillStyle(PALETTE.plasma, 1); // emissores
      g.fillRect(1, 30, 6, 4);
      g.fillStyle(PALETTE.metalWorn, 1); // torso
      g.fillRect(7, 14, 15, 20);
      g.fillStyle(PALETTE.rockCold, 1); // capacete
      g.fillRect(8, 2, 14, 13);
      g.fillStyle(PALETTE.visorLight, 1); // visor
      g.fillRect(10, 6, 11, 4);
      g.fillStyle(PALETTE.rockCold, 1); // pernas
      g.fillRect(9, 34, 5, 9);
      g.fillRect(16, 34, 5, 9);
      g.fillStyle(PALETTE.metalWorn, 1); // braco
      g.fillRect(21, 16, 4, 12);
    });
  }

  // Sobrevivente: silhueta menor, cor quente, braco erguido pedindo socorro.
  private makeSurvivor(): void {
    this.bake('survivor', 24, 34, (g) => {
      g.fillStyle(PALETTE.textLight, 1); // cabeca
      g.fillRect(8, 2, 8, 8);
      g.fillStyle(PALETTE.plasma, 1); // traje
      g.fillRect(6, 10, 12, 14);
      g.fillStyle(PALETTE.alert, 1); // faixa de sinalizacao
      g.fillRect(6, 16, 12, 3);
      g.fillStyle(PALETTE.plasma, 1); // braco erguido
      g.fillRect(17, 4, 4, 9);
      g.fillStyle(PALETTE.rockCold, 1); // pernas
      g.fillRect(7, 24, 4, 9);
      g.fillRect(13, 24, 4, 9);
    });
  }

  // Bloco fragilizado (cortavel): rocha com veios luminosos.
  private makeBreakable(): void {
    this.bake('breakable', 40, 40, (g) => {
      g.fillStyle(0x33402f, 1);
      g.fillRect(0, 0, 40, 40);
      g.fillStyle(PALETTE.toxic, 0.22);
      g.fillRect(2, 2, 36, 36);
      g.lineStyle(2, PALETTE.toxic, 0.9);
      g.beginPath();
      g.moveTo(6, 10);
      g.lineTo(18, 22);
      g.lineTo(12, 34);
      g.moveTo(30, 6);
      g.lineTo(24, 20);
      g.lineTo(34, 30);
      g.strokePath();
      g.lineStyle(2, PALETTE.metalWorn, 1);
      g.strokeRect(1, 1, 38, 38);
    });
  }

  // Bloco reforcado (so a demolicao remove): metal com rebites e borda de alerta.
  private makeReinforced(): void {
    this.bake('reinforced', 40, 40, (g) => {
      g.fillStyle(PALETTE.metalWorn, 1);
      g.fillRect(0, 0, 40, 40);
      g.fillStyle(PALETTE.rockCold, 1);
      g.fillRect(4, 4, 32, 32);
      g.lineStyle(3, PALETTE.metalWorn, 1);
      g.beginPath();
      g.moveTo(6, 6);
      g.lineTo(34, 34);
      g.moveTo(34, 6);
      g.lineTo(6, 34);
      g.strokePath();
      g.fillStyle(PALETTE.plasma, 1); // rebites
      for (const [bx, by] of [
        [6, 6],
        [32, 6],
        [6, 32],
        [32, 32],
      ]) {
        g.fillRect(bx, by, 3, 3);
      }
      g.lineStyle(2, PALETTE.alert, 0.9);
      g.strokeRect(1, 1, 38, 38);
    });
  }

  private makeBattery(): void {
    this.bake('battery', 18, 24, (g) => {
      g.fillStyle(PALETTE.plasma, 1); // terminal
      g.fillRect(6, 0, 6, 3);
      g.fillStyle(PALETTE.energy, 1);
      g.fillRect(2, 3, 14, 19);
      g.fillStyle(PALETTE.visorLight, 0.9); // carga
      g.fillRect(5, 7, 8, 4);
      g.fillRect(5, 13, 8, 4);
      g.lineStyle(1, PALETTE.textLight, 0.8);
      g.strokeRect(2, 3, 14, 19);
    });
  }

  // Base para inimigos futuros (fora do escopo de gameplay do MVP).
  private makeEnemy(): void {
    this.bake('enemy', 28, 28, (g) => {
      g.fillStyle(PALETTE.alert, 1);
      g.fillRect(2, 8, 24, 14);
      g.fillStyle(PALETTE.rockCold, 1);
      g.fillRect(0, 12, 28, 6);
      g.fillStyle(PALETTE.visorLight, 1);
      g.fillRect(10, 12, 8, 4);
    });
  }

  private makeParticle(): void {
    this.bake('particle', 6, 6, (g) => {
      g.fillStyle(0xffffff, 1);
      g.fillRect(0, 0, 6, 6);
    });
  }

  // Vinheta estatica para clima de caverna sem prejudicar a leitura (centro limpo).
  private makeVignette(): void {
    const tex = this.textures.createCanvas('vignette', 960, 540);
    if (!tex) {
      return;
    }
    const ctx = tex.getContext();
    const grd = ctx.createRadialGradient(480, 270, 140, 480, 270, 560);
    grd.addColorStop(0, 'rgba(16,19,26,0)');
    grd.addColorStop(0.7, 'rgba(16,19,26,0.18)');
    grd.addColorStop(1, 'rgba(16,19,26,0.6)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 960, 540);
    tex.refresh();
  }
}
