/**
 * NEO-QIX Master Game Engine
 * Manages game loop, 60/120fps requestAnimationFrame, state machines, levels,
 * scoring multipliers, combos, powerup activations, and gamepad integration.
 */

import { Grid, CELL_BORDER } from './grid.js';
import { Player } from './player.js';
import { Qix } from './qix.js';
import { Sparx } from './sparx.js';
import { PowerupManager } from './powerups.js';
import { AudioManager } from './audio.js';
import { ParticleSystem } from './particles.js';
import { UIManager } from './ui.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // High DPI Canvas setup
    this.dpr = window.devicePixelRatio || 1;
    this.displayWidth = 600;
    this.displayHeight = 600;
    this.scaleX = 1;
    this.scaleY = 1;

    // Subsystems
    this.audio = new AudioManager();
    this.particles = new ParticleSystem();
    this.grid = new Grid(200, 200);
    this.grid.loadBackground('assets/background1.jpg');
    this.player = new Player(this.grid);
    this.powerups = new PowerupManager(this.grid);

    // Dynamic entities
    this.qixes = [];
    this.sparxes = [];

    // State machine
    this.state = 'TITLE'; // 'TITLE', 'PLAYING', 'DEATH', 'LEVEL_CLEAR', 'GAME_OVER', 'PAUSED'
    this.prevPauseState = 'PLAYING';

    // Game modes: 'arcade', 'hardcore', 'zen'
    this.gameMode = 'arcade';

    // Game stats & progression
    this.score = 0;
    this.highScore = this.loadHighestScore();
    this.level = 1;
    this.lives = 3;
    this.targetPercent = 75;
    this.largestSingleCut = 0;
    this.totalTerritoryCaptured = 0;

    // Round timers
    this.roundTimer = 0;
    this.superSparxTimer = 0;
    this.superSparxTriggerTime = 45 * 60; // 45 seconds at 60fps
    this.nearMissCooldown = 0;

    // Input state
    this.inputs = {
      up: false,
      down: false,
      left: false,
      right: false,
      drawFast: false,
      drawSlow: false,
      autoDraw: false
    };

    // UI Manager
    this.ui = new UIManager(this);

    // Event listeners
    this._bindInputs();
    this._setupResize();

    // Start loop
    this.lastTime = performance.now();
    this.animFrameId = requestAnimationFrame((t) => this.gameLoop(t));
  }

  _bindInputs() {
    window.addEventListener('keydown', (e) => {
      // Audio resume on first keystroke
      this.audio.init();
      this.audio.resume();

      if (e.code === 'KeyP' || e.code === 'Escape') {
        if (this.state === 'PLAYING' || this.state === 'PAUSED') {
          this.togglePause();
        }
        return;
      }

      if (e.code === 'KeyM') {
        this.audio.toggleMute();
        return;
      }

      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          this.inputs.up = true;
          e.preventDefault();
          break;
        case 'ArrowDown':
        case 'KeyS':
          this.inputs.down = true;
          e.preventDefault();
          break;
        case 'ArrowLeft':
        case 'KeyA':
          this.inputs.left = true;
          e.preventDefault();
          break;
        case 'ArrowRight':
        case 'KeyD':
          this.inputs.right = true;
          e.preventDefault();
          break;

        case 'Space':
        case 'KeyX':
        case 'KeyJ':
        case 'ShiftLeft':
        case 'ShiftRight':
          this.inputs.drawFast = true;
          e.preventDefault();
          break;

        case 'KeyZ':
        case 'KeyK':
        case 'KeyC':
        case 'ControlLeft':
        case 'ControlRight':
        case 'AltLeft':
          this.inputs.drawSlow = true;
          e.preventDefault();
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          this.inputs.up = false;
          break;
        case 'ArrowDown':
        case 'KeyS':
          this.inputs.down = false;
          break;
        case 'ArrowLeft':
        case 'KeyA':
          this.inputs.left = false;
          break;
        case 'ArrowRight':
        case 'KeyD':
          this.inputs.right = false;
          break;

        case 'Space':
        case 'KeyX':
        case 'KeyJ':
        case 'ShiftLeft':
        case 'ShiftRight':
          this.inputs.drawFast = false;
          break;

        case 'KeyZ':
        case 'KeyK':
        case 'KeyC':
        case 'ControlLeft':
        case 'ControlRight':
        case 'AltLeft':
          this.inputs.drawSlow = false;
          break;
      }
    });

    // Touch/click start trigger
    this.canvas.addEventListener('click', () => {
      this.audio.init();
      this.audio.resume();
    });
  }

  _setupResize() {
    const resize = () => {
      const hudEl = document.getElementById('hud');
      const toolbarEl = document.getElementById('toolbar');
      const hudHeight = hudEl ? hudEl.offsetHeight : 68;
      const toolbarHeight = toolbarEl ? toolbarEl.offsetHeight : 36;
      const verticalPadding = 24;

      const availHeight = window.innerHeight - hudHeight - toolbarHeight - verticalPadding;
      const availWidth = window.innerWidth - 32;

      // Expand play area significantly: up to 920px (nearly 2x visual area of old 680px cap)
      const size = Math.min(availWidth, availHeight, 920);
      this.displayWidth = Math.max(320, Math.floor(size));
      this.displayHeight = this.displayWidth; // keep 1:1 aspect ratio

      this.canvas.width = this.displayWidth * this.dpr;
      this.canvas.height = this.displayHeight * this.dpr;
      this.canvas.style.width = `${this.displayWidth}px`;
      this.canvas.style.height = `${this.displayHeight}px`;

      // Synchronize HUD max-width with canvas width for a unified sleek cabinet look
      if (hudEl) {
        hudEl.style.maxWidth = `${this.displayWidth}px`;
      }

      this.ctx.resetTransform();
      this.ctx.scale(this.dpr, this.dpr);

      this.scaleX = this.displayWidth / this.grid.width;
      this.scaleY = this.displayHeight / this.grid.height;
    };

    window.addEventListener('resize', resize);
    resize();
  }

  _pollGamepad() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    if (!gamepads || !gamepads[0]) return;
    const gp = gamepads[0];

    // D-Pad or Left Stick
    const threshold = 0.4;
    this.inputs.left = gp.axes[0] < -threshold || gp.buttons[14]?.pressed;
    this.inputs.right = gp.axes[0] > threshold || gp.buttons[15]?.pressed;
    this.inputs.up = gp.axes[1] < -threshold || gp.buttons[12]?.pressed;
    this.inputs.down = gp.axes[1] > threshold || gp.buttons[13]?.pressed;

    // Fast Draw: Button A (0) or X (2) or RT (7)
    this.inputs.drawFast = gp.buttons[0]?.pressed || gp.buttons[2]?.pressed || gp.buttons[7]?.pressed;

    // Slow Draw: Button B (1) or Y (3) or LT (6)
    this.inputs.drawSlow = gp.buttons[1]?.pressed || gp.buttons[3]?.pressed || gp.buttons[6]?.pressed;

    // Pause: Start button (9)
    if (gp.buttons[9]?.pressed && !this._prevGpStart) {
      this.togglePause();
    }
    this._prevGpStart = gp.buttons[9]?.pressed;
  }

  setGameMode(mode) {
    this.gameMode = mode;
    if (mode === 'hardcore') {
      this.lives = 1;
      this.targetPercent = 80;
    } else if (mode === 'zen') {
      this.lives = 99;
      this.targetPercent = 75;
    } else {
      this.lives = 3;
      this.targetPercent = 75;
    }
  }

  startNewGame() {
    this.audio.init();
    this.audio.resume();
    this.audio.startBGM();

    this.score = 0;
    this.level = 1;
    this.largestSingleCut = 0;
    this.totalTerritoryCaptured = 0;

    if (this.gameMode === 'hardcore') {
      this.lives = 1;
      this.targetPercent = 80;
    } else if (this.gameMode === 'zen') {
      this.lives = 99;
      this.targetPercent = 75;
    } else {
      this.lives = 3;
      this.targetPercent = 75;
    }

    this.ui.hideStartScreen();
    this.ui.hideGameOver();
    this.startLevel(this.level);
  }

  startLevel(lvl) {
    this.level = lvl;
    this.grid.init();

    // Load background artwork for this round (alternates across levels)
    const bgSrc = (lvl % 2 === 1) ? 'assets/background1.jpg' : 'assets/background2.jpg';
    this.grid.loadBackground(bgSrc);

    this.particles.reset();
    this.powerups.reset();
    this.roundTimer = 0;
    this.superSparxTimer = 0;
    this.superSparxTriggerTime = Math.max(25 * 60, (50 - lvl * 3) * 60);

    // Spawn player at bottom center
    this.player.reset(Math.floor(this.grid.width / 2), this.grid.height - 1);

    // Spawn Qix entities
    this.qixes = [];
    const qixSpeed = 1.3 + Math.min(2.0, lvl * 0.25);

    if (lvl >= 3) {
      // 2 Qixes!
      this.qixes.push(
        new Qix(this.grid, {
          x: Math.floor(this.grid.width * 0.35),
          y: Math.floor(this.grid.height * 0.45),
          speed: qixSpeed,
          baseColor: '#ff007f'
        })
      );
      this.qixes.push(
        new Qix(this.grid, {
          x: Math.floor(this.grid.width * 0.65),
          y: Math.floor(this.grid.height * 0.55),
          speed: qixSpeed * 1.1,
          baseColor: '#00f0ff'
        })
      );
    } else {
      // 1 Qix
      this.qixes.push(
        new Qix(this.grid, {
          x: Math.floor(this.grid.width / 2),
          y: Math.floor(this.grid.height / 2),
          speed: qixSpeed,
          baseColor: '#ff007f'
        })
      );
    }

    // Spawn Sparx
    this.sparxes = [];
    const sparxCount = lvl >= 4 ? 3 : 2;
    for (let i = 0; i < sparxCount; i++) {
      const startX = i % 2 === 0 ? 0 : this.grid.width - 1;
      const startY = 0;
      this.sparxes.push(
        new Sparx(this.grid, {
          x: startX,
          y: startY,
          direction: i % 2 === 0 ? 1 : -1,
          moveInterval: Math.max(2, 4 - Math.floor(lvl / 3))
        })
      );
    }

    this.state = 'PLAYING';
    this.audio.setIntensity(0);
    this.particles.addFloatingText(`ROUND ${lvl}`, this.displayWidth / 2, this.displayHeight / 2, '#00ffff', 24);
  }

  togglePause() {
    if (this.state === 'PAUSED') {
      this.state = this.prevPauseState;
      this.ui.showPause(false);
      this.audio.resume();
    } else if (this.state === 'PLAYING') {
      this.prevPauseState = this.state;
      this.state = 'PAUSED';
      this.ui.showPause(true);
    }
  }

  gameLoop(currentTime) {
    try {
      const dt = Math.min(2.0, (currentTime - this.lastTime) / 16.666);
      this.lastTime = currentTime;

      this._pollGamepad();

      if (this.state === 'PLAYING') {
        this.update(dt);
      } else if (this.state === 'DEATH') {
        this.updateDeathSequence(dt);
      }

      this.render();
    } catch (err) {
      console.error('NEO-QIX Game Loop Error:', err);
    } finally {
      this.animFrameId = requestAnimationFrame((t) => this.gameLoop(t));
    }
  }

  update(dt) {
    this.roundTimer += dt;
    this.superSparxTimer += dt;

    // Super Sparx countdown trigger
    if (this.superSparxTimer >= this.superSparxTriggerTime) {
      for (const sp of this.sparxes) {
        if (!sp.isSuper) {
          sp.setSuper(true);
          this.particles.addFloatingText('SUPER SPARX ACTIVE!', this.displayWidth / 2, 40, '#ff0033', 18);
          this.audio.playSparxWarning();
        }
      }
    }

    // Audio Intensity based on territory
    if (this.grid.capturedPercentage >= 70) {
      this.audio.setIntensity(2);
    } else if (this.grid.capturedPercentage >= 50) {
      this.audio.setIntensity(1);
    } else {
      this.audio.setIntensity(0);
    }

    // Update Player & check Stix completion
    const playerResult = this.player.update(this.inputs, this.audio, this.particles, dt);

    // Audio drawing tone
    if (this.player.mode === 'DRAWING') {
      this.audio.startDraw(this.player.drawType === 'slow');
      this.audio.updateDraw(this.player.drawType === 'slow', this.player.stix.length);
    } else {
      this.audio.stopDraw();
    }

    // Handle Fuse Death
    if (playerResult.fuseKilledPlayer) {
      this.handlePlayerDeath('FUSE IGNITION!');
      return;
    }

    // Handle Stix Partition Completion
    if (playerResult.completedPartition) {
      this._handleStixCompleted(playerResult.completedPartition);
    }

    // Update Qix entities & check collision with active stix
    for (const qix of this.qixes) {
      qix.update(this.particles, dt);

      // Collision check with active drawing line
      if (this.player.mode === 'DRAWING') {
        if (qix.checkCollisionWithStix(this.player.stix)) {
          this.handlePlayerDeath('QIX STRIKE!');
          return;
        }

        // Near-miss detection
        if (this.nearMissCooldown <= 0 && qix.checkNearMiss(this.player.stix, 6)) {
          this.nearMissCooldown = 60; // 1s cooldown
          const bonusPts = 250;
          this.score += bonusPts;
          this.audio.playNearMiss();
          this.particles.addFloatingText('NEAR MISS! +250', this.player.x * this.scaleX, this.player.y * this.scaleY - 15, '#ffff00', 16);
          this.particles.emitSparks(this.player.x * this.scaleX, this.player.y * this.scaleY, 12, '#ffff00', 3);
        }
      }
    }

    if (this.nearMissCooldown > 0) this.nearMissCooldown -= dt;

    // Update Sparx enemies & check collision with player
    for (const sparx of this.sparxes) {
      sparx.update({ x: this.player.x, y: this.player.y }, this.particles, dt);

      // Collision check with player marker
      if (sparx.checkCollisionWithPlayer(this.player.x, this.player.y, 2.5)) {
        if (this.player.hasShield) {
          this.player.hasShield = false;
          sparx.freeze(180); // Stun sparx for 3 seconds
          this.particles.emitExplosion(this.player.x * this.scaleX, this.player.y * this.scaleY, 25, '#00ff88');
          this.particles.addFloatingText('SHIELD BLOCKED!', this.player.x * this.scaleX, this.player.y * this.scaleY, '#00ff88', 16);
        } else {
          this.handlePlayerDeath('SPARX COLLISION!');
          return;
        }
      }

      // If player is drawing, check if Sparx strikes the active drawing line
      if (this.player.mode === 'DRAWING' && sparx.checkCollisionWithStix(this.player.stix, 2.2)) {
        if (this.player.hasShield) {
          this.player.hasShield = false;
          sparx.freeze(180);
          this.particles.emitExplosion(sparx.x * this.scaleX, sparx.y * this.scaleY, 25, '#00ff88');
          this.particles.addFloatingText('SHIELD BLOCKED!', sparx.x * this.scaleX, sparx.y * this.scaleY, '#00ff88', 16);
        } else {
          this.handlePlayerDeath('SPARX STRUCK STIX!');
          return;
        }
      }
    }

    // Update Powerups
    this.powerups.update(this.particles);

    // Update Particles
    this.particles.update(dt);

    // Update HUD
    this.ui.updateHUD(
      this.score,
      this.highScore,
      this.level,
      this.grid.capturedPercentage,
      this.targetPercent,
      this.lives,
      this.player.fuseLit,
      {
        hasShield: this.player.hasShield,
        speedBuffTimer: this.player.speedBuffTimer,
        multiplierActive: this.player.multiplierActive
      }
    );
  }

  _handleStixCompleted({ stix, drawType }) {
    const isSlow = drawType === 'slow';
    const result = this.grid.partition(stix, drawType, this.qixes);

    if (result.newCellsCount <= 0) {
      return;
    }

    // Ensure all Sparx remain on active borders
    for (const sparx of this.sparxes) {
      if (!this.grid.isBorder(sparx.x, sparx.y)) {
        const safe = this.grid.findClosestBorderCell(sparx.x, sparx.y);
        sparx.x = safe.x;
        sparx.y = safe.y;
        sparx.prevX = safe.x;
        sparx.prevY = safe.y;
      }
    }

    // Calculate score
    const baseRate = isSlow ? 200 : 100;
    let earnedPoints = Math.round(result.newPercent * baseRate);

    // Check Multiplier buff
    if (this.player.multiplierActive) {
      earnedPoints *= 3;
      this.player.multiplierActive = false;
    }

    // Single Cut Combos
    let comboText = '';
    if (result.newPercent >= 40) {
      earnedPoints += 10000;
      comboText = 'GIGA SLICE! +10,000';
    } else if (result.newPercent >= 25) {
      earnedPoints += 5000;
      comboText = 'ULTRA SLICE! +5,000';
    } else if (result.newPercent >= 15) {
      earnedPoints += 2000;
      comboText = 'MEGA SLICE! +2,000';
    } else if (result.newPercent >= 8) {
      earnedPoints += 500;
      comboText = 'SUPER SLICE! +500';
    }

    this.score += earnedPoints;
    if (result.newPercent > this.largestSingleCut) {
      this.largestSingleCut = result.newPercent;
    }
    this.totalTerritoryCaptured += result.newPercent;

    // Visual & Audio fanfare
    this.audio.playCapture(result.newPercent, isSlow);
    this.particles.triggerScreenShake(result.newPercent > 15 ? 12 : 6);

    const midX = (result.bounds.minX + result.bounds.maxX) * 0.5 * this.scaleX;
    const midY = (result.bounds.minY + result.bounds.maxY) * 0.5 * this.scaleY;

    this.particles.addShockwave(midX, midY, Math.max(40, result.newPercent * 4), isSlow ? '#ffaa00' : '#00f0ff');
    this.particles.emitCaptureDebris(
      result.bounds.minX * this.scaleX,
      result.bounds.minY * this.scaleY,
      (result.bounds.maxX - result.bounds.minX) * this.scaleX,
      (result.bounds.maxY - result.bounds.minY) * this.scaleY,
      Math.min(50, Math.floor(result.newPercent * 2)),
      isSlow ? '#ffaa00' : '#00f0ff'
    );

    this.particles.addFloatingText(
      `+${earnedPoints.toLocaleString()}`,
      midX,
      midY,
      isSlow ? '#ffcc00' : '#00ffff',
      20,
      comboText
    );

    // Check captured Power-up Cores
    const collectedCores = this.powerups.checkCapturedCores();
    for (const core of collectedCores) {
      this._activatePowerup(core);
    }

    // Check 2-QIX SPLIT VICTORY!
    if (result.qixSplit) {
      this.score += 25000;
      this.particles.addFloatingText('QIX SPLIT BONUS! +25,000', this.displayWidth / 2, this.displayHeight / 2, '#ff00aa', 26);
      this.triggerLevelClear(true);
      return;
    }

    // Check Target Goal Completion
    if (result.totalPercent >= this.targetPercent) {
      this.triggerLevelClear(false);
    }
  }

  _activatePowerup(core) {
    this.audio.playPowerup();
    this.particles.addFloatingText(`${core.name}!`, this.displayWidth / 2, 70, core.color, 20, core.description);

    switch (core.id) {
      case 'emp':
        for (const q of this.qixes) q.freeze(core.duration);
        for (const s of this.sparxes) s.freeze(core.duration);
        break;
      case 'shield':
        this.player.hasShield = true;
        break;
      case 'speed':
        this.player.speedBuffTimer = core.duration;
        break;
      case 'multiplier':
        this.player.multiplierActive = true;
        break;
    }
  }

  triggerLevelClear(isSplit = false) {
    this.state = 'LEVEL_CLEAR';
    this.audio.playLevelWin();

    // Bonus points for excess territory: 200 pts for every 1% above target
    const excess = Math.max(0, this.grid.capturedPercentage - this.targetPercent);
    const roundBonus = 5000 + Math.round(excess * 300) + (isSplit ? 25000 : 0);
    this.score += roundBonus;

    this.ui.showLevelClear(this.level, this.score, roundBonus, this.grid.capturedPercentage);

    setTimeout(() => {
      if (this.state === 'LEVEL_CLEAR') {
        this.startLevel(this.level + 1);
      }
    }, 2500);
  }

  handlePlayerDeath(reason = 'LIFE LOST') {
    this.state = 'DEATH';
    this.deathTimer = 0;
    this.audio.playDeath();
    this.player.cancelStix(this.audio);

    const px = this.player.x * this.scaleX;
    const py = this.player.y * this.scaleY;
    this.particles.emitExplosion(px, py, 60, '#ff0055');
    this.particles.addFloatingText(reason, px, py - 20, '#ff0055', 20);

    if (this.gameMode !== 'zen') {
      this.lives--;
    }
  }

  updateDeathSequence(dt) {
    this.deathTimer += dt;
    this.particles.update(dt);

    if (this.deathTimer >= 90) { // ~1.5s
      if (this.lives <= 0) {
        this.triggerGameOver();
      } else {
        // Respawn player on closest safe border
        this.player.reset();
        this.player.snapToBorder();
        this.state = 'PLAYING';
      }
    }
  }

  triggerGameOver() {
    this.state = 'GAME_OVER';
    this.audio.stopBGM();
    this.audio.playGameOver();

    const isNewHigh = this.score > this.highScore;
    if (isNewHigh) {
      this.highScore = this.score;
      this.saveHighScore(this.score, this.level);
    }

    this.ui.showGameOver(
      this.score,
      this.grid.capturedPercentage,
      this.largestSingleCut,
      isNewHigh
    );
  }

  loadHighestScore() {
    try {
      const scores = JSON.parse(localStorage.getItem('neo_qix_scores') || '[]');
      return scores.length > 0 ? scores[0].score : 10000;
    } catch (_) {
      return 10000;
    }
  }

  getHighScores() {
    try {
      return JSON.parse(localStorage.getItem('neo_qix_scores') || '[]');
    } catch (_) {
      return [];
    }
  }

  saveHighScore(score, round) {
    try {
      const scores = this.getHighScores();
      scores.push({
        score,
        round,
        name: 'CYBER-ACE',
        date: new Date().toLocaleDateString()
      });
      scores.sort((a, b) => b.score - a.score);
      const top10 = scores.slice(0, 10);
      localStorage.setItem('neo_qix_scores', JSON.stringify(top10));
    } catch (_) {}
  }

  render() {
    const shake = this.particles.getShakeOffset();
    this.ctx.save();
    this.ctx.translate(shake.x, shake.y);

    // 1. Draw Playfield & Territory
    this.grid.draw(this.ctx, this.displayWidth, this.displayHeight);

    // 2. Draw Powerup Cores
    this.powerups.draw(this.ctx, this.scaleX, this.scaleY);

    // 3. Draw Qixes
    for (const qix of this.qixes) {
      qix.draw(this.ctx, this.scaleX, this.scaleY);
    }

    // 4. Draw Sparx enemies
    for (const sparx of this.sparxes) {
      sparx.draw(this.ctx, this.scaleX, this.scaleY);
    }

    // 5. Draw Player Marker & Stix
    if (this.state !== 'DEATH') {
      this.player.draw(this.ctx, this.scaleX, this.scaleY);
    }

    // 6. Draw Particles, Floating Text & Shockwaves
    this.particles.draw(this.ctx);

    this.ctx.restore();
  }
}
