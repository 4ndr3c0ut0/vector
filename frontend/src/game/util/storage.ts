// Persistencia local simples via localStorage: identidade anonima, ranking local
// e preferencia de audio. Tudo tolerante a ambientes sem localStorage.

import type { LocalScore } from '../types';

const KEY_PLAYER_ID = 'vector.playerId';
const KEY_DISPLAY_NAME = 'vector.displayName';
const KEY_MUTED = 'vector.muted';
const scoresKey = (levelId: string): string => `vector.scores.${levelId}`;

function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* ambiente sem storage: ignora */
  }
}

function uuid(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {
    /* fallback abaixo */
  }
  // Fallback RFC4122 v4 aproximado.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16);
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getPlayerId(): string {
  let id = safeGet(KEY_PLAYER_ID);
  if (!id) {
    id = uuid();
    safeSet(KEY_PLAYER_ID, id);
  }
  return id;
}

export function getDisplayName(): string {
  let name = safeGet(KEY_DISPLAY_NAME);
  if (!name) {
    const suffix = Math.floor(100 + Math.random() * 900);
    name = `VECTOR-${suffix}`;
    safeSet(KEY_DISPLAY_NAME, name);
  }
  return name;
}

export function isMuted(): boolean {
  return safeGet(KEY_MUTED) === '1';
}

export function setMuted(muted: boolean): void {
  safeSet(KEY_MUTED, muted ? '1' : '0');
}

export function getScores(levelId: string): LocalScore[] {
  const raw = safeGet(scoresKey(levelId));
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as LocalScore[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getBestScore(levelId: string): number {
  const scores = getScores(levelId);
  return scores.length > 0 ? scores[0].score : 0;
}

/**
 * Salva uma pontuacao e devolve a posicao (1-based) que ela ocupa no ranking
 * local da fase. Mantem ate 20 entradas ordenadas por score desc, tempo asc.
 */
export function saveScore(levelId: string, entry: LocalScore): number {
  const scores = getScores(levelId);
  scores.push(entry);
  scores.sort((a, b) => b.score - a.score || a.durationMs - b.durationMs);
  const trimmed = scores.slice(0, 20);
  safeSet(scoresKey(levelId), JSON.stringify(trimmed));
  const rank = trimmed.findIndex((s) => s === entry) + 1;
  return rank > 0 ? rank : trimmed.length;
}
