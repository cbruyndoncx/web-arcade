/**
 * NEO-QIX Player Marker & Stix Drawing Engine
 * Manages player navigation on boundaries, line extrusion into void,
 * Fast vs Slow draw dynamics, the Fuse combustion mechanics, and shields.
 */

import { CELL_EMPTY, CELL_BORDER } from './grid.js';

export class Player {
  constructor(grid, options = {}) {
    this.grid = grid;
    this.reset();
  }

  reset(startX = null, startY = null) {
    // Start at bottom center border if unspecified
    this.x = startX !== null ? startX : Math.floor(this.grid.width / 2);
    this.y = startY !== null ? startY : this.grid.height - 1;

    // Movement state
    this.dx = 0;
    this.dy = 0;
    this.mode = 'BORDER'; // 'BORDER' or 'DRAWING'
    this.drawType = 'fast'; // 'fast' or 'slow'
    this.stix = []; // [{x, y}]

    // Fuse state
    this.fuseLit = false;
    this.fuseIndex = 0;
    this.idleTimer = 0;
    this.idleThreshold = 25; // frames of standing still before fuse ignites

    // Buffs
    this.hasShield = false;
    this.speedBuffTimer = 0;
    this.multiplierActive = false;

    // Visual animation
    this.animAngle = 0;
    this.fuseParticleTimer = 0;

    // Time-based movement regulation
    this.moveAccumulator = 0;
    this.wasMoving = false;
  }

  snapToBorder() {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    if (!this.grid.isBorder(this.x, this.y)) {
      const safe = this.grid.findClosestBorderCell(this.x, this.y);
      this.x = safe.x;
      this.y = safe.y;
    }
  }

