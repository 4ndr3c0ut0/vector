// Audio 100% procedural via Web Audio API. Nenhum asset externo e usado, o que
// mantem o projeto livre de questoes de copyright (docs/09-criterios-copyright.md)
// e reforca a leitura de estado do jogo (docs/03 secao Audio).

type OscType = 'sine' | 'square' | 'sawtooth' | 'triangle';

export class AudioSystem {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private muted: boolean;

  // Loop continuo do propulsor.
  private thrustOsc: OscillatorNode | null = null;
  private thrustGain: GainNode | null = null;
  private thrustOn = false;

  constructor(muted: boolean) {
    this.muted = muted;
  }

  /** Cria o contexto na primeira interacao (politica de autoplay dos browsers). */
  private ensure(): AudioContext | null {
    if (this.ctx) {
      return this.ctx;
    }
    try {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) {
        return null;
      }
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.5;
      this.master.connect(this.ctx.destination);
    } catch {
      this.ctx = null;
    }
    return this.ctx;
  }

  resume(): void {
    const ctx = this.ensure();
    if (ctx && ctx.state === 'suspended') {
      void ctx.resume();
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(muted ? 0 : 0.5, this.ctx.currentTime, 0.02);
    }
    if (muted) {
      this.stopThrust();
    }
  }

  get isMuted(): boolean {
    return this.muted;
  }

  // ---- Primitivos ----

  private tone(
    freq: number,
    durationMs: number,
    type: OscType,
    peak = 0.3,
    glideTo?: number,
  ): void {
    const ctx = this.ensure();
    if (!ctx || !this.master || this.muted) {
      return;
    }
    const now = ctx.currentTime;
    const dur = durationMs / 1000;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (glideTo !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, glideTo), now + dur);
    }
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(peak, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(now);
    osc.stop(now + dur + 0.02);
  }

  private noise(durationMs: number, peak = 0.3, lowpass = 1200): void {
    const ctx = this.ensure();
    if (!ctx || !this.master || this.muted) {
      return;
    }
    const now = ctx.currentTime;
    const dur = durationMs / 1000;
    const frames = Math.floor(ctx.sampleRate * dur);
    const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = lowpass;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(peak, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    src.start(now);
    src.stop(now + dur + 0.02);
  }

  private sequence(notes: { freq: number; at: number; dur: number; type?: OscType }[]): void {
    for (const n of notes) {
      window.setTimeout(() => this.tone(n.freq, n.dur, n.type ?? 'square', 0.28), n.at);
    }
  }

  // ---- Efeitos do jogo ----

  jump(): void {
    this.tone(360, 130, 'square', 0.22, 620);
  }

  plasma(): void {
    this.tone(220, 180, 'sawtooth', 0.22, 90);
    this.noise(160, 0.18, 2600);
  }

  explosion(): void {
    this.noise(420, 0.5, 700);
    this.tone(90, 380, 'sine', 0.4, 40);
  }

  battery(): void {
    this.sequence([
      { freq: 520, at: 0, dur: 80, type: 'triangle' },
      { freq: 780, at: 70, dur: 110, type: 'triangle' },
    ]);
  }

  rescue(): void {
    this.sequence([
      { freq: 523, at: 0, dur: 110 },
      { freq: 659, at: 90, dur: 110 },
      { freq: 784, at: 180, dur: 160 },
    ]);
  }

  lowEnergy(): void {
    this.tone(300, 90, 'square', 0.16);
  }

  timerCritical(): void {
    this.tone(880, 70, 'square', 0.2);
  }

  damage(): void {
    this.tone(160, 120, 'sawtooth', 0.25, 80);
  }

  victory(): void {
    this.sequence([
      { freq: 523, at: 0, dur: 140 },
      { freq: 659, at: 120, dur: 140 },
      { freq: 784, at: 240, dur: 140 },
      { freq: 1046, at: 360, dur: 280 },
    ]);
  }

  death(): void {
    this.tone(440, 700, 'sawtooth', 0.3, 70);
  }

  uiSelect(): void {
    this.tone(660, 90, 'square', 0.2, 880);
  }

  // ---- Loop do propulsor ----

  startThrust(): void {
    if (this.thrustOn || this.muted) {
      return;
    }
    const ctx = this.ensure();
    if (!ctx || !this.master) {
      return;
    }
    this.thrustOn = true;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    osc.type = 'sawtooth';
    osc.frequency.value = 78;
    filter.type = 'lowpass';
    filter.frequency.value = 520;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.05);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    osc.start(now);
    this.thrustOsc = osc;
    this.thrustGain = gain;
  }

  stopThrust(): void {
    if (!this.thrustOn || !this.ctx) {
      this.thrustOn = false;
      return;
    }
    this.thrustOn = false;
    const now = this.ctx.currentTime;
    const osc = this.thrustOsc;
    const gain = this.thrustGain;
    if (gain) {
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
    }
    if (osc) {
      osc.stop(now + 0.12);
    }
    this.thrustOsc = null;
    this.thrustGain = null;
  }

  shutdown(): void {
    this.stopThrust();
  }
}
