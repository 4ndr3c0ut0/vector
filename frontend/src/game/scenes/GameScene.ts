import Phaser from 'phaser';
import {
  CLIENT_VERSION,
  GAME_HEIGHT,
  GAME_WIDTH,
  LEVEL_ID,
  LEVEL_VERSION,
  PALETTE,
  TUNING,
} from '../constants';
import { level001 } from '../maps/level-001';
import { Battery } from '../entities/Battery';
import { BreakableBlock } from '../entities/BreakableBlock';
import { DemolitionCharge } from '../entities/DemolitionCharge';
import { Hazard } from '../entities/Hazard';
import { Player } from '../entities/Player';
import { Survivor } from '../entities/Survivor';
import { AudioSystem } from '../systems/AudioSystem';
import { CollisionSystem } from '../systems/CollisionSystem';
import { EnergySystem } from '../systems/EnergySystem';
import { HealthSystem } from '../systems/HealthSystem';
import { InputSystem } from '../systems/InputSystem';
import { RescueSystem } from '../systems/RescueSystem';
import { ScoreSystem } from '../systems/ScoreSystem';
import { HUD } from '../ui/HUD';
import { submitRun } from '../net/Api';
import type { RunResultKind, ToolKind } from '../types';
import { getBestScore, getDisplayName, getPlayerId, isMuted, saveScore, setMuted } from '../util/storage';

const INTERACT_RANGE = 66;

export class GameScene extends Phaser.Scene {
  private input2!: InputSystem;
  private energy!: EnergySystem;
  private health!: HealthSystem;
  private score!: ScoreSystem;
  private rescue!: RescueSystem;
  private audio!: AudioSystem;
  private hud!: HUD;

  private player!: Player;
  private survivors: Survivor[] = [];
  private breakables: BreakableBlock[] = [];
  private hazards: Hazard[] = [];
  private batteries: Battery[] = [];
  private exitZone!: Phaser.GameObjects.Zone;
  private thrustEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;

  private timeLeft: number = TUNING.levelTimeSec;
  private startTime = 0;
  private charges: number = TUNING.chargeCount;
  private activeTool: ToolKind = 'plasma';
  private finished = false;

  private lastPlasmaAt = -9999;
  private lastScanAt = -9999;
  private lastLowBeepAt = -9999;

  constructor() {
    super('GameScene');
  }

  create(): void {
    this.resetState();

    this.audio = new AudioSystem(isMuted());
    this.audio.resume();

    this.energy = new EnergySystem(TUNING.energyMax);
    this.health = new HealthSystem(TUNING.healthMax);
    this.score = new ScoreSystem();
    this.rescue = new RescueSystem(level001.survivors.length);
    this.input2 = new InputSystem(this);

    this.buildParallax();
    const terrain = this.buildTerrain();
    this.buildBreakables();
    this.buildHazards();
    this.buildBatteries();
    this.buildSurvivors();
    this.buildExit();

    this.player = new Player(
      this,
      level001.spawn.x,
      level001.spawn.y,
      this.energy,
      this.health,
      this.audio,
    );

    this.physics.world.setBounds(0, 0, level001.world.width, level001.world.height);
    this.cameras.main.setBounds(0, 0, level001.world.width, level001.world.height);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setBackgroundColor(PALETTE.bgDeep);

    this.physics.add.collider(this.player, terrain);
    this.physics.add.collider(this.player, this.breakables);
    this.physics.add.overlap(this.player, this.batteries, (_p, b) =>
      this.collectBattery(b as unknown as Battery),
    );

    this.buildThrustEmitter();

    // Vinheta e HUD por ultimo, fixos na camera.
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'vignette').setScrollFactor(0).setDepth(80);
    this.hud = new HUD(this);

