# 🕹️ Retro Web Arcade

> A unified multi-game browser arcade cabinet combining classic and modernized retro games in a single repository. Zero build requirements, zero server runtime, and 100% compatible with GitHub Pages.

---

## 🌟 Overview & Motivation

When testing LLM coding harnesses and building retro games, having separate repositories for every small project quickly leads to GitHub sprawl and deployment overhead.

**Retro Web Arcade** solves this by unifying all web games under a single repository with:
- **Central Frontdoor Hub (`index.html`)**: An 80s/90s cyber-arcade themed portal featuring game cards, search & category filters, cover art previews, and an embedded theater cabinet modal.
- **Independent Game Subdirectories (`games/<game-id>/`)**: Each game lives in its own self-contained folder with relative asset paths.
- **Direct GitHub Pages Deployment**: No custom CI/CD or build steps required. Push to GitHub and enable Pages from `/ (root)`.
- **Seamless Back Navigation**: Every game has an embedded "◀ Arcade Hub" navigation button that works both in standalone tabs and within embedded iframes.

---

## 🎮 Included Games

| Game | Era / Genre | Tech Stack | Description |
| :--- | :--- | :--- | :--- |
| **[NEO-QIX 2088](./games/qix/index.html)** | 1981 / Modern Remake | HTML5 Canvas, Delta-Time Engine, Web Audio | Modernized synthwave tribute to Taito's 1981 classic. Claim territory, avoid the erratic plasma Qix, dodge patrolling Sparx, and uncover vibrant synthwave backgrounds. |
| **[Jet Set Willy (Enhanced)](./games/jet-set-willy-agy/index.html)** | 1984 / Enhanced | HTML5 Canvas, CRT Scanlines, Web Audio | Authentic recreation of Matthew Smith's legendary 60-room ZX Spectrum platformer. Guide Miner Willy, collect glasses, enjoy the *Moonlight Sonata* soundtrack and room warp picker. |
| **[Jet Set Willy (Classic)](./games/jet-set-willy/index.html)** | 1984 / Classic Minimal | Pure Vanilla JS, Crisp Canvas | Lightweight, pure-canvas reproduction of the original Jet Set Willy game loop with on-screen virtual touch pad for mobile. |
| **[Ministeck Daily Puzzle](./games/ministeck/index.html)** | 1965 / Modern PWA | React 18, Vite (Static Build), Canvas | Digital revival of the classic German plastic peg mosaic puzzle toy. Place colorful pegs onto perforated boards, solve daily animal/floral puzzles, or create freeform pixel art. |

---

## 🚀 How to Run Locally

You can test the entire arcade locally using any simple static HTTP server:

### Option 1: Python 3 (No installation needed)
```bash
cd web-arcade
python3 -m http.server 8080
```
Then open [http://localhost:8080](http://localhost:8080) in your browser.

### Option 2: Node.js (npx serve)
```bash
cd web-arcade
npx serve .
```

---

## 🌐 Deploying to GitHub Pages

1. **Create a new repository** on GitHub (e.g., `web-arcade`).
2. **Push this code**:
   ```bash
   cd web-arcade
   git init
   git add .
   git commit -m "feat: unified retro web arcade with frontdoor portal"
   git remote add origin https://github.com/<your-username>/web-arcade.git
   git branch -M main
   git push -u origin main
   ```
3. **Enable GitHub Pages**:
   - Go to your repository on GitHub.
   - Navigate to **Settings** &rarr; **Pages**.
   - Under **Build and deployment**:
     - **Source**: `Deploy from a branch`
     - **Branch**: `main`, Folder: `/(root)`
   - Click **Save**.
4. Your arcade is immediately live at:
   `https://<your-username>.github.io/web-arcade/`

---

## ➕ Adding New Games in 3 Steps

1. **Add your game folder**:
   Copy your self-contained web game folder into `games/<your-game-name>/` (ensure all asset references like scripts and images use relative paths `./`).
2. **Add a cover image**:
   Save a 16:9 banner or screenshot in `assets/covers/<your-game-name>.jpg`.
3. **Register in `js/portal.js`**:
   Add an entry into the `GAMES_DATA` array in `js/portal.js`:
   ```javascript
   {
     id: "my-game",
     title: "My Game Title",
     category: "arcade", // arcade | platformer | puzzle
     categoryLabel: "Arcade / Retro",
     era: "1990 Classic",
     engine: "HTML5 Canvas",
     cover: "./assets/covers/my-game.jpg",
     path: "./games/my-game/index.html",
     tagline: "Short 1-2 sentence description...",
     specs: ["Feature 1", "Feature 2", "Feature 3"],
     controlsSnippet: "Controls summary...",
     controls: [
       { key: "Arrows", desc: "Move" },
       { key: "Space", desc: "Action" }
     ],
     lore: "Historical background and tips..."
   }
   ```
4. In your new game's `index.html`, add the "◀ Arcade Hub" link:
   ```html
   <a href="../../index.html" target="_top" style="position:fixed;top:10px;left:10px;z-index:99999;background:rgba(10,14,35,0.9);color:#00f0ff;border:1px solid rgba(0,240,255,0.6);border-radius:20px;padding:6px 14px;font-size:12px;font-family:sans-serif;font-weight:700;text-decoration:none;" onclick="if(window.top!==window.self){window.top.postMessage('close-modal','*');return false;}">
     ◀ ARCADE HUB
   </a>
   ```

---

## 📜 License
MIT License. All retro remakes are fan tributes created for educational and archival preservation purposes.
