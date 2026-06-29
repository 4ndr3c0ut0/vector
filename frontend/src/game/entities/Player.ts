import Phaser from 'phaser';
import { TUNING } from '../constants';
import { EnergySystem } from '../systems/EnergySystem';
import { HealthSystem } from '../systems/HealthSystem';
import { AudioSystem } from '../systems/AudioSystem';
import { InputSystem } from '../systems/InputSystem';

// Operador da unidade V.E.C.T.O.R.: movimento lateral preciso, pulo com controle
// no ar, propulsor vetorial limitado por energia e sujeito a superaquecimento,
// e integridade que cai ao tocar perigos.

export class Player extends Phaser.Physics.Arcade.Sprite {
  isThrusting = false;
  heat = 0;
  overheated = false;
  facing: 1 | -1 = 1;

  private lastGroundedAt = -9999;
  private jumpPressedAt = -9999;
  private jumping = false;
  private lastDamageAt = -9999;
  private flashing = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    private readonly energy: EnergySystem,
    private readonly health: HealthSystem,
    private readonly audio: AudioSystem,
  ) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setDepth(20);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(24, 42);
    body.setOffset(2, 2);
    body.setMaxVelocity(420, 720);
  }

  get isInvulnerable(): boolean {
    return this.scene.time.now - this.lastDamageAt < TUNING.damageInvulnMs;
  }

  update(input: InputSystem, delta: number): void {
    const dt = delta / 1000;
    const body = this.body as Phaser.Physics.Arcade.Body;
    const now = this.scene.time.now;
    const onGround = body.blocked.down || body.touching.down;

    this.handleMovement(input, body, onGround);
    this.handleJump(input, body, onGround, now);
    this.handleThrust(input, body, dt);
    this.handleEnergyRegen(dt);
    this.updateFacing(body);
  }

  private handleMovement(
    input: InputSystem,
    body: Phaser.Physics.Arcade.Body,
    onGround: boolean,
  ): void {
    const dir = (input.isDown('moveRight') ? 1 : 0) - (input.isDown('moveLeft') ? 1 : 0);
    const target = dir * TUNING.moveSpeed * (onGround ? 1 : TUNING.airControl);
    const smoothing = onGround ? 0.35 : 0.18;
    body.setVelocityX(Phaser.Math.Linear(body.velocity.x, target, smoothing));
    if (dir !== 0) {
      this.facing = dir > 0 ? 1 : -1;
    }
  }

  private handleJump(
    input: InputSystem,
    body: Phaser.Physics.Arcade.Body,
    onGround: boolean,
    now: number,
  ): void {
    if (onGround) {
      this.lastGroundedAt = now;
      if (body.velocity.y >= 0) {
        this.jumping = false;
      }
    }
    if (input.justDown('jump')) {
      this.jumpPressedAt = now;
    }

    const wantJump = now - this.jumpPressedAt <= TUNING.jumpBufferMs;
    const canJump = onGround || now - this.lastGroundedAt <= TUNING.coyoteMs;
    if (wantJump && canJump && !this.jumping) {
      body.setVelocityY(-TUNING.jumpSpeed);
      this.jumping = true;
      this.jumpPressedAt = -9999;
      this.lastGroundedAt = -9999;
      this.audio.jump();
    }

    // Pulo de altura variavel: soltar cedo corta o impulso.
    if (this.jumping && body.velocity.y < 0 && !input.isDown('jump')) {
      body.setVelocityY(body.velocity.y * 0.45);
      this.jumping = false;
    }
  }

  private handleThrust(
    input: InputSystem,
    body: Phaser.Physics.Arcade.Body,
    dt: number,
  ): void {
    const wants = input.isDown('thrust');
    const canThrust = wants && !this.overheated && this.energy.has(TUNING.thrustMinEnergy);

    if (canThrust && this.energy.consume(TUNING.thrustEnergyPerSec * dt)) {
      body.setVelocityY(Phaser.Math.Linear(body.velocity.y, -TUNING.thrustSpeed, 0.2));
      this.heat = Math.min(TUNING.thrustOverheatAt, this.heat + TUNING.thrustHeatPerSec * dt);
      if (this.heat >= TUNING.thrustOverheatAt) {
        this.overheated = true;
      }
      if (!this.isThrusting) {
        this.audio.startThrust();
      }
      this.isThrusting = true;
    } else {
      if (this.isThrusting) {
        this.audio.stopThrust();
      }
      this.isThrusting = false;
    }

    // Resfriamento quando nao esta propulsionando.
    if (!this.isThrusting) {
      this.heat = Math.max(0, this.heat - TUNING.thrustCoolPerSec * dt);
      if (this.overheated && this.heat <= TUNING.thrustResumeAt) {
        this.overheated = false;
      }
    }
  }

  private handleEnergyRegen(dt: number): void {
    if (!this.isThrusting) {
      this.energy.recover(TUNING.energyRegenPerSec * dt);
    }
  }

  private updateFacing(body: Phaser.Physics.Arcade.Body): void {
    this.setFlipX(this.facing < 0);
    // Inclina levemente o sprite durante o voo para dar peso ao propulsor.
    if (!body.blocked.down) {
      this.setAngle(Phaser.Math.Clamp(body.velocity.x * 0.02, -12, 12));
    } else {
      this.setAngle(0);
    }
  }

  /** Dano discreto (explosao) — respeita invulnerabilidade. Retorna true se morreu. */
  takeHit(amount: number): boolean {
    if (this.isInvulnerable) {
      return false;
    }
    this.lastDamageAt = this.scene.time.now;
    this.flash();
    this.audio.damage();
    return this.health.damage(amount);
  }

  /** Dano continuo de perigo ambiental (por frame). Retorna true se morreu. */
  takeHazardDamage(amount: number): boolean {
    const dead = this.health.damage(amount);
    if (!this.flashing) {
      this.flash();
      this.audio.damage();
    }
    return dead;
  }

  private flash(): void {
    this.flashing = true;
    this.setTintFill(0xffffff);
    this.scene.time.delayedCall(90, () => {
      this.clearTint();
      this.flashing = false;
    });
  }
}
