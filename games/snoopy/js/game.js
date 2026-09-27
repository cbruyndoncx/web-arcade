/**
 * NINTENDO GAME & WATCH TABLETOP: SNOOPY (Model SM-73, 1983)
 * Modernized Smooth Physics & Authentic Piezo Sound Emulation
 */

// Vintage Game & Watch Piezo Beeper Sound Engine
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

  beep(freq = 1200, duration = 0.04, type = "square", volume = 0.12) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (_) {}
  }

  step() {
    this.beep(520, 0.035, "square", 0.09);
  }

  swing() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, this.ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.09, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch (_) {}
  }

  smash(perfect = false) {
    if (perfect) {
      this.beep(1318, 0.05, "square", 0.15);
      setTimeout(() => this.beep(1760, 0.08, "square", 0.15), 35);
    } else {
      this.beep(1046, 0.04, "square", 0.12);
      setTimeout(() => this.beep(1318, 0.06, "square", 0.12), 30);
    }
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
      osc.frequency.exponentialRampToValueAtTime(95, this.ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.4);
    } catch (_) {}
  }

  woodstockWake() {
    for (let i = 0; i < 4; i++) {
      setTimeout(() => this.beep(2200 + (i % 2) * 350, 0.04, "square", 0.14), i * 60);
    }
  }

  fanfare() {
    const notes = [523, 659, 784, 1046];
    notes.forEach((f, idx) => {
      setTimeout(() => this.beep(f, 0.08, "square", 0.13), idx * 85);
    });
  }

  kick() {
    this.beep(160, 0.18, "triangle", 0.22);
  }
}

// Master Game Controller
class SnoopyTabletopGame {
  constructor() {
    this.canvas = document.getElementById("gw-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.audio = new AudioBeeps();

    // 4 Platform Stations
    this.platforms = [
      { id: 0, x: 105, y: 175, color: "#e11d48", label: "RED" },
      { id: 1, x: 200, y: 165, color: "#10b981", label: "GREEN" },
      { id: 2, x: 295, y: 155, color: "#38bdf8", label: "BLUE" },
      { id: 3, x: 390, y: 145, color: "#facc15", label: "YELLOW" }
    ];

    // Snoopy Smooth Movement Physics
    this.snoopyPos = 1; // 0, 1, 2, 3
    this.snoopyX = this.platforms[1].x;
    this.targetX = this.platforms[1].x;
    this.snoopyY = this.platforms[1].y;
    this.targetY = this.platforms[1].y;
    this.snoopyFacing = 1; // 1 = right, -1 = left
    this.walkAnimTimer = 0;
    this.isMoving = false;

    // Hammer Action
    this.snoopySwinging = false;
    this.snoopySwingTimer = 0;

    // Game Mode & Progression
    this.gameMode = "A"; // "A", "B", "TIME"
    this.state = "ATTRACT"; // "ATTRACT", "PLAYING", "GAMEOVER"
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem("snoopy_gw_highscore") || "0", 10);
    this.misses = 0;
    this.maxMisses = 3;

    // Smooth Flying Musical Notes
    // Each note has: track (0..3), progress (0.0 -> 1.0), speed
    this.notes = [];
    this.spawnTimer = 0;
    this.baseSpeed = 0.00045; // progress per ms
    this.nextBonusMilestone = 100;

    // Floating Score Popups & Particle FX
    this.popups = [];
    this.particles = [];

    // Woodstock & Lucy Animation States
    this.woodstockAwake = false;
    this.woodstockTimer = 0;
    this.lucyActive = false;
    this.lucyStep = 0;
    this.lucyTimer = 0;

    // Clock
    this.clockTimeStr = "12:00";
    this.lastFrameTime = performance.now();

    this.bindDOM();
    this.checkFirstTimeGuide();
    this.startAttractMode();
    requestAnimationFrame((t) => this.loop(t));
  }