    this.startTime = this.time.now;
    this.time.addEvent({ delay: 1000, loop: true, callback: this.tickTimer, callbackScope: this });
  }

  private resetState(): void {
    this.survivors = [];
    this.breakables = [];
    this.hazards = [];
    this.batteries = [];
    this.timeLeft = TUNING.levelTimeSec;
    this.charges = TUNING.chargeCount;
    this.activeTool = 'plasma';
    this.finished = false;
    this.lastPlasmaAt = -9999;
    this.lastScanAt = -9999;
    this.lastLowBeepAt = -9999;
  }

  // ---- Construcao da fase ----

  private buildParallax(): void {
    for (let i = 0; i < 26; i += 1) {
      const x = (i / 26) * level001.world.width + Phaser.Math.Between(-30, 30);
      const y = Phaser.Math.Between(40, 460);
      const size = Phaser.Math.Between(40, 120);
      this.add
        .rectangle(x, y, size, size, PALETTE.rockCold, 0.25)
        .setScrollFactor(0.4)
        .setDepth(-10)
        .setAngle(Phaser.Math.Between(0, 45));
    }
  }

  private buildTerrain(): Phaser.GameObjects.Rectangle[] {
    const bodies: Phaser.GameObjects.Rectangle[] = [];
    for (const p of level001.platforms) {
      const rect = this.add.rectangle(p.x, p.y, p.w, p.h, p.color ?? PALETTE.rockCold);
      rect.setStrokeStyle(2, PALETTE.metalWorn, 0.6);
      rect.setDepth(5);
      this.physics.add.existing(rect, true);
      bodies.push(rect);
    }
    return bodies;
  }

  private buildBreakables(): void {
    for (const b of level001.breakables) {
      this.breakables.push(new BreakableBlock(this, b.x, b.y, b.cuttable));
    }
  }

  private buildHazards(): void {
    for (const h of level001.hazards) {
      this.hazards.push(new Hazard(this, h.x, h.y, h.w, h.h, h.kind, h.label));
    }
  }

  private buildBatteries(): void {
    for (const b of level001.batteries) {
      this.batteries.push(new Battery(this, b.x, b.y));
    }
  }

  private buildSurvivors(): void {
    for (const s of level001.survivors) {
      this.survivors.push(new Survivor(this, s.x, s.y));
    }
  }

  private buildExit(): void {
    const e = level001.exit;
    this.exitZone = this.add.zone(e.x, e.y, e.w, e.h);
    this.physics.add.existing(this.exitZone, true);
    // Marcador visual da zona de extracao.
    const pad = this.add.rectangle(e.x, e.y, e.w, e.h, PALETTE.visorLight, 0.18).setDepth(6);
    pad.setStrokeStyle(2, PALETTE.visorLight, 0.7);
    this.add
      .text(e.x, e.y - e.h / 2 - 12, 'EXTRACAO', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#6fffe9',
      })
      .setOrigin(0.5)
      .setDepth(6);
    this.tweens.add({ targets: pad, alpha: { from: 0.12, to: 0.32 }, duration: 800, yoyo: true, repeat: -1 });
  }

  private buildThrustEmitter(): void {
    this.thrustEmitter = this.add
      .particles(0, 0, 'particle', {
        speedY: { min: 120, max: 240 },
        speedX: { min: -50, max: 50 },
        lifespan: 320,
        scale: { start: 0.7, end: 0 },
        alpha: { start: 0.85, end: 0 },
        tint: [PALETTE.plasma, PALETTE.visorLight],
        blendMode: 'ADD',
        frequency: 16,
        quantity: 2,
        emitting: false,
      })
      .setDepth(18);
  }

  // ---- Loop ----

  update(_time: number, delta: number): void {
    if (this.finished) {
      return;
    }
    const now = this.time.now;

    if (this.input2.justDown('pause')) {
      this.pauseGame();
      return;
    }
    if (this.input2.justDown('mute')) {
      this.toggleMute();
    }

    this.player.update(this.input2, delta);

    if (this.input2.justDown('tool')) {
      this.usePlasma(now);
    }
    if (this.input2.justDown('scan')) {
      this.useScanner(now);
    }
    if (this.input2.justDown('charge')) {
      this.placeCharge();
    }
    if (this.input2.justDown('interact')) {
      this.tryRescue();
    }

    this.updateThrustFx();
    this.updateHazards(delta);
    this.updateLowEnergyWarning(now);
    this.checkExit();

    if (this.health.isDead) {
      this.endDeath('Integridade comprometida', 'integrity');
      return;
    }

    this.hud.update({
      energy: this.energy.current,
      energyMax: this.energy.max,
      heat: this.player.heat,
      heatMax: TUNING.thrustOverheatAt,
      overheated: this.player.overheated,
      integrity: this.health.current,
      integrityMax: this.health.max,
      score: this.score.value,
      rescued: this.rescue.rescued,
      totalSurvivors: this.rescue.total,
      timeLeft: this.timeLeft,
      timerCritical: this.timeLeft <= TUNING.timerCriticalSec,
      charges: this.charges,
      activeTool: this.activeTool,
      lowEnergy: this.energy.ratio < 0.2,
      muted: this.audio.isMuted,
    });
  }

  private updateThrustFx(): void {
    const offset = -this.player.facing * 6;
    this.thrustEmitter.setPosition(this.player.x + offset, this.player.y + 18);
    this.thrustEmitter.emitting = this.player.isThrusting;
  }

  private updateHazards(delta: number): void {
    const dt = delta / 1000;
    for (const hazard of this.hazards) {
      if (!this.physics.overlap(this.player, hazard)) {
        continue;
      }
      if (hazard.kind === 'fatal') {
        this.endDeath(`Contato com ${hazard.label.toLowerCase()}`, 'fatal');
        return;
      }
      this.player.takeHazardDamage(TUNING.hazardDamagePerSec * dt);
    }
  }

  private updateLowEnergyWarning(now: number): void {
    if (this.energy.ratio < 0.2 && now - this.lastLowBeepAt > 1100) {
      this.audio.lowEnergy();
      this.lastLowBeepAt = now;
    }
  }

  private checkExit(): void {
    if (this.rescue.complete && this.physics.overlap(this.player, this.exitZone)) {
      this.endVictory();
    }
  }

  // ---- Ferramentas ----

  private usePlasma(now: number): void {
    if (now - this.lastPlasmaAt < TUNING.plasmaCooldownMs) {
      return;
    }
    this.activeTool = 'plasma';

    let target: BreakableBlock | null = null;
    let blocked = false;
    for (const block of this.breakables) {
      if (!block.active) {
        continue;
      }
      if (CollisionSystem.withinRange(this.player, block, TUNING.plasmaRange)) {
        if (block.cuttable) {
          target = block;
          break;
        }
        blocked = true;
      }
    }

    if (!target) {
      if (blocked) {
        this.audio.uiSelect(); // bloco reforcado: plasma nao corta
      }
      return;
    }

    if (!this.energy.consume(TUNING.plasmaEnergyCost)) {
      return;
    }
    this.lastPlasmaAt = now;
    this.spawnPlasmaFx(target.x, target.y);
    target.break();
    this.score.add(TUNING.scoreBlockCut);
    this.audio.plasma();
  }

  private spawnPlasmaFx(x: number, y: number): void {
    const flash = this.add.circle(x, y, 6, PALETTE.plasma, 0.85).setDepth(28).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: flash, scale: 2.4, alpha: 0, duration: 240, onComplete: () => flash.destroy() });

    const beam = this.add.graphics().setDepth(27);
    beam.lineStyle(2, PALETTE.plasma, 0.85);
    beam.lineBetween(this.player.x, this.player.y, x, y);
    this.tweens.add({ targets: beam, alpha: 0, duration: 180, onComplete: () => beam.destroy() });
  }

  private useScanner(now: number): void {
    if (now - this.lastScanAt < TUNING.scanCooldownMs) {
      return;
    }
    if (!this.energy.consume(TUNING.scanEnergyCost)) {
      return;
    }
    this.lastScanAt = now;
    this.activeTool = 'scanner';
    this.audio.uiSelect();

    const ring = this.add
      .circle(this.player.x, this.player.y, TUNING.scanRange, PALETTE.visorLight, 0)
      .setStrokeStyle(2, PALETTE.visorLight, 0.8)
      .setDepth(60)
      .setScale(0);
    this.tweens.add({
      targets: ring,
      scale: 1,
      alpha: 0,
      duration: 650,
      ease: 'Cubic.out',
      onComplete: () => ring.destroy(),
    });

    this.revealNearby();
  }

  private revealNearby(): void {
    const within = (o: { x: number; y: number; active?: boolean }): boolean =>
      (o.active ?? true) && CollisionSystem.withinRange(this.player, o, TUNING.scanRange);

    for (const s of this.survivors) {
      if (!s.rescued && within(s)) {
        this.highlight(s.x, s.y, 34, 40, PALETTE.plasma);
      }
    }
    for (const b of this.batteries) {
      if (b.active && within(b)) {
        this.highlight(b.x, b.y, 26, 30, PALETTE.energy);
      }
    }
    for (const blk of this.breakables) {
      if (blk.active && within(blk)) {
        this.highlight(blk.x, blk.y, 44, 44, blk.cuttable ? PALETTE.toxic : PALETTE.alert);
      }
    }
    for (const h of this.hazards) {
      if (CollisionSystem.withinRange(this.player, h, TUNING.scanRange)) {
        this.highlight(h.x, h.y, h.width + 8, h.height + 8, PALETTE.alert);
      }
    }
  }

  private highlight(x: number, y: number, w: number, h: number, color: number): void {
    const box = this.add.rectangle(x, y, w, h, 0x000000, 0).setStrokeStyle(2, color, 0.9).setDepth(59);
    this.tweens.add({
      targets: box,
      alpha: { from: 0.9, to: 0 },
      duration: TUNING.scanRevealMs,
      onComplete: () => box.destroy(),
    });
  }

  private placeCharge(): void {
    if (this.charges <= 0) {
      this.audio.uiSelect();
      return;
    }
    this.charges -= 1;
    this.activeTool = 'charge';
    new DemolitionCharge(
      this,
      this.player.x,
      this.player.y + 8,
      TUNING.chargeArmMs,
      TUNING.chargeRadius,
      this.audio,
      (x, y, r) => this.onChargeExplode(x, y, r),
    );
  }

  private onChargeExplode(x: number, y: number, radius: number): void {
    if (this.finished) {
      return;
    }
    this.cameras.main.shake(220, 0.01);
    for (const block of this.breakables) {
      if (block.active && CollisionSystem.withinRange({ x, y }, block, radius)) {
        block.break();
        this.score.add(TUNING.scoreBlockCut);
      }
    }
    if (CollisionSystem.withinRange({ x, y }, this.player, radius)) {
      this.player.takeHit(TUNING.chargeDamage);
    }
  }

  private tryRescue(): void {
    for (const s of this.survivors) {
      if (!s.rescued && CollisionSystem.withinRange(this.player, s, INTERACT_RANGE)) {
        s.rescue();
        this.rescue.markRescued();
        this.score.add(TUNING.scoreRescue);
        this.energy.recover(TUNING.rescueEnergyBonus);
        this.audio.rescue();
        return;
      }
    }
  }

  private collectBattery(battery: Battery): void {
    if (battery.collected) {
      return;
    }
    battery.collect();
    this.energy.recover(TUNING.batteryEnergy);
    this.score.add(TUNING.scoreBattery);
    this.audio.battery();
  }

  // ---- Estados de pausa, fim e timer ----

  private tickTimer(): void {
    if (this.finished) {
      return;
    }
    this.timeLeft -= 1;
    if (this.timeLeft <= TUNING.timerCriticalSec && this.timeLeft > 0) {
      this.audio.timerCritical();
      this.cameras.main.shake(120, 0.004);
    }
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.endDeath('Tempo esgotado: a galeria colapsou', 'timeout');
    }
  }

  private toggleMute(): void {
    const next = !this.audio.isMuted;
    this.audio.setMuted(next);
    setMuted(next);
  }

  private pauseGame(): void {
    this.audio.stopThrust();
    this.thrustEmitter.emitting = false;
    this.scene.launch('PauseScene', { audio: this.audio });
    this.scene.pause();
  }

  private durationMs(): number {
    return Math.round(this.time.now - this.startTime);
  }

  private submit(result: RunResultKind, deathCause: string | null): void {
    void submitRun({
      playerId: getPlayerId(),
      levelId: LEVEL_ID,
      levelVersion: LEVEL_VERSION,
      score: Math.max(0, Math.round(result === 'victory' ? this.lastFinalScore : this.score.value)),
      durationMs: this.durationMs(),
      rescuedSurvivors: this.rescue.rescued,
      totalSurvivors: this.rescue.total,
      energyRemaining: Math.max(0, Math.round(this.energy.current)),
      result,
      deathCause,
      clientVersion: CLIENT_VERSION,
    });
    // displayName fica disponivel para uso futuro do ranking online.
    void getDisplayName();
  }

  private lastFinalScore = 0;

  private endVictory(): void {
    if (this.finished) {
      return;
    }
    this.finished = true;
    this.audio.stopThrust();
    this.thrustEmitter.emitting = false;

    const perfectIntegrity = this.health.isFull;
    const breakdown = this.score.computeFinal({
      timeLeft: this.timeLeft,
      energyRemaining: this.energy.current,
      perfectIntegrity,
      unusedCharges: this.charges,
    });
    this.lastFinalScore = breakdown.total;

    const previousBest = getBestScore(LEVEL_ID);
    const durationMs = this.durationMs();
    const localRank = saveScore(LEVEL_ID, {
      score: breakdown.total,
      durationMs,
      rescued: this.rescue.rescued,
      createdAt: new Date().toISOString(),
    });
    const isRecord = breakdown.total > previousBest;

    this.submit('victory', null);
    this.audio.victory();

    this.scene.start('VictoryScene', {
      baseScore: breakdown.base,
      finalScore: breakdown.total,
      timeLeft: this.timeLeft,
      energyRemaining: this.energy.current,
      integrity: this.health.current,
      rescued: this.rescue.rescued,
      totalSurvivors: this.rescue.total,
      unusedCharges: this.charges,
      perfectIntegrity,
      durationMs,
      localRank,
      isRecord,
    });
  }

  private endDeath(reason: string, cause: string): void {
    if (this.finished) {
      return;
    }
    this.finished = true;
    this.audio.stopThrust();
    this.thrustEmitter.emitting = false;
    this.cameras.main.shake(260, 0.012);

    this.submit('death', cause);
    this.audio.death();

    this.scene.start('GameOverScene', {
      reason,
      cause,
      partialScore: this.score.value,
      timeLeft: this.timeLeft,
      rescued: this.rescue.rescued,
      totalSurvivors: this.rescue.total,
      durationMs: this.durationMs(),
    });
  }
}
