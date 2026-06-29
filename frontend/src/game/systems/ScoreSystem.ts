import { TUNING } from '../constants';

/** Detalhamento da pontuacao para exibir na tela de vitoria. */
export interface ScoreBreakdown {
  base: number;
  timeBonus: number;
  energyBonus: number;
  perfectBonus: number;
  chargeBonus: number;
  total: number;
}

/**
 * Acumula a pontuacao corrente da fase (resgates, cortes, baterias) e calcula a
 * pontuacao final aplicando os bonus de fim de fase (tempo, energia, integridade
 * perfeita e ferramentas economizadas).
 */
export class ScoreSystem {
  value = 0;

  add(points: number): void {
    this.value += points;
  }

  computeFinal(opts: {
    timeLeft: number;
    energyRemaining: number;
    perfectIntegrity: boolean;
    unusedCharges: number;
  }): ScoreBreakdown {
    const base = this.value;
    const timeBonus = Math.max(0, Math.floor(opts.timeLeft)) * TUNING.scorePerSecondLeft;
    const energyBonus = Math.max(0, Math.round(opts.energyRemaining)) * TUNING.scorePerEnergy;
    const perfectBonus = opts.perfectIntegrity ? TUNING.scorePerfectIntegrity : 0;
    const chargeBonus = Math.max(0, opts.unusedCharges) * TUNING.scorePerUnusedCharge;
    const total = base + timeBonus + energyBonus + perfectBonus + chargeBonus;
    return { base, timeBonus, energyBonus, perfectBonus, chargeBonus, total };
  }
}
