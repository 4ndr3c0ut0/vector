// Cliente opcional do backend. O MVP roda 100% local: estas chamadas so acontecem
// se VITE_API_URL estiver configurada no build/dev. Qualquer falha e silenciosa
// para nunca atrapalhar a jogabilidade offline.

import { CLIENT_VERSION } from '../constants';
import type { RunResultKind } from '../types';

interface ImportMetaEnvLike {
  VITE_API_URL?: string;
}

function apiBaseUrl(): string | null {
  try {
    const env = (import.meta as unknown as { env?: ImportMetaEnvLike }).env;
    const url = env?.VITE_API_URL;
    return url && url.length > 0 ? url.replace(/\/$/, '') : null;
  } catch {
    return null;
  }
}

export interface RunPayload {
  playerId: string;
  levelId: string;
  levelVersion: string;
  score: number;
  durationMs: number;
  rescuedSurvivors: number;
  totalSurvivors: number;
  energyRemaining: number;
  result: RunResultKind;
  deathCause: string | null;
  clientVersion: string;
}

export interface RunResponse {
  id: string;
  accepted: boolean;
  rankPosition: number | null;
  createdAt: string;
}

export interface LeaderboardEntry {
  position: number;
  playerId: string;
  displayName: string;
  score: number;
  durationMs: number;
  createdAt: string;
}

/** Indica se ha backend configurado para esta build. */
export function isBackendEnabled(): boolean {
  return apiBaseUrl() !== null;
}

export async function submitRun(payload: RunPayload): Promise<RunResponse | null> {
  const base = apiBaseUrl();
  if (!base) {
    return null;
  }
  try {
    const res = await fetch(`${base}/api/v1/runs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, clientVersion: CLIENT_VERSION }),
    });
    if (!res.ok) {
      return null;
    }
    return (await res.json()) as RunResponse;
  } catch {
    return null;
  }
}

export async function fetchLeaderboard(
  levelId: string,
  limit = 10,
): Promise<LeaderboardEntry[] | null> {
  const base = apiBaseUrl();
  if (!base) {
    return null;
  }
  try {
    const res = await fetch(
      `${base}/api/v1/leaderboard?levelId=${encodeURIComponent(levelId)}&limit=${limit}`,
    );
    if (!res.ok) {
      return null;
    }
    const data = (await res.json()) as { entries?: LeaderboardEntry[] };
    return data.entries ?? [];
  } catch {
    return null;
  }
}
