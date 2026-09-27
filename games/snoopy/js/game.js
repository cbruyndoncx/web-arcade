/**
 * NINTENDO GAME & WATCH TABLETOP: SNOOPY (Model SM-73, 1983)
 * Full authentic web emulation with Web Audio piezo synthesizer and LCD rendering
 */

// Audio Synthesizer (Vintage Game & Watch Piezo Beeper)
class AudioBeeps {
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

  beep(freq = 1200, duration = 0.04, type = "square") {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (_) {}
  }

  tick() {
    this.beep(1800, 0.02, "square");
  }

  step() {
    this.beep(650, 0.03, "square");
  }

  swing() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(900, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch (_) {}
  }

  smash() {
    this.beep(1200, 0.04, "square");
    setTimeout(() => this.beep(1600, 0.06, "square"), 30);
  }

  miss() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(260, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
    } catch (_) {}
  }

  woodstockWake() {
    for (let i = 0; i < 4; i++) {
      setTimeout(() => this.beep(2100 + (i % 2) * 300, 0.04, "square"), i * 65);
    }
  }

  fanfare() {
    const notes = [523, 659, 784, 1046];
    notes.forEach((f, idx) => {
      setTimeout(() => this.beep(f, 0.08, "square"), idx * 90);
    });
  }

  kick() {
    this.beep(180, 0.15, "triangle");
  }
}

// Game State Engine
class SnoopyTabletopGame {
  constructor() {
    this.canvas = document.getElementById("gw-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.audio = new AudioBeeps();

    // Platforms (Positions 0, 1, 2, 3)
    this.platforms = [
      { id: 0, x: 105, y: 175, color: "#e11d48", label: "RED" },
      { id: 1, x: 200, y: 165, color: "#10b981", label: "GREEN" },
      { id: 2, x: 295, y: 155, color: "#38bdf8", label: "BLUE" },
      { id: 3, x: 390, y: 145, color: "#facc15", label: "YELLOW" }
    ];

    // Snoopy State
    this.snoopyPos = 1; // Start on platform 1
    this.snoopySwinging = false;
    this.snoopySwingTimer = 0;
    this.snoopyFalling = false;
    this.snoopyFallTimer = 0;

    // Game Mode & Rules
    this.gameMode = "A"; // "A" or "B" or "TIME"
    this.state = "ATTRACT"; // "ATTRACT", "PLAYING", "GAMEOVER", "INTERMISSION"
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem("snoopy_gw_highscore") || "0", 10);
    this.misses = 0;
    this.maxMisses = 3;

    // Note Tracking
    // Notes travel across discrete step stages: 0 (emerging), 1, 2, 3 (near), 4 (strike zone)
    this.notes = []; // { track: 0..3, step: 0..5, type: 'note' }
    this.tickInterval = 550; // ms per step tick
    this.lastTickTime = 0;
    this.spawnTimer = 0;

    // Woodstock State
    this.woodstockAwake = false;
    this.woodstockTimer = 0;

    // Lucy Intermission
    this.lucyActive = false;
    this.lucyStep = 0;
    this.lucyTimer = 0;
    this.nextBonusMilestone = 100;

    // Particle FX
    this.particles = [];

    // Animation Loop
    this.lastFrameTime = performance.now();
    this.clockTimeStr = "12:00";

    this.bindDOM();
    this.startAttractMode();
    requestAnimationFrame((t) => this.loop(t));
  }

