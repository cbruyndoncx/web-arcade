/**
 * NBA JAM: TOURNAMENT EDITION (1994 Arcade)
 * Full 2-on-2 Arcade Basketball Engine with Flaming Physics & Announcer Voice
 */

// 1994 NBA Rosters Database
const TEAMS_DB = {
  BULLS: {
    id: "BULLS",
    city: "CHICAGO",
    name: "BULLS",
    primaryColor: "#ce1141",
    secondaryColor: "#000000",
    roster: [
      { name: "Scottie Pippen", num: 33, speed: 9, dunks: 9, threes: 8, blocks: 7 },
      { name: "Horace Grant", num: 54, speed: 7, dunks: 8, threes: 4, blocks: 9 }
    ]
  },
  KNICKS: {
    id: "KNICKS",
    city: "NEW YORK",
    name: "KNICKS",
    primaryColor: "#006bb6",
    secondaryColor: "#f58426",
    roster: [
      { name: "Patrick Ewing", num: 33, speed: 7, dunks: 9, threes: 3, blocks: 10 },
      { name: "John Starks", num: 3, speed: 9, dunks: 7, threes: 9, blocks: 6 }
    ]
  },
  ROCKETS: {
    id: "ROCKETS",
    city: "HOUSTON",
    name: "ROCKETS",
    primaryColor: "#ce1141",
    secondaryColor: "#fdb927",
    roster: [
      { name: "Hakeem Olajuwon", num: 34, speed: 8, dunks: 10, threes: 4, blocks: 10 },
      { name: "Vernon Maxwell", num: 11, speed: 8, dunks: 7, threes: 8, blocks: 5 }
    ]
  },
  SUNS: {
    id: "SUNS",
    city: "PHOENIX",
    name: "SUNS",
    primaryColor: "#e56020",
    secondaryColor: "#1d1160",
    roster: [
      { name: "Charles Barkley", num: 34, speed: 8, dunks: 10, threes: 7, blocks: 8 },
      { name: "Kevin Johnson", num: 7, speed: 10, dunks: 7, threes: 8, blocks: 5 }
    ]
  },
  HORNETS: {
    id: "HORNETS",
    city: "CHARLOTTE",
    name: "HORNETS",
    primaryColor: "#00788c",
    secondaryColor: "#1d1160",
    roster: [
      { name: "Larry Johnson", num: 2, speed: 8, dunks: 9, threes: 7, blocks: 8 },
      { name: "Alonzo Mourning", num: 33, speed: 7, dunks: 9, threes: 3, blocks: 10 }
    ]
  },
  MAGIC: {
    id: "MAGIC",
    city: "ORLANDO",
    name: "MAGIC",
    primaryColor: "#0077c0",
    secondaryColor: "#000000",
    roster: [
      { name: "Shaquille O'Neal", num: 32, speed: 8, dunks: 10, threes: 2, blocks: 10 },
      { name: "Penny Hardaway", num: 1, speed: 9, dunks: 8, threes: 8, blocks: 6 }
    ]
  }
};

// Web Audio & Announcer Voice Synthesizer
class JamAudio {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) this.ctx = new AudioContextClass();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  playTone(freq = 440, duration = 0.08, type = "square", vol = 0.15) {
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

  dribble() {
    this.playTone(110, 0.04, "triangle", 0.18);
  }

  swish() {
    this.playTone(1200, 0.05, "sine", 0.1);
    setTimeout(() => this.playTone(850, 0.06, "sine", 0.1), 40);
  }

  rimClank() {
    this.playTone(420, 0.06, "square", 0.22);
    setTimeout(() => this.playTone(280, 0.08, "sawtooth", 0.18), 30);
  }

  dunkSlam() {
    this.playTone(180, 0.12, "sawtooth", 0.3);
    setTimeout(() => this.playTone(90, 0.2, "square", 0.35), 60);
  }

  shove() {
    this.playTone(150, 0.08, "triangle", 0.25);
  }

  whistle() {
    this.playTone(2400, 0.18, "sine", 0.2);
  }

  buzzer() {
    this.playTone(120, 0.8, "sawtooth", 0.35);
  }

  turboWhoosh() {
    this.playTone(350, 0.06, "sawtooth", 0.08);
  }

