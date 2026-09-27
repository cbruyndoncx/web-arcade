/**
 * NEO-QIX Grid Engine
 * High-performance 2D cellular grid for territory partitioning, flood fill,
 * boundary navigation, and multi-layered cyber rendering.
 */

export const CELL_EMPTY = 0;
export const CELL_BORDER = 1;
export const CELL_FILLED_FAST = 2;
export const CELL_FILLED_SLOW = 3;
export const CELL_STIX_FAST = 4;
export const CELL_STIX_SLOW = 5;

export class Grid {
  constructor(width = 200, height = 200) {
    this.width = width;
    this.height = height;
    this.cells = new Uint8Array(width * height);
    this.totalPlayableCells = (width - 2) * (height - 2);

    // Offscreen canvas for pre-rendering territory fills
    if (typeof document !== 'undefined') {
      this.offscreenCanvas = document.createElement('canvas');
      this.offscreenCanvas.width = width;
      this.offscreenCanvas.height = height;
      this.offscreenCtx = this.offscreenCanvas.getContext('2d', { willReadFrequently: true });
      this.imgData = this.offscreenCtx ? this.offscreenCtx.createImageData(width, height) : null;
    } else {
      this.offscreenCanvas = null;
      this.offscreenCtx = null;
      this.imgData = null;
    }

    this.capturedCount = 0;
    this.capturedPercentage = 0;

    // Background artwork
    this.bgImage = null;
    this.bgLoaded = false;

    this.init();
  }

  loadBackground(src) {
    if (typeof Image === 'undefined') return;
    const img = new Image();
    img.onload = () => {
      this.bgImage = img;
      this.bgLoaded = true;
    };
    img.src = src;
  }

  init() {
    this.cells.fill(CELL_EMPTY);

    // Initialize perimeter border
    for (let x = 0; x < this.width; x++) {
      this.cells[x] = CELL_BORDER;
      this.cells[(this.height - 1) * this.width + x] = CELL_BORDER;
    }
    for (let y = 0; y < this.height; y++) {
      this.cells[y * this.width] = CELL_BORDER;
      this.cells[y * this.width + (this.width - 1)] = CELL_BORDER;
    }

    this.capturedCount = 0;
    this.capturedPercentage = 0;
    this.updateOffscreenCanvas();
  }

