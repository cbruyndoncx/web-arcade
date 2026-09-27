/**
 * NHL '94 - Classic 16-Bit Ice Hockey Engine
 * One-timers, stadium organ tunes, bone-crushing body checks, and blue ice physics
 */

// 1993-94 NHL Teams Database
const NHL_TEAMS = {
  NYR: {
    id: "NYR",
    city: "NEW YORK",
    name: "RANGERS",
    primary: "#0038a8",
    secondary: "#ce1126",
    skaters: [
      { name: "Mark Messier", num: 11, speed: 8.5, shot: 9.0, check: 9.0 },
      { name: "Brian Leetch", num: 2, speed: 8.8, shot: 8.5, check: 8.0 }
    ],
    goalie: { name: "Mike Richter", num: 35, save: 9.0 }
  },
  MTL: {
    id: "MTL",
    city: "MONTREAL",
    name: "CANADIENS",
    primary: "#af1e2d",
    secondary: "#192168",
    skaters: [
      { name: "Kirk Muller", num: 11, speed: 8.2, shot: 8.5, check: 8.5 },
      { name: "Vincent Damphousse", num: 25, speed: 8.5, shot: 9.0, check: 8.0 }
    ],
    goalie: { name: "Patrick Roy", num: 33, save: 9.8 }
  },
  DET: {
    id: "DET",
    city: "DETROIT",
    name: "RED WINGS",
    primary: "#ce1126",
    secondary: "#ffffff",
    skaters: [
      { name: "Steve Yzerman", num: 19, speed: 9.2, shot: 9.2, check: 8.0 },
      { name: "Sergei Fedorov", num: 91, speed: 9.5, shot: 9.0, check: 8.2 }
    ],
    goalie: { name: "Chris Osgood", num: 29, save: 8.8 }
  },
  TOR: {
    id: "TOR",
    city: "TORONTO",
    name: "MAPLE LEAFS",
    primary: "#00205b",
    secondary: "#ffffff",
    skaters: [
      { name: "Doug Gilmour", num: 93, speed: 9.0, shot: 8.8, check: 9.0 },
      { name: "Wendel Clark", num: 17, speed: 8.2, shot: 9.0, check: 9.5 }
    ],
    goalie: { name: "Felix Potvin", num: 29, save: 9.0 }
  },
  CHI: {
    id: "CHI",
    city: "CHICAGO",
    name: "BLACKHAWKS",
    primary: "#cf0a2c",
    secondary: "#000000",
    skaters: [
      { name: "Jeremy Roenick", num: 27, speed: 9.6, shot: 9.2, check: 8.8 },
      { name: "Chris Chelios", num: 7, speed: 8.5, shot: 8.6, check: 9.4 }
    ],
    goalie: { name: "Ed Belfour", num: 30, save: 9.2 }
  },
  PIT: {
    id: "PIT",
    city: "PITTSBURGH",
    name: "PENGUINS",
    primary: "#000000",
    secondary: "#ffb81c",
    skaters: [
      { name: "Mario Lemieux", num: 66, speed: 9.5, shot: 9.8, check: 8.8 },
      { name: "Jaromir Jagr", num: 68, speed: 9.2, shot: 9.4, check: 8.5 }
    ],
    goalie: { name: "Tom Barrasso", num: 35, save: 8.8 }
  }
};

// Web Audio Stadium Synthesizer
class NHLAudio {
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

  tone(freq = 440, duration = 0.08, type = "square", vol = 0.15) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (_) {}
  }

  skateStop() {
    this.tone(320, 0.06, "sawtooth", 0.08);
  }

  slapShot() {
    this.tone(140, 0.09, "sawtooth", 0.25);
    setTimeout(() => this.tone(90, 0.08, "triangle", 0.25), 20);
  }

  postPing() {
    this.tone(2600, 0.2, "sine", 0.35);
  }

  bodyCheck() {
    this.tone(120, 0.14, "sawtooth", 0.3);
    setTimeout(() => this.tone(70, 0.2, "square", 0.35), 40);
  }

  goalHorn() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      // Blaring dual-tone fog horn
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = "sawtooth";
      osc2.type = "square";
      osc1.frequency.setValueAtTime(146.8, this.ctx.currentTime); // D3
      osc2.frequency.setValueAtTime(185.0, this.ctx.currentTime); // F#3

      gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 1.2);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(this.ctx.currentTime + 1.2);
      osc2.stop(this.ctx.currentTime + 1.2);
    } catch (_) {}
  }

  organCharge() {
    const notes = [261.6, 329.6, 392.0, 523.3, 392.0, 523.3];
    const delays = [0, 120, 240, 360, 480, 600];
    notes.forEach((freq, i) => {
      setTimeout(() => this.tone(freq, 0.12, "triangle", 0.2), delays[i]);
    });
  }

  whistle() {
    this.tone(2800, 0.2, "sine", 0.22);
  }
}