  // Voice Announcer (Speech Synthesis + Chord Stinger)
  announce(phrase) {
    // Show visual banner
    const banner = document.getElementById("announcer-banner");
    const bannerText = document.getElementById("announcer-text");
    if (banner && bannerText) {
      bannerText.textContent = phrase;
      banner.classList.remove("hidden");
      clearTimeout(this.bannerTimeout);
      this.bannerTimeout = setTimeout(() => {
        banner.classList.add("hidden");
      }, 1500);
    }

    if (this.muted) return;

    // Play arcade fanfare chord
    this.playTone(523, 0.1, "sawtooth", 0.12);
    setTimeout(() => this.playTone(659, 0.1, "sawtooth", 0.12), 40);
    setTimeout(() => this.playTone(784, 0.15, "sawtooth", 0.15), 80);

    // Speak with Web Speech API
    if ("speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(phrase);
        utterance.rate = 1.25;
        utterance.pitch = 1.05;
        utterance.volume = 0.9;
        window.speechSynthesis.speak(utterance);
      } catch (_) {}
    }
  }
}

// NBA Jam Master Game Controller
class NBAJamGame {
  constructor() {
    this.canvas = document.getElementById("court-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.audio = new JamAudio();

    // Teams Selection
    this.homeTeamKey = "BULLS";
    this.awayTeamKey = "KNICKS";
    this.homeTeam = TEAMS_DB.BULLS;
    this.awayTeam = TEAMS_DB.KNICKS;

    // Game Clock & Quarters
    this.quarter = 1;
    this.gameTime = 120; // 2 minutes (in seconds)
    this.shotClock = 24;
    this.clockTimer = 0;
    this.state = "SELECT"; // "SELECT", "PLAYING", "GAMEOVER"

    // Scores & Fire Streaks
    this.homeScore = 0;
    this.awayScore = 0;
    this.homeStreak = 0;
    this.awayStreak = 0;
    this.onFirePlayer = null; // Reference to player currently on fire

    // Court Dimensions (World Coordinates)
    this.courtWidth = 1100;
    this.courtHeight = 400;
    this.cameraX = 550; // Camera center tracking

    // Hoops (Left = Home, Right = Away)
    this.hoopLeft = { x: 70, y: 200, z: 80, radius: 18 };
    this.hoopRight = { x: 1030, y: 200, z: 80, radius: 18 };

    // Basketball (World coordinates: x, y, z)
    this.ball = {
      x: 550,
      y: 200,
      z: 15,
      vx: 0,
      vy: 0,
      vz: 0,
      holder: null,
      state: "FREE", // "HELD", "SHOT", "PASS", "FREE"
      targetHoop: null,
      isFire: false
    };

    // 4 Players: 2 Home (P1 User, P2 AI) vs 2 Away (P3 CPU, P4 CPU)
    this.players = [];

    // Keyboard & Input states
    this.keys = {
      up: false, down: false, left: false, right: false,
      shoot: false, pass: false, turbo: false
    };

    // Visual FX Particles
    this.particles = [];

    this.lastFrameTime = performance.now();
    this.buildTeamSelectUI();
    this.bindDOM();
    requestAnimationFrame((t) => this.loop(t));
  }

  buildTeamSelectUI() {
    const grid = document.getElementById("teams-grid");
    if (!grid) return;
    grid.innerHTML = "";

    Object.values(TEAMS_DB).forEach(team => {
      const btn = document.createElement("button");
      btn.className = `team-choice-btn ${team.id === this.homeTeamKey ? "selected" : ""}`;
      btn.dataset.id = team.id;
      btn.innerHTML = `
        <span class="t-city">${team.city}</span>
        <span class="t-name" style="color:${team.primaryColor};">${team.name}</span>
      `;

      btn.addEventListener("click", () => {
        document.querySelectorAll(".team-choice-btn").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        this.homeTeamKey = team.id;
        this.homeTeam = TEAMS_DB[team.id];

        // Pick a default rival for away
        const rivals = Object.keys(TEAMS_DB).filter(k => k !== team.id);
        this.awayTeamKey = rivals[0];
        this.awayTeam = TEAMS_DB[this.awayTeamKey];

        this.updatePreview();
      });

      grid.appendChild(btn);
    });

    this.updatePreview();
  }

  updatePreview() {
    const hName = document.getElementById("preview-home-name");
    const hRoster = document.getElementById("preview-home-roster");
    const aName = document.getElementById("preview-away-name");
    const aRoster = document.getElementById("preview-away-roster");

    if (hName) hName.textContent = `${this.homeTeam.city} ${this.homeTeam.name}`;
    if (hRoster) hRoster.textContent = this.homeTeam.roster.map(r => r.name).join(" • ");
    if (aName) aName.textContent = `${this.awayTeam.city} ${this.awayTeam.name}`;
    if (aRoster) aRoster.textContent = this.awayTeam.roster.map(r => r.name).join(" • ");
  }

  bindDOM() {
    // Tip-off button
    document.getElementById("btn-tip-off").addEventListener("click", () => {
      this.initMatch();
    });

    // Sound toggle
    const soundBtn = document.getElementById("btn-sound-toggle");
    soundBtn.addEventListener("click", () => {
      this.audio.muted = !this.audio.muted;
      soundBtn.textContent = `🔊 SOUND: ${this.audio.muted ? "OFF" : "ON"}`;
    });

    // Play again button
    document.getElementById("btn-play-again").addEventListener("click", () => {
      document.getElementById("game-over-overlay").classList.add("hidden");
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

      // Shoot / Dunk / Block
      if (k === " " || k === "x" || k === "j") {
        if (!this.keys.shoot) this.onShootDown();
        this.keys.shoot = true;
      }

      // Pass / Steal / Shove
      if (k === "z" || k === "k") {
        if (!this.keys.pass) this.onPassDown();
        this.keys.pass = true;
      }

      // Turbo
      if (k === "shift" || k === "l" || k === "e") {
        this.keys.turbo = true;
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
      if (k === "shift" || k === "l" || k === "e") this.keys.turbo = false;
    });

    // Touch Virtual Buttons
    const setupTouchBtn = (id, onDown, onUp) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("pointerdown", (e) => { e.preventDefault(); onDown(); });
      el.addEventListener("pointerup", (e) => { e.preventDefault(); onUp(); });
      el.addEventListener("pointerleave", (e) => { e.preventDefault(); onUp(); });
    };

    setupTouchBtn("vbtn-up", () => this.keys.up = true, () => this.keys.up = false);
    setupTouchBtn("vbtn-down", () => this.keys.down = true, () => this.keys.down = false);
    setupTouchBtn("vbtn-left", () => this.keys.left = true, () => this.keys.left = false);
    setupTouchBtn("vbtn-right", () => this.keys.right = true, () => this.keys.right = false);

    setupTouchBtn("vbtn-shoot", () => { this.onShootDown(); this.keys.shoot = true; }, () => { this.onShootUp(); this.keys.shoot = false; });
    setupTouchBtn("vbtn-pass", () => { this.onPassDown(); this.keys.pass = true; }, () => this.keys.pass = false);
    setupTouchBtn("vbtn-turbo", () => this.keys.turbo = true, () => this.keys.turbo = false);
  }

  initMatch() {
    this.audio.init();
    this.state = "PLAYING";
    this.homeScore = 0;
    this.awayScore = 0;
    this.homeStreak = 0;
    this.awayStreak = 0;
    this.onFirePlayer = null;
    this.gameTime = 120;
    this.shotClock = 24;
    this.quarter = 1;

    document.getElementById("team-select-overlay").classList.add("hidden");

    // Update scoreboard HUD
    document.getElementById("home-city").textContent = this.homeTeam.city;
    document.getElementById("home-name").textContent = this.homeTeam.name;
    document.getElementById("away-city").textContent = this.awayTeam.city;
    document.getElementById("away-name").textContent = this.awayTeam.name;

    this.updateHUD();

    // Spawn 4 Players
    // P0: User (Home Star), P1: Home Teammate (AI), P2: Away Star (CPU), P3: Away Teammate (CPU)
    this.players = [
      {
        id: 0,
        team: "home",
        isUser: true,
        data: this.homeTeam.roster[0],
        x: 480, y: 180, z: 0,
        vx: 0, vy: 0, vz: 0,
        facing: 1, // 1 = right, -1 = left
        state: "IDLE", // IDLE, RUN, JUMP, DUNK, SHOVE, STUMBLED
        jumpTime: 0,
        dunkRotation: 0,
        turboMeter: 100,
        color: this.homeTeam.primaryColor
      },
      {
        id: 1,
        team: "home",
        isUser: false,
        data: this.homeTeam.roster[1],
        x: 440, y: 240, z: 0,
        vx: 0, vy: 0, vz: 0,
        facing: 1,
        state: "IDLE",
        jumpTime: 0,
        dunkRotation: 0,
        turboMeter: 100,
        color: this.homeTeam.primaryColor
      },
      {
        id: 2,
        team: "away",
        isUser: false,
        data: this.awayTeam.roster[0],
        x: 620, y: 180, z: 0,
        vx: 0, vy: 0, vz: 0,
        facing: -1,
        state: "IDLE",
        jumpTime: 0,
        dunkRotation: 0,
        turboMeter: 100,
        color: this.awayTeam.primaryColor
      },
      {
        id: 3,
        team: "away",
        isUser: false,
        data: this.awayTeam.roster[1],
        x: 660, y: 240, z: 0,
        vx: 0, vy: 0, vz: 0,
        facing: -1,
        state: "IDLE",
        jumpTime: 0,
        dunkRotation: 0,
        turboMeter: 100,
        color: this.awayTeam.primaryColor
      }
    ];

    // Give ball to P0
    this.giveBallTo(this.players[0]);

    this.audio.whistle();
    this.audio.announce("WELCOME TO NBA JAM!");
  }

  giveBallTo(player) {
    this.ball.holder = player;
    this.ball.state = "HELD";
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.ball.vz = 0;
    this.ball.x = player.x;
    this.ball.y = player.y;
    this.ball.z = player.z + 20;
    this.ball.isFire = (player === this.onFirePlayer);
  }

  onShootDown() {
    const p = this.players[0];
    if (this.ball.holder === p) {
      // User has ball: begin Jump / Shot / Dunk
      const distToHoop = Math.hypot(this.hoopRight.x - p.x, this.hoopRight.y - p.y);
      const isTurbo = this.keys.turbo && p.turboMeter > 10;

      if (distToHoop < 240 && isTurbo) {
        // MONSTER SLAM DUNK!
        p.state = "DUNK";
        p.vz = 8.5;
        p.jumpTime = 0;
        p.dunkRotation = 0;
        this.audio.turboWhoosh();
        this.audio.announce(Math.random() > 0.5 ? "KABOOM!" : "IS IT THE SHOES?!");
      } else {
        // Jump Shot
        p.state = "JUMP";
        p.vz = 6.8;
        p.jumpTime = 0;
        this.audio.dribble();
      }
    } else {
      // User on Defense: Jump to Block!
      p.state = "JUMP";
      p.vz = 6.5;
      this.audio.step();
    }
  }

  onShootUp() {
    const p = this.players[0];
    if (this.ball.holder === p && (p.state === "JUMP" || p.state === "DUNK")) {
      // Release shot at apex
      this.releaseShot(p);
    }
  }

  onPassDown() {
    const p = this.players[0];
    if (this.ball.holder === p) {
      // Pass to teammate P1
      const teammate = this.players[1];
      this.passBall(p, teammate);
    } else if (this.ball.holder === this.players[1]) {
      // Call for pass from AI teammate
      this.passBall(this.players[1], p);
    } else {
      // On Defense: SHOVE / STEAL!
      this.doShove(p);
    }
  }

  doShove(shover) {
    shover.state = "SHOVE";
    this.audio.shove();
    setTimeout(() => {
      if (shover.state === "SHOVE") shover.state = "IDLE";
    }, 250);

    // Check hit against ball holder or nearby opponent
    this.players.forEach(target => {
      if (target.team !== shover.team) {
        const d = Math.hypot(target.x - shover.x, target.y - shover.y);
        if (d < 38) {
          // KNOCKDOWN!
          target.state = "STUMBLED";
          target.vx = shover.facing * 4;
          target.vy = (Math.random() - 0.5) * 3;
          setTimeout(() => { target.state = "IDLE"; }, 900);

          if (this.ball.holder === target) {
            // Loose ball!
            this.ball.holder = null;
            this.ball.state = "FREE";
            this.ball.vx = (Math.random() - 0.5) * 5;
            this.ball.vy = (Math.random() - 0.5) * 5;
            this.ball.vz = 4;
            this.audio.shove();
            this.audio.announce("HE KNOCKS HIM DOWN!");
          }
        }
      }
    });
  }

  passBall(fromPlayer, toPlayer) {
    this.ball.holder = null;
    this.ball.state = "PASS";
    const dx = toPlayer.x - fromPlayer.x;
    const dy = toPlayer.y - fromPlayer.y;
    const dist = Math.hypot(dx, dy) || 1;
    const speed = 9;

    this.ball.vx = (dx / dist) * speed;
    this.ball.vy = (dy / dist) * speed;
    this.ball.vz = 2.5;
    this.audio.swish();
  }

  releaseShot(shooter) {
    const isHome = (shooter.team === "home");
    const targetHoop = isHome ? this.hoopRight : this.hoopLeft;

    this.ball.holder = null;
    this.ball.state = "SHOT";
    this.ball.targetHoop = targetHoop;

    const dx = targetHoop.x - shooter.x;
    const dy = targetHoop.y - shooter.y;
    const dist = Math.hypot(dx, dy);

    // Shot calculations
    const isDunk = (shooter.state === "DUNK");
    const is3Pt = dist > 340;

    if (isDunk) {
      // High-flying slam
      this.ball.vx = (dx / 20);
      this.ball.vy = (dy / 20);
      this.ball.vz = 1;
    } else {
      // Arc jump shot
      const flightFrames = Math.max(30, Math.floor(dist / 8));
      this.ball.vx = dx / flightFrames;
      this.ball.vy = dy / flightFrames;
      this.ball.vz = 7.5 + (dist / 140);

      if (is3Pt) {
        this.audio.announce(Math.random() > 0.5 ? "FROM DOWNTOWN!" : "FOR THREE!");
      }
    }

    shooter.state = "IDLE";
  }

  // Master Loop
  loop(timestamp) {
    const dt = Math.min(timestamp - this.lastFrameTime, 100);
    this.lastFrameTime = timestamp;

    this.update(dt);
    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    if (this.state !== "PLAYING") return;

    // Game Clock
    this.clockTimer += dt;
    if (this.clockTimer >= 1000) {
      this.clockTimer = 0;
      this.gameTime--;
      this.shotClock--;

      if (this.shotClock <= 0) {
        // Shot clock violation
        this.audio.buzzer();
        this.shotClock = 24;
      }

      if (this.gameTime <= 0) {
        // Quarter or Game End
        this.quarter++;
        if (this.quarter > 4) {
          this.endGame();
        } else {
          this.gameTime = 120;
          this.audio.buzzer();
          this.audio.announce(`END OF QUARTER ${this.quarter - 1}`);
        }
      }

      this.updateHUD();
    }

    // Update Players
    this.players.forEach(p => this.updatePlayer(p, dt));

    // Update Ball Physics
    this.updateBall(dt);

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life -= dt * 0.002;
      if (pt.life <= 0) this.particles.splice(i, 1);
    }

    // Smooth Camera Tracking (Keep ball and player centered)
    const targetCamX = this.ball.holder ? this.ball.holder.x : this.ball.x;
    this.cameraX += (targetCamX - this.cameraX) * 0.08;
    this.cameraX = Math.max(430, Math.min(670, this.cameraX));
  }

