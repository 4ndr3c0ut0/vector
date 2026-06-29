import { LEVEL_ID, LEVEL_VERSION, PALETTE } from '../constants';
import type { LevelDef } from '../types';

// Fase 1 — "Galeria Geotermica Selada".
// Mapa programatico original (docs permite mapa programatico no MVP, pronto para
// migrar a tilemap). Layout, ritmo e posicoes sao proprios (docs/09).
//
// Rota pretendida: subir pela esquerda (pulo) -> resgatar o sobrevivente na
// saliencia sobre a lava -> planar para a galeria central -> desviar de acido e
// cabo -> cortar a parede com plasma -> usar o propulsor para escalar ate a
// zona de extracao a direita.

const ROCK = PALETTE.rockCold;
const METAL = PALETTE.metalWorn;

export const level001: LevelDef = {
  id: LEVEL_ID,
  name: 'Galeria Geotermica Selada',
  version: LEVEL_VERSION,
  world: { width: 1600, height: 540 },
  spawn: { x: 90, y: 450 },
  exit: { x: 1500, y: 232, w: 48, h: 66 },

  platforms: [
    // Lajes de chao (com um vao de lava entre a esquerda e o centro).
    { x: 280, y: 520, w: 560, h: 40, color: ROCK },
    { x: 920, y: 520, w: 400, h: 40, color: ROCK },
    { x: 1360, y: 520, w: 480, h: 40, color: ROCK },

    // Plataformas suspensas.
    { x: 300, y: 412, w: 150, h: 22, color: METAL }, // p1
    { x: 470, y: 330, w: 140, h: 22, color: METAL }, // p2
    { x: 640, y: 250, w: 150, h: 22, color: METAL }, // saliencia do sobrevivente
    { x: 900, y: 372, w: 150, h: 22, color: METAL }, // p3 (rota alta sobre o acido)
    { x: 1300, y: 360, w: 150, h: 22, color: METAL }, // p4 (apoio para escalar)
    { x: 1460, y: 276, w: 190, h: 22, color: METAL }, // saliencia de extracao
  ],

  // Parede de blocos: 3 cortaveis com plasma + 1 reforcado (so cede a demolicao)
  // como lintel superior, ensinando que nem tudo e cortavel.
  breakables: [
    { x: 1180, y: 480, cuttable: true },
    { x: 1180, y: 440, cuttable: true },
    { x: 1180, y: 400, cuttable: true },
    { x: 1180, y: 360, cuttable: false },
  ],

  hazards: [
    { x: 640, y: 524, w: 160, h: 28, kind: 'fatal', label: 'Material fundido' },
    { x: 860, y: 492, w: 120, h: 16, kind: 'damage', label: 'Acido industrial' },
    { x: 1060, y: 470, w: 12, h: 60, kind: 'damage', label: 'Cabo energizado' },
  ],

  batteries: [
    { x: 300, y: 377 },
    { x: 470, y: 295 },
    { x: 900, y: 337 },
    { x: 1300, y: 320 },
  ],

  survivors: [{ x: 640, y: 222 }],
};