// Master NHL '94 Engine
class NHL94Game {
  constructor() {
    this.canvas = document.getElementById("rink-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.audio = new NHLAudio();

    // Teams Selection
    this.homeKey = "NYR";
    this.awayKey = "MTL";
    this.homeTeam = NHL_TEAMS.NYR;
    this.awayTeam = NHL_TEAMS.MTL;

    // Period & Time
    this.period = 1;
    this.timeRemaining = 180; // 3 minutes in seconds
    this.clockAccum = 0;
    this.state = "SELECT"; // "SELECT", "PLAYING", "GAMEOVER"

    // Scores & Stats
    this.homeScore = 0;
    this.awayScore = 0;
    this.homeShots = 0;
    this.awayShots = 0;

    // Rink Dimensions (World Coordinates)
    this.rinkW = 1000;
    this.rinkH = 460;
    this.cameraX = 500;

    // Goals (Nets)
    this.netLeft = { x: 90, y: 230, w: 24, h: 70 };
    this.netRight = { x: 910, y: 230, w: 24, h: 70 };

    // Puck
    this.puck = {
      x: 500,
      y: 230,
      vx: 0,
      vy: 0,
      holder: null,
      state: "FREE", // "HELD", "SHOT", "PASS", "FREE"
      oneTimerTarget: null
    };

    // Skaters: 2 Home Skaters + 1 Home Goalie, 2 Away Skaters + 1 Away Goalie
    this.skaters = [];
    this.goalies = [];

    // Shot charge power (for slap shots)
    this.shotCharge = 0;
    this.isChargingShot = false;

    // Visual particles (ice spray, sparks)
    this.particles = [];

    // Keyboard states
    this.keys = {
      up: false, down: false, left: false, right: false,
      shoot: false, pass: false
    };

    this.lastTime = performance.now();
    this.buildTeamSelectUI();
    this.bindDOM();
    requestAnimationFrame((t) => this.loop(t));
  }

  buildTeamSelectUI() {
    const grid = document.getElementById("teams-grid");
    if (!grid) return;
    grid.innerHTML = "";

    Object.values(NHL_TEAMS).forEach(t => {
      const btn = document.createElement("button");
      btn.className = `team-btn ${t.id === this.homeKey ? "selected" : ""}`;
      btn.dataset.id = t.id;
      btn.innerHTML = `
        <span class="t-city">${t.city}</span>
        <span class="t-title" style="color:${t.primary};">${t.name}</span>
      `;

      btn.addEventListener("click", () => {
        document.querySelectorAll(".team-btn").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        this.homeKey = t.id;
        this.homeTeam = NHL_TEAMS[t.id];

        const rivals = Object.keys(NHL_TEAMS).filter(k => k !== t.id);
        this.awayKey = rivals[0];
        this.awayTeam = NHL_TEAMS[this.awayKey];

        this.updatePreview();
      });

      grid.appendChild(btn);
    });

    this.updatePreview();
  }

  updatePreview() {
    document.getElementById("preview-home-name").textContent = `${this.homeTeam.city} ${this.homeTeam.name}`;
    document.getElementById("preview-home-stars").textContent =
      `${this.homeTeam.skaters[0].name} • ${this.homeTeam.skaters[1].name} • ${this.homeTeam.goalie.name} (G)`;

    document.getElementById("preview-away-name").textContent = `${this.awayTeam.city} ${this.awayTeam.name}`;
    document.getElementById("preview-away-stars").textContent =
      `${this.awayTeam.skaters[0].name} • ${this.awayTeam.skaters[1].name} • ${this.awayTeam.goalie.name} (G)`;
  }

  bindDOM() {
    document.getElementById("btn-puck-drop").addEventListener("click", () => this.startMatch());

    const soundBtn = document.getElementById("btn-sound-toggle");
    soundBtn.addEventListener("click", () => {
      this.audio.muted = !this.audio.muted;
      soundBtn.textContent = `🔊 SOUND: ${this.audio.muted ? "OFF" : "ON"}`;
    });

    document.getElementById("btn-rematch").addEventListener("click", () => {
      document.getElementById("final-overlay").classList.add("hidden");
      document.getElementById("team-select-overlay").classList.remove("hidden");
      this.state = "SELECT";
    });

    // Keyboard bindings
    window.addEventListener("keydown", (e) => {
      const k = e.key.toLowerCase();
      if (k === "arrowup" || k === "w") this.keys.up = true;
      if (k === "arrowdown" || k === "s") this.keys.down = true;
      if (k === "arrowleft" || k === "a") this.keys.left = true;
      if (k === "arrowright" || k === "d") this.keys.right = true;

      // Shoot / Slap Shot (charge on hold)
      if (k === " " || k === "x" || k === "j") {
        if (!this.keys.shoot) this.onShootDown();
        this.keys.shoot = true;
      }

      // Pass / Body Check
      if (k === "z" || k === "k") {
        if (!this.keys.pass) this.onPassDown();
        this.keys.pass = true;
      }
    });

    window.addEventListener("keyup", (e) => {
      const k = e.key.toLowerCase();
      if (k === "arrowup" || k === "w") this.keys.up = false;
      if (k === "arrowdown" || k === "s") this.keys.down = false;
      if (k === "arrowleft" || k === "a") this.keys.left = false;
      if (k === "arrowright" || k === "d") this.keys.right = false;

      if (k === " " || k === "x" || k === "j") {
        if (this.keys.shoot) this.onShootUp();
        this.keys.shoot = false;
      }

      if (k === "z" || k === "k") this.keys.pass = false;
    });

    // Touch Virtual Buttons
    const bindTouch = (id, onDown, onUp) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("pointerdown", (e) => { e.preventDefault(); onDown(); });
      el.addEventListener("pointerup", (e) => { e.preventDefault(); onUp(); });
      el.addEventListener("pointerleave", (e) => { e.preventDefault(); onUp(); });
    };

    bindTouch("vbtn-up", () => this.keys.up = true, () => this.keys.up = false);
    bindTouch("vbtn-down", () => this.keys.down = true, () => this.keys.down = false);
    bindTouch("vbtn-left", () => this.keys.left = true, () => this.keys.left = false);
    bindTouch("vbtn-right", () => this.keys.right = true, () => this.keys.right = false);

    bindTouch("vbtn-shoot", () => { this.onShootDown(); this.keys.shoot = true; }, () => { this.onShootUp(); this.keys.shoot = false; });
    bindTouch("vbtn-pass", () => { this.onPassDown(); this.keys.pass = true; }, () => this.keys.pass = false);
  }