  updatePlayer(p, dt) {
    // Turbo recovery
    if (p.turboMeter < 100) p.turboMeter += dt * 0.015;

    // Movement
    if (p.isUser) {
      // User Controller
      let speed = 3.6;
      if (this.keys.turbo && p.turboMeter > 5) {
        speed = 5.6;
        p.turboMeter -= dt * 0.04;
      }

      p.vx = 0;
      p.vy = 0;

      if (p.state !== "STUMBLED") {
        if (this.keys.left) { p.vx = -speed; p.facing = -1; }
        if (this.keys.right) { p.vx = speed; p.facing = 1; }
        if (this.keys.up) p.vy = -speed * 0.75;
        if (this.keys.down) p.vy = speed * 0.75;
      }
    } else {
      // AI Teammates & CPU Opponents
      this.updateAI(p, dt);
    }

    // Apply movement
    p.x += p.vx;
    p.y += p.vy;

    // Court boundaries
    p.x = Math.max(50, Math.min(1050, p.x));
    p.y = Math.max(70, Math.min(330, p.y));

    // Jump / Dunk Vertical Physics
    if (p.z > 0 || p.vz !== 0) {
      p.z += p.vz;
      p.vz -= 0.35; // Gravity

      if (p.state === "DUNK") {
        p.dunkRotation += 0.25;
        // Trail fire particles
        this.spawnFireParticle(p.x, p.y, p.z);
      }

      if (p.z <= 0) {
        p.z = 0;
        p.vz = 0;
        if (p.state === "JUMP" || p.state === "DUNK") {
          p.state = "IDLE";
        }
      }
    }

    // Ball Follower if holding
    if (this.ball.holder === p) {
      this.ball.x = p.x + p.facing * 12;
      this.ball.y = p.y + 4;
      this.ball.z = p.z + 14 + (p.state === "DUNK" ? 10 : Math.sin(performance.now() / 80) * 4);
    }
  }