  isInside(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  get(x, y) {
    if (!this.isInside(x, y)) return -1;
    return this.cells[y * this.width + x];
  }

  set(x, y, val) {
    if (this.isInside(x, y)) {
      this.cells[y * this.width + x] = val;
    }
  }

  isBorder(x, y) {
    return this.get(x, y) === CELL_BORDER;
  }

  isEmpty(x, y) {
    return this.get(x, y) === CELL_EMPTY;
  }

  isFilled(x, y) {
    const v = this.get(x, y);
    return v === CELL_FILLED_FAST || v === CELL_FILLED_SLOW;
  }

  /**
   * Finds the closest empty cell to given coordinates
   */
  getClosestEmptyCell(qx, qy) {
    let ix = Math.round(qx);
    let iy = Math.round(qy);
    ix = Math.max(1, Math.min(this.width - 2, ix));
    iy = Math.max(1, Math.min(this.height - 2, iy));

    if (this.isEmpty(ix, iy)) {
      return { x: ix, y: iy };
    }

    // Radial search
    for (let radius = 1; radius < 30; radius++) {
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue;
          const nx = ix + dx;
          const ny = iy + dy;
          if (this.isInside(nx, ny) && this.isEmpty(nx, ny)) {
            return { x: nx, y: ny };
          }
        }
      }
    }
    return { x: ix, y: iy };
  }

  /**
   * Finds the exact closest border cell to given coordinates across the grid
   */
  findClosestBorderCell(fromX, fromY) {
    const ix = Math.max(0, Math.min(this.width - 1, Math.round(fromX)));
    const iy = Math.max(0, Math.min(this.height - 1, Math.round(fromY)));

    if (this.isBorder(ix, iy)) {
      return { x: ix, y: iy };
    }

    const visited = new Uint8Array(this.width * this.height);
    const queue = new Int32Array(this.width * this.height);
    let head = 0, tail = 0;

    const startIdx = iy * this.width + ix;
    visited[startIdx] = 1;
    queue[tail++] = startIdx;

    while (head < tail) {
      const cur = queue[head++];
      if (this.cells[cur] === CELL_BORDER) {
        return { x: cur % this.width, y: (cur / this.width) | 0 };
      }

      const cx = cur % this.width;
      const cy = (cur / this.width) | 0;

      if (cx > 0) {
        const left = cur - 1;
        if (!visited[left]) { visited[left] = 1; queue[tail++] = left; }
      }
      if (cx < this.width - 1) {
        const right = cur + 1;
        if (!visited[right]) { visited[right] = 1; queue[tail++] = right; }
      }
      if (cy > 0) {
        const up = cur - this.width;
        if (!visited[up]) { visited[up] = 1; queue[tail++] = up; }
      }
      if (cy < this.height - 1) {
        const down = cur + this.width;
        if (!visited[down]) { visited[down] = 1; queue[tail++] = down; }
      }
    }

    // Fallback: top perimeter border
    return { x: ix, y: 0 };
  }

  /**
   * Partitions the playfield upon completion of a Stix.
   * Finds connected empty components, claims any component without a Qix,
   * detects Qix splits, prunes internal borders, and returns metrics.
   */
  partition(stixPoints, drawType, qixEntities) {
    // 1. Mark stix line as border temporarily
    for (const pt of stixPoints) {
      if (this.isInside(pt.x, pt.y)) {
        this.cells[pt.y * this.width + pt.x] = CELL_BORDER;
      }
    }

    // 2. Identify all connected components of EMPTY cells
    const visited = new Uint8Array(this.width * this.height);
    const components = [];

    for (let y = 1; y < this.height - 1; y++) {
      for (let x = 1; x < this.width - 1; x++) {
        const idx = y * this.width + x;
        if (this.cells[idx] === CELL_EMPTY && !visited[idx]) {
          const comp = [];
          const queue = new Int32Array(this.width * this.height);
          let head = 0, tail = 0;

          visited[idx] = 1;
          queue[tail++] = idx;

          while (head < tail) {
            const cur = queue[head++];
            comp.push(cur);

            const cx = cur % this.width;
            const cy = (cur / this.width) | 0;

            if (cx > 1) {
              const left = cur - 1;
              if (!visited[left] && this.cells[left] === CELL_EMPTY) {
                visited[left] = 1;
                queue[tail++] = left;
              }
            }
            if (cx < this.width - 2) {
              const right = cur + 1;
              if (!visited[right] && this.cells[right] === CELL_EMPTY) {
                visited[right] = 1;
                queue[tail++] = right;
              }
            }
            if (cy > 1) {
              const up = cur - this.width;
              if (!visited[up] && this.cells[up] === CELL_EMPTY) {
                visited[up] = 1;
                queue[tail++] = up;
              }
            }
            if (cy < this.height - 2) {
              const down = cur + this.width;
              if (!visited[down] && this.cells[down] === CELL_EMPTY) {
                visited[down] = 1;
                queue[tail++] = down;
              }
            }
          }
          components.push(comp);
        }
      }
    }

    // 3. Match each Qix to the component it resides in
    // Map cell index to component index
    const cellToCompMap = new Int32Array(this.width * this.height);
    cellToCompMap.fill(-1);
    for (let i = 0; i < components.length; i++) {
      const comp = components[i];
      for (let j = 0; j < comp.length; j++) {
        cellToCompMap[comp[j]] = i;
      }
    }

    const qixCompIndices = new Set();
    for (const q of qixEntities) {
      const emptyPt = this.getClosestEmptyCell(q.x, q.y);
      const compIdx = cellToCompMap[emptyPt.y * this.width + emptyPt.x];
      if (compIdx !== -1) {
        qixCompIndices.add(compIdx);
      }
    }

    // Check for Qix split (e.g. 2 Qixes in distinct non-empty components)
    let qixSplit = false;
    if (qixEntities.length >= 2 && qixCompIndices.size >= 2) {
      qixSplit = true;
    }

    // 4. Fill all components that do NOT contain any Qix
    let newFilledCells = 0;
    const fillType = (drawType === 'slow') ? CELL_FILLED_SLOW : CELL_FILLED_FAST;
    const capturedBounds = { minX: this.width, maxX: 0, minY: this.height, maxY: 0 };

    for (let i = 0; i < components.length; i++) {
      if (!qixCompIndices.has(i)) {
        const comp = components[i];
        for (const idx of comp) {
          this.cells[idx] = fillType;
          newFilledCells++;

          const cx = idx % this.width;
          const cy = (idx / this.width) | 0;
          if (cx < capturedBounds.minX) capturedBounds.minX = cx;
          if (cx > capturedBounds.maxX) capturedBounds.maxX = cx;
          if (cy < capturedBounds.minY) capturedBounds.minY = cy;
          if (cy > capturedBounds.maxY) capturedBounds.maxY = cy;
        }
      }
    }

    // 5. Prune internal borders:
    // Any BORDER cell that has NO adjacent EMPTY cell (8-neighborhood) is converted to FILLED
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const idx = y * this.width + x;
        if (this.cells[idx] === CELL_BORDER) {
          let hasEmptyNeighbor = false;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              const nx = x + dx;
              const ny = y + dy;
              if (this.isInside(nx, ny) && this.cells[ny * this.width + nx] === CELL_EMPTY) {
                hasEmptyNeighbor = true;
                break;
              }
            }
            if (hasEmptyNeighbor) break;
          }
          if (!hasEmptyNeighbor) {
            this.cells[idx] = fillType;
          }
        }
      }
    }

    // 6. Recalculate global captured stats
    let totalFilled = 0;
    for (let i = 0; i < this.cells.length; i++) {
      const v = this.cells[i];
      if (v === CELL_FILLED_FAST || v === CELL_FILLED_SLOW) {
        totalFilled++;
      }
    }

    this.capturedCount = totalFilled;
    this.capturedPercentage = (totalFilled / this.totalPlayableCells) * 100;
    const newPercent = (newFilledCells / this.totalPlayableCells) * 100;

    // Update offscreen buffer for rendering
    this.updateOffscreenCanvas();

    return {
      newCellsCount: newFilledCells,
      newPercent,
      totalPercent: this.capturedPercentage,
      qixSplit,
      bounds: capturedBounds
    };
  }

  /**
   * Refreshes the offscreen pixel buffer with vibrant synthwave styling
   */
  updateOffscreenCanvas() {
    if (!this.imgData || !this.offscreenCtx) return;
    const data = this.imgData.data;
    const w = this.width;
    const h = this.height;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        const cell = this.cells[y * w + x];

        switch (cell) {
          case CELL_EMPTY:
            // Dark cyber shroud obscuring the background image
            data[idx] = 10;
            data[idx + 1] = 8;
            data[idx + 2] = 26;
            data[idx + 3] = 228; // ~90% opacity shroud
            break;

          case CELL_BORDER:
            // Radiant electric cyan border edge
            data[idx] = 0;
            data[idx + 1] = 240;
            data[idx + 2] = 255;
            data[idx + 3] = 255;
            break;

          case CELL_FILLED_FAST:
            // Shroud cleared! Background artwork fully revealed with subtle cyber scanline
            const isPatternF = (x + y) % 5 === 0;
            data[idx] = 0;
            data[idx + 1] = 240;
            data[idx + 2] = 255;
            data[idx + 3] = isPatternF ? 30 : 0; // almost transparent, artwork shines through!
            break;

          case CELL_FILLED_SLOW:
            // Shroud cleared! Background artwork revealed with golden warm holographic sheen
            const isPatternS = (x - y) % 5 === 0;
            data[idx] = 255;
            data[idx + 1] = 180;
            data[idx + 2] = 20;
            data[idx + 3] = isPatternS ? 40 : 0; // artwork shines through!
            break;

          default:
            data[idx] = 0;
            data[idx + 1] = 0;
            data[idx + 2] = 0;
            data[idx + 3] = 255;
        }
      }
    }

    this.offscreenCtx.putImageData(this.imgData, 0, 0);
  }

  _drawProceduralBackground(ctx, w, h) {
    // Synthwave Sunset & Cyber Mountains fallback
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#0d0722');
    grad.addColorStop(0.5, '#2c0d48');
    grad.addColorStop(0.7, '#6b1168');
    grad.addColorStop(1, '#ff007f');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Glowing striped sun
    const sunY = h * 0.52;
    const sunR = h * 0.22;
    const sunGrad = ctx.createLinearGradient(0, sunY - sunR, 0, sunY + sunR);
    sunGrad.addColorStop(0, '#ff00aa');
    sunGrad.addColorStop(0.5, '#ff5500');
    sunGrad.addColorStop(1, '#ffff00');

    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(w * 0.5, sunY, sunR, 0, Math.PI * 2);
    ctx.fill();

    // Horizontal sun stripe cuts
    ctx.fillStyle = '#0d0722';
    for (let sy = sunY - sunR * 0.2; sy < sunY + sunR; sy += 8) {
      ctx.fillRect(w * 0.5 - sunR - 10, sy, (sunR + 10) * 2, 3);
    }
  }

  /**
   * Renders the grid playfield onto the main canvas with background art and shroud reveal
   */
  draw(ctx, canvasWidth, canvasHeight, theme = 'cyberpunk') {
    ctx.save();

    // 1. Draw Background Image (or procedural fallback)
    if (this.bgLoaded && this.bgImage) {
      ctx.drawImage(this.bgImage, 0, 0, canvasWidth, canvasHeight);
    } else {
      this._drawProceduralBackground(ctx, canvasWidth, canvasHeight);
    }

    // 2. Draw Territory Shroud & Border Layer (unclaimed space is shrouded; captured space is revealed)
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(this.offscreenCanvas, 0, 0, canvasWidth, canvasHeight);

    // 3. Subtle cyber grid scanline overlay
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
    ctx.lineWidth = 1;
    const step = canvasWidth / 22;
    ctx.beginPath();
    for (let x = 0; x <= canvasWidth; x += step) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
    }
    for (let y = 0; y <= canvasHeight; y += step) {
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
    }
    ctx.stroke();

    ctx.restore();
  }
}
