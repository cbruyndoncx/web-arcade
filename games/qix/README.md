# NEO-QIX 2088 // Cybernetic Arcade

A modernized synthwave arcade tribute to the legendary 1981 Taito arcade classic **QIX**. Built with pure vanilla JavaScript, HTML5 Canvas, and the Web Audio API with zero external dependencies—ready to play directly in any modern web browser or host on **GitHub Pages**.

---

## ⚡ Live on GitHub Pages

Because **NEO-QIX** is built purely with standard HTML5, CSS, and modern ES6 modules with no build steps or backend servers required, it can be deployed to a public GitHub URL in seconds:

1. Push this repository to GitHub:
   ```bash
   git add .
   git commit -m "Launch NEO-QIX 2088"
   git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git
   git push -u origin main
   ```
2. In your GitHub repository, go to **Settings** → **Pages** (under Code and automation).
3. Under **Branch**, select `main` (or `master`) and directory `/ (root)`.
4. Click **Save**.
5. Your arcade game will be instantly live at:
   `https://<YOUR-USERNAME>.github.io/<YOUR-REPO-NAME>/`

---

## 🎮 Game Overview & Objective

You command a cybernetic diamond marker patrolling the perimeter of an unfilled electronic grid. Your mission: carve into the void and seal off territory to capture at least **75%** of the playfield to secure each sector.

### The Threats
- **The Qix**: An erratic, undulating plasma helix with chaotic vector momentum bouncing within the unclaimed space. If any segment of the Qix strikes your drawing line (Stix) before you reach a border, you disintegrate!
- **Sparx**: Lethal electrical drones that patrol existing borders. In prolonged rounds, their timer triggers **Super Sparx** mode, turning them aggressive red drones that hunt your position.
- **The Fuse**: Hesitation is deadly! If you freeze for more than ~0.4 seconds while drawing in the void, a Fuse ignites at the origin of your line and races towards you.

### Fast Draw vs. Slow Draw
- **Fast Draw (Neon Cyan)**: Move quickly, claim territory safely, standard scoring (100 pts per 1% captured).
- **Slow Draw (Molten Gold / Orange)**: Move at half speed through high danger, but earn **DOUBLE POINTS** (200 pts per 1% captured)!

---

## 🕹️ Controls

| Action | Keyboard | Touch / Mobile | USB / Bluetooth Gamepad |
| :--- | :--- | :--- | :--- |
| **Move / Navigate** | `Arrow Keys` or `W`, `A`, `S`, `D` | Virtual D-Pad | `D-Pad` or `Left Analog Stick` |
| **Fast Draw** | `Space`, `X`, `J`, or `Shift` | `[FAST]` Button | `Button A` (0), `X` (2), or `RT` |
| **Slow Draw (2x Pts)** | `Z`, `K`, `C`, or `Ctrl` | `[SLOW]` Button | `Button B` (1), `Y` (3), or `LT` |
| **Pause Game** | `P` or `Escape` | Tap Status Bar | `Start` Button (9) |
| **Mute / Unmute** | `M` or UI Button | Sound Button | — |
| **Fullscreen** | UI Button | Fullscreen Button | — |

> **Pro-Tip**: When moving along the border, holding the draw button allows you to step off into the void. If you press into the void without holding a draw button, a helpful on-screen prompt reminds you to hold `Space` or `Z`.

---

## 💎 Modern Features & Power-Ups

- **Procedural Web Audio Engine**: Dynamic synthwave soundtrack with driving bassline, retro drums, and adaptive chord progressions that ramp up in intensity as you near the 75% target.
- **Tactical Cyber Cores**: Enclosing floating cyber cores within captured territory grants instant tactical buffs:
  - ⚡ **EMP STUN**: Freezes the Qix and Sparx in stasis for 5 seconds.
  - 🛡️ **NANO SHIELD**: Deploys an energy barrier absorbing 1 lethal Sparx or Fuse collision.
  - 🚀 **HYPER DRIVE**: Doubles border and drawing movement speed.
  - 💎 **3X MULTIPLIER**: Triples points awarded on your next territory capture.
- **Dynamic Combos & Slices**:
  - *Super Slice* (8%+ cut): +500 Bonus Points
  - *Mega Slice* (15%+ cut): +2,000 Bonus Points
  - *Ultra Slice* (25%+ cut): +5,000 Bonus Points
  - *Giga Slice* (40%+ cut): +10,000 Bonus Points
  - *Near Miss* (brushing past Qix): +250 Bonus Points with slow-mo effect
  - *2-Qix Split Bonus*: Separating 2 roaming Qixes instantly clears the round with a massive +25,000 jackpot!
- **Game Modes**:
  - **Arcade**: Authentic challenge (3 lives, 75% threshold, escalating speeds).
  - **Hardcore**: High-stakes trial (1 life, 80% threshold, hyperactive enemies).
  - **Zen**: Infinite lives and relaxed synth atmosphere for pure carving flow.
- **Visual Filters**:
  - CRT Scanline & Curved Vignette filter toggle.
  - Screen shake & shockwave physics on high-percentage territory captures.
  - LocalStorage Hall of Fame leaderboard.

---

## 📁 Project Architecture

```
qix-arcade-game/
├── index.html         # Semantic HTML5 shell, responsive HUD, modals, touch controls
├── css/
│   └── style.css      # Synthwave arcade styling, neon glows, glassmorphism, CRT overlay
├── js/
│   ├── main.js        # Bootstrapper and DOMContentLoaded initialization
│   ├── game.js        # Master game loop, state machine, level progression, input poll
│   ├── grid.js        # 2D cellular grid, BFS flood-fill partition math, territory metrics
│   ├── player.js      # Player marker, stix line extrusion, fuse combustion, buffs
│   ├── qix.js         # Undulating chaotic geometric helix ribbon, physics, line collision
│   ├── sparx.js       # Perimeter patrol enemies, path traversal, Super Sparx tracking
│   ├── powerups.js    # Cyber core tactical pickups and duration management
│   ├── particles.js   # Pooled particle engine, shockwaves, floating text, screen shake
│   ├── audio.js       # Procedural Web Audio API synthesizer and dynamic BGM sequencer
│   └── ui.js          # HUD updates, odometer animations, modal dialogs, touch bindings
└── test/
    └── game_test.js   # Automated unit test suite verifying grid math and physics
```

---

## 🧪 Running Unit Tests

To verify mathematical accuracy, collision detection, and territory flood fill:
```bash
node test/game_test.js
```

---

## 📜 License
MIT License. Inspired by the classic arcade masterpiece by Randy and Sandy Pfeiffer (1981).