  updateAI(p, dt) {
    const isHome = (p.team === "home");
    const targetHoop = isHome ? this.hoopRight : this.hoopLeft;
    const opponentHoop = isHome ? this.hoopLeft : this.hoopRight;

    p.vx = 0;
    p.vy = 0;

    if (this.ball.holder === p) {
      // AI has the ball: Drive to hoop and shoot!
      const dx = targetHoop.x - p.x;
      const dy = targetHoop.y - p.y;
      const dist = Math.hypot(dx, dy);

      p.facing = dx > 0 ? 1 : -1;
      p.vx = (dx / dist) * 3.4;
      p.vy = (dy / dist) * 2.2;

      // Shoot / Dunk threshold
      if (dist < 260 && Math.random() < 0.04) {
        p.state = dist < 140 ? "DUNK" : "JUMP";
        p.vz = 7;
        setTimeout(() => this.releaseShot(p), 350);
      }
    } else if (this.ball.state === "FREE") {
      // Chase free ball
      const dx = this.ball.x - p.x;
      const dy = this.ball.y - p.y;
      const dist = Math.hypot(dx, dy) || 1;
      p.vx = (dx / dist) * 3.6;
      p.vy = (dy / dist) * 2.5;
    } else {
      // Defense / Offense Positioning
      const ballHolder = this.ball.holder;
      if (ballHolder && ballHolder.team !== p.team) {
        // Defensive coverage: get between holder and hoop
        const defendX = (ballHolder.x + opponentHoop.x) / 2;
        const defendY = (ballHolder.y + opponentHoop.y) / 2;
        const dx = defendX - p.x;
        const dy = defendY - p.y;
        const dist = Math.hypot(dx, dy) || 1;
        p.vx = (dx / dist) * 3.2;
        p.vy = (dy / dist) * 2.0;

        // Try shove if very close
        if (Math.hypot(ballHolder.x - p.x, ballHolder.y - p.y) < 30 && Math.random() < 0.03) {
          this.doShove(p);
        }
      } else {
        // Offensive support: find open space
        const targetX = isHome ? 750 : 350;
        const targetY = (p.id % 2 === 0) ? 140 : 260;
        p.vx = (targetX - p.x) * 0.02;
        p.vy = (targetY - p.y) * 0.02;
      }
    }
  }

