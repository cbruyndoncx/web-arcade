/**
 * NEO-QIX Entity
 * The iconic undulating, spiraling geometric helix ribbon.
 * Features realistic bouncing physics, chaotic momentum, vector phosphor trails,
 * line segment collision detection, and near-miss sensing.
 */

function ccw(A, B, C) {
  return (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
}

function segmentsIntersect(A, B, C, D) {
  // Fast Bounding Box check
  if (Math.min(A.x, B.x) > Math.max(C.x, D.x) || Math.max(A.x, B.x) < Math.min(C.x, D.x) ||
      Math.min(A.y, B.y) > Math.max(C.y, D.y) || Math.max(A.y, B.y) < Math.min(C.y, D.y)) {
    return false;
  }
  return ccw(A, C, D) !== ccw(B, C, D) && ccw(A, B, C) !== ccw(A, B, D);
}

function distToSegment(P, A, B) {
  const l2 = (B.x - A.x) ** 2 + (B.y - A.y) ** 2;
  if (l2 === 0) return Math.hypot(P.x - A.x, P.y - A.y);
  let t = ((P.x - A.x) * (B.x - A.x) + (P.y - A.y) * (B.y - A.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(P.x - (A.x + t * (B.x - A.x)), P.y - (A.y + t * (B.y - A.y)));
}

export class Qix {
  constructor(grid, options = {}) {
    this.grid = grid;
    this.trailLength = options.trailLength || 16;
    this.speed = options.speed || 1.6;
    this.baseColor = options.baseColor || '#ff007f'; // synthwave neon magenta

    // Find valid starting empty space (typically near center)
    const startX = options.x || Math.floor(grid.width / 2);
    const startY = options.y || Math.floor(grid.height / 2);

    // Two moving endpoints defining the active line
    this.p1 = { x: startX - 10, y: startY - 10 };
    this.p2 = { x: startX + 10, y: startY + 10 };

    const angle1 = Math.random() * Math.PI * 2;
    const angle2 = Math.random() * Math.PI * 2;
    this.v1 = { x: Math.cos(angle1) * this.speed, y: Math.sin(angle1) * this.speed };
    this.v2 = { x: Math.cos(angle2) * this.speed, y: Math.sin(angle2) * this.speed };

    // FIFO history buffer of segment positions
    this.history = [];
    for (let i = 0; i < this.trailLength; i++) {
      this.history.push({
        p1: { ...this.p1 },
        p2: { ...this.p2 }
      });
    }

    // Center of mass
    this.x = startX;
    this.y = startY;

    // Erratic wander timer
    this.mutationTimer = 0;
    this.frozenTimer = 0;
    this.sparkTimer = 0;
  }

  freeze(durationFrames = 300) {
    this.frozenTimer = durationFrames;
  }

  update(particleSystem, dt = 1) {
    if (this.frozenTimer > 0) {
      this.frozenTimer -= dt;
      // Frozen ice crackle particles
      if (Math.random() < 0.2 && particleSystem) {
        particleSystem.emitSparks(
          (this.p1.x + this.p2.x) / 2 * (600 / this.grid.width),
          (this.p1.y + this.p2.y) / 2 * (600 / this.grid.height),
          1,
          '#a0f0ff',
          1
        );
      }
      return;
    }

    // Periodic chaotic perturbation
    this.mutationTimer += dt;
    if (this.mutationTimer > 25) {
      this.mutationTimer = 0;
      const dTheta1 = (Math.random() - 0.5) * 0.9;
      const dTheta2 = (Math.random() - 0.5) * 0.9;

      const spd1 = Math.hypot(this.v1.x, this.v1.y);
      const angle1 = Math.atan2(this.v1.y, this.v1.x) + dTheta1;
      this.v1.x = Math.cos(angle1) * spd1;
      this.v1.y = Math.sin(angle1) * spd1;

      const spd2 = Math.hypot(this.v2.x, this.v2.y);
      const angle2 = Math.atan2(this.v2.y, this.v2.x) + dTheta2;
      this.v2.x = Math.cos(angle2) * spd2;
      this.v2.y = Math.sin(angle2) * spd2;
    }

    // Move endpoints
    this._moveEndpoint(this.p1, this.v1, dt);
    this._moveEndpoint(this.p2, this.v2, dt);

    // Keep length between endpoints within bounds
    const dx = this.p2.x - this.p1.x;
    const dy = this.p2.y - this.p1.y;
    const dist = Math.hypot(dx, dy);
    const minLen = 12;
    const maxLen = 38;

    if (dist < minLen) {
      const scale = (minLen - dist) * 0.5;
      const nx = dx / (dist || 1);
      const ny = dy / (dist || 1);
      this.p1.x -= nx * scale;
      this.p1.y -= ny * scale;
      this.p2.x += nx * scale;
      this.p2.y += ny * scale;
    } else if (dist > maxLen) {
      const scale = (dist - maxLen) * 0.5;
      const nx = dx / (dist || 1);
      const ny = dy / (dist || 1);
      this.p1.x += nx * scale;
      this.p1.y += ny * scale;
      this.p2.x -= nx * scale;
      this.p2.y -= ny * scale;
    }

    // Center of mass
    this.x = (this.p1.x + this.p2.x) / 2;
    this.y = (this.p1.y + this.p2.y) / 2;

    // Push new segment to history
    this.history.unshift({
      p1: { ...this.p1 },
      p2: { ...this.p2 }
    });
    if (this.history.length > this.trailLength) {
      this.history.pop();
    }
  }

  _moveEndpoint(p, v, dt = 1) {
    const nextX = p.x + v.x * dt;
    const nextY = p.y + v.y * dt;
    const gw = this.grid.width;
    const gh = this.grid.height;

    // Wall bounce check against playfield perimeter
    if (nextX <= 1 || nextX >= gw - 2) {
      v.x = -v.x * (0.95 + Math.random() * 0.1);
      p.x = Math.max(1.5, Math.min(gw - 2.5, p.x));
    } else {
      p.x = nextX;
    }

    if (nextY <= 1 || nextY >= gh - 2) {
      v.y = -v.y * (0.95 + Math.random() * 0.1);
      p.y = Math.max(1.5, Math.min(gh - 2.5, p.y));
    } else {
      p.y = nextY;
    }

    // Bounce off filled territory or completed borders
    const ix = Math.round(p.x);
    const iy = Math.round(p.y);
    if (!this.grid.isEmpty(ix, iy)) {
      // Endpoint collided with border or filled territory - bounce back
      v.x = -v.x + (Math.random() - 0.5) * 0.6;
      v.y = -v.y + (Math.random() - 0.5) * 0.6;

      // Nudge towards empty cell
      const safe = this.grid.getClosestEmptyCell(p.x, p.y);
      p.x += (safe.x - p.x) * 0.2;
      p.y += (safe.y - p.y) * 0.2;
    }
  }

  /**
   * Checks collision against the player's active drawing line
   */
  checkCollisionWithStix(stixPoints) {
    if (!stixPoints || stixPoints.length < 2) return false;

    // Check recent segments of the Qix ribbon
    const checkSegments = Math.min(8, this.history.length);
    for (let q = 0; q < checkSegments; q++) {
      const qA = this.history[q].p1;
      const qB = this.history[q].p2;

      for (let i = 0; i < stixPoints.length - 1; i++) {
        const sA = stixPoints[i];
        const sB = stixPoints[i + 1];

        if (segmentsIntersect(qA, qB, sA, sB)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Detects if the Qix is within close proximity (near miss) of the drawing line
   */
  checkNearMiss(stixPoints, threshold = 6) {
    if (!stixPoints || stixPoints.length < 2) return false;

    const qA = this.p1;
    const qB = this.p2;

    for (let i = 0; i < stixPoints.length - 1; i++) {
      const sA = stixPoints[i];
      const sB = stixPoints[i + 1];

      const d1 = distToSegment(qA, sA, sB);
      const d2 = distToSegment(qB, sA, sB);
      if (d1 < threshold || d2 < threshold) {
        return true;
      }
    }
    return false;
  }

  draw(ctx, scaleX, scaleY) {
    ctx.save();

    const isFrozen = this.frozenTimer > 0;
    const historyLen = this.history.length;

    // Draw ribbon trails from oldest to newest
    for (let i = historyLen - 1; i >= 0; i--) {
      const seg = this.history[i];
      const normIdx = 1 - (i / historyLen); // 0 (oldest) to 1 (newest)

      ctx.beginPath();
      ctx.moveTo(seg.p1.x * scaleX, seg.p1.y * scaleY);
      ctx.lineTo(seg.p2.x * scaleX, seg.p2.y * scaleY);

      if (isFrozen) {
        ctx.strokeStyle = `rgba(160, 240, 255, ${0.2 + normIdx * 0.7})`;
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 8;
        ctx.lineWidth = 2 + normIdx * 1.5;
      } else {
        // Shifting synthwave chromatic palette: Magenta -> Electric Cyan -> Laser Orange -> White
        const hue = (Date.now() * 0.1 + i * 14) % 360;
        ctx.strokeStyle = `hsla(${hue}, 100%, ${50 + normIdx * 35}%, ${0.2 + normIdx * 0.8})`;
        ctx.shadowColor = `hsl(${hue}, 100%, 60%)`;
        ctx.shadowBlur = 10 * normIdx;
        ctx.lineWidth = 1.5 + normIdx * 2.0;
      }

      ctx.stroke();
    }

    // Glowing endpoint nodes
    const h1 = this.p1;
    const h2 = this.p2;
    const nodeColor = isFrozen ? '#ffffff' : '#00ffff';

    ctx.fillStyle = nodeColor;
    ctx.shadowColor = nodeColor;
    ctx.shadowBlur = 12;

    ctx.beginPath();
    ctx.arc(h1.x * scaleX, h1.y * scaleY, isFrozen ? 3 : 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(h2.x * scaleX, h2.y * scaleY, isFrozen ? 3 : 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
