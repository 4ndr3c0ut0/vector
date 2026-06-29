import Phaser from 'phaser';
import { gameConfig } from './game/config';

const game = new Phaser.Game(gameConfig);

// Exposto para automacao/depuracao (smoke tests). Inofensivo em producao.
(window as unknown as { __VECTOR__?: Phaser.Game }).__VECTOR__ = game;
