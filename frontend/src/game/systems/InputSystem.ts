import Phaser from 'phaser';

// Entrada centralizada em acoes logicas (docs/03-arquitetura-frontend.md).
// Mantem o resto do jogo desacoplado das teclas fisicas, abrindo caminho para
// suporte futuro a controle e mobile.

export type InputAction =
  | 'moveLeft'
  | 'moveRight'
  | 'jump'
  | 'thrust'
  | 'interact'
  | 'scan'
  | 'tool'
  | 'charge'
  | 'pause'
  | 'mute';

const KEY = Phaser.Input.Keyboard.KeyCodes;

const BINDINGS: Record<InputAction, number[]> = {
  moveLeft: [KEY.A, KEY.LEFT],
  moveRight: [KEY.D, KEY.RIGHT],
  jump: [KEY.W, KEY.UP, KEY.SPACE],
  thrust: [KEY.SHIFT],
  interact: [KEY.E],
  scan: [KEY.Q],
  tool: [KEY.F],
  charge: [KEY.R],
  pause: [KEY.ESC, KEY.P],
  mute: [KEY.M],
};

export class InputSystem {
  private readonly keys = new Map<number, Phaser.Input.Keyboard.Key>();

  constructor(scene: Phaser.Scene) {
    const keyboard = scene.input.keyboard;
    if (!keyboard) {
      return;
    }
    for (const codes of Object.values(BINDINGS)) {
      for (const code of codes) {
        if (!this.keys.has(code)) {
          // enableCapture (padrao) evita que Espaco/setas rolem a pagina.
          this.keys.set(code, keyboard.addKey(code));
        }
      }
    }
  }

  /** Alguma tecla da acao esta pressionada agora. */
  isDown(action: InputAction): boolean {
    for (const code of BINDINGS[action]) {
      const key = this.keys.get(code);
      if (key?.isDown) {
        return true;
      }
    }
    return false;
  }

  /** A acao foi pressionada exatamente neste frame (consome o flag). */
  justDown(action: InputAction): boolean {
    let triggered = false;
    for (const code of BINDINGS[action]) {
      const key = this.keys.get(code);
      // Consulta todas as teclas para consumir o flag de cada uma, mesmo que
      // uma anterior ja tenha disparado.
      if (key && Phaser.Input.Keyboard.JustDown(key)) {
        triggered = true;
      }
    }
    return triggered;
  }
}