  bindDOM() {
    // Buttons
    document.getElementById("btn-game-a").addEventListener("click", () => this.startGame("A"));
    document.getElementById("btn-game-b").addEventListener("click", () => this.startGame("B"));
    document.getElementById("btn-time").addEventListener("click", () => this.showTimeMode());

    const soundBtn = document.getElementById("btn-sound");
    soundBtn.addEventListener("click", () => {
      this.audio.muted = !this.audio.muted;
      soundBtn.innerHTML = `<span class="btn-pip"></span> SOUND: ${this.audio.muted ? "OFF" : "ON"}`;
    });

    // Directional controls
    const joyLeft = document.getElementById("joy-left");
    const joyRight = document.getElementById("joy-right");
    const joySmash = document.getElementById("btn-smash");
    const joyStick = document.getElementById("joy-stick");

    const doLeft = () => {
      joyLeft.classList.add("pressed");
      if (joyStick) joyStick.style.transform = "translateX(-6px) rotate(-12deg)";
      this.moveLeft();
      setTimeout(() => {
        joyLeft.classList.remove("pressed");
        if (joyStick) joyStick.style.transform = "";
      }, 120);
    };

    const doRight = () => {
      joyRight.classList.add("pressed");
      if (joyStick) joyStick.style.transform = "translateX(6px) rotate(12deg)";
      this.moveRight();
      setTimeout(() => {
        joyRight.classList.remove("pressed");
        if (joyStick) joyStick.style.transform = "";
      }, 120);
    };

    const doSmash = () => {
      joySmash.classList.add("pressed");
      this.smash();
      setTimeout(() => joySmash.classList.remove("pressed"), 120);
    };

    joyLeft.addEventListener("pointerdown", (e) => { e.preventDefault(); doLeft(); });
    joyRight.addEventListener("pointerdown", (e) => { e.preventDefault(); doRight(); });
    joySmash.addEventListener("pointerdown", (e) => { e.preventDefault(); doSmash(); });

    // Keyboard bindings
    window.addEventListener("keydown", (e) => {
      if (e.repeat && e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;

      if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") {
        doLeft();
      } else if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") {
        doRight();
      } else if (e.key === " " || e.key === "ArrowUp" || e.key === "Enter") {
        e.preventDefault();
        doSmash();
      } else if (e.key === "1") {
        this.startGame("A");
      } else if (e.key === "2") {
        this.startGame("B");
      } else if (e.key.toLowerCase() === "m") {
        soundBtn.click();
      }
    });
  }

  showTimeMode() {
    this.state = "ATTRACT";
    this.gameMode = "TIME";
    this.updateClock();
    this.notes = [];
    this.audio.tick();
  }

  startAttractMode() {
    this.state = "ATTRACT";
    this.score = 0;
    this.misses = 0;
    this.notes = [];
    this.updateClock();
  }

  startGame(mode = "A") {
    this.audio.init();
    this.gameMode = mode;
    this.state = "PLAYING";
    this.score = 0;
    this.misses = 0;
    this.notes = [];
    this.snoopyPos = 1;
    this.snoopyFalling = false;
    this.woodstockAwake = false;
    this.lucyActive = false;
    this.nextBonusMilestone = 100;
    this.tickInterval = mode === "A" ? 540 : 440;
    this.lastTickTime = performance.now();

    document.querySelectorAll(".sys-btn").forEach(b => b.classList.remove("active"));
    const activeBtn = document.getElementById(mode === "A" ? "btn-game-a" : "btn-game-b");
    if (activeBtn) activeBtn.classList.add("active");

    this.audio.fanfare();
  }

  moveLeft() {
    if (this.state !== "PLAYING" || this.snoopyFalling || this.lucyActive) {
      if (this.state === "ATTRACT") this.startGame("A");
      return;
    }

    if (this.snoopyPos > 0) {
      this.snoopyPos--;
      this.audio.step();
    } else {
      // Over the edge! Fall hazard
      this.triggerFall();
    }
  }

  moveRight() {
    if (this.state !== "PLAYING" || this.snoopyFalling || this.lucyActive) {
      if (this.state === "ATTRACT") this.startGame("A");
      return;
    }

    if (this.snoopyPos < 3) {
      this.snoopyPos++;
      this.audio.step();
    } else {
      // Over the right edge! Fall hazard
      this.triggerFall();
    }
  }

  triggerFall() {
    this.snoopyFalling = true;
    this.snoopyFallTimer = 1200;
    this.audio.miss();
    this.addMiss();
    setTimeout(() => {
      this.snoopyFalling = false;
      this.snoopyPos = 1; // recover to safe platform
    }, 1200);
  }

  smash() {
    if (this.state !== "PLAYING" || this.snoopyFalling || this.lucyActive) {
      if (this.state === "ATTRACT") this.startGame("A");
      return;
    }

    this.snoopySwinging = true;
    this.snoopySwingTimer = 180;
    this.audio.swing();

    // Check collision with any note in current platform's strike zone (step 3 or 4)
    let hitAny = false;
    for (let i = this.notes.length - 1; i >= 0; i--) {
      const n = this.notes[i];
      if (n.track === this.snoopyPos && (n.step === 3 || n.step === 4)) {
        // SMASH HIT!
        hitAny = true;
        this.notes.splice(i, 1);

        const pts = (n.step === 4) ? (this.gameMode === "B" ? 3 : 2) : 1;
        this.addScore(pts);
        this.audio.smash();

        // Spawn hit stars
        const p = this.platforms[this.snoopyPos];
        this.spawnStars(p.x + 20, p.y - 15, p.color);
        break;
      }
    }
  }

  addScore(pts) {
    this.score += pts;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem("snoopy_gw_highscore", this.highScore.toString());
    }

    // Speed scaling
    if (this.score % 20 === 0 && this.tickInterval > 280) {
      this.tickInterval -= 15;
    }

    // Every 100 points: Lucy intermission
    if (this.score >= this.nextBonusMilestone) {
      this.nextBonusMilestone += 100;
      this.startLucyIntermission();
    }

    // 300 points bonus: Clear misses or double
    if (this.score === 300) {
      if (this.misses > 0) {
        this.misses = 0;
        this.audio.fanfare();
      }
    }
  }

  addMiss() {
    this.misses++;
    this.woodstockAwake = true;
    this.woodstockTimer = 1800;
    this.audio.woodstockWake();

    if (this.misses >= this.maxMisses) {
      this.state = "GAMEOVER";
      this.audio.miss();
    }
  }

  startLucyIntermission() {
    this.lucyActive = true;
    this.lucyStep = 0;
    this.lucyTimer = 0;
    this.audio.fanfare();
  }

  spawnStars(x, y, color) {
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 * i) / 6;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * (2 + Math.random() * 2),
        vy: Math.sin(angle) * (2 + Math.random() * 2),
        life: 1.0,
        color
      });
    }
  }

  updateClock() {
    const d = new Date();
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    this.clockTimeStr = `${h}:${m}`;
  }

  // Master Game Loop
  loop(timestamp) {
    const dt = timestamp - this.lastFrameTime;
    this.lastFrameTime = timestamp;

    this.update(dt, timestamp);
    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt, timestamp) {
    // Clock updates periodically
    if (timestamp % 1000 < dt) {
      this.updateClock();
    }

    // Lucy Intermission
    if (this.lucyActive) {
      this.lucyTimer += dt;
      if (this.lucyTimer > 400) {
        this.lucyTimer = 0;
        this.lucyStep++;
        if (this.lucyStep === 3) {
          this.audio.kick();
        }
        if (this.lucyStep > 6) {
          this.lucyActive = false;
        }
      }
      return;
    }

    // Snoopy timers
    if (this.snoopySwinging) {
      this.snoopySwingTimer -= dt;
      if (this.snoopySwingTimer <= 0) this.snoopySwinging = false;
    }

    if (this.woodstockAwake) {
      this.woodstockTimer -= dt;
      if (this.woodstockTimer <= 0) this.woodstockAwake = false;
    }

    // Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= dt / 400;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    if (this.state !== "PLAYING") return;

    // Note advancement tick
    if (timestamp - this.lastTickTime >= this.tickInterval) {
      this.lastTickTime = timestamp;
      this.audio.tick();

      // Advance existing notes
      for (let i = this.notes.length - 1; i >= 0; i--) {
        const n = this.notes[i];
        n.step++;

        // If note surpasses strike zone (step 5) -> Woodstock woken up!
        if (n.step >= 5) {
          this.notes.splice(i, 1);
          this.addMiss();
        }
      }

      // Spawn new notes periodically
      this.spawnTimer++;
      const spawnRate = this.gameMode === "B" ? 2 : 3;
      if (this.spawnTimer >= spawnRate) {
        this.spawnTimer = 0;

        // Choose track
        const maxTrack = this.gameMode === "B" ? 4 : 3;
        const chosenTrack = Math.floor(Math.random() * maxTrack);

        // Don't stack immediately on same track
        const existsAtStart = this.notes.some(n => n.track === chosenTrack && n.step <= 1);
        if (!existsAtStart) {
          this.notes.push({
            track: chosenTrack,
            step: 0
          });
        }
      }
    }
  }

  // LCD Graphic Rendering
  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, 560, 380);

    // 1. Vintage Tabletop Background Artwork
    this.renderBackgroundArt(ctx);

    // 2. Schroeder at his piano
    this.renderSchroeder(ctx);

    // 3. Tree, Branches & Woodstock in Nest
    this.renderWoodstockAndTree(ctx);

    // 4. Musical Notes on Paths
    this.renderMusicalNotes(ctx);

    // 5. Snoopy on Platform
    this.renderSnoopy(ctx);

    // 6. Lucy Intermission (if active)
    if (this.lucyActive) {
      this.renderLucy(ctx);
    }

    // 7. Hit Star Particles
    this.renderParticles(ctx);

    // 8. LCD Scoreboard & Status Bar
    this.renderLCDHeader(ctx);
  }

  renderBackgroundArt(ctx) {
    // Screen gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 380);
    grad.addColorStop(0, "#1a2130");
    grad.addColorStop(0.7, "#141a24");
    grad.addColorStop(1, "#0d1117");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 560, 380);

    // Lawn / Ground
    ctx.fillStyle = "#1e3a24";
    ctx.fillRect(0, 320, 560, 60);
    ctx.fillStyle = "#2d5e38";
    ctx.fillRect(0, 318, 560, 3);

    // Platform Posts / Steps
    this.platforms.forEach((p, idx) => {
      // Wooden support post
      ctx.fillStyle = "#334155";
      ctx.fillRect(p.x + 8, p.y + 12, 10, 320 - (p.y + 12));

      // Platform Bar
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(p.x - 14, p.y + 10, 54, 8);

      // Color Badge on Platform Edge
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - 14, p.y + 10, 54, 3);

      // Platform number pill
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.font = "bold 9px monospace";
      ctx.fillText(String(idx + 1), p.x + 9, p.y + 26);
    });
  }

  renderSchroeder(ctx) {
    const px = 200;
    const py = 280;

    // Grand Piano (Red Toy Piano)
    ctx.fillStyle = "#991b1b";
    ctx.fillRect(px - 40, py - 18, 48, 28);
    ctx.fillStyle = "#dc2626";
    ctx.fillRect(px - 40, py - 20, 50, 4);

    // Piano Keys
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(px + 4, py - 14, 14, 6);
    ctx.fillStyle = "#000000";
    ctx.fillRect(px + 6, py - 14, 3, 4);
    ctx.fillRect(px + 12, py - 14, 3, 4);

    // Piano legs
    ctx.fillStyle = "#7f1d1d";
    ctx.fillRect(px - 36, py + 10, 5, 25);
    ctx.fillRect(px - 2, py + 10, 5, 25);

    // Schroeder sitting
    const sx = px + 28;
    const sy = py + 2;

    // Striped Shirt (Blue & Black)
    ctx.fillStyle = "#2563eb";
    ctx.fillRect(sx - 10, sy - 18, 16, 18);
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(sx - 10, sy - 14, 16, 3);
    ctx.fillRect(sx - 10, sy - 7, 16, 3);

    // Head & Blonde Hair
    ctx.fillStyle = "#fde047"; // Blonde hair
    ctx.beginPath();
    ctx.arc(sx - 2, sy - 26, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fed7aa"; // Face skin
    ctx.beginPath();
    ctx.arc(sx - 4, sy - 24, 7, 0, Math.PI * 2);
    ctx.fill();

    // Eye looking at keys
    ctx.fillStyle = "#000000";
    ctx.fillRect(sx - 7, sy - 25, 2, 2);

    // Hands on piano keys
    ctx.fillStyle = "#fed7aa";
    ctx.fillRect(px + 6, py - 12, 12, 4);
  }

  renderWoodstockAndTree(ctx) {
    const tx = 470;
    const ty = 135;

    // Tree Trunk
    ctx.fillStyle = "#3e2723";
    ctx.beginPath();
    ctx.moveTo(tx + 20, 320);
    ctx.lineTo(tx + 40, 320);
    ctx.lineTo(tx + 30, ty);
    ctx.lineTo(tx + 10, ty);
    ctx.closePath();
    ctx.fill();

    // Branch holding nest
    ctx.fillStyle = "#4e342e";
    ctx.fillRect(tx - 35, ty + 12, 50, 10);

    // Foliage Cloud
    ctx.fillStyle = "#1b4d24";
    ctx.beginPath();
    ctx.arc(tx + 25, ty - 25, 35, 0, Math.PI * 2);
    ctx.arc(tx - 10, ty - 20, 28, 0, Math.PI * 2);
    ctx.arc(tx + 50, ty - 15, 26, 0, Math.PI * 2);
    ctx.fill();

    // Twig Nest
    ctx.fillStyle = "#8d6e63";
    ctx.beginPath();
    ctx.ellipse(tx - 10, ty + 10, 22, 10, 0, 0, Math.PI);
    ctx.fill();
    ctx.strokeStyle = "#5d4037";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Woodstock in nest
    const wx = tx - 10;
    const wy = ty - 2;

    ctx.fillStyle = "#facc15"; // Yellow bird body
    ctx.beginPath();
    ctx.arc(wx, wy, 8, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = "#f97316";
    ctx.beginPath();
    ctx.moveTo(wx - 7, wy);
    ctx.lineTo(wx - 14, wy + 2);
    ctx.lineTo(wx - 7, wy + 4);
    ctx.closePath();
    ctx.fill();

    // Crest feathers
    ctx.fillStyle = "#facc15";
    ctx.fillRect(wx - 2, wy - 14, 3, 7);
    ctx.fillRect(wx + 2, wy - 12, 3, 5);

    if (this.woodstockAwake) {
      // Startled eyes
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(wx - 2, wy - 1, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#000000";
      ctx.fillRect(wx - 3, wy - 2, 2, 2);

      // Exclamation marks
      ctx.fillStyle = "#ef4444";
      ctx.font = "bold 16px monospace";
      ctx.fillText("!!", wx - 5, wy - 18);
    } else {
      // Sleeping Z z z
      ctx.fillStyle = "#000000";
      ctx.fillRect(wx - 4, wy - 1, 4, 1.5); // Closed eye

      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.font = "bold 11px monospace";
      const zOffset = Math.sin(performance.now() / 300) * 3;
      ctx.fillText("z", wx + 6, wy - 8 + zOffset);
      ctx.font = "bold 14px monospace";
      ctx.fillText("Z", wx + 14, wy - 16 + zOffset);
    }
  }

  renderMusicalNotes(ctx) {
    // Note paths: interpolate positions between piano (x:200, y:280) and target platform strike zones
    this.notes.forEach(n => {
      const targetPlatform = this.platforms[n.track];
      const startX = 180 + n.track * 8;
      const startY = 270;
      const endX = targetPlatform.x + 12;
      const endY = targetPlatform.y - 12;

      // Calculate path arc depending on step 0..4
      const t = n.step / 4.0;
      const curX = startX + (endX - startX) * t;
      const arcHeight = 40 * Math.sin(t * Math.PI);
      const curY = startY + (endY - startY) * t - arcHeight;

      this.drawSingleNote(ctx, curX, curY, targetPlatform.color, n.step >= 3);
    });
  }

  drawSingleNote(ctx, x, y, color, inStrikeZone) {
    ctx.save();
    ctx.translate(x, y);

    if (inStrikeZone) {
      // Pulsing glow in strike zone
      const glow = (Math.sin(performance.now() / 80) + 1) / 2;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10 * glow + 4;
    }

    ctx.fillStyle = color;

    // Eighth note oval head
    ctx.beginPath();
    ctx.ellipse(0, 0, 5, 4, -Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();

    // Stem
    ctx.fillRect(3, -14, 2.5, 14);

    // Flag
    ctx.beginPath();
    ctx.moveTo(5, -14);
    ctx.quadraticCurveTo(12, -10, 8, -4);
    ctx.lineTo(5, -6);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  renderSnoopy(ctx) {
    const p = this.platforms[this.snoopyPos];
    let sx = p.x;
    let sy = p.y;

    if (this.snoopyFalling) {
      // Tumbling fall animation
      sy += 70;
      ctx.fillStyle = "#ef4444";
      ctx.font = "bold 14px monospace";
      ctx.fillText("FALL!", sx - 10, sy - 30);
    }

    ctx.save();
    ctx.translate(sx, sy);

    // Snoopy Body (White Dog)
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(8, 0, 10, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Snoopy Head
    ctx.beginPath();
    ctx.ellipse(14, -14, 11, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Black Nose
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.ellipse(25, -14, 3, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Black Drooping Ear
    ctx.beginPath();
    ctx.ellipse(6, -10, 4, 8, Math.PI / 12, 0, Math.PI * 2);
    ctx.fill();

    // Black Eye
    ctx.fillRect(16, -16, 2, 2.5);

    // Red Baseball Cap
    ctx.fillStyle = "#e11d48";
    ctx.beginPath();
    ctx.arc(12, -18, 9, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(14, -19, 10, 3); // Cap visor

    // Feet
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 10, 8, 4);
    ctx.fillRect(9, 10, 8, 4);

    // Mallet / Hammer
    ctx.strokeStyle = "#854d0e"; // Wooden handle
    ctx.lineWidth = 3;
    ctx.fillStyle = "#a16207"; // Wooden mallet head

    if (this.snoopySwinging) {
      // Swing down toward note
      ctx.beginPath();
      ctx.moveTo(12, -4);
      ctx.lineTo(26, -4);
      ctx.stroke();

      ctx.fillRect(24, -10, 8, 12);
    } else {
      // Up over shoulder
      ctx.beginPath();
      ctx.moveTo(10, -4);
      ctx.lineTo(4, -22);
      ctx.stroke();

      ctx.fillRect(0, -26, 12, 7);
    }

    ctx.restore();
  }

  renderLucy(ctx) {
    // Lucy stomping in at bottom to kick piano
    const lx = 70 + this.lucyStep * 18;
    const ly = 295;

    ctx.fillStyle = "#3b82f6"; // Blue dress
    ctx.fillRect(lx - 8, ly - 20, 16, 20);

    // Black hair
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(lx, ly - 26, 9, 0, Math.PI * 2);
    ctx.fill();

    // Face
    ctx.fillStyle = "#fed7aa";
    ctx.beginPath();
    ctx.arc(lx + 2, ly - 24, 6, 0, Math.PI * 2);
    ctx.fill();

    if (this.lucyStep === 3) {
      // Kicking foot!
      ctx.fillStyle = "#ef4444";
      ctx.font = "bold 14px monospace";
      ctx.fillText("*CLANG!*", lx + 15, ly - 25);
    }
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

  renderLCDHeader(ctx) {
    // LCD Top Header Banner
    ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
    ctx.fillRect(0, 0, 560, 42);
    ctx.fillStyle = "#334155";
    ctx.fillRect(0, 42, 560, 1);

    // Digital Score Display
    ctx.fillStyle = "#facc15";
    ctx.font = "bold 20px monospace";
    const scoreStr = this.state === "ATTRACT" && this.gameMode === "TIME" 
      ? this.clockTimeStr 
      : String(this.score).padStart(4, "0");

    ctx.fillText(scoreStr, 35, 28);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 9px monospace";
    ctx.fillText(this.gameMode === "TIME" ? "CLOCK" : "SCORE", 35, 39);

    // Game Mode Indicator
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 12px monospace";
    ctx.fillText(`GAME ${this.gameMode}`, 240, 24);

    // Best Score
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 10px monospace";
    ctx.fillText(`BEST: ${String(this.highScore).padStart(4, "0")}`, 320, 24);

    // Miss Indicators (X X X)
    ctx.font = "bold 16px monospace";
    for (let i = 0; i < this.maxMisses; i++) {
      if (i < this.misses) {
        ctx.fillStyle = "#ef4444";
        ctx.fillText("✕", 460 + i * 22, 26);
      } else {
        ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
        ctx.fillText("·", 462 + i * 22, 26);
      }
    }

    // Attract / Game Over Overlay message
    if (this.state === "ATTRACT") {
      ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
      ctx.fillRect(110, 80, 340, 55);
      ctx.strokeStyle = "#ea580c";
      ctx.strokeRect(110, 80, 340, 55);

      ctx.fillStyle = "#facc15";
      ctx.font = "bold 14px monospace";
      ctx.textAlign = "center";
      ctx.fillText("PRESS GAME A OR GAME B", 280, 102);
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "11px sans-serif";
      ctx.fillText("Hit Schroeder's notes to protect sleeping Woodstock!", 280, 122);
      ctx.textAlign = "start";
    } else if (this.state === "GAMEOVER") {
      ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
      ctx.fillRect(140, 80, 280, 55);
      ctx.strokeStyle = "#ef4444";
      ctx.strokeRect(140, 80, 280, 55);

      ctx.fillStyle = "#ef4444";
      ctx.font = "bold 18px monospace";
      ctx.textAlign = "center";
      ctx.fillText("GAME OVER", 280, 105);
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "11px sans-serif";
      ctx.fillText("Press Game A or B to try again", 280, 124);
      ctx.textAlign = "start";
    }
  }
}

// Instantiate on Load
document.addEventListener("DOMContentLoaded", () => {
  window.snoopyGame = new SnoopyTabletopGame();
});