  update(inputs, audio, particles, dt = 1) {
    this.animAngle += 0.08 * dt;

    // Decrement speed buff timer
    if (this.speedBuffTimer > 0) {
      this.speedBuffTimer -= dt;
    }

    // Determine intended movement direction
    let moveX = 0;
    let moveY = 0;

    if (inputs.up) moveY -= 1;
    else if (inputs.down) moveY += 1;

    if (inputs.left) moveX -= 1;
    else if (inputs.right) moveX += 1;

    // Prevent diagonal movement (classic arcade 4-way orthogonal constraint)
    if (moveX !== 0 && moveY !== 0) {
      moveY = 0;
    }

    const hasInput = moveX !== 0 || moveY !== 0;
    let stepsToTake = 0;

    if (hasInput) {
      this.idleTimer = 0;

      // Controlled movement speed (cells per frame at 60Hz)
      // Normal border: ~39 cells/sec (comfortable and deliberate)
      let speed = 0.65;
      if (this.mode === 'BORDER') {
        speed = this.speedBuffTimer > 0 ? 0.95 : 0.65;
      } else {
        // DRAWING
        if (this.drawType === 'slow') {
          speed = this.speedBuffTimer > 0 ? 0.45 : 0.28; // ~17 cells/sec (tense slow crawl)
        } else {
          speed = this.speedBuffTimer > 0 ? 0.80 : 0.52; // ~31 cells/sec (responsive fast draw)
        }
      }

      if (!this.wasMoving) {
        // Instant response on initial keypress / tap
        stepsToTake = 1;
        this.moveAccumulator = 0;
        this.wasMoving = true;
      } else {
        this.moveAccumulator += speed * dt;
        while (this.moveAccumulator >= 1.0) {
          stepsToTake++;
          this.moveAccumulator -= 1.0;
        }
      }
    } else {
      this.wasMoving = false;
      this.moveAccumulator = 0;
    }

    let completedPartition = null;

    if (stepsToTake > 0) {
      for (let s = 0; s < stepsToTake; s++) {
        const result = this._step(moveX, moveY, inputs);
        if (result && result.tip && particles) {
          if (!this._lastTipTime || Date.now() - this._lastTipTime > 2500) {
            this._lastTipTime = Date.now();
            particles.addFloatingText(result.tip, this.x * (600 / this.grid.width), this.y * (600 / this.grid.height) - 15, '#00ffff', 11);
          }
        }
        if (result && result.completed) {
          completedPartition = {
            stix: [...this.stix],
            drawType: this.drawType
          };
          this._finishStix(audio, particles);
          break;
        }
      }
    } else if (!hasInput) {
      // Standing still
      if (this.mode === 'DRAWING') {
        this.idleTimer += dt;
        if (this.idleTimer > this.idleThreshold && !this.fuseLit) {
          this.fuseLit = true;
          this.fuseIndex = 0;
          if (audio) audio.startFuse();
          if (particles) particles.addFloatingText('FUSE LIT!', this.x * (600 / this.grid.width), this.y * (600 / this.grid.height) - 15, '#ff3300', 14);
        }
      }
    }

    // Process Fuse burning if lit
    let fuseKilledPlayer = false;
    if (this.fuseLit && this.mode === 'DRAWING') {
      // Fuse travels along the stix path towards the player
      const fuseSpeed = hasInput ? 0.35 : 0.85; // crawls if moving, races if idle
      this.fuseIndex += fuseSpeed;

      const fuseCellIdx = Math.floor(this.fuseIndex);
      if (fuseCellIdx < this.stix.length) {
        const fusePt = this.stix[fuseCellIdx];
        if (particles) {
          particles.emitFuse(
            fusePt.x * (600 / this.grid.width),
            fusePt.y * (600 / this.grid.height)
          );
        }

        // Check if fuse reached the player
        if (fuseCellIdx >= this.stix.length - 2) {
          if (this.hasShield) {
            // Shield absorbs fuse!
            this.hasShield = false;
            this.fuseLit = false;
            if (audio) audio.stopFuse();
            if (particles) {
              particles.emitExplosion(this.x * (600 / this.grid.width), this.y * (600 / this.grid.height), 20, '#00ff88');
              particles.addFloatingText('SHIELD BROKEN!', this.x * (600 / this.grid.width), this.y * (600 / this.grid.height), '#00ff88', 16);
            }
          } else {
            fuseKilledPlayer = true;
          }
        }
      }
    }

    return {
      completedPartition,
      fuseKilledPlayer
    };
  }

  _step(dirX, dirY, inputs) {
    const nextX = Math.round(this.x + dirX);
    const nextY = Math.round(this.y + dirY);

    if (!this.grid.isInside(nextX, nextY)) {
      return null;
    }

    const nextCell = this.grid.get(nextX, nextY);

    if (this.mode === 'BORDER') {
      // Walking on Border
      if (nextCell === CELL_BORDER) {
        // Normal border traversal
        this.x = nextX;
        this.y = nextY;
        return null;
      }

      if (nextCell === CELL_EMPTY) {
        // Player wants to step into the void to draw!
        // Check if draw button is held or auto-draw mode is on
        const isSlowRequested = inputs.drawSlow;
        const isFastRequested = inputs.drawFast || inputs.autoDraw;

        if (isSlowRequested || isFastRequested) {
          this.mode = 'DRAWING';
          this.drawType = isSlowRequested ? 'slow' : 'fast';
          this.stix = [{ x: this.x, y: this.y }, { x: nextX, y: nextY }];
          this.x = nextX;
          this.y = nextY;
          this.idleTimer = 0;
          this.fuseLit = false;
          return null;
        } else {
          // Block movement - prevent accidental step off the border
          return { tip: 'HOLD SPACE (FAST) OR Z (SLOW) TO DRAW' };
        }
      }

      // Cannot walk into filled territory
      return null;
    }

    if (this.mode === 'DRAWING') {
      // Anti-reverse check: cannot step backward to the immediate previous cell
      if (this.stix.length >= 2) {
        const prev = this.stix[this.stix.length - 2];
        if (nextX === prev.x && nextY === prev.y) {
          return null; // Block reverse
        }
      }

      // Check self-intersection with earlier stix cells
      for (let i = 0; i < this.stix.length - 2; i++) {
        if (nextX === this.stix[i].x && nextY === this.stix[i].y) {
          return null; // Cannot cross own stix
        }
      }

      if (nextCell === CELL_EMPTY) {
        // Continue drawing in void
        this.stix.push({ x: nextX, y: nextY });
        this.x = nextX;
        this.y = nextY;
        return null;
      }

      if (nextCell === CELL_BORDER) {
        // Reached existing border! STIX COMPLETED!
        this.stix.push({ x: nextX, y: nextY });
        this.x = nextX;
        this.y = nextY;
        return { completed: true };
      }

      // Cannot draw into filled cells
      return null;
    }

    return null;
  }

