// Tipos compartilhados entre cenas, sistemas e rede.

export type RunResultKind = 'victory' | 'death' | 'abandoned';

export type ToolKind = 'plasma' | 'charge' | 'scanner';

/** Dados passados para a VictoryScene. */
export interface VictoryData {
  baseScore: number;
  finalScore: number;
  timeLeft: number;
  energyRemaining: number;
  integrity: number;
  rescued: number;
  totalSurvivors: number;
  unusedCharges: number;
  perfectIntegrity: boolean;
  durationMs: number;
  localRank: number;
  isRecord: boolean;
}

/** Dados passados para a GameOverScene. */
export interface GameOverData {
  reason: string;
  cause: string; // codigo curto, ex: "timeout", "hazard", "fall"
  partialScore: number;
  timeLeft: number;
  rescued: number;
  totalSurvivors: number;
  durationMs: number;
}

/** Estado consumido pelo HUD a cada frame. */
export interface HUDState {
  energy: number;
  energyMax: number;
  heat: number;
  heatMax: number;
  overheated: boolean;
  integrity: number;
  integrityMax: number;
  score: number;
  rescued: number;
  totalSurvivors: number;
  timeLeft: number;
  timerCritical: boolean;
  charges: number;
  activeTool: ToolKind;
  lowEnergy: boolean;
  muted: boolean;
}

/** Entrada local de ranking (localStorage). */
export interface LocalScore {
  score: number;
  durationMs: number;
  rescued: number;
  createdAt: string;
}

// ----- Esquema de fase (mapa programatico, pronto para migrar para tilemap) -----

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type HazardKind = 'fatal' | 'damage';

export interface PlatformDef extends Rect {
  color?: number;
}

export interface BreakableDef {
  x: number;
  y: number;
  /** true: cortavel com plasma. false: so cede a carga de demolicao. */
  cuttable: boolean;
}

export interface HazardDef extends Rect {
  kind: HazardKind;
  label: string;
}

export interface BatteryDef {
  x: number;
  y: number;
}

export interface SurvivorDef {
  x: number;
  y: number;
}

export interface LevelDef {
  id: string;
  name: string;
  version: string;
  world: { width: number; height: number };
  spawn: { x: number; y: number };
  exit: Rect;
  platforms: PlatformDef[];
  breakables: BreakableDef[];
  hazards: HazardDef[];
  batteries: BatteryDef[];
  survivors: SurvivorDef[];
}
