/**
 * STRIKERS 1945 // Modern 3D Arcade Shmup Engine
 * High-performance 2.5D/3D virtual space vertical shoot 'em up with loop physics
 */

// Web Audio Sound Engine
class ShmupAudio {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  shoot() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(850, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (_) {}
  }

  enemyShoot() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(420, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, this.ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch (_) {}
  }

  explosion(isBoss = false) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const dur = isBoss ? 0.8 : 0.25;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(isBoss ? 160 : 220, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + dur);
      gain.gain.setValueAtTime(isBoss ? 0.35 : 0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + dur);
    } catch (_) {}
  }

  bomb() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 1.2);
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 1.2);
    } catch (_) {}
  }

  loopSwoop() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(300, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, this.ctx.currentTime + 0.3);
      osc.frequency.exponentialRampToValueAtTime(350, this.ctx.currentTime + 0.6);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.6);
    } catch (_) {}
  }

  medal() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(1400, this.ctx.currentTime);
      osc.frequency.setValueAtTime(1800, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (_) {}
  }

  powerUp() {
    const freqs = [523, 659, 784, 1046];
    freqs.forEach((f, i) => {
      setTimeout(() => {
        if (!this.muted && this.ctx) {
          try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = "triangle";
            osc.frequency.setValueAtTime(f, this.ctx.currentTime);
            gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.08);
          } catch (_) {}
        }
      }, i * 50);
    });
  }

  bossSiren() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(600, this.ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.4);
          gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.4);
        } catch (_) {}
      }, i * 450);
    }
  }
}

// Strikers 1945 Master Game Class
class Strikers1945Game {
  constructor() {
    this.canvas = document.getElementById("game-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.audio = new ShmupAudio();

    // Game state
    this.state = "HANGAR"; // "HANGAR", "PLAYING", "GAMEOVER"
    this.selectedPlane = "p38";
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem("strikers1945_hiscore") || "500000", 10);
    this.lives = 3;
    this.bombs = 2;
    this.powerLevel = 1; // 1 to 4
    this.medalsCollected = 0;
    this.enemiesDestroyed = 0;

    // Player Fighter Aircraft
    this.player = {
      x: 240,
      y: 560,
      vx: 0,
      vy: 0,
      speed: 4.8,
      width: 44,
      height: 38,
      bank: 0, // -1 (left tilt) to 1 (right tilt)
      looping: false,
      loopScale: 1.0,
      loopProgress: 0,
      invulnerable: false,
      invulnTimer: 0,
      autoFire: true,
      fireTimer: 0
    };

    // Bullets & Entities Arrays
    this.playerBullets = [];
    this.enemyBullets = [];
    this.enemies = [];
    this.pickups = []; // [P], [B], Medals
    this.particles = [];
    this.screenShake = 0;

    // Mega Bomb explosion wave
    this.bombWave = null; // { x, y, radius, maxRadius }

    // Wave Spawner & Boss
    this.stageTime = 0;
    this.bossSpawned = false;
    this.boss = null;

    // Environment & Parallax Scrolling Layers
    this.oceanY = 0;
    this.clouds = [];
    this.islands = [];
    this.initEnvironment();

    // Input Tracking
    this.keys = { up: false, down: false, left: false, right: false, shoot: false };
    this.isPointerDown = false;
    this.pointerTarget = { x: 240, y: 560 };

    this.lastTime = performance.now();
    this.bindDOM();
    requestAnimationFrame((t) => this.loop(t));
  }

  initEnvironment() {
    // Generate initial islands
    this.islands = [
      { x: 80, y: 150, size: 70, shape: 0 },
      { x: 380, y: -200, size: 90, shape: 1 },
      { x: 180, y: -600, size: 80, shape: 2 }
    ];

    // Generate parallax cloud layers
    this.clouds = [];
    for (let i = 0; i < 8; i++) {
      this.clouds.push({
        x: Math.random() * 480,
        y: Math.random() * 680,
        size: 50 + Math.random() * 70,
        speed: 1.2 + Math.random() * 0.8,
        alpha: 0.2 + Math.random() * 0.25
      });
    }
  }

