/**
 * NEO-QIX Power-up & Cyber Core System
 * Spawns collectable tactical cores inside unclaimed territory.
 * Cores are collected when captured inside closed territory polygons.
 */

export const POWERUP_TYPES = {
  EMP: {
    id: 'emp',
    name: 'EMP STUN',
    color: '#00e5ff',
    icon: '⚡',
    duration: 300, // frames (~5s)
    description: 'Freezes Qix & Sparx'
  },
  SHIELD: {
    id: 'shield',
    name: 'NANO SHIELD',
    color: '#00ff88',
    icon: '🛡️',
    duration: 0, // 1-hit absorb
    description: 'Absorbs 1 Lethal Hit'
  },
  SPEED: {
    id: 'speed',
    name: 'HYPER DRIVE',
    color: '#ffaa00',
    icon: '🚀',
    duration: 400, // frames (~6.5s)
    description: '2x Draw & Move Speed'
  },
  MULTIPLIER: {
    id: 'multiplier',
    name: '3X MULTIPLIER',
    color: '#ff00aa',
    icon: '💎',
    duration: 0, // applies to next capture
    description: 'Triple Points On Next Cut'
  }
};

export class PowerupManager {
  constructor(grid) {
    this.grid = grid;
    this.activeCores = [];
    this.spawnTimer = 0;
    this.spawnInterval = 700; // frames (~11s)
  }

  reset() {
    this.activeCores = [];
    this.spawnTimer = 0;
  }

  update(particleSystem) {
    this.spawnTimer++;
    if (this.spawnTimer >= this.spawnInterval && this.activeCores.length < 3) {
      this.spawnTimer = 0;
      this.spawnRandomCore();
    }

    // Update active cores (lifespan and floating animation)
    for (let i = this.activeCores.length - 1; i >= 0; i--) {
      const core = this.activeCores[i];
      core.life--;
      core.pulseAngle += 0.08;

      // Despawn if time expired
      if (core.life <= 0) {
        this.activeCores.splice(i, 1);
        continue;
      }

      // Despawn or collect if territory around it got captured
      const cellVal = this.grid.get(core.x, core.y);
      if (cellVal === 2 || cellVal === 3) { // CELL_FILLED_FAST or CELL_FILLED_SLOW
        // Core was captured!
        // The game loop will collect it during partition check
      }
    }
  }

  spawnRandomCore() {
    const keys = Object.keys(POWERUP_TYPES);
    const typeKey = keys[Math.floor(Math.random() * keys.length)];
    const type = POWERUP_TYPES[typeKey];

    // Find an empty cell with a margin from borders
    let found = false;
    let attempts = 0;
    let cx = 0, cy = 0;

    while (!found && attempts < 50) {
      attempts++;
      cx = 20 + Math.floor(Math.random() * (this.grid.width - 40));
      cy = 20 + Math.floor(Math.random() * (this.grid.height - 40));

      if (this.grid.isEmpty(cx, cy)) {
        found = true;
      }
    }

    if (found) {
      this.activeCores.push({
        x: cx,
        y: cy,
        type,
        life: 900, // ~15 seconds
        maxLife: 900,
        pulseAngle: 0
      });
    }
  }

  /**
   * Checks which cores were captured by a territory fill
   */
  checkCapturedCores() {
    const collected = [];
    for (let i = this.activeCores.length - 1; i >= 0; i--) {
      const core = this.activeCores[i];
      if (this.grid.isFilled(core.x, core.y)) {
        collected.push(core.type);
        this.activeCores.splice(i, 1);
      }
    }
    return collected;
  }

  draw(ctx, scaleX, scaleY) {
    ctx.save();
    for (const core of this.activeCores) {
      const cx = core.x * scaleX;
      const cy = core.y * scaleY;
      const pulse = Math.sin(core.pulseAngle) * 3;
      const radius = 9 + pulse;
      const alpha = Math.min(1, core.life / 60); // fade out at end

      ctx.globalAlpha = alpha;
      ctx.fillStyle = core.type.color;
      ctx.shadowColor = core.type.color;
      ctx.shadowBlur = 15;

      // Hexagonal cyber core container
      ctx.beginPath();
      for (let a = 0; a < 6; a++) {
        const angle = (Math.PI / 3) * a + core.pulseAngle * 0.5;
        const hx = cx + Math.cos(angle) * radius;
        const hy = cy + Math.sin(angle) * radius;
        if (a === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.fill();

      // Inner icon or white center
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 4;
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(core.type.icon, cx, cy);
    }
    ctx.restore();
  }
}
