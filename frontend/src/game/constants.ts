// Identidade visual e parametros de jogo centralizados.
// Paleta retirada de docs/07-identidade-visual.md.

/** Cores como numeros (uso em Phaser graphics, tint, etc). */
export const PALETTE = {
  bgDeep: 0x10131a,
  rockCold: 0x2b3038,
  metalWorn: 0x59616d,
  visorLight: 0x6fffe9,
  plasma: 0xffcc66,
  alert: 0xff4d5e,
  energy: 0x4da3ff,
  toxic: 0x7dff6a,
  uiDark: 0x171b22,
  textLight: 0xe8f0ff,
} as const;

/** Mesmas cores como string CSS (uso em texto e estilos). */
export const CSS = {
  bgDeep: '#10131a',
  rockCold: '#2b3038',
  metalWorn: '#59616d',
  visorLight: '#6fffe9',
  plasma: '#ffcc66',
  alert: '#ff4d5e',
  energy: '#4da3ff',
  toxic: '#7dff6a',
  uiDark: '#171b22',
  textLight: '#e8f0ff',
} as const;

export const FONT = 'monospace';

export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

export const GAME_VERSION = '0.1.0';
export const CLIENT_VERSION = '0.1.0';
export const LEVEL_ID = 'level-001';
export const LEVEL_VERSION = '0.1.0';

/**
 * Parametros de balanceamento. Reunidos aqui para facilitar ajuste de "game feel"
 * sem cacar numeros magicos espalhados pelo codigo.
 */
export const TUNING = {
  // Movimento lateral.
  moveSpeed: 230,
  airControl: 0.85,
  groundAccel: 2600,
  groundFriction: 2200,
  airAccel: 1500,

  // Pulo.
  jumpSpeed: 470,
  coyoteMs: 90, // tolerancia para pular logo apos sair da borda
  jumpBufferMs: 110, // tolerancia para registrar pulo um pouco antes de tocar o chao

  // Propulsor vetorial.
  thrustSpeed: 330, // velocidade vertical alvo enquanto propulsiona
  thrustEnergyPerSec: 30,
  thrustMinEnergy: 6, // carga minima para acionar
  thrustHeatPerSec: 42, // ganho de calor enquanto ativo
  thrustCoolPerSec: 34, // perda de calor quando desligado
  thrustOverheatAt: 100, // trava ao atingir esse calor
  thrustResumeAt: 45, // so libera novamente abaixo desse calor

  // Energia.
  energyMax: 100,
  energyRegenPerSec: 9, // regeneracao passiva quando no chao e sem propulsionar
  rescueEnergyBonus: 25,
  batteryEnergy: 40,

  // Integridade (vida).
  healthMax: 100,
  hazardDamagePerSec: 35, // perigo que machuca por contato continuo
  damageInvulnMs: 700,

  // Ferramentas.
  plasmaRange: 78,
  plasmaEnergyCost: 14,
  plasmaCooldownMs: 280,
  scanEnergyCost: 12,
  scanRange: 240,
  scanRevealMs: 4000,
  scanCooldownMs: 1500,
  chargeCount: 2,
  chargeArmMs: 1400,
  chargeRadius: 110,
  chargeDamage: 55,

  // Fase.
  levelTimeSec: 120,
  timerCriticalSec: 15,

  // Pontuacao (docs/01-game-design.md).
  scoreRescue: 1000,
  scorePerSecondLeft: 10,
  scorePerEnergy: 5,
  scoreBlockCut: 250,
  scoreBattery: 50,
  scorePerfectIntegrity: 500, // bonus se terminar com integridade cheia
  scorePerUnusedCharge: 100, // ferramentas economizadas
} as const;