  updateBall(dt) {
    if (this.ball.state === "HELD") return;

    if (this.ball.state === "SHOT" || this.ball.state === "PASS" || this.ball.state === "FREE") {
      this.ball.x += this.ball.vx;
      this.ball.y += this.ball.vy;
      this.ball.z += this.ball.vz;
      this.ball.vz -= 0.28; // Gravity

      // Fire particles when ball is on fire
      if (this.ball.isFire) {
        this.spawnFireParticle(this.ball.x, this.ball.y, this.ball.z);
      }

      // Check basket scored
      if (this.ball.state === "SHOT") {
        const hoop = this.ball.targetHoop;
        const distToHoop = Math.hypot(this.ball.x - hoop.x, this.ball.y - hoop.y);

        if (distToHoop < hoop.radius + 6 && Math.abs(this.ball.z - hoop.z) < 14 && this.ball.vz < 0) {
          // SWISH! IT'S GOOD!
          this.onBasketScored(hoop === this.hoopRight ? "home" : "away");
          return;
        }
      }

      // Ball Bounce on Floor
      if (this.ball.z <= 0) {
        this.ball.z = 0;
        this.ball.vz = -this.ball.vz * 0.65;
        this.ball.vx *= 0.85;
        this.ball.vy *= 0.85;

        if (Math.abs(this.ball.vz) < 1) {
          this.ball.vz = 0;
          this.ball.state = "FREE";
        }
      }

      // Pickup loose ball
      if (this.ball.state === "FREE" || (this.ball.state === "PASS" && this.ball.z < 25)) {
        this.players.forEach(p => {
          if (p.state !== "STUMBLED" && Math.hypot(p.x - this.ball.x, p.y - this.ball.y) < 26) {
            this.giveBallTo(p);
            this.audio.dribble();
          }
        });
      }
    }
  }