  startMatch() {
    this.audio.init();
    this.state = "PLAYING";
    this.homeScore = 0;
    this.awayScore = 0;
    this.homeShots = 0;
    this.awayShots = 0;
    this.period = 1;
    this.timeRemaining = 180;

    document.getElementById("team-select-overlay").classList.add("hidden");
    document.getElementById("sb-home-team").textContent = this.homeTeam.name;
    document.getElementById("sb-away-team").textContent = this.awayTeam.name;

    this.updateScoreboard();

    // Spawn Players & Goalies
    this.skaters = [
      // Home Skaters (Blue/Red)
      { id: 0, team: "home", isUser: true, data: this.homeTeam.skaters[0], x: 450, y: 210, vx: 0, vy: 0, facing: 1, color: this.homeTeam.primary },
      { id: 1, team: "home", isUser: false, data: this.homeTeam.skaters[1], x: 380, y: 280, vx: 0, vy: 0, facing: 1, color: this.homeTeam.primary },

      // Away Skaters
      { id: 2, team: "away", isUser: false, data: this.awayTeam.skaters[0], x: 550, y: 210, vx: 0, vy: 0, facing: -1, color: this.awayTeam.primary },
      { id: 3, team: "away", isUser: false, data: this.awayTeam.skaters[1], x: 620, y: 280, vx: 0, vy: 0, facing: -1, color: this.awayTeam.primary }
    ];

    // Goalies
    this.goalies = [
      { id: 10, team: "home", data: this.homeTeam.goalie, x: 110, y: 230, vy: 0, color: this.homeTeam.primary },
      { id: 11, team: "away", data: this.awayTeam.goalie, x: 890, y: 230, vy: 0, color: this.awayTeam.primary }
    ];

    // Face-off puck drop
    this.dropPuckCenter();
    this.audio.whistle();
    this.audio.organCharge();
  }

