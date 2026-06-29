import Phaser from 'phaser';
import { CSS, FONT, GAME_WIDTH, GAME_HEIGHT, PALETTE } from '../constants';
import { AudioSystem } from '../systems/AudioSystem';
import { setMuted } from '../util/storage';

interface PauseData {
  audio?: AudioSystem;
}

// Overlay de pausa sobre a GameScene (lancada com scene.launch enquanto a
// GameScene fica em scene.pause).
export class PauseScene extends Phaser.Scene {
  private audio?: AudioSystem;
  private muteText?: Phaser.GameObjects.Text;

  constructor() {
    super('PauseScene');
  }

  create(data: PauseData): void {
    this.audio = data.audio;

    this.add
      .rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, PALETTE.bgDeep, 0.72)
      .setOrigin(0, 0);

    this.add
      .text(GAME_WIDTH / 2, 190, 'PAUSADO', { fontFamily: FONT, fontSize: '40px', color: CSS.visorLight })
      .setOrigin(0.5);

    this.add
      .text(
        GAME_WIDTH / 2,
        268,
        ['Esc / P  continuar', 'ENTER  abandonar e voltar ao menu'],
        { fontFamily: FONT, fontSize: '18px', color: CSS.textLight, align: 'center', lineSpacing: 10 },
      )
      .setOrigin(0.5);

    this.muteText = this.add
      .text(GAME_WIDTH / 2, 340, '', { fontFamily: FONT, fontSize: '16px', color: CSS.plasma })
      .setOrigin(0.5);
    this.refreshMute();

    this.input.keyboard?.on('keydown-ESC', this.resumeGame, this);
    this.input.keyboard?.on('keydown-P', this.resumeGame, this);
    this.input.keyboard?.on('keydown-ENTER', this.abandon, this);
    this.input.keyboard?.on('keydown-M', this.toggleMute, this);
  }

  private refreshMute(): void {
    if (this.muteText) {
      this.muteText.setText(this.audio?.isMuted ? 'Som: OFF  (M para ligar)' : 'Som: ON  (M para desligar)');
    }
  }

  private toggleMute(): void {
    if (!this.audio) {
      return;
    }
    const next = !this.audio.isMuted;
    this.audio.setMuted(next);
    setMuted(next);
    this.refreshMute();
  }

  private resumeGame(): void {
    this.scene.resume('GameScene');
    this.scene.stop();
  }

  private abandon(): void {
    this.scene.stop('GameScene');
    this.scene.start('MenuScene');
  }
}