  onBasketScored(scoringTeam) {
    const isHome = (scoringTeam === "home");
    const pts = Math.hypot(this.ball.x - (isHome ? this.hoopRight.x : this.hoopLeft.x)) > 340 ? 3 : 2;

    if (isHome) {
      this.homeScore += pts;
      this.homeStreak++;
      this.awayStreak = 0;
    } else {
      this.awayScore += pts;
      this.awayStreak++;
      this.homeStreak = 0;
    }

    // Audio & Announcer
    this.audio.swish();
    this.audio.dunkSlam();

    const streak = isHome ? this.homeStreak : this.awayStreak;
    if (streak === 2) {
      this.audio.announce("HE'S HEATING UP!");
    } else if (streak >= 3) {
      this.audio.announce("HE'S ON FIRE!");
      this.onFirePlayer = isHome ? this.players[0] : this.players[2];
    } else {
      const calls = ["BOOMSHAKALAKA!", "JAM TIME!", "MONSTER JAM!", "COUNT IT!"];
      this.audio.announce(calls[Math.floor(Math.random() * calls.length)]);
    }

    // Reset shot clock and give ball to scored-on team
    this.shotClock = 24;
    this.updateHUD();

    // Spawn ball on scored-upon team
    setTimeout(() => {
      const inboundPlayer = isHome ? this.players[2] : this.players[0];
      inboundPlayer.x = isHome ? 950 : 150;
      inboundPlayer.y = 200;
      this.giveBallTo(inboundPlayer);
    }, 700);
  }