  dropPuckCenter() {
    this.puck.x = 500;
    this.puck.y = 230;
    this.puck.vx = 0;
    this.puck.vy = 0;
    this.puck.holder = null;
    this.puck.state = "FREE";
  }

  onShootDown() {
    const user = this.skaters[0];
    if (this.puck.holder === user) {
      this.isChargingShot = true;
      this.shotCharge = 0;
    }
  }

  onShootUp() {
    const user = this.skaters[0];
    if (this.puck.holder === user && this.isChargingShot) {
      this.isChargingShot = false;
      this.executeShot(user, this.shotCharge);
    }
  }

  onPassDown() {
    const user = this.skaters[0];
    if (this.puck.holder === user) {
      // Pass to teammate skater 1
      const teammate = this.skaters[1];
      this.passPuck(user, teammate);
    } else {
      // On Defense: Body Check!
      this.doBodyCheck(user);
    }
  }

  doBodyCheck(checker) {
    this.audio.bodyCheck();

    // Check collision against opponent skaters
    this.skaters.forEach(target => {
      if (target.team !== checker.team) {
        const dist = Math.hypot(target.x - checker.x, target.y - checker.y);
        if (dist < 36) {
          // Flatten opponent!
          target.vx = checker.facing * 5;
          target.vy = (Math.random() - 0.5) * 4;
          this.spawnIceSpray(target.x, target.y, 12);

          if (this.puck.holder === target) {
            // Loose puck!
            this.puck.holder = null;
            this.puck.state = "FREE";
            this.puck.vx = (Math.random() - 0.5) * 6;
            this.puck.vy = (Math.random() - 0.5) * 6;
          }
        }
      }
    });
  }

  passPuck(fromSkater, toSkater) {
    this.puck.holder = null;
    this.puck.state = "PASS";
    const dx = toSkater.x - fromSkater.x;
    const dy = toSkater.y - fromSkater.y;
    const dist = Math.hypot(dx, dy) || 1;
    const speed = 10;

    this.puck.vx = (dx / dist) * speed;
    this.puck.vy = (dy / dist) * speed;
    this.puck.oneTimerTarget = toSkater;

    this.audio.skateStop();
  }

  executeShot(shooter, charge = 0) {
    const isHome = (shooter.team === "home");
    const targetNet = isHome ? this.netRight : this.netLeft;

    if (isHome) this.homeShots++;
    else this.awayShots++;
    this.updateScoreboard();

    this.puck.holder = null;
    this.puck.state = "SHOT";

    // Shot angle towards corners of net
    const cornerAim = (Math.random() - 0.5) * 45;
    const targetY = targetNet.y + cornerAim;

    const dx = targetNet.x - shooter.x;
    const dy = targetY - shooter.y;
    const dist = Math.hypot(dx, dy);

    // Power based on charge (slap shot) or quick release (wrist shot)
    const basePower = 11 + Math.min(6, charge * 0.008);
    this.puck.vx = (dx / dist) * basePower;
    this.puck.vy = (dy / dist) * basePower;

    this.audio.slapShot();
    this.spawnIceSpray(shooter.x, shooter.y, 8);
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

    // Clock
    this.clockAccum += dt;
    if (this.clockAccum >= 1000) {
      this.clockAccum = 0;
      this.timeRemaining--;

      if (this.timeRemaining <= 0) {
        this.period++;
        if (this.period > 3) {
          this.endGame();
        } else {
          this.timeRemaining = 180;
          this.audio.whistle();
          this.dropPuckCenter();
        }
      }
      this.updateScoreboard();
    }

    // Shot Charge buildup
    if (this.isChargingShot) {
      this.shotCharge += dt;
    }

    // Update Skaters (Ice Inertia Physics)
    this.skaters.forEach(s => this.updateSkater(s, dt));

    // Update Goalies
    this.goalies.forEach(g => this.updateGoalie(g, dt));

    // Update Puck
    this.updatePuck(dt);

    // Update Ice Spray Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= dt * 0.0025;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    // Camera follow puck
    this.cameraX += (this.puck.x - this.cameraX) * 0.08;
    this.cameraX = Math.max(430, Math.min(570, this.cameraX));
  }

