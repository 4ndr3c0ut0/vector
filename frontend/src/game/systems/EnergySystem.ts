// Energia alimenta propulsor, scanner e cortador de plasma.
// Nunca fica abaixo de zero nem acima do maximo.

export class EnergySystem {
  current: number;

  constructor(readonly max: number) {
    this.current = max;
  }

  get ratio(): number {
    return this.max > 0 ? this.current / this.max : 0;
  }

  /** Ha energia suficiente para gastar `amount`? */
  has(amount: number): boolean {
    return this.current >= amount && this.current > 0;
  }

  /** Gasta energia se houver saldo. Retorna true se conseguiu gastar tudo. */
  consume(amount: number): boolean {
    if (amount <= 0) {
      return true;
    }
    if (!this.has(amount)) {
      return false;
    }
    this.current = Math.max(0, this.current - amount);
    return true;
  }

  recover(amount: number): void {
    if (amount <= 0) {
      return;
    }
    this.current = Math.min(this.max, this.current + amount);
  }
}
