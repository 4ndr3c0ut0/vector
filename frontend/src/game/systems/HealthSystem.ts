// Integridade do traje (vida). Perigos ambientais aplicam dano; chegar a zero
// encerra a fase em morte.

export class HealthSystem {
  current: number;

  constructor(readonly max: number) {
    this.current = max;
  }

  get ratio(): number {
    return this.max > 0 ? this.current / this.max : 0;
  }

  get isDead(): boolean {
    return this.current <= 0;
  }

  get isFull(): boolean {
    return this.current >= this.max;
  }

  /** Aplica dano e retorna true se a integridade chegou a zero. */
  damage(amount: number): boolean {
    this.current = Math.max(0, this.current - Math.max(0, amount));
    return this.isDead;
  }

  heal(amount: number): void {
    this.current = Math.min(this.max, this.current + Math.max(0, amount));
  }
}