  bindDOM() {
    // Plane selection cards
    document.querySelectorAll(".plane-card").forEach(card => {
      card.addEventListener("click", () => {
        document.querySelectorAll(".plane-card").forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");
        this.selectedPlane = card.dataset.plane;
      });
    });

    // Scramble button
    document.getElementById("btn-scramble").addEventListener("click", () => this.startMission());

    // Restart button
    document.getElementById("btn-restart").addEventListener("click", () => {
      document.getElementById("game-over-overlay").classList.add("hidden");
      document.getElementById("hangar-select-overlay").classList.remove("hidden");
      this.state = "HANGAR";
    });

    // Sound toggle
    const soundBtn = document.getElementById("btn-sound-toggle");
    soundBtn.addEventListener("click", () => {
      this.audio.muted = !this.audio.muted;
      soundBtn.textContent = `🔊 SOUND: ${this.audio.muted ? "OFF" : "ON"}`;
    });

    // Keyboard bindings
    window.addEventListener("keydown", (e) => {
      const k = e.key.toLowerCase();
      if (k === "arrowup" || k === "w") this.keys.up = true;
      if (k === "arrowdown" || k === "s") this.keys.down = true;
      if (k === "arrowleft" || k === "a") this.keys.left = true;
      if (k === "arrowright" || k === "d") this.keys.right = true;

      if (k === " " || k === "j") {
        if (this.state === "HANGAR") {
          this.startMission();
        } else {
          this.keys.shoot = true;
        }
      }

      if (k === "b" || k === "k") this.triggerBomb();
      if (k === "c" || k === "l") this.triggerLoop();
    });

    window.addEventListener("keyup", (e) => {
      const k = e.key.toLowerCase();
      if (k === "arrowup" || k === "w") this.keys.up = false;
      if (k === "arrowdown" || k === "s") this.keys.down = false;
      if (k === "arrowleft" || k === "a") this.keys.left = false;
      if (k === "arrowright" || k === "d") this.keys.right = false;
      if (k === " " || k === "j") this.keys.shoot = false;
    });

    // Touch & Mouse Pointer Drag Controls
    const viewport = document.getElementById("canvas-viewport");
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: ((clientX - rect.left) / rect.width) * 480,
        y: ((clientY - rect.top) / rect.height) * 680
      };
    };

    viewport.addEventListener("pointerdown", (e) => {
      if (this.state !== "PLAYING") return;
      this.isPointerDown = true;
      this.pointerTarget = getPos(e);
    });

    window.addEventListener("pointermove", (e) => {
      if (this.isPointerDown && this.state === "PLAYING") {
        this.pointerTarget = getPos(e);
      }
    });

    window.addEventListener("pointerup", () => {
      this.isPointerDown = false;
    });

    // Virtual Touch Action Buttons
    document.getElementById("vbtn-bomb").addEventListener("pointerdown", (e) => {
      e.preventDefault();
      this.triggerBomb();
    });

    document.getElementById("vbtn-loop").addEventListener("pointerdown", (e) => {
      e.preventDefault();
      this.triggerLoop();
    });
  }

  startMission() {
    this.audio.init();
    this.state = "PLAYING";
    this.score = 0;
    this.lives = 3;
    this.bombs = 2;
    this.powerLevel = 1;
    this.medalsCollected = 0;
    this.enemiesDestroyed = 0;
    this.stageTime = 0;
    this.bossSpawned = false;
    this.boss = null;

    this.player.x = 240;
    this.player.y = 560;
    this.player.looping = false;
    this.player.invulnerable = true;
    this.player.invulnTimer = 2000;

    this.playerBullets = [];
    this.enemyBullets = [];
    this.enemies = [];
    this.pickups = [];
    this.particles = [];
    this.bombWave = null;

    document.getElementById("hangar-select-overlay").classList.add("hidden");
    document.getElementById("boss-health-container").classList.add("hidden");
    this.updateHUD();
    this.audio.powerUp();
  }

  triggerBomb() {
    if (this.state !== "PLAYING" || this.bombs <= 0 || this.bombWave) return;
    this.bombs--;
    this.updateHUD();
    this.audio.bomb();
    this.screenShake = 20;

    // Deploy screen clearing shockwave
    this.bombWave = {
      x: this.player.x,
      y: this.player.y,
      radius: 10,
      maxRadius: 420
    };

    // Erase all enemy bullets on screen
    this.enemyBullets = [];
  }

  triggerLoop() {
    if (this.state !== "PLAYING" || this.player.looping) return;
    this.player.looping = true;
    this.player.loopProgress = 0;
    this.player.invulnerable = true;
    this.audio.loopSwoop();

    // Convert nearby enemy bullets into gold medals
    for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
      const b = this.enemyBullets[i];
      if (Math.hypot(b.x - this.player.x, b.y - this.player.y) < 140) {
        this.spawnPickup(b.x, b.y, "medal");
        this.enemyBullets.splice(i, 1);
      }
    }
  }

  // Master Loop
  loop(timestamp) {
    const dt = Math.min(timestamp - this.lastTime, 100);
    this.lastTime = timestamp;

    this.update(dt);
    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    if (this.state !== "PLAYING") return;

    this.stageTime += dt;

    // Scrolling background layers
    this.oceanY = (this.oceanY + 1.2) % 680;

    this.islands.forEach(isl => {
      isl.y += 0.8;
      if (isl.y > 750) {
        isl.y = -200;
        isl.x = Math.random() * 400 + 40;
      }
    });

    this.clouds.forEach(c => {
      c.y += c.speed;
      if (c.y > 720) {
        c.y = -100;
        c.x = Math.random() * 480;
      }
    });

    // Screen Shake decay
    if (this.screenShake > 0) {
      this.screenShake *= 0.88;
      if (this.screenShake < 0.5) this.screenShake = 0;
    }

    // Update Player & 3D banking
    this.updatePlayer(dt);

    // Update Bullets
    this.updateBullets(dt);

    // Update Enemies & Spawning
    this.updateEnemies(dt);

    // Update Mega Bomb
    this.updateBomb(dt);

    // Update Pickups
    this.updatePickups(dt);

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= dt * 0.002;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  updatePlayer(dt) {
    const p = this.player;

    // Movement (Keyboard or Pointer Drag)
    let moveX = 0;
    let moveY = 0;

    if (this.isPointerDown) {
      const dx = this.pointerTarget.x - p.x;
      const dy = this.pointerTarget.y - p.y;
      moveX = Math.sign(dx) * Math.min(Math.abs(dx) * 0.18, p.speed);
      moveY = Math.sign(dy) * Math.min(Math.abs(dy) * 0.18, p.speed);
    } else {
      if (this.keys.left) moveX -= p.speed;
      if (this.keys.right) moveX += p.speed;
      if (this.keys.up) moveY -= p.speed;
      if (this.keys.down) moveY += p.speed;
    }

    p.x += moveX;
    p.y += moveY;

    // Screen boundaries
    p.x = Math.max(24, Math.min(456, p.x));
    p.y = Math.max(50, Math.min(640, p.y));

    // 3D Banking Roll (tilts left/right)
    const targetBank = moveX !== 0 ? Math.sign(moveX) * 0.75 : 0;
    p.bank += (targetBank - p.bank) * 0.2;

    // 3D Loop Evasion
    if (p.looping) {
      p.loopProgress += dt * 0.0018;
      // Loop vertical scaling toward camera
      p.loopScale = 1.0 + Math.sin(p.loopProgress * Math.PI) * 1.2;

      if (p.loopProgress >= 1.0) {
        p.looping = false;
        p.loopScale = 1.0;
        p.invulnerable = false;
      }
    }

    // Invulnerability timer
    if (p.invulnTimer > 0) {
      p.invulnTimer -= dt;
      if (p.invulnTimer <= 0) p.invulnerable = false;
    }

    // Auto-Fire Primary Vulcan Cannon
    p.fireTimer += dt;
    if (p.fireTimer >= 105 && !p.looping) {
      p.fireTimer = 0;
      this.firePlayerWeapon();
    }
  }

  firePlayerWeapon() {
    const p = this.player;
    this.audio.shoot();

    if (this.selectedPlane === "p38") {
      // P-38: Twin Laser / Heavy Vulcan
      const offset = 8;
      this.playerBullets.push({ x: p.x - offset, y: p.y - 18, vx: 0, vy: -12, color: "#38bdf8", size: 4 });
      this.playerBullets.push({ x: p.x + offset, y: p.y - 18, vx: 0, vy: -12, color: "#38bdf8", size: 4 });

      if (this.powerLevel >= 2) {
        this.playerBullets.push({ x: p.x - 18, y: p.y - 12, vx: -1.2, vy: -11, color: "#facc15", size: 3 });
        this.playerBullets.push({ x: p.x + 18, y: p.y - 12, vx: 1.2, vy: -11, color: "#facc15", size: 3 });
      }
      if (this.powerLevel >= 3) {
        this.playerBullets.push({ x: p.x - 24, y: p.y - 6, vx: -2.5, vy: -10, color: "#f97316", size: 3.5 });
        this.playerBullets.push({ x: p.x + 24, y: p.y - 6, vx: 2.5, vy: -10, color: "#f97316", size: 3.5 });
      }
    } else if (this.selectedPlane === "spitfire") {
      // Spitfire: Wide 5-Way Fan Spread
      const angles = [-0.25, -0.12, 0, 0.12, 0.25];
      const count = Math.min(angles.length, 1 + this.powerLevel);
      const startIdx = Math.floor((angles.length - count) / 2);

      for (let i = 0; i < count; i++) {
        const a = angles[startIdx + i];
        this.playerBullets.push({
          x: p.x,
          y: p.y - 16,
          vx: Math.sin(a) * 11,
          vy: -Math.cos(a) * 11,
          color: "#4ade80",
          size: 3.5
        });
      }
    } else {
      // Zero: High-Velocity Piercing Cannon
      this.playerBullets.push({ x: p.x, y: p.y - 20, vx: 0, vy: -14, color: "#ef4444", size: 5 });
      if (this.powerLevel >= 2) {
        this.playerBullets.push({ x: p.x - 12, y: p.y - 14, vx: 0, vy: -13, color: "#f59e0b", size: 3.5 });
        this.playerBullets.push({ x: p.x + 12, y: p.y - 14, vx: 0, vy: -13, color: "#f59e0b", size: 3.5 });
      }
      if (this.powerLevel >= 3) {
        this.playerBullets.push({ x: p.x - 20, y: p.y - 10, vx: -1.5, vy: -12, color: "#ef4444", size: 3.5 });
        this.playerBullets.push({ x: p.x + 20, y: p.y - 10, vx: 1.5, vy: -12, color: "#ef4444", size: 3.5 });
      }
    }
  }

  updateBullets(dt) {
    // Player Bullets
    for (let i = this.playerBullets.length - 1; i >= 0; i--) {
      const b = this.playerBullets[i];
      b.x += b.vx;
      b.y += b.vy;

      if (b.y < -20 || b.x < -20 || b.x > 500) {
        this.playerBullets.splice(i, 1);
        continue;
      }

      // Hit check against enemies
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const e = this.enemies[j];
        if (Math.hypot(b.x - e.x, b.y - e.y) < e.radius) {
          e.hp -= 1;
          this.spawnHitSpark(b.x, b.y);
          this.playerBullets.splice(i, 1);

          if (e.hp <= 0) {
            this.destroyEnemy(e, j);
          }
          break;
        }
      }
    }

    // Enemy Bullets
    for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
      const eb = this.enemyBullets[i];
      eb.x += eb.vx;
      eb.y += eb.vy;

      if (eb.y > 700 || eb.x < -20 || eb.x > 500) {
        this.enemyBullets.splice(i, 1);
        continue;
      }

      // Hit check against Player
      if (!this.player.invulnerable && !this.player.looping) {
        if (Math.hypot(eb.x - this.player.x, eb.y - this.player.y) < 10) {
          this.killPlayer();
          this.enemyBullets.splice(i, 1);
          break;
        }
      }
    }
  }

  updateEnemies(dt) {
    // Enemy Spawning Waves
    if (!this.bossSpawned) {
      if (Math.random() < 0.025) {
        // Spawn scout plane formation
        const startX = Math.random() * 380 + 50;
        this.enemies.push({
          type: "scout",
          x: startX,
          y: -40,
          vx: (Math.random() - 0.5) * 1.5,
          vy: 2.5,
          hp: 2,
          maxHp: 2,
          radius: 18,
          shootTimer: 0,
          scoreVal: 200
        });
      }

      if (this.stageTime > 15000 && Math.random() < 0.008) {
        // Heavy twin-engine bomber
        this.enemies.push({
          type: "bomber",
          x: Math.random() * 320 + 80,
          y: -80,
          vx: 0,
          vy: 1.1,
          hp: 22,
          maxHp: 22,
          radius: 36,
          shootTimer: 0,
          scoreVal: 1500
        });
      }

      // Boss Trigger at 45 seconds
      if (this.stageTime > 45000) {
        this.spawnBoss();
      }
    }

    // Update Existing Enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      e.x += e.vx;
      e.y += e.vy;

      // Enemy shooting behavior
      e.shootTimer += dt;
      if (e.type === "scout" && e.shootTimer > 1800) {
        e.shootTimer = 0;
        this.fireEnemyBullet(e.x, e.y, this.player.x, this.player.y, 3.0);
      } else if (e.type === "bomber" && e.shootTimer > 1400) {
        e.shootTimer = 0;
        // Radial 3-way flak burst
        for (let a = -0.3; a <= 0.3; a += 0.3) {
          const angle = Math.atan2(this.player.y - e.y, this.player.x - e.x) + a;
          this.enemyBullets.push({
            x: e.x, y: e.y + 15,
            vx: Math.cos(angle) * 3.2,
            vy: Math.sin(angle) * 3.2,
            color: "#f97316"
          });
        }
        this.audio.enemyShoot();
      } else if (e.type === "boss") {
        this.updateBoss(e, dt);
      }

      if (e.y > 750 && e.type !== "boss") {
        this.enemies.splice(i, 1);
      }
    }
  }

  spawnBoss() {
    this.bossSpawned = true;
    this.audio.bossSiren();

    const banner = document.getElementById("boss-warning-banner");
    banner.classList.remove("hidden");
    setTimeout(() => banner.classList.add("hidden"), 3000);

    const healthBox = document.getElementById("boss-health-container");
    healthBox.classList.remove("hidden");

    this.boss = {
      type: "boss",
      x: 240,
      y: -140,
      vx: 0,
      vy: 0.6,
      hp: 120,
      maxHp: 120,
      radius: 65,
      shootTimer: 0,
      phase: 1,
      scoreVal: 10000
    };

    this.enemies.push(this.boss);
  }

  updateBoss(b, dt) {
    // Descend into upper court
    if (b.y < 130) {
      b.y += 0.8;
    } else {
      // Horizontal patrol
      b.x += Math.sin(performance.now() / 800) * 1.5;
    }

    // Update Boss Health Bar
    const pct = Math.max(0, (b.hp / b.maxHp) * 100);
    const fill = document.getElementById("boss-health-fill");
    if (fill) fill.style.width = `${pct}%`;

    // Multi-phase attack patterns
    b.shootTimer += dt;
    if (b.shootTimer > 1100) {
      b.shootTimer = 0;
      // Spiral bullet barrage
      const bulletCount = 8;
      for (let i = 0; i < bulletCount; i++) {
        const angle = (Math.PI * 2 * i) / bulletCount + (performance.now() / 500);
        this.enemyBullets.push({
          x: b.x,
          y: b.y + 20,
          vx: Math.cos(angle) * 2.8,
          vy: Math.sin(angle) * 2.8,
          color: "#ef4444"
        });
      }
      this.audio.enemyShoot();
    }
  }

  fireEnemyBullet(fromX, fromY, toX, toY, speed = 3.2) {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    this.enemyBullets.push({
      x: fromX,
      y: fromY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color: "#f59e0b"
    });
    this.audio.enemyShoot();
  }

  destroyEnemy(e, index) {
    this.enemies.splice(index, 1);
    this.enemiesDestroyed++;
    this.addScore(e.scoreVal);
    this.screenShake = e.type === "boss" ? 35 : (e.type === "bomber" ? 14 : 5);
    this.audio.explosion(e.type === "boss");

    // Spawn Explosion Particles
    this.spawnExplosion(e.x, e.y, e.radius);

    // Drop Pickups
    if (e.type === "boss") {
      // Victory!
      document.getElementById("boss-health-container").classList.add("hidden");
      for (let i = 0; i < 6; i++) {
        this.spawnPickup(e.x + (Math.random() - 0.5) * 60, e.y + (Math.random() - 0.5) * 60, "medal");
      }
      setTimeout(() => this.triggerVictory(), 2000);
    } else {
      if (Math.random() < 0.25) this.spawnPickup(e.x, e.y, "medal");
      else if (Math.random() < 0.12) this.spawnPickup(e.x, e.y, "power");
      else if (Math.random() < 0.05) this.spawnPickup(e.x, e.y, "bomb");
    }
  }

  spawnPickup(x, y, type) {
    this.pickups.push({
      x, y,
      type,
      vy: 1.4,
      rotation: 0
    });
  }

  updatePickups(dt) {
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const p = this.pickups[i];
      p.y += p.vy;
      p.rotation += 0.08;

      if (p.y > 700) {
        this.pickups.splice(i, 1);
        continue;
      }

      // Collect by Player
      if (Math.hypot(p.x - this.player.x, p.y - this.player.y) < 32) {
        if (p.type === "medal") {
          this.medalsCollected++;
          this.addScore(1000);
          this.audio.medal();
        } else if (p.type === "power") {
          if (this.powerLevel < 4) this.powerLevel++;
          this.audio.powerUp();
          this.updateHUD();
        } else if (p.type === "bomb") {
          if (this.bombs < 5) this.bombs++;
          this.audio.powerUp();
          this.updateHUD();
        }
        this.pickups.splice(i, 1);
      }
    }
  }

  updateBomb(dt) {
    if (!this.bombWave) return;
    this.bombWave.radius += dt * 0.45;

    // Destroy all enemy bullets inside wave
    for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
      const eb = this.enemyBullets[i];
      if (Math.hypot(eb.x - this.bombWave.x, eb.y - this.bombWave.y) < this.bombWave.radius) {
        this.enemyBullets.splice(i, 1);
      }
    }

    // Heavy damage to enemies inside wave
    this.enemies.forEach(e => {
      if (Math.hypot(e.x - this.bombWave.x, e.y - this.bombWave.y) < this.bombWave.radius) {
        e.hp -= 0.6;
      }
    });

    if (this.bombWave.radius >= this.bombWave.maxRadius) {
      this.bombWave = null;
    }
  }

  killPlayer() {
    this.lives--;
    this.audio.explosion(true);
    this.spawnExplosion(this.player.x, this.player.y, 40);
    this.screenShake = 18;
    this.updateHUD();

    if (this.lives <= 0) {
      this.triggerGameOver();
    } else {
      // Respawn with invulnerability
      this.player.x = 240;
      this.player.y = 580;
      this.player.invulnerable = true;
      this.player.invulnTimer = 2500;
      this.powerLevel = Math.max(1, this.powerLevel - 1);
      this.updateHUD();
    }
  }

  addScore(pts) {
    this.score += pts;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem("strikers1945_hiscore", this.highScore.toString());
    }
    this.updateHUD();
  }

  updateHUD() {
    document.getElementById("hud-score").textContent = String(this.score).padStart(6, "0");
    document.getElementById("hud-highscore").textContent = String(this.highScore).padStart(6, "0");

    // Lives icons
    const livesDiv = document.getElementById("hud-lives");
    livesDiv.innerHTML = Array(this.lives).fill('<span class="life-plane">✈</span>').join("");

    // Bombs icons
    const bombsDiv = document.getElementById("hud-bombs");
    bombsDiv.innerHTML = Array(this.bombs).fill('<span class="bomb-badge">💣</span>').join("");

    // Power fill
    const powerFill = document.getElementById("power-bar-fill");
    if (powerFill) powerFill.style.width = `${(this.powerLevel / 4) * 100}%`;
  }

  triggerVictory() {
    this.state = "GAMEOVER";
    document.getElementById("go-title").textContent = "MISSION COMPLETE!";
    document.getElementById("go-title").style.color = "#4ade80";
    this.showGameOverModal();
  }

  triggerGameOver() {
    this.state = "GAMEOVER";
    document.getElementById("go-title").textContent = "MISSION DEFEAT";
    document.getElementById("go-title").style.color = "#ef4444";
    this.showGameOverModal();
  }

  showGameOverModal() {
    document.getElementById("go-final-score").textContent = this.score.toLocaleString();
    document.getElementById("go-medals").textContent = this.medalsCollected;
    document.getElementById("go-kills").textContent = this.enemiesDestroyed;
    document.getElementById("game-over-overlay").classList.remove("hidden");
  }

  spawnExplosion(x, y, radius) {
    for (let i = 0; i < 16; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.5;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        color: Math.random() > 0.4 ? "#f59e0b" : "#ef4444"
      });
    }
  }

  spawnHitSpark(x, y) {
    for (let i = 0; i < 3; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        life: 0.5,
        color: "#ffffff"
      });
    }
  }

  // Rendering
  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, 480, 680);

    ctx.save();
    // Screen shake offset
    if (this.screenShake > 0) {
      const sx = (Math.random() - 0.5) * this.screenShake;
      const sy = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(sx, sy);
    }

    // 1. Deep Ocean & Waves (Bottom Virtual Plane)
    this.renderOcean(ctx);

    // 2. Island Archipelago
    this.renderIslands(ctx);

    // 3. Lower Clouds
    this.renderClouds(ctx);

    // 4. Enemy Ships & Aircraft
    this.enemies.forEach(e => this.renderEnemy(ctx, e));

    // 5. Pickups (Gold Medals, Power, Bombs)
    this.pickups.forEach(p => this.renderPickup(ctx, p));

    // 6. Player Fighter (With 3D Banking & Loop Scale)
    this.renderPlayer(ctx);

    // 7. Bullets (Player & Enemy)
    this.renderBullets(ctx);

    // 8. Mega Bomb Firestorm Wave
    if (this.bombWave) this.renderBombWave(ctx);

    // 9. Particle FX
    this.renderParticles(ctx);

    ctx.restore();
  }

  renderOcean(ctx) {
    // Deep Pacific Blue Gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 680);
    grad.addColorStop(0, "#081d3d");
    grad.addColorStop(1, "#041024");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 480, 680);

    // Wave foam lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1.5;
    for (let y = -40; y < 720; y += 45) {
      const curY = (y + this.oceanY) % 720;
      ctx.beginPath();
      ctx.moveTo(0, curY);
      ctx.bezierCurveTo(120, curY + 6, 240, curY - 6, 480, curY);
      ctx.stroke();
    }
  }

  renderIslands(ctx) {
    this.islands.forEach(isl => {
      ctx.save();
      ctx.translate(isl.x, isl.y);

      // Island Sand Beach rim
      ctx.fillStyle = "#d97706";
      ctx.beginPath();
      ctx.ellipse(0, 0, isl.size * 0.7, isl.size * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Island Lush Jungle Green
      ctx.fillStyle = "#15803d";
      ctx.beginPath();
      ctx.ellipse(0, 0, isl.size * 0.58, isl.size * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  }

  renderClouds(ctx) {
    this.clouds.forEach(c => {
      ctx.save();
      ctx.fillStyle = `rgba(255, 255, 255, ${c.alpha})`;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.size * 0.4, 0, Math.PI * 2);
      ctx.arc(c.x + c.size * 0.3, c.y - 8, c.size * 0.35, 0, Math.PI * 2);
      ctx.arc(c.x - c.size * 0.3, c.y - 5, c.size * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  renderPlayer(ctx) {
    const p = this.player;

    ctx.save();
    // 3D Shadow on sea below
    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.beginPath();
    ctx.ellipse(p.x + 20, p.y + 40, 20 * p.loopScale, 12 * p.loopScale, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.translate(p.x, p.y);
    ctx.scale(p.loopScale, p.loopScale);

    // Inverted during loop apex
    if (p.looping && p.loopProgress > 0.3 && p.loopProgress < 0.7) {
      ctx.scale(1, -1);
    }

    // 3D Bank skew
    ctx.transform(1, 0, p.bank * 0.35, 1, 0, 0);

    // Flashing if invulnerable
    if (p.invulnerable && Math.floor(performance.now() / 80) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    if (this.selectedPlane === "p38") {
      // P-38 Lightning Twin-Boom Fuselage
      ctx.fillStyle = "#cbd5e1"; // Metallic silver body
      ctx.fillRect(-18, -14, 6, 32); // Left boom
      ctx.fillRect(12, -14, 6, 32);  // Right boom

      // Propellers on booms
      ctx.fillStyle = "#f59e0b";
      ctx.fillRect(-20, -18, 10, 4);
      ctx.fillRect(10, -18, 10, 4);

      // Center Cockpit Pod
      ctx.fillStyle = "#64748b";
      ctx.beginPath();
      ctx.ellipse(0, 0, 8, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      // Main Wings
      ctx.fillStyle = "#94a3b8";
      ctx.beginPath();
      ctx.moveTo(-28, 2);
      ctx.lineTo(28, 2);
      ctx.lineTo(0, -12);
      ctx.closePath();
      ctx.fill();

      // Tail connector
      ctx.fillStyle = "#64748b";
      ctx.fillRect(-18, 14, 36, 4);

      // Glass Canopy
      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.ellipse(0, -4, 4, 8, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.selectedPlane === "spitfire") {
      // Spitfire Elliptical Wings
      ctx.fillStyle = "#334155";
      ctx.beginPath();
      ctx.ellipse(0, 2, 26, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Fuselage
      ctx.fillStyle = "#475569";
      ctx.beginPath();
      ctx.ellipse(0, 0, 7, 22, 0, 0, Math.PI * 2);
      ctx.fill();

      // Yellow Propeller Tip
      ctx.fillStyle = "#facc15";
      ctx.fillRect(-4, -24, 8, 3);

      // RAF Roundel on wings
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(-14, 2, 4, 0, Math.PI * 2);
      ctx.arc(14, 2, 4, 0, Math.PI * 2);
      ctx.fill();

      // Canopy
      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.ellipse(0, -2, 3.5, 7, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // A6M Zero
      ctx.fillStyle = "#15803d"; // Dark Imperial Green
      ctx.beginPath();
      ctx.moveTo(-24, 4);
      ctx.lineTo(24, 4);
      ctx.lineTo(0, -14);
      ctx.closePath();
      ctx.fill();

      // Fuselage
      ctx.fillStyle = "#166534";
      ctx.beginPath();
      ctx.ellipse(0, 0, 6.5, 20, 0, 0, Math.PI * 2);
      ctx.fill();

      // Red Hinomaru Sun Emblems
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(-14, 2, 4.5, 0, Math.PI * 2);
      ctx.arc(14, 2, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Canopy
      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.ellipse(0, -3, 3.5, 6, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  renderEnemy(ctx, e) {
    ctx.save();
    ctx.translate(e.x, e.y);

    if (e.type === "scout") {
      // Scout Plane
      ctx.fillStyle = "#b91c1c";
      ctx.beginPath();
      ctx.moveTo(-16, -2);
      ctx.lineTo(16, -2);
      ctx.lineTo(0, 14);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#7f1d1d";
      ctx.fillRect(-4, -12, 8, 22);
    } else if (e.type === "bomber") {
      // Heavy Bomber
      ctx.fillStyle = "#334155";
      ctx.beginPath();
      ctx.moveTo(-38, -6);
      ctx.lineTo(38, -6);
      ctx.lineTo(0, 32);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#1e293b";
      ctx.fillRect(-10, -24, 20, 52);

      // Rotating Turrets
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(-18, 0, 5, 0, Math.PI * 2);
      ctx.arc(18, 0, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (e.type === "boss") {
      // Super Battleship Boss
      ctx.fillStyle = "#1e293b"; // Dark Battleship Steel
      ctx.beginPath();
      ctx.moveTo(0, 95);
      ctx.lineTo(45, 20);
      ctx.lineTo(55, -80);
      ctx.lineTo(-55, -80);
      ctx.lineTo(-45, 20);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Main Deck & Armor
      ctx.fillStyle = "#334155";
      ctx.fillRect(-35, -60, 70, 110);

      // Triple Turrets
      const turretY = [-40, -10, 25];
      turretY.forEach(ty => {
        ctx.fillStyle = "#64748b";
        ctx.beginPath();
        ctx.arc(0, ty, 14, 0, Math.PI * 2);
        ctx.fill();

        // Gun Barrels pointed at player
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-4, ty);
        ctx.lineTo(-4, ty + 24);
        ctx.moveTo(4, ty);
        ctx.lineTo(4, ty + 24);
        ctx.stroke();
      });

      // Bridge Command Tower
      ctx.fillStyle = "#f59e0b";
      ctx.fillRect(-10, -50, 20, 16);
    }

    ctx.restore();
  }

  renderBullets(ctx) {
    // Player Bullets
    this.playerBullets.forEach(b => {
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Enemy Bullets (Glowing Neon Orange/Red Orbs)
    this.enemyBullets.forEach(eb => {
      ctx.fillStyle = eb.color;
      ctx.shadowColor = eb.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(eb.x, eb.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }

  renderPickup(ctx, p) {
    ctx.save();
    ctx.translate(p.x, p.y);

    if (p.type === "medal") {
      // Spinning Gold Medal in 3D
      const scaleX = Math.cos(p.rotation);
      ctx.scale(scaleX, 1);
      ctx.fillStyle = "#facc15";
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ca8a04";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#ef4444";
      ctx.font = "bold 9px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("★", 0, 3);
    } else if (p.type === "power") {
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(-9, -9, 18, 18);
      ctx.strokeStyle = "#ffffff";
      ctx.strokeRect(-9, -9, 18, 18);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px monospace";
      ctx.textAlign = "center";
      ctx.fillText("P", 0, 4);
    } else if (p.type === "bomb") {
      ctx.fillStyle = "#0284c7";
      ctx.fillRect(-9, -9, 18, 18);
      ctx.strokeStyle = "#ffffff";
      ctx.strokeRect(-9, -9, 18, 18);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px monospace";
      ctx.textAlign = "center";
      ctx.fillText("B", 0, 4);
    }

    ctx.restore();
  }

  renderBombWave(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.bombWave.x, this.bombWave.y, this.bombWave.radius, 0, Math.PI * 2);
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 14;
    ctx.stroke();

    ctx.fillStyle = "rgba(239, 68, 68, 0.25)";
    ctx.fill();
    ctx.restore();
  }

  renderParticles(ctx) {
    this.particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;
  }
}

// Bootstrap
document.addEventListener("DOMContentLoaded", () => {
  window.strikersGame = new Strikers1945Game();
});
