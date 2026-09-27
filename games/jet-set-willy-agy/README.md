# Jet Set Willy (1984) — HTML5 Web Remake for GitHub Pages

A faithful, complete, and responsive client-side HTML5 / JavaScript remake of the legendary 1984 ZX Spectrum platform game **Jet Set Willy**, written by Matthew Smith and originally published by Software Projects.

This version is designed specifically to run seamlessly in modern web browsers and be hosted directly on **GitHub Pages** with zero setup or external dependencies.

![Jet Set Willy Banner](https://raw.githubusercontent.com/skoolkid/jetsetwilly/master/images/title.png)

---

## 🚀 Live Demo & GitHub Pages Hosting

### Option 1: Automatic Deployment via GitHub Actions (Recommended)
This repository includes a pre-configured GitHub Actions workflow in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

1. Create a new repository on GitHub (e.g., `jet-set-willy-agy`).
2. Push this project to your repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Jet Set Willy game"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/jet-set-willy-agy.git
   git push -u origin main
   ```
3. In your GitHub repository:
   - Go to **Settings** → **Pages**.
   - Under **Build and deployment** → **Source**, select **GitHub Actions**.
4. The workflow will automatically deploy your game! Your game will be live at:
   `https://YOUR_USERNAME.github.io/jet-set-willy-agy/`

---

### Option 2: Deploy Directly from Branch
1. Push the code to your `main` branch.
2. In your repository on GitHub:
   - Go to **Settings** → **Pages**.
   - Under **Build and deployment** → **Source**, choose **Deploy from a branch**.
   - Select branch: `main` and folder: `/ (root)`.
   - Click **Save**.
3. In a few seconds, your site will be live!

---

### Running Locally
Because this project uses zero build steps and self-contained data, you can run it immediately on your machine:
- Simply double-click [`index.html`](index.html) to open in any web browser (`file:///...` works out of the box with zero CORS issues!), or
- Run a lightweight local server:
  ```bash
  python3 -m http.server 8000
  ```
  and open `http://localhost:8000` in your browser.

---

## 🎮 How to Play

### The Story
After striking it rich in *Manic Miner*, Miner Willy purchased a sprawling 60-room Tudor mansion. Following an epic party attended by dozens of rowdy guests, the mansion is left in complete chaos. Maria the housekeeper stands firmly in Willy's Master Bedroom and refuses to let him go to sleep until he has tidied up all **82 flashing items** scattered throughout the mansion, grounds, and estate!

### Controls

| Action | Keyboard | Gamepad | Mobile Touch |
| :--- | :--- | :--- | :--- |
| **Walk Left** | <kbd>←</kbd> or <kbd>A</kbd> or <kbd>O</kbd> | D-Pad Left / Left Stick | <kbd>◀</kbd> On-Screen Button |
| **Walk Right** | <kbd>→</kbd> or <kbd>D</kbd> or <kbd>P</kbd> | D-Pad Right / Left Stick | <kbd>▶</kbd> On-Screen Button |
| **Jump** | <kbd>Space</kbd> / <kbd>↑</kbd> / <kbd>W</kbd> / <kbd>Q</kbd> | <kbd>A</kbd> / <kbd>B</kbd> / <kbd>Y</kbd> | <kbd>JUMP</kbd> On-Screen Button |
| **Pause / Start** | <kbd>Enter</kbd> | <kbd>Start</kbd> | <kbd>PAUSE</kbd> Button |
| **Mute / Audio** | <kbd>M</kbd> | - | Sound Toggle Button |
| **Title / Reset** | <kbd>Escape</kbd> | - | - |

---

## 🕹️ Authentic Game Mechanics

1. **Fixed Parabolic Jump Arc:**
   - Jumping follows the exact 18-frame arc from the original Z80 code.
   - You cannot steer or change direction mid-jump.
2. **Diagonal Ramps and Slopes:**
   - Willy smoothly climbs up and descends ramps.
3. **Conveyor Belts:**
   - Push Willy left or right while on them.
4. **Swinging Ropes:**
   - Authentic physics in rooms: *We Must Perform A Quirkafleeg*, *On The Roof*, *Cold Store*, *Swimming Pool*, and *The Beach*.
   - Willy can grab swinging ropes, ride across deadly gaps, climb up/down, and jump off.
5. **Fall Height Limit:**
   - Falling more than 4 vertical character blocks (32 pixels) is fatal.
6. **Clock & Time Limit:**
   - Starts at 7:00 AM and advances 1 game minute every 256 frames (~5 seconds).
   - Collect all 82 items before midnight!
7. **Endgame Victory Sequence:**
   - Once all 82 items are collected, Maria steps aside.
   - Enter the Master Bedroom and jump into bed.
   - Willy enters sleepwalker mode, runs automatically through the mansion all the way to The Bathroom, and is flushed down the toilet!
8. **Game Over Animation:**
   - When Willy runs out of lives, the Monty Python giant boot descends from the ceiling to crush Willy on his plinth to the tune of the game-over fanfare.

---

## 🏰 All 60 Rooms Included

| ID | Room Name | ID | Room Name | ID | Room Name |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 00 | The Off Licence | 20 | Ballroom East | 40 | Dr Jones will never believe this |
| 01 | The Bridge | 21 | Ballroom West | 41 | The Attic |
| 02 | Under the MegaTree | 22 | To the Kitchens / Main Stairway | 42 | Under the Roof |
| 03 | At the Foot of the MegaTree | 23 | The Kitchen | 43 | Conservatory Roof |
| 04 | The Drive | 24 | West of Kitchen | 44 | On top of the house |
| 05 | The Security Guard | 25 | Cold Store | 45 | Under the Drive |
| 06 | Entrance to Hades | 26 | East Wall Base | 46 | Tree Root |
| 07 | Cuckoo's Nest | 27 | The Chapel | 47 | Nomen Luni |
| 08 | Inside the MegaTrunk | 28 | First Landing | 48 | The Wine Cellar |
| 09 | On a Branch Over the Drive | 29 | The Nightmare Room | 49 | Watch Tower |
| 10 | The Front Door | 30 | The Banyan Tree | 50 | Tool Shed |
| 11 | The Hall | 31 | Swimming Pool | 51 | Back Stairway |
| 12 | Tree Top | 32 | Halfway up the East Wall | 52 | Back Door |
| 13 | Out on a limb | 33 | The Bathroom | 53 | West Wing |
| 14 | Rescue Esmerelda | 34 | Top Landing | 54 | West Bedroom |
| 15 | I'm sure I've seen this before.. | 35 | Master Bedroom | 55 | West Wing Roof |
| 16 | We must perform a Quirkafleeg | 36 | A bit of tree | 56 | Above the West Bedroom |
| 17 | Up on the Battlements | 37 | Orangery | 57 | The Beach |
| 18 | On the Roof | 38 | Priests' Hole | 58 | The Yacht |
| 19 | The Forgotten Abbey | 39 | Emergency Generator | 59 | The Bow |

---

## ⚡ Cheats & Modern Features

- **Classic WRITETYPER Cheat:** Type `writetyper` on your keyboard at any time to activate the famous ZX Spectrum cheat mode (confirmed by the cheat icon on the lives bar).
- **Mansion Room Warp:** Practice or explore any room using the dropdown selector.
- **Infinite Lives Toggle:** Practice difficult sections without losing lives.
- **Auto Collect All Items:** Jump straight to the Maria sleepwalker endgame sequence.
- **Save & Load State:** Save your progress directly in your browser (`localStorage`).
- **CRT Filter:** Vintage TV scanline and curvature overlay.
- **Speed Selector:** Choose between 50 Hz (PAL Spectrum original), 60 Hz (Turbo), or 30 Hz (Practice).

---

## 📁 Repository Structure

```
jet-set-willy-agy/
├── index.html              # Main HTML5 entry point
├── style.css               # Responsive arcade styling & CRT effects
├── README.md               # Documentation and GitHub Pages guide
├── .github/
│   └── workflows/
│       └── deploy.yml      # Zero-config GitHub Pages automated deployment
└── js/
    ├── constants.js        # Game constants, enums, Spectrum palette
    ├── data.js             # Extracted room maps, tile bitmaps, sprites, music
    ├── audio.js            # Web Audio 1-bit beeper & Moonlight Sonata engine
    ├── renderer.js         # Pixel-perfect canvas graphics renderer
    ├── physics.js          # Willy movement, jumping trajectory, ramp physics
    ├── robots.js           # Guardian patrol AI and animations
    ├── rope.js             # Swinging rope physics simulation
    ├── input.js            # Unified keyboard, touch, and gamepad handler
    ├── game.js             # State machine, room transitions, clock, win/die logic
    └── main.js             # 50 Hz game loop and UI event wiring
```

---

## 🧠 Engineering & Approach Notes

This project was built from the ground up using an autonomous engineering workflow:

### 1. Requirements & Architecture Design
- **Zero-Dependency Static App:** The entire application runs natively in any browser without build tooling, bundlers, or package installs. This ensures friction-free hosting on GitHub Pages and allows opening `index.html` directly via `file:///` without CORS roadblocks.
- **Strict Retro Fidelity:** Rather than creating a loose clone, the goal was an exact, authentic recreation of the 1984 ZX Spectrum 48K engine, including its 256×192 graphics resolution, 15-color palette, 18-step jump trajectory, slope physics, conveyor inertia, 33-segment swinging rope mechanics, and 50 Hz PAL timing.

### 2. Reverse Engineering & Data Pipeline
- Analyzed the annotated Z80 disassembly (SkoolKit) and verified C port logic.
- Built a custom automated extraction tool in Python to convert the canonical ROM structures into clean, typed JavaScript structures stored in `js/data.js`:
  - **60 Rooms:** 32×16 tile maps, 8×8 pixel tile bitmaps, attribute colors, exits, and item positions.
  - **45 Robot Sets:** Multi-frame guardian sprites with frame masks and update frequencies.
  - **Sprite Tables:** Miner Willy walking frames, plinth, and the Monty Python crushing boot.
  - **Audio Data:** Complete tracker event scores for Beethoven's *Moonlight Sonata* and sound effect tables.

### 3. Modular Engine Construction
- **Canvas Renderer (`renderer.js`):** Pixel-perfect software rasterizer writing directly to an `ImageData` Uint32 buffer. Implements bit-tagging for pixel-accurate collision detection with guardians.
- **Physics & Movement (`physics.js`):** Faithful port of the classic 18-step parabolic jump table, ramp climbing offsets, conveyor velocities, solid-ceiling head bumps, and fall-height death triggers (>32 vertical pixels).
- **Harmonic Rope Engine (`rope.js`):** Recreates the exact 86-point mathematical rope sweep table across 33 segments for the five rope rooms.
- **Web Audio 1-Bit Beeper (`audio.js`):** Polyphonic square-wave synthesizer with real-time stereo panning tied to Willy's horizontal screen position.
- **State & Endgames (`game.js`):** Full state machine handling the title screen, in-game exploration, 7:00 AM clock progression, death animations, the classic `writetyper` cheat mode, and the complete Maria sleepwalker toilet flush ending.
- **Input System (`input.js`):** Unified handler supporting modern keyboard layouts (Arrows, WASD), classic Spectrum keys (QAOP), the Gamepad API, and responsive on-screen mobile touch controls.

### 4. Rigorous Multi-Level Verification
- **Syntax & Module Checks:** Ran `node --check` across all modules to verify syntax and compatibility.
- **Headless Unit & Integration Tests:** Developed an 8-milestone test suite validating data integrity, movement arcs, room warping, item collection, and endgame transitions.
- **Automated End-to-End Browser Testing:** Deployed a headless Chromium browser using Playwright to test the application under realistic network conditions:
  - Verified 0 console errors and 0 page exceptions.
  - Validated canvas pixel rendering on the title screen and in-game rooms.
  - Inspected real screenshot artifacts to confirm visual accuracy, CRT styling, and layout integrity.
  - Identified and fixed edge cases, such as safe platform spawn coordinates during practice room warps and input trigger latching.

---

## 📜 Credits, License & Legal Disclaimer

### License
The source code in this repository is distributed under the terms of the [zlib License](LICENSE).
- **C Reference Implementation:** Copyright © 2021-2026 Steve Clark.
- **Original Game Logic & Assets:** Copyright © 1984 Matthew Smith (Software Projects Ltd).
- **Web Port:** Copyright © 2026 Antigravity AI / Contributors.

See the full [`LICENSE`](LICENSE) file for details.

### Legal Status & Non-Commercial Preservation
- **Non-Commercial / Educational:** This project is an open-source, non-commercial educational tribute and preservation project celebrating the history of 1980s 8-bit British computer gaming.
- **No Monetization:** There are no advertisements, microtransactions, paywalls, or commercial activities associated with this repository or its GitHub Pages deployment.
- **Musical Composition:** The main title soundtrack is Ludwig van Beethoven's *Piano Sonata No. 14 in C-sharp minor ("Moonlight Sonata")*, composed in 1801, which is in the public domain.
- **Intellectual Property Rights:** *Jet Set Willy*, *Miner Willy*, character names, and original game visuals remain the intellectual property of Matthew Smith and their respective rights holders. In 1999, Matthew Smith gave blanket community permission for the non-commercial distribution and fan preservation of his ZX Spectrum classics. If any copyright holder objects to this educational preservation project, please open an issue and the content will be removed promptly upon request.
