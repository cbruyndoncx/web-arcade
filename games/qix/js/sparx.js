/**
 * NEO-QIX Sparx & Super Sparx Enemy Engine
 * High-speed boundary patrolling drones with directional bias,
 * transformation into Super Sparx, and player tracking.
 */

export class Sparx {
  constructor(grid, options = {}) {
    this.grid = grid;
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.prevX = this.x;
    this.prevY = this.y;

    // Movement direction bias: 1 for clockwise, -1 for counter-clockwise
    this.direction = options.direction || 1;
    this.speed = options.speed || 1.0; // steps per move
    this.moveTimer = 0;
    this.moveInterval = options.moveInterval || 3; // frames per step

    this.isSuper = false;
    this.frozenTimer = 0;
    this.rotation = 0;
  }

  setSuper(isSuper = true) {
    this.isSuper = isSuper;
    if (this.isSuper) {
      this.moveInterval = 2; // Super Sparx move faster
    }
  }

  freeze(durationFrames = 300) {
    this.frozenTimer = durationFrames;
  }

  update(playerPos, particleSystem, dt = 1) {
    this.rotation += (this.isSuper ? 0.25 : 0.15) * dt;

    if (this.frozenTimer > 0) {
      this.frozenTimer -= dt;
      return;
    }

    this.moveTimer += dt;
    if (this.moveTimer >= this.moveInterval) {
      this.moveTimer = 0;
      this._step(playerPos);

      // Emit boundary spark trail
      if (particleSystem && Math.random() < 0.4) {
        const color = this.isSuper ? '#ff0033' : '#ffff00';
        particleSystem.emitSparks(
          this.x * (600 / this.grid.width),
          this.y * (600 / this.grid.height),
          2,
          color,
          1.5
        );
      }
    }
  }

  _step(playerPos) {
    // Current cell must be on border. If territory partition pushed us off, snap to closest border.
    if (!this.grid.isBorder(this.x, this.y)) {
      this._snapToBorder();
      return;
    }

    // Candidate 4-way neighbors
    const dirs = [
      { dx: 1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: -1 }
    ];

    const validNeighbors = [];
    for (const d of dirs) {
      const nx = this.x + d.dx;
      const ny = this.y + d.dy;
      if (this.grid.isBorder(nx, ny)) {
        validNeighbors.push({ x: nx, y: ny, dx: d.dx, dy: d.dy });
      }
    }

    if (validNeighbors.length === 0) {
      this._snapToBorder();
      return;
    }

    // Filter out immediate reverse step if other forward paths exist
    let forwardCandidates = validNeighbors.filter(
      p => !(p.x === this.prevX && p.y === this.prevY)
    );
    if (forwardCandidates.length === 0) {
      forwardCandidates = validNeighbors;
    }

    let nextCell;

    if (this.isSuper && playerPos) {
      // Super Sparx: prioritize step reducing Manhattan distance to player
      forwardCandidates.sort((a, b) => {
        const distA = Math.hypot(a.x - playerPos.x, a.y - playerPos.y);
        const distB = Math.hypot(b.x - playerPos.x, b.y - playerPos.y);
        return distA - distB;
      });
      nextCell = forwardCandidates[0];
    } else {
      // Normal Sparx: sort candidates based on clockwise / counter-clockwise heading
      if (this.direction === 1) {
        // Clockwise bias
        nextCell = forwardCandidates[0];
      } else {
        // Counter-clockwise bias
        nextCell = forwardCandidates[forwardCandidates.length - 1];
      }
    }

    this.prevX = this.x;
    this.prevY = this.y;
    this.x = nextCell.x;
    this.y = nextCell.y;
  }

  _snapToBorder() {
    const pt = this.grid.findClosestBorderCell(this.x, this.y);
    this.x = pt.x;
    this.y = pt.y;
    this.prevX = pt.x;
    this.prevY = pt.y;
  }

  checkCollisionWithPlayer(px, py, tolerance = 2.5) {
    return Math.hypot(this.x - px, this.y - py) <= tolerance;
  }

  checkCollisionWithStix(stixPoints, tolerance = 2.0) {
    if (!stixPoints || stixPoints.length < 2) return false;
    for (let i = 0; i < stixPoints.length; i++) {
      const pt = stixPoints[i];
      if (Math.hypot(this.x - pt.x, this.y - pt.y) <= tolerance) {
        return true;
      }
    }
    return false;
  }

  draw(ctx, scaleX, scaleY) {
    ctx.save();
    const cx = this.x * scaleX;
    const cy = this.y * scaleY;
    const isFrozen = this.frozenTimer > 0;

    ctx.translate(cx, cy);
    ctx.rotate(this.rotation);

    const mainColor = isFrozen ? '#a0f0ff' : (this.isSuper ? '#ff0055' : '#ffff00');
    const glowColor = isFrozen ? '#00ffff' : (this.isSuper ? '#ff3300' : '#ffea00');

    ctx.fillStyle = mainColor;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 12;

    // Glowing 4-pointed diamond star
    const starRadius = this.isSuper ? 6 : 5;
    ctx.beginPath();
    ctx.moveTo(0, -starRadius * 1.4);
    ctx.lineTo(starRadius * 0.35, -starRadius * 0.35);
    ctx.lineTo(starRadius * 1.4, 0);
    ctx.lineTo(starRadius * 0.35, starRadius * 0.35);
    ctx.lineTo(0, starRadius * 1.4);
    ctx.lineTo(-starRadius * 0.35, starRadius * 0.35);
    ctx.lineTo(-starRadius * 1.4, 0);
    ctx.lineTo(-starRadius * 0.35, -starRadius * 0.35);
    ctx.closePath();
    ctx.fill();

    // Hot central core
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(0, 0, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