  spawnFireParticle(x, y, z) {
    for (let i = 0; i < 3; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 8,
        z: z + (Math.random() - 0.5) * 8,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        life: 1.0,
        color: Math.random() > 0.4 ? "#f97316" : "#facc15"
      });
    }
  }

  updateHUD() {
    document.getElementById("home-score").textContent = this.homeScore;
    document.getElementById("away-score").textContent = this.awayScore;
    document.getElementById("shot-clock-val").textContent = this.shotClock;

    const mins = Math.floor(this.gameTime / 60);
    const secs = String(this.gameTime % 60).padStart(2, "0");
    document.getElementById("hud-clock").textContent = `${mins}:${secs}`;
    document.getElementById("hud-quarter").textContent = `${this.quarter}${["ST","ND","RD","TH"][this.quarter-1] || "TH"} QTR`;

    // Flame indicators
    const homeFlames = document.querySelectorAll("#home-flames .flame-icon");
    const awayFlames = document.querySelectorAll("#away-flames .flame-icon");

    homeFlames.forEach((f, i) => f.classList.toggle("active", i < this.homeStreak));
    awayFlames.forEach((f, i) => f.classList.toggle("active", i < this.awayStreak));
  }

  endGame() {
    this.state = "GAMEOVER";
    this.audio.buzzer();
    this.audio.announce("FINAL BUZZER! THAT'S THE GAME!");

    document.getElementById("game-over-overlay").classList.remove("hidden");
    document.getElementById("final-home-team").textContent = this.homeTeam.name;
    document.getElementById("final-home-score").textContent = this.homeScore;
    document.getElementById("final-away-team").textContent = this.awayTeam.name;
    document.getElementById("final-away-score").textContent = this.awayScore;

    const winner = this.homeScore > this.awayScore ? this.homeTeam.name : this.awayTeam.name;
    document.getElementById("final-mvp-text").textContent = `${winner} WIN THE TOURNAMENT MATCH!`;
  }

  // Canvas 2D Perspective Court Renderer
  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, 860, 460);

    // Camera offset (Center is 430px in canvas)
    const offsetX = 430 - this.cameraX;

    ctx.save();
    ctx.translate(offsetX, 0);

    // 1. Crowd Stadium Background
    this.renderCrowd(ctx);

    // 2. Hardwood Basketball Court
    this.renderCourt(ctx);

    // 3. Hoops & Backboards (Left & Right)
    this.renderHoop(ctx, this.hoopLeft, true);
    this.renderHoop(ctx, this.hoopRight, false);

    // 4. Sort Objects by Y (Depth Sorting)
    const renderables = [
      ...this.players.map(p => ({ type: "player", obj: p, y: p.y })),
      { type: "ball", obj: this.ball, y: this.ball.y }
    ];
    renderables.sort((a, b) => a.y - b.y);

    renderables.forEach(item => {
      if (item.type === "player") this.renderPlayer(ctx, item.obj);
      else if (item.type === "ball") this.renderBall(ctx, item.obj);
    });

    // 5. Fire Particles
    this.renderParticles(ctx);

    ctx.restore();
  }

  renderCrowd(ctx) {
    // Upper stadium dark seating
    ctx.fillStyle = "#0c0e18";
    ctx.fillRect(0, 0, 1100, 70);

    // Pixelated animated cheering crowd
    for (let x = 10; x < 1100; x += 14) {
      const bob = Math.sin(performance.now() / 200 + x) * 2;
      ctx.fillStyle = (x % 28 === 0) ? "#3b82f6" : ((x % 42 === 0) ? "#ef4444" : "#64748b");
      ctx.fillRect(x, 40 + bob, 10, 14);
      // Head
      ctx.fillStyle = "#fde047";
      ctx.beginPath();
      ctx.arc(x + 5, 34 + bob, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  renderCourt(ctx) {
    // Polished Wood Floor
    const grad = ctx.createLinearGradient(0, 70, 0, 370);
    grad.addColorStop(0, "#d97706");
    grad.addColorStop(0.5, "#b45309");
    grad.addColorStop(1, "#92400e");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 70, 1100, 300);

    // Hardwood Planks (Stripes)
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    for (let y = 70; y < 370; y += 12) {
      ctx.fillRect(0, y, 1100, 2);
    }

    // Court Boundary Lines
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.strokeRect(40, 70, 1020, 290);

    // Half Court Line
    ctx.beginPath();
    ctx.moveTo(550, 70);
    ctx.lineTo(550, 360);
    ctx.stroke();

    // Center Circle & NBA JAM Center Logo
    ctx.beginPath();
    ctx.arc(550, 215, 50, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#ef4444";
    ctx.font = "bold 18px 'Teko', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("NBA JAM", 550, 222);

    // 3-Point Arcs (Left & Right)
    ctx.beginPath();
    ctx.arc(70, 215, 175, -Math.PI / 2.3, Math.PI / 2.3);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(1030, 215, 175, Math.PI / 1.75, -Math.PI / 1.75);
    ctx.stroke();

    // Keys & Free Throw Circles
    ctx.strokeRect(40, 160, 130, 110);
    ctx.strokeRect(930, 160, 130, 110);

    ctx.beginPath();
    ctx.arc(170, 215, 35, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(930, 215, 35, 0, Math.PI * 2);
    ctx.stroke();
  }

  renderHoop(ctx, hoop, isLeft) {
    const hx = hoop.x;
    const hy = hoop.y;
    const hz = hoop.z;

    // Pole
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(isLeft ? hx - 25 : hx + 18, hy - 4, 8, 360 - hy);

    // Glass Backboard
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.fillRect(isLeft ? hx - 20 : hx + 8, hy - 35 - hz, 12, 70);
    ctx.strokeRect(isLeft ? hx - 20 : hx + 8, hy - 35 - hz, 12, 70);

    // Orange Breakaway Rim
    ctx.strokeStyle = "#f97316";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(hx, hy - hz, hoop.radius, hoop.radius * 0.45, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Net
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(hx - hoop.radius, hy - hz);
    ctx.lineTo(hx - 8, hy - hz + 24);
    ctx.lineTo(hx + 8, hy - hz + 24);
    ctx.lineTo(hx + hoop.radius, hy - hz);
    ctx.stroke();
  }

  renderPlayer(ctx, p) {
    const px = p.x;
    const py = p.y - p.z; // Project altitude upward

    // Floor Shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + 4, 16, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(px, py);

    // Somersault Rotation if Dunking
    if (p.state === "DUNK") {
      ctx.rotate(p.dunkRotation * p.facing);
    }

    // Facing direction
    ctx.scale(p.facing, 1);

    // Shoes (Red/Black Sneakers)
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(-8, 6, 8, 5);
    ctx.fillRect(2, 6, 8, 5);

    // Legs / Socks
    ctx.fillStyle = "#fde047"; // Skin
    ctx.fillRect(-6, -4, 4, 10);
    ctx.fillRect(4, -4, 4, 10);

    // Team Shorts
    ctx.fillStyle = p.color;
    ctx.fillRect(-9, -16, 20, 14);

    // Jersey Body
    ctx.fillStyle = p.color;
    ctx.fillRect(-10, -38, 22, 24);

    // Jersey Number
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 9px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(String(p.data.num), 1, -22);

    // Arms
    ctx.fillStyle = "#fde047";
    if (p.state === "JUMP" || p.state === "DUNK") {
      // Arms raised high
      ctx.fillRect(-14, -44, 5, 18);
      ctx.fillRect(11, -44, 5, 18);
    } else {
      ctx.fillRect(-14, -36, 5, 16);
      ctx.fillRect(11, -36, 5, 16);
    }

    // Head
    ctx.fillStyle = "#fde047";
    ctx.beginPath();
    ctx.arc(1, -46, 8, 0, Math.PI * 2);
    ctx.fill();

    // Hair / Headband
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(-7, -54, 16, 5);

    ctx.restore();

    // Player Identification Tag above head
    ctx.fillStyle = p.isUser ? "#facc15" : "#ffffff";
    ctx.font = "bold 10px 'Teko', sans-serif";
    ctx.textAlign = "center";
    const tag = p.isUser ? "YOU" : p.data.name.split(" ")[1];
    ctx.fillText(tag, p.x, py - 60);

    // Fire aura around player on fire
    if (p === this.onFirePlayer) {
      ctx.strokeStyle = "#f97316";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y + 4, 24, 12, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  renderBall(ctx, ball) {
    const bx = ball.x;
    const by = ball.y - ball.z;

    // Floor Shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    const shadowSize = Math.max(4, 12 - ball.z * 0.08);
    ctx.beginPath();
    ctx.ellipse(ball.x, ball.y + 2, shadowSize, shadowSize * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(bx, by);

    // Flaming Ball Aura
    if (ball.isFire) {
      ctx.shadowColor = "#f97316";
      ctx.shadowBlur = 18;
    }

    // Basketball Sphere
    ctx.fillStyle = ball.isFire ? "#f97316" : "#ea580c";
    ctx.beginPath();
    ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
    ctx.fill();

    // Seams
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, 7.5, -Math.PI / 3, Math.PI / 3);
    ctx.stroke();

    ctx.restore();
  }

  renderParticles(ctx) {
    this.particles.forEach(pt => {
      ctx.fillStyle = pt.color;
      ctx.globalAlpha = Math.max(0, pt.life);
      ctx.beginPath();
      ctx.arc(pt.x, pt.y - (pt.z || 0), 3.5, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;
  }
}

// Bootstrap
document.addEventListener("DOMContentLoaded", () => {
  window.nbaJam = new NBAJamGame();
});