  _finishStix(audio, particles) {
    this.mode = 'BORDER';
    this.fuseLit = false;
    this.idleTimer = 0;
    if (audio) {
      audio.stopDraw();
      audio.stopFuse();
    }
  }

  cancelStix(audio) {
    this.mode = 'BORDER';
    this.stix = [];
    this.fuseLit = false;
    this.idleTimer = 0;
    if (audio) {
      audio.stopDraw();
      audio.stopFuse();
    }
  }

  draw(ctx, scaleX, scaleY) {
    ctx.save();
    const cx = this.x * scaleX;
    const cy = this.y * scaleY;

    // 1. Draw Active Stix line if drawing
    if (this.mode === 'DRAWING' && this.stix.length > 0) {
      const isSlow = this.drawType === 'slow';
      const stixColor = isSlow ? '#ff9900' : '#00ffff';
      const stixGlow = isSlow ? '#ff5500' : '#00ccff';

      ctx.beginPath();
      ctx.moveTo(this.stix[0].x * scaleX, this.stix[0].y * scaleY);
      for (let i = 1; i < this.stix.length; i++) {
        ctx.lineTo(this.stix[i].x * scaleX, this.stix[i].y * scaleY);
      }

      ctx.strokeStyle = stixColor;
      ctx.shadowColor = stixGlow;
      ctx.shadowBlur = 10;
      ctx.lineWidth = isSlow ? 3 : 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Draw fuse head if active
      if (this.fuseLit) {
        const fuseIdx = Math.min(this.stix.length - 1, Math.floor(this.fuseIndex));
        const fPt = this.stix[fuseIdx];
        if (fPt) {
          ctx.beginPath();
          ctx.arc(fPt.x * scaleX, fPt.y * scaleY, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#ff0033';
          ctx.shadowColor = '#ffff00';
          ctx.shadowBlur = 15;
          ctx.fill();
        }
      }
    }

    // 2. Draw Shield Bubble
    if (this.hasShield) {
      ctx.beginPath();
      ctx.arc(cx, cy, 12, 0, Math.PI * 2);
      ctx.strokeStyle = '#00ff88';
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 12;
      ctx.lineWidth = 2;
      ctx.fillStyle = 'rgba(0, 255, 136, 0.15)';
      ctx.fill();
      ctx.stroke();
    }

    // 3. Draw Player Marker (Glowing Diamond)
    ctx.translate(cx, cy);
    ctx.rotate(this.animAngle);

    const isDrawing = this.mode === 'DRAWING';
    const mainColor = isDrawing 
      ? (this.drawType === 'slow' ? '#ffaa00' : '#00f0ff')
      : '#ffffff';

    const glowColor = isDrawing
      ? (this.drawType === 'slow' ? '#ff4400' : '#0088ff')
      : '#00ffff';

    ctx.fillStyle = mainColor;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 14;

    const r = 5.5;
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(r, 0);
    ctx.lineTo(0, r);
    ctx.lineTo(-r, 0);
    ctx.closePath();
    ctx.fill();

    // Hot center
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
