import Phaser from 'phaser';

// Regras de colisao/proximidade especiais centralizadas. As colisoes solidas
// padrao ficam nos colliders do Arcade Physics; aqui vivem as checagens de
// alcance usadas por ferramentas (plasma, carga) e interacoes (resgate).

export class CollisionSystem {
  /** Distancia entre dois objetos com posicao no mundo. */
  static distance(
    a: { x: number; y: number },
    b: { x: number; y: number },
  ): number {
    return Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y);
  }

  /** `target` esta dentro de `range` pixels de `origin`? */
  static withinRange(
    origin: { x: number; y: number },
    target: { x: number; y: number },
    range: number,
  ): boolean {
    return CollisionSystem.distance(origin, target) <= range;
  }
}