  bindDOM() {
    // Mode Buttons
    document.getElementById("btn-game-a").addEventListener("click", () => this.startGame("A"));
    document.getElementById("btn-game-b").addEventListener("click", () => this.startGame("B"));
    document.getElementById("btn-time").addEventListener("click", () => this.showTimeMode());

    // Sound Toggle
    const soundBtn = document.getElementById("btn-sound");
    soundBtn.addEventListener("click", () => {
      this.audio.muted = !this.audio.muted;
      soundBtn.innerHTML = `<span class="btn-pip"></span> SOUND: ${this.audio.muted ? "OFF" : "ON"}`;
    });

    // How to Play Modal
    const howToPlayBtn = document.getElementById("btn-how-to-play");
    const instModal = document.getElementById("instructions-modal");
    const instCloseBtn = document.getElementById("inst-close-btn");
    const instDismissBtn = document.getElementById("inst-btn-dismiss");
    const instStartA = document.getElementById("inst-btn-start-a");
    const instStartB = document.getElementById("inst-btn-start-b");

    const openGuide = () => {
      instModal.classList.remove("hidden");
    };

    const closeGuide = () => {
      instModal.classList.add("hidden");
    };

    if (howToPlayBtn) howToPlayBtn.addEventListener("click", openGuide);
    if (instCloseBtn) instCloseBtn.addEventListener("click", closeGuide);
    if (instDismissBtn) instDismissBtn.addEventListener("click", closeGuide);

    if (instStartA) {
      instStartA.addEventListener("click", () => {
        closeGuide();
        this.startGame("A");
      });
    }

    if (instStartB) {
      instStartB.addEventListener("click", () => {
        closeGuide();
        this.startGame("B");
      });
    }

    // Physical Controls
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
      }, 100);
    };

    const doRight = () => {
      joyRight.classList.add("pressed");
      if (joyStick) joyStick.style.transform = "translateX(6px) rotate(12deg)";
      this.moveRight();
      setTimeout(() => {
        joyRight.classList.remove("pressed");
        if (joyStick) joyStick.style.transform = "";
      }, 100);
    };

    const doSmash = () => {
      joySmash.classList.add("pressed");
      this.smash();
      setTimeout(() => joySmash.classList.remove("pressed"), 100);
    };

    joyLeft.addEventListener("pointerdown", (e) => { e.preventDefault(); doLeft(); });
    joyRight.addEventListener("pointerdown", (e) => { e.preventDefault(); doRight(); });
    joySmash.addEventListener("pointerdown", (e) => { e.preventDefault(); doSmash(); });

    // Keyboard Bindings
    window.addEventListener("keydown", (e) => {
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
      } else if (e.key.toLowerCase() === "h") {
        openGuide();
      } else if (e.key.toLowerCase() === "m") {
        soundBtn.click();
      } else if (e.key === "Escape") {
        closeGuide();
      }
    });
  }

  checkFirstTimeGuide() {
    const seen = localStorage.getItem("snoopy_guide_seen");
    if (!seen) {
      setTimeout(() => {
        const instModal = document.getElementById("instructions-modal");
        if (instModal) instModal.classList.remove("hidden");
        localStorage.setItem("snoopy_guide_seen", "true");
      }, 400);
    }
  }

  showTimeMode() {
    this.state = "ATTRACT";
    this.gameMode = "TIME";
    this.updateClock();
    this.notes = [];
    this.audio.step();
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
    this.popups = [];
    this.particles = [];
    this.snoopyPos = 1;
    this.snoopyX = this.platforms[1].x;
    this.targetX = this.platforms[1].x;
    this.snoopyY = this.platforms[1].y;
    this.targetY = this.platforms[1].y;
    this.woodstockAwake = false;
    this.lucyActive = false;
    this.nextBonusMilestone = 100;
    this.spawnTimer = 0;

    // Game A: slightly calmer speed. Game B: fast
    this.baseSpeed = mode === "A" ? 0.00042 : 0.00058;

    document.querySelectorAll(".sys-btn").forEach(b => b.classList.remove("active"));
    const activeBtn = document.getElementById(mode === "A" ? "btn-game-a" : "btn-game-b");
    if (activeBtn) activeBtn.classList.add("active");

    this.audio.fanfare();
  }

  moveLeft() {
    if (this.state !== "PLAYING" || this.lucyActive) {
      if (this.state === "ATTRACT") this.startGame("A");
      return;
    }

    if (this.snoopyPos > 0) {
      this.snoopyPos--;
      this.targetX = this.platforms[this.snoopyPos].x;
      this.targetY = this.platforms[this.snoopyPos].y;
      this.snoopyFacing = -1;
      this.audio.step();
    } else {
      // Gentle bump at boundary (safe, non-punishing)
      this.snoopyX -= 4;
      this.audio.step();
    }
  }

  moveRight() {
    if (this.state !== "PLAYING" || this.lucyActive) {
      if (this.state === "ATTRACT") this.startGame("A");
      return;
    }

    if (this.snoopyPos < 3) {
      this.snoopyPos++;
      this.targetX = this.platforms[this.snoopyPos].x;
      this.targetY = this.platforms[this.snoopyPos].y;
      this.snoopyFacing = 1;
      this.audio.step();
    } else {
      // Gentle bump at boundary (safe, non-punishing)
      this.snoopyX += 4;
      this.audio.step();
    }
  }

  smash() {
    if (this.state !== "PLAYING" || this.lucyActive) {
      if (this.state === "ATTRACT") this.startGame("A");
      return;
    }

    this.snoopySwinging = true;
    this.snoopySwingTimer = 160;
    this.audio.swing();

    // Check hit in current platform's Strike Zone (progress between 0.68 and 0.88)
    let hitIndex = -1;
    let bestDelta = 999;

    for (let i = 0; i < this.notes.length; i++) {
      const n = this.notes[i];
      if (n.track === this.snoopyPos && n.progress >= 0.68 && n.progress <= 0.88) {
        const delta = Math.abs(n.progress - 0.78);
        if (delta < bestDelta) {
          bestDelta = delta;
          hitIndex = i;
        }
      }
    }

    if (hitIndex !== -1) {
      const hitNote = this.notes.splice(hitIndex, 1)[0];
      const p = this.platforms[this.snoopyPos];
      const isPerfect = bestDelta < 0.04;
      const pts = isPerfect ? 3 : 1;

      this.addScore(pts);
      this.audio.smash(isPerfect);

      // Visual Popups
      this.popups.push({
        x: p.x + 12,
        y: p.y - 30,
        text: isPerfect ? "PERFECT! +3" : "+1",
        color: isPerfect ? "#facc15" : "#4ade80",
        life: 1.0
      });

      // Musical Starburst Particles
      this.spawnParticles(p.x + 18, p.y - 12, p.color, isPerfect ? 10 : 6);
    }
  }

  addScore(pts) {
    this.score += pts;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem("snoopy_gw_highscore", this.highScore.toString());
    }

    // Gradual difficulty increase
    if (this.score % 25 === 0 && this.baseSpeed < 0.00095) {
      this.baseSpeed += 0.00003;
    }

    // Lucy Intermission at 100 points
    if (this.score >= this.nextBonusMilestone) {
      this.nextBonusMilestone += 100;
      this.startLucyIntermission();
    }

    // 300 Points Bonus: clear misses
    if (this.score === 300 && this.misses > 0) {
      this.misses = 0;
      this.audio.fanfare();
      this.popups.push({
        x: 280,
        y: 120,
        text: "MISSES CLEARED!",
        color: "#38bdf8",
        life: 1.5
      });
    }
  }

  addMiss() {
    this.misses++;
    this.woodstockAwake = true;
    this.woodstockTimer = 1800;
    this.audio.woodstockWake();

    this.popups.push({
      x: 470,
      y: 100,
      text: "MISS!",
      color: "#ef4444",
      life: 1.2
    });

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

  spawnParticles(x, y, color, count = 8) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5);
      const speed = 1.5 + Math.random() * 2.5;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.8,
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

  // Main Loop
  loop(timestamp) {
    const dt = Math.min(timestamp - this.lastFrameTime, 100);
    this.lastFrameTime = timestamp;

    this.update(dt, timestamp);
    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt, timestamp) {
    if (timestamp % 1000 < dt) {
      this.updateClock();
    }

    // Smooth Snoopy Lerp Interpolation
    const dx = this.targetX - this.snoopyX;
    const dy = this.targetY - this.snoopyY;
    this.isMoving = Math.abs(dx) > 1.2;

    if (this.isMoving) {
      this.snoopyX += dx * 0.35;
      this.snoopyY += dy * 0.35;
      this.walkAnimTimer += dt * 0.015;
    } else {
      this.snoopyX = this.targetX;
      this.snoopyY = this.targetY;
      this.walkAnimTimer = 0;
    }

    // Hammer swing timer
    if (this.snoopySwinging) {
      this.snoopySwingTimer -= dt;
      if (this.snoopySwingTimer <= 0) this.snoopySwinging = false;
    }

    // Woodstock awake timer
    if (this.woodstockAwake) {
      this.woodstockTimer -= dt;
      if (this.woodstockTimer <= 0) this.woodstockAwake = false;
    }

    // Lucy Intermission
    if (this.lucyActive) {
      this.lucyTimer += dt;
      if (this.lucyTimer > 350) {
        this.lucyTimer = 0;
        this.lucyStep++;
        if (this.lucyStep === 3) this.audio.kick();
        if (this.lucyStep > 6) this.lucyActive = false;
      }
      return;
    }

    // Popups & Particles
    for (let i = this.popups.length - 1; i >= 0; i--) {
      const pop = this.popups[i];
      pop.y -= dt * 0.035;
      pop.life -= dt * 0.0015;
      if (pop.life <= 0) this.popups.splice(i, 1);
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += dt * 0.002; // gravity
      p.life -= dt * 0.002;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    if (this.state !== "PLAYING") return;

    // Advance Flying Musical Notes (Smooth continuous progression)
    for (let i = this.notes.length - 1; i >= 0; i--) {
      const n = this.notes[i];
      n.progress += this.baseSpeed * dt;

      // Check if note flew past the platform into Woodstock's nest (progress >= 1.0)
      if (n.progress >= 1.0) {
        this.notes.splice(i, 1);
        this.addMiss();
      }
    }

    // Spawn new notes periodically
    this.spawnTimer += dt;
    const spawnThreshold = this.gameMode === "B" ? 1400 : 2100;
    if (this.spawnTimer >= spawnThreshold) {
      this.spawnTimer = 0;

      const trackLimit = this.gameMode === "B" ? 4 : 3;
      const track = Math.floor(Math.random() * trackLimit);

      // Check not immediately overlapping on same track
      const overlaps = this.notes.some(n => n.track === track && n.progress < 0.25);
      if (!overlaps) {
        this.notes.push({
          track,
          progress: 0.0
        });
      }
    }
  }

  // Rendering
  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, 560, 380);

    // 1. Background, Ground & Platform Stems
    this.renderBackgroundArt(ctx);

    // 2. Trajectory Stave Guides & Strike Zone Targets
    this.renderTrajectoryGuidesAndTargets(ctx);

    // 3. Schroeder at Red Piano
    this.renderSchroeder(ctx);

    // 4. Woodstock in Tree Nest
    this.renderWoodstockAndTree(ctx);

    // 5. Smooth Flying Musical Notes
    this.renderNotes(ctx);

    // 6. Smoothly Interpolated Snoopy
    this.renderSnoopy(ctx);

    // 7. Lucy Intermission
    if (this.lucyActive) this.renderLucy(ctx);

    // 8. Particles & Popups
    this.renderParticlesAndPopups(ctx);

    // 9. LCD Score & Status Overlay
    this.renderLCDHeader(ctx);
  }

  renderBackgroundArt(ctx) {
    // Vintage LCD Dark Navy Screen
    const grad = ctx.createLinearGradient(0, 0, 0, 380);
    grad.addColorStop(0, "#192231");
    grad.addColorStop(0.7, "#121824");
    grad.addColorStop(1, "#0a0f18");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 560, 380);

    // Ground Grass Line
    ctx.fillStyle = "#1e3a24";
    ctx.fillRect(0, 320, 560, 60);
    ctx.fillStyle = "#34d399";
    ctx.fillRect(0, 318, 560, 3);

    // Platforms
    this.platforms.forEach((p, idx) => {
      // Post support
      ctx.fillStyle = "#334155";
      ctx.fillRect(p.x + 8, p.y + 12, 10, 320 - (p.y + 12));

      // Platform Bar
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(p.x - 14, p.y + 10, 54, 8);

      // Colored Platform Top Accent
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - 14, p.y + 10, 54, 3);

      // Station ID Pill
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.font = "bold 9px monospace";
      ctx.fillText(String(idx + 1), p.x + 9, p.y + 26);
    });
  }

  renderTrajectoryGuidesAndTargets(ctx) {
    const startX = 200;
    const startY = 275;

    this.platforms.forEach((p, trackIdx) => {
      // Subtle curved trajectory guides
      ctx.save();
      ctx.strokeStyle = p.color;
      ctx.globalAlpha = 0.14;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);

      const endX = p.x + 12;
      const endY = p.y - 14;
      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2 - 35;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(midX, midY, endX, endY);
      ctx.stroke();
      ctx.restore();

      // Glowing STRIKE TARGET CIRCLE over each platform
      const isSnoopyHere = this.snoopyPos === trackIdx;
      const hasNoteInZone = this.notes.some(n => n.track === trackIdx && n.progress >= 0.68 && n.progress <= 0.88);

      ctx.save();
      ctx.translate(endX, endY);

      if (hasNoteInZone) {
        // High alert: note is inside the strike zone!
        const pulse = Math.sin(performance.now() / 60) * 3;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2.5;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 14;

        ctx.beginPath();
        ctx.arc(0, 0, 15 + pulse, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = isSnoopyHere ? "#facc15" : p.color;
        ctx.font = "bold 9px monospace";
        ctx.textAlign = "center";
        ctx.fillText(isSnoopyHere ? "SMASH!" : "MOVE HERE", 0, -20);
      } else {
        // Subtle resting strike target
        ctx.strokeStyle = p.color;
        ctx.globalAlpha = isSnoopyHere ? 0.45 : 0.2;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, 13, 0, Math.PI * 2);
        ctx.stroke();

        if (isSnoopyHere) {
          ctx.fillStyle = "rgba(255,255,255,0.4)";
          ctx.font = "8px monospace";
          ctx.textAlign = "center";
          ctx.fillText("TARGET", 0, -16);
        }
      }

      ctx.restore();
    });
  }

  renderSchroeder(ctx) {
    const px = 200;
    const py = 280;

    // Upright Piano
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

    // Piano Legs
    ctx.fillStyle = "#7f1d1d";
    ctx.fillRect(px - 36, py + 10, 5, 25);
    ctx.fillRect(px - 2, py + 10, 5, 25);

    // Schroeder (Blue & Black Striped Shirt, Blonde Hair)
    const sx = px + 28;
    const sy = py + 2;

    ctx.fillStyle = "#2563eb";
    ctx.fillRect(sx - 10, sy - 18, 16, 18);
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(sx - 10, sy - 14, 16, 3);
    ctx.fillRect(sx - 10, sy - 7, 16, 3);

    ctx.fillStyle = "#fde047"; // Hair
    ctx.beginPath();
    ctx.arc(sx - 2, sy - 26, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fed7aa"; // Face
    ctx.beginPath();
    ctx.arc(sx - 4, sy - 24, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#000000"; // Eye
    ctx.fillRect(sx - 7, sy - 25, 2, 2);

    ctx.fillStyle = "#fed7aa"; // Hands
    ctx.fillRect(px + 6, py - 12, 12, 4);
  }

  renderWoodstockAndTree(ctx) {
    const tx = 475;
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

    // Foliage
    ctx.fillStyle = "#1b4d24";
    ctx.beginPath();
    ctx.arc(tx + 25, ty - 25, 35, 0, Math.PI * 2);
    ctx.arc(tx - 10, ty - 20, 28, 0, Math.PI * 2);
    ctx.arc(tx + 50, ty - 15, 26, 0, Math.PI * 2);
    ctx.fill();

    // Nest
    ctx.fillStyle = "#8d6e63";
    ctx.beginPath();
    ctx.ellipse(tx - 10, ty + 10, 22, 10, 0, 0, Math.PI);
    ctx.fill();
    ctx.strokeStyle = "#5d4037";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Woodstock
    const wx = tx - 10;
    const wy = ty - 2;

    ctx.fillStyle = "#facc15";
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

    // Tuft
    ctx.fillStyle = "#facc15";
    ctx.fillRect(wx - 2, wy - 14, 3, 7);
    ctx.fillRect(wx + 2, wy - 12, 3, 5);

    if (this.woodstockAwake) {
      // Startled Eyes
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(wx - 2, wy - 1, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#000000";
      ctx.fillRect(wx - 3, wy - 2, 2, 2);

      // Warning !
      ctx.fillStyle = "#ef4444";
      ctx.font = "bold 16px monospace";
      ctx.fillText("!!", wx - 5, wy - 18);
    } else {
      // Closed Eye
      ctx.fillStyle = "#000000";
      ctx.fillRect(wx - 4, wy - 1, 4, 1.5);

      // Floating Z z z
      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.font = "bold 11px monospace";
      const zOffset = Math.sin(performance.now() / 250) * 3;
      ctx.fillText("z", wx + 6, wy - 8 + zOffset);
      ctx.font = "bold 14px monospace";
      ctx.fillText("Z", wx + 14, wy - 16 + zOffset);
    }
  }

  renderNotes(ctx) {
    const startX = 200;
    const startY = 275;
    const nestX = 465;
    const nestY = 135;

    this.notes.forEach(n => {
      const p = this.platforms[n.track];
      const targetX = p.x + 12;
      const targetY = p.y - 14;

      let curX, curY;

      if (n.progress <= 0.78) {
        // Phase 1: From Schroeder to platform strike zone
        const t = n.progress / 0.78;
        const midX = (startX + targetX) / 2;
        const midY = (startY + targetY) / 2 - 35;

        // Quadratic Bezier Interpolation
        curX = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * midX + t * t * targetX;
        curY = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * midY + t * t * targetY;
      } else {
        // Phase 2: From platform strike zone towards Woodstock's nest
        const t = (n.progress - 0.78) / 0.22;
        curX = targetX + (nestX - targetX) * t;
        curY = targetY + (nestY - targetY) * t - Math.sin(t * Math.PI) * 15;
      }

      const inZone = n.progress >= 0.68 && n.progress <= 0.88;
      this.drawSingleNote(ctx, curX, curY, p.color, inZone);
    });
  }

  drawSingleNote(ctx, x, y, color, inZone) {
    ctx.save();
    ctx.translate(x, y);

    if (inZone) {
      const glow = (Math.sin(performance.now() / 60) + 1) / 2;
      ctx.shadowColor = color;
      ctx.shadowBlur = 12 * glow + 4;
      ctx.scale(1.2, 1.2);
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
    ctx.save();
    ctx.translate(this.snoopyX, this.snoopyY);

    // Walking bob offset
    const walkBob = this.isMoving ? Math.sin(this.walkAnimTimer * 2) * 2 : 0;
    ctx.translate(0, walkBob);

    // Snoopy Body
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(8, 0, 10, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.ellipse(14, -14, 11, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Black Nose
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.ellipse(25, -14, 3, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Drooping Black Ear
    ctx.beginPath();
    ctx.ellipse(6, -10, 4, 8, Math.PI / 12, 0, Math.PI * 2);
    ctx.fill();

    // Eye
    ctx.fillRect(16, -16, 2, 2.5);

    // Red Cap
    ctx.fillStyle = "#e11d48";
    ctx.beginPath();
    ctx.arc(12, -18, 9, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(14, -19, 10, 3);

    // Feet with walking alternation
    ctx.fillStyle = "#ffffff";
    const footOffset = this.isMoving ? Math.sin(this.walkAnimTimer) * 4 : 0;
    ctx.fillRect(0 + footOffset, 10, 8, 4);
    ctx.fillRect(9 - footOffset, 10, 8, 4);

    // Wooden Mallet
    ctx.strokeStyle = "#854d0e";
    ctx.lineWidth = 3;
    ctx.fillStyle = "#a16207";

    if (this.snoopySwinging) {
      // Swing down directly into strike zone
      ctx.beginPath();
      ctx.moveTo(10, -4);
      ctx.lineTo(26, -10);
      ctx.stroke();

      ctx.fillRect(24, -18, 10, 14);
    } else {
      // Resting on shoulder
      ctx.beginPath();
      ctx.moveTo(10, -4);
      ctx.lineTo(4, -22);
      ctx.stroke();

      ctx.fillRect(0, -26, 12, 7);
    }

    ctx.restore();
  }

  renderLucy(ctx) {
    const lx = 70 + this.lucyStep * 18;
    const ly = 295;

    ctx.fillStyle = "#3b82f6";
    ctx.fillRect(lx - 8, ly - 20, 16, 20);

    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(lx, ly - 26, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fed7aa";
    ctx.beginPath();
    ctx.arc(lx + 2, ly - 24, 6, 0, Math.PI * 2);
    ctx.fill();

    if (this.lucyStep === 3) {
      ctx.fillStyle = "#ef4444";
      ctx.font = "bold 14px monospace";
      ctx.fillText("*CLANG!*", lx + 15, ly - 25);
    }
  }

  renderParticlesAndPopups(ctx) {
    // Popups
    this.popups.forEach(pop => {
      ctx.save();
      ctx.fillStyle = pop.color;
      ctx.globalAlpha = Math.max(0, pop.life);
      ctx.font = "bold 14px monospace";
      ctx.textAlign = "center";
      ctx.shadowColor = pop.color;
      ctx.shadowBlur = 8;
      ctx.fillText(pop.text, pop.x, pop.y);
      ctx.restore();
    });

    // Particles
    this.particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1.0;
  }

  renderLCDHeader(ctx) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, 560, 42);
    ctx.fillStyle = "#334155";
    ctx.fillRect(0, 42, 560, 1);

    // Score / Clock
    ctx.fillStyle = "#facc15";
    ctx.font = "bold 20px monospace";
    const scoreStr = this.state === "ATTRACT" && this.gameMode === "TIME"
      ? this.clockTimeStr
      : String(this.score).padStart(4, "0");

    ctx.fillText(scoreStr, 35, 28);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 9px monospace";
    ctx.fillText(this.gameMode === "TIME" ? "CLOCK" : "SCORE", 35, 39);

    // Game Mode
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 12px monospace";
    ctx.fillText(`GAME ${this.gameMode}`, 240, 24);

    // High Score
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

    // Attract / Game Over Banner
    if (this.state === "ATTRACT") {
      ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
      ctx.fillRect(90, 75, 380, 60);
      ctx.strokeStyle = "#ea580c";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(90, 75, 380, 60);

      ctx.fillStyle = "#facc15";
      ctx.font = "bold 14px monospace";
      ctx.textAlign = "center";
      ctx.fillText("PRESS GAME A OR GAME B TO PLAY", 280, 98);
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "11px sans-serif";
      ctx.fillText("Move across platforms & smash notes before Woodstock wakes!", 280, 120);
      ctx.textAlign = "start";
    } else if (this.state === "GAMEOVER") {
      ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
      ctx.fillRect(130, 75, 300, 60);
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2;
      ctx.strokeRect(130, 75, 300, 60);

      ctx.fillStyle = "#ef4444";
      ctx.font = "bold 18px monospace";
      ctx.textAlign = "center";
      ctx.fillText("GAME OVER", 280, 102);
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "11px sans-serif";
      ctx.fillText("Press Game A or B to play again", 280, 122);
      ctx.textAlign = "start";
    }
  }
}

// Instantiate
document.addEventListener("DOMContentLoaded", () => {
  window.snoopyGame = new SnoopyTabletopGame();
});