  updateSkater(s, dt) {
    if (s.isUser) {
      // User Input Acceleration with Ice Glide Inertia
      const accel = 0.35;
      if (this.keys.left) { s.vx -= accel; s.facing = -1; }
      if (this.keys.right) { s.vx += accel; s.facing = 1; }
      if (this.keys.up) s.vy -= accel;
      if (this.keys.down) s.vy += accel;
    } else {
      // AI Skaters
      this.updateSkaterAI(s, dt);
    }

    // Ice Friction (Gentle deceleration for natural gliding)
    s.vx *= 0.94;
    s.vy *= 0.94;

    s.x += s.vx;
    s.y += s.vy;

    // Rink Boards Collision
    s.x = Math.max(70, Math.min(930, s.x));
    s.y = Math.max(60, Math.min(400, s.y));

    // Carry Puck if holding
    if (this.puck.holder === s) {
      this.puck.x = s.x + s.facing * 12;
      this.puck.y = s.y + 4;
    }
  }

  updateSkaterAI(s, dt) {
    const isHome = (s.team === "home");
    const opponentNet = isHome ? this.netRight : this.netLeft;

    if (this.puck.holder === s) {
      // Skater with puck: drive towards net and shoot
      const dx = opponentNet.x - s.x;
      const dy = opponentNet.y - s.y;
      const dist = Math.hypot(dx, dy);

      s.facing = dx > 0 ? 1 : -1;
      s.vx += (dx / dist) * 0.3;
      s.vy += (dy / dist) * 0.25;

      if (dist < 280 && Math.random() < 0.035) {
        this.executeShot(s, 200);
      }
    } else if (this.puck.state === "FREE") {
      // Chase free puck
      const dx = this.puck.x - s.x;
      const dy = this.puck.y - s.y;
      const dist = Math.hypot(dx, dy) || 1;
      s.facing = dx > 0 ? 1 : -1;
      s.vx += (dx / dist) * 0.32;
      s.vy += (dy / dist) * 0.32;
    } else {
      // Defensive pressure
      const holder = this.puck.holder;
      if (holder && holder.team !== s.team) {
        const dx = holder.x - s.x;
        const dy = holder.y - s.y;
        const dist = Math.hypot(dx, dy) || 1;
        s.vx += (dx / dist) * 0.28;
        s.vy += (dy / dist) * 0.28;

        if (dist < 32 && Math.random() < 0.04) {
          this.doBodyCheck(s);
        }
      }
    }
  }

  updateGoalie(g, dt) {
    // Goalie tracks puck Y coordinate within crease
    const targetY = Math.max(200, Math.min(260, this.puck.y));
    g.y += (targetY - g.y) * 0.08;

    // Check Save against incoming shots
    const distToPuck = Math.hypot(this.puck.x - g.x, this.puck.y - g.y);
    if (this.puck.state === "SHOT" && distToPuck < 26) {
      // SAVE! Rebound puck
      this.puck.state = "FREE";
      this.puck.vx = (g.x < 500 ? 1 : -1) * (4 + Math.random() * 3);
      this.puck.vy = (Math.random() - 0.5) * 6;
      this.audio.postPing();
      this.spawnIceSpray(g.x, g.y, 10);
    }
  }

