// Controla o estado de resgate dos sobreviventes da fase.

export class RescueSystem {
  rescued = 0;

  constructor(readonly total: number) {}

  get complete(): boolean {
    return this.rescued >= this.total;
  }

  get remaining(): number {
    return Math.max(0, this.total - this.rescued);
  }

  markRescued(): void {
    this.rescued = Math.min(this.total, this.rescued + 1);
  }
}