  updatePuck(dt) {
    if (this.puck.state === "HELD") return;

    this.puck.x += this.puck.vx;
    this.puck.y += this.puck.vy;

    // Friction on ice
    this.puck.vx *= 0.985;
    this.puck.vy *= 0.985;

    // Check Goal
    if (this.puck.x <= this.netLeft.x + 8 && Math.abs(this.puck.y - this.netLeft.y) < 32) {
      this.onGoal("away");
      return;
    }

    if (this.puck.x >= this.netRight.x - 8 && Math.abs(this.puck.y - this.netRight.y) < 32) {
      this.onGoal("home");
      return;
    }

    // Boards bounce
    if (this.puck.x < 55 || this.puck.x > 945) {
      this.puck.vx = -this.puck.vx * 0.8;
      this.audio.postPing();
    }
    if (this.puck.y < 45 || this.puck.y > 415) {
      this.puck.vy = -this.puck.vy * 0.8;
    }

    // Pickup puck
    if (this.puck.state === "FREE") {
      this.skaters.forEach(s => {
        if (Math.hypot(s.x - this.puck.x, s.y - this.puck.y) < 22) {
          this.puck.holder = s;
          this.puck.state = "HELD";
          this.audio.skateStop();
        }
      });
    }

    // One-Timer trigger if passing to teammate
    if (this.puck.state === "PASS" && this.puck.oneTimerTarget) {
      const tgt = this.puck.oneTimerTarget;
      if (Math.hypot(tgt.x - this.puck.x, tgt.y - this.puck.y) < 26) {
        // If user is target and pressing shoot -> INSTANT ONE-TIMER BLAST!
        if (tgt.isUser && this.keys.shoot) {
          this.executeShot(tgt, 500); // Supercharged one-timer!
        } else {
          this.puck.holder = tgt;
          this.puck.state = "HELD";
        }
        this.puck.oneTimerTarget = null;
      }
    }
  }

  onGoal(scoringTeam) {
    const isHome = (scoringTeam === "home");
    if (isHome) this.homeScore++;
    else this.awayScore++;

    this.audio.goalHorn();
    this.updateScoreboard();

    // Show Goal Siren Banner
    const banner = document.getElementById("goal-horn-banner");
    if (banner) {
      banner.classList.remove("hidden");
      setTimeout(() => banner.classList.add("hidden"), 2000);
    }

    this.dropPuckCenter();
  }

  spawnIceSpray(x, y, count = 8) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 2.5;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0
      });
    }
  }

  updateScoreboard() {
    document.getElementById("sb-home-score").textContent = this.homeScore;
    document.getElementById("sb-away-score").textContent = this.awayScore;
    document.getElementById("sb-shots").textContent = `SOG: ${this.homeShots} - ${this.awayShots}`;

    const mins = Math.floor(this.timeRemaining / 60);
    const secs = String(this.timeRemaining % 60).padStart(2, "0");
    document.getElementById("sb-clock").textContent = `${mins}:${secs}`;
    document.getElementById("sb-period").textContent = `${this.period}${["ST","ND","RD"][this.period-1] || "TH"}`;
  }

  endGame() {
    this.state = "GAMEOVER";
    this.audio.goalHorn();

    document.getElementById("final-overlay").classList.remove("hidden");
    document.getElementById("fin-home-name").textContent = this.homeTeam.name;
    document.getElementById("fin-home-score").textContent = this.homeScore;
    document.getElementById("fin-away-name").textContent = this.awayTeam.name;
    document.getElementById("fin-away-score").textContent = this.awayScore;

    const winner = this.homeScore > this.awayScore ? this.homeTeam.name : this.awayTeam.name;
    document.getElementById("fin-winner-msg").textContent = `${winner} WIN THE STANLEY CUP SHOWDOWN!`;
  }

  // 16-Bit Ice Rink Renderer
  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, 860, 460);

    const offsetX = 430 - this.cameraX;

    ctx.save();
    ctx.translate(offsetX, 0);

    // 1. Rink Ice Surface & Lines
    this.renderRink(ctx);

    // 2. Nets & Goal Creases
    this.renderNets(ctx);

    // 3. Skaters & Goalies
    this.skaters.forEach(s => this.renderSkater(ctx, s));
    this.goalies.forEach(g => this.renderGoalie(ctx, g));

    // 4. Puck
    this.renderPuck(ctx);

    // 5. Ice Spray Particles
    this.renderParticles(ctx);

    ctx.restore();
  }

  renderRink(ctx) {
    // Blue-tinted ice surface
    ctx.fillStyle = "#e2f1fd";
    ctx.fillRect(40, 30, 920, 400);

    // Boards & Glass Rim
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 8;
    ctx.strokeRect(40, 30, 920, 400);

    // Center Red Line
    ctx.strokeStyle = "#dc2626";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(500, 30);
    ctx.lineTo(500, 430);
    ctx.stroke();

    // Center Face-Off Circle & NHL Shield
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(500, 230, 60, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#2563eb";
    ctx.font = "bold 16px 'Teko', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("NHL '94", 500, 236);

    // Blue Lines
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 5;

    ctx.beginPath();
    ctx.moveTo(330, 30);
    ctx.lineTo(330, 430);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(670, 30);
    ctx.lineTo(670, 430);
    ctx.stroke();

    // Face-Off Spots (Red dots & circles)
    const spots = [
      { x: 230, y: 130 }, { x: 230, y: 330 },
      { x: 770, y: 130 }, { x: 770, y: 330 }
    ];

    spots.forEach(sp => {
      ctx.strokeStyle = "#dc2626";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, 45, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = "#dc2626";
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  renderNets(ctx) {
    // Goal Creases (Blue semi-circles)
    ctx.fillStyle = "#bae6fd";
    ctx.beginPath();
    ctx.arc(this.netLeft.x, this.netLeft.y, 28, -Math.PI / 2, Math.PI / 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(this.netRight.x, this.netRight.y, 28, Math.PI / 2, -Math.PI / 2);
    ctx.fill();

    // Red Nets & White Mesh
    [this.netLeft, this.netRight].forEach(n => {
      ctx.fillStyle = "#dc2626";
      ctx.fillRect(n.x - 4, n.y - 35, 8, 70);
      ctx.fillRect(n.x - 14, n.y - 35, 14, 5);
      ctx.fillRect(n.x - 14, n.y + 30, 14, 5);

      // White mesh net
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.fillRect(n.x - 12, n.y - 30, 10, 60);
    });
  }

  renderSkater(ctx, s) {
    ctx.save();
    ctx.translate(s.x, s.y);

    // Shadow on ice
    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    ctx.beginPath();
    ctx.ellipse(0, 4, 12, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Skates
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(-6, 2, 4, 6);
    ctx.fillRect(2, 2, 4, 6);

    // Team Jersey Body
    ctx.fillStyle = s.color;
    ctx.beginPath();
    ctx.arc(0, -6, 11, 0, Math.PI * 2);
    ctx.fill();

    // Helmet
    ctx.fillStyle = s.color;
    ctx.beginPath();
    ctx.arc(0, -16, 7, 0, Math.PI * 2);
    ctx.fill();

    // Hockey Stick
    ctx.strokeStyle = "#b45309";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(s.facing * 4, -4);
    ctx.lineTo(s.facing * 16, 4);
    ctx.lineTo(s.facing * 22, 4);
    ctx.stroke();

    ctx.restore();

    // User "YOU" Indicator Tag
    if (s.isUser) {
      ctx.fillStyle = "#facc15";
      ctx.font = "bold 10px 'Teko', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("YOU", s.x, s.y - 28);
    }
  }

  renderGoalie(ctx, g) {
    ctx.save();
    ctx.translate(g.x, g.y);

    // Shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.beginPath();
    ctx.ellipse(0, 4, 16, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Goalie Leg Pads (White / Team Trim)
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(-10, -2, 7, 14);
    ctx.fillRect(3, -2, 7, 14);

    // Torso / Chest Protector
    ctx.fillStyle = g.color;
    ctx.beginPath();
    ctx.arc(0, -8, 13, 0, Math.PI * 2);
    ctx.fill();

    // Goalie Mask
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(0, -18, 8, 0, Math.PI * 2);
    ctx.fill();

    // Goalie Stick & Blocker
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-6, -4);
    ctx.lineTo(-6, 8);
    ctx.lineTo(8, 8);
    ctx.stroke();

    ctx.restore();
  }

  renderPuck(ctx) {
    ctx.save();
    ctx.translate(this.puck.x, this.puck.y);

    // Black Rubber Puck
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.ellipse(0, 0, 4.5, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  renderParticles(ctx) {
    this.particles.forEach(p => {
      ctx.fillStyle = "rgba(255, 255, 255, " + Math.max(0, p.life) + ")";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}

// Instantiate
document.addEventListener("DOMContentLoaded", () => {
  window.nhlGame = new NHL94Game();
});
