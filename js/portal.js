/**
 * RETRO WEB ARCADE - Portal Application Logic
 * Zero-dependency, 100% static client-side portal for unified game selection
 */

const GAMES_DATA = [
  {
    id: "strikers-1945",
    title: "Strikers 1945: Air Combat",
    category: "shooter",
    categoryLabel: "Shooter / Arcade Shmup",
    era: "1945 / 1995 Psikyo",
    engine: "HTML5 Canvas • 2.5D Parallax • Web Audio Synthesizer",
    cover: "./assets/covers/strikers-1945.jpg",
    path: "./games/strikers-1945/index.html",
    tagline: "The supreme WWII arcade shoot 'em up. Choose P-38 Lightning, Spitfire, or Zero, unleash bomb barrages, and battle the Yamato super-battleship!",
    specs: ["3 Authentic WWII Fighters", "Parallax Altitude & 3D Skew", "Screen-Clearing Bombs & Loops", "Yamato Super-Battleship Boss"],
    controlsSnippet: "Mouse/Touch Drag or Arrows/WASD • Space (Shoot) • B (Bomb) • C (Loop)",
    controls: [
      { key: "Mouse Drag / Touch Drag", desc: "Smooth high-speed one-finger flight maneuvering with auto-fire" },
      { key: "Arrow Keys / WASD", desc: "8-way directional flight control with 3D banking skew" },
      { key: "Space / J", desc: "Fire high-velocity machine guns & wing cannons" },
      { key: "B / K", desc: "Screen-clearing Bomb Barrage (destroys enemy bullets & damages all targets)" },
      { key: "C / L", desc: "Tactical Evasion Loop (3D vertical loop with temporary invulnerability)" },
      { key: "Virtual Touch Pad", desc: "On-screen fire, bomb, and loop buttons for mobile devices" }
    ],
    lore: "Inspired by Psikyo's legendary 1995 arcade vertical shoot 'em up and Capcom's 194X series, Strikers 1945 drops players into an alternate WWII conflict. Pilot iconic fighters—the twin-boom P-38 Lightning, agile British Spitfire, or nimble Mitsubishi Zero—over deep multi-layer oceans and tropical atolls, surviving intense bullet curtains to defeat the colossal transformed Yamato battleship."
  },
  {
    id: "nba-jam",
    title: "NBA Jam: T.E. (1994)",
    category: "sports",
    categoryLabel: "Sports / Arcade",
    era: "1994 Midway",
    engine: "HTML5 Canvas • Voice Announcer • 2v2 AI",
    cover: "./assets/covers/nba-jam.jpg",
    path: "./games/nba-jam/index.html",
    tagline: "The legendary 2-on-2 arcade basketball sensation. High-flying somersault dunks, shove defense, and 'HE'S ON FIRE!'",
    specs: ["2-on-2 Arcade Basketball", "Flaming Ball Physics", "Tim Kitzrow Commentary", "1994 Classic Rosters"],
    controlsSnippet: "Arrows • Space (Shoot/Dunk) • Z (Pass/Shove) • Shift (Turbo)",
    controls: [
      { key: "Arrow Keys / WASD", desc: "Run, dribble, and steer player across the hardwood court" },
      { key: "Space / X / J", desc: "Shoot / Monster Slam Dunk (near hoop holding Turbo) / Jump Block" },
      { key: "Z / K", desc: "Pass to teammate / On defense: Two-handed shove to knock opponent down" },
      { key: "Shift / L / E", desc: "Turbo speed sprint & high-altitude flips" },
      { key: "Virtual Pad", desc: "Virtual joystick and action buttons for smartphones and tablets" }
    ],
    lore: "Released by Midway in 1994, NBA Jam: Tournament Edition took the world by storm with exaggerated physics, shattered backboards, over-the-top commentary from Tim Kitzrow, and the immortal 'HE'S ON FIRE!' mechanic."
  },
  {
    id: "nhl-94",
    title: "EA Sports NHL '94",
    category: "sports",
    categoryLabel: "Sports / 16-Bit Hockey",
    era: "1994 EA Sports",
    engine: "HTML5 Canvas • Stadium Organ • Ice Inertia",
    cover: "./assets/covers/nhl-94.jpg",
    path: "./games/nhl-94/index.html",
    tagline: "The gold standard of 16-bit retro sports gaming. Devastating one-timers, stadium organ tunes, and bone-crushing body checks!",
    specs: ["One-Timer Shot System", "Glide Inertia & Ice Spray", "Stadium Organ 'Charge!'", "Classic 1994 Rosters"],
    controlsSnippet: "Arrows • Space (Slap Shot) • Z (Pass/Check)",
    controls: [
      { key: "Arrow Keys / WASD", desc: "Skate and steer with authentic ice friction and glide inertia" },
      { key: "Space / X / J", desc: "Wrist Shot (tap) or heavy Slap Shot (hold to charge power)" },
      { key: "Z / K", desc: "Pass puck / On defense: Deliver a heavy body check into the boards" },
      { key: "One-Timer", desc: "Pass to a teammate and tap shoot before the puck arrives to blast a one-timer" },
      { key: "Virtual Pad", desc: "Virtual on-screen touch controls for mobile devices" }
    ],
    lore: "EA Sports NHL '94 is celebrated as one of the greatest video games ever made. Introducing direct one-timer shots, authentic organ music, manual goalie control, and legendary 1994 playoff intensity."
  },
  {
    id: "qix",
    title: "NEO-QIX 2088",
    category: "arcade",
    categoryLabel: "Arcade / Action",
    era: "1981 / 2026 Remake",
    engine: "HTML5 Canvas • Delta-Time Physics",
    cover: "./assets/covers/qix.jpg",
    path: "./games/qix/index.html",
    tagline: "Modernized synthwave territory-claiming arcade classic. Trap the erratic plasma Qix, dodge patrolling Sparx, and uncover vibrant retro backgrounds.",
    specs: ["Slow/Fast Line Slices", "Cyberpunk CRT Effects", "Synthwave Soundtrack", "Dynamic Territory Reveal"],
    controlsSnippet: "Arrows / WASD • Shift (Fast) • Space (Slow)",
    controls: [
      { key: "Arrow Keys / WASD", desc: "Navigate border and draw territory capture lines" },
      { key: "Space (Hold)", desc: "Slow Draw: Riskier, but awards DOUBLE SCORE points" },
      { key: "Shift (Hold)", desc: "Fast Draw: Faster cutting speed at base score value" },
      { key: "P / Esc", desc: "Pause and resume game" },
      { key: "M", desc: "Toggle audio and sound effects" },
      { key: "Touch D-Pad", desc: "Virtual on-screen touch buttons for smartphones and tablets" }
    ],
    lore: "Originally created in 1981 by Randy and Sandy Pfeiffer for Taito, QIX pioneered the territory-claim arcade genre. NEO-QIX 2088 reimagines the formula with buttery sub-pixel collision physics, a smooth delta-time movement engine, synthwave aesthetic, and progressive round difficulty escalations."
  },
  {
    id: "snoopy",
    title: "Snoopy Tabletop (SM-73)",
    category: "arcade",
    categoryLabel: "Arcade / Game & Watch",
    era: "1983 Nintendo",
    engine: "HTML5 Canvas • Piezo Web Audio",
    cover: "./assets/covers/snoopy.jpg",
    path: "./games/snoopy/index.html",
    tagline: "Authentic recreation of the 1983 Nintendo Tabletop arcade classic. Smash Schroeder's musical notes with Snoopy's hammer before they wake sleeping Woodstock!",
    specs: ["Smooth Lerp Physics", "Glowing Strike Targets", "Game A & Game B Modes", "Lucy 100-Pt Intermission"],
    controlsSnippet: "Left / Right • Space (Smash in Target Circle) • H (Guide)",
    controls: [
      { key: "Left Arrow / A", desc: "Move Snoopy left across the 4 platform posts (smooth glide)" },
      { key: "Right Arrow / D", desc: "Move Snoopy right across the 4 platform posts (smooth glide)" },
      { key: "Space / Up / Enter", desc: "Swing hammer when rising note enters the glowing Strike Target ring" },
      { key: "H or HOW TO PLAY", desc: "Open the comprehensive in-game visual gameplay guide" },
      { key: "1 or Game A Button", desc: "Start Game A (3 note tracks, relaxed speed)" },
      { key: "2 or Game B Button", desc: "Start Game B (4 note tracks, fast pace)" },
      { key: "M", desc: "Toggle vintage piezo sound effects" },
      { key: "Virtual Joystick", desc: "On-screen touch controls for smartphones and tablets" }
    ],
    lore: "Invented by Gunpei Yokoi and released by Nintendo in 1983, the Tabletop series was renowned for its chunky bright orange arcade cabinet, illuminated mirror-reflected color LCD screen, and mini joystick. Snoopy must protect sleeping Woodstock from the cascade of musical notes pouring out of Schroeder's toy piano by timing his hammer swings inside the glowing Strike Targets."
  },
  {
    id: "jet-set-willy-agy",
    title: "Jet Set Willy (Enhanced Edition)",
    category: "platformer",
    categoryLabel: "Platformer / 8-Bit",
    era: "1984 / Enhanced",
    engine: "HTML5 Canvas • CRT Scanlines • Web Audio",
    cover: "./assets/covers/jsw-agy.jpg",
    path: "./games/jet-set-willy-agy/index.html",
    tagline: "Matthew Smith's legendary 60-room surreal mansion adventure. Collect party glasses, dodge bizarre monsters, with authentic physics and Moonlight Sonata.",
    specs: ["All 60 Original Rooms", "Authentic 8-Bit Physics", "Moonlight Sonata Audio", "Room Warp Selector"],
    controlsSnippet: "O/P or Left/Right • Space/Up (Jump)",
    controls: [
      { key: "O or Left Arrow", desc: "Walk Miner Willy Left" },
      { key: "P or Right Arrow", desc: "Walk Miner Willy Right" },
      { key: "Space or Up Arrow", desc: "Jump in current facing direction" },
      { key: "Room Warp Dropdown", desc: "Instant warp to any room in the 60-room mansion" },
      { key: "Touch Controls", desc: "Virtual directional buttons and jump action pad on mobile" }
    ],
    lore: "Published in 1984 by Software Projects for the Sinclair ZX Spectrum, Jet Set Willy followed Miner Willy after striking it rich. After a wild party in his huge 60-room mansion, housekeeper Maria won't let him sleep until he tidies up every discarded item. The game is celebrated for its bizarre hazards (flying pigs, bouncing teapots, monkies) and unforgiving precision jumps."
  },
  {
    id: "jet-set-willy",
    title: "Jet Set Willy (Classic Minimal)",
    category: "platformer",
    categoryLabel: "Platformer / Retro",
    era: "1984 / Classic",
    engine: "Pure Vanilla JS • Pixel-Crisp Canvas",
    cover: "./assets/covers/jsw.jpg",
    path: "./games/jet-set-willy/index.html",
    tagline: "Ultra-pure lightweight recreation of the 1984 platforming classic with zero chrome, direct touch controls, and instant responsiveness.",
    specs: ["Original Spectrum Aspect Ratio", "Zero Build Steps", "Lightweight Canvas Engine", "Mobile Touch Overlay"],
    controlsSnippet: "Arrow Keys • On-screen Touch Controls",
    controls: [
      { key: "Left Arrow", desc: "Move Miner Willy Left" },
      { key: "Right Arrow", desc: "Move Miner Willy Right" },
      { key: "Up Arrow", desc: "Jump" },
      { key: "On-screen Buttons", desc: "Touch left, right, and jump buttons on touchscreen devices" }
    ],
    lore: "A clean, featherweight implementation of the original Jet Set Willy game loop focusing purely on authentic room traversal, collision accuracy, and universal cross-device play without extra overhead."
  },
  {
    id: "ministeck",
    title: "Ministeck Daily Puzzle",
    category: "puzzle",
    categoryLabel: "Puzzle / Creative",
    era: "Retro Toy / Modern PWA",
    engine: "React 18 • Vite • HTML5 Canvas",
    cover: "./assets/covers/ministeck.jpg",
    path: "./games/ministeck/index.html",
    tagline: "Digital revival of the beloved 1960s-80s German plastic peg mosaic puzzle toy. Assemble daily mosaic art or express yourself with freeform pixel peg art.",
    specs: ["Daily Mosaic Challenges", "Full Ministeck Color Palette", "PWA Offline Capable", "Touch & Drag Support"],
    controlsSnippet: "Mouse Drag-and-drop • Color Palette Picker",
    controls: [
      { key: "Mouse Drag & Drop / Click", desc: "Select and place plastic mosaic pegs onto the perforated board" },
      { key: "Color Palette", desc: "Select authentic vintage Ministeck peg colors" },
      { key: "Puzzle Selector", desc: "Switch between daily challenges (hummingbird, puppy, floral, fish)" },
      { key: "Touch Screen", desc: "Full touch support for mobile & tablet screens" }
    ],
    lore: "Invented by Helmut Gottschalk in 1965 in Germany, Ministeck entertained millions with its colorful plastic pegs pressed into perforated pegboards. This modern web adaptation brings the tactile charm of retro peg mosaic crafting to modern screens with zero server requirements."
  }
];

// DOM Element References
const gamesGrid = document.getElementById("games-grid");
const noResults = document.getElementById("no-results");
const searchInput = document.getElementById("game-search-input");
const searchClearBtn = document.getElementById("search-clear-btn");
const filterPills = document.querySelectorAll(".filter-pill");
const totalGamesCount = document.getElementById("total-games-count");
const btnRandomGame = document.getElementById("btn-random-game");
const btnResetFilters = document.getElementById("btn-reset-filters");

// Theater Modal References
const theaterModal = document.getElementById("theater-modal");
const modalGameTitle = document.getElementById("modal-game-title");
const modalGameCategory = document.getElementById("modal-game-category");
const cabinetIframe = document.getElementById("cabinet-iframe");
const cabinetContainer = document.getElementById("cabinet-screen-container");
const modalCloseBtn = document.getElementById("modal-close-btn");
const modalFullscreenBtn = document.getElementById("modal-fullscreen-btn");
const modalLaunchNewTab = document.getElementById("modal-launch-newtab");

// Info Modal References
const infoModal = document.getElementById("info-modal");
const infoModalTitle = document.getElementById("info-modal-title");
const infoModalEra = document.getElementById("info-modal-era");
const infoModalBody = document.getElementById("info-modal-body");
const infoModalClose = document.getElementById("info-modal-close");
const infoModalPlayBtn = document.getElementById("info-modal-play-btn");
const infoModalTabBtn = document.getElementById("info-modal-tab-btn");

let currentFilter = "all";
let currentSearchQuery = "";
let activeModalGame = null;

// Initialize Hub
function initArcadeHub() {
  if (totalGamesCount) {
    totalGamesCount.textContent = GAMES_DATA.length;
  }

  updateCategoryPillCounts();
  renderGames();
  setupEventListeners();
}

function updateCategoryPillCounts() {
  document.querySelectorAll(".filter-pill").forEach(pill => {
    const cat = pill.dataset.category;
    const countSpan = pill.querySelector(".pill-count");
    if (!countSpan) return;
    if (cat === "all") {
      countSpan.textContent = GAMES_DATA.length;
    } else {
      const count = GAMES_DATA.filter(g => g.category === cat).length;
      countSpan.textContent = count;
    }
  });
}

// Render Games Grid
function renderGames() {
  const query = currentSearchQuery.trim().toLowerCase();

  const filteredGames = GAMES_DATA.filter(game => {
    const matchesCategory = (currentFilter === "all") || (game.category === currentFilter);
    if (!matchesCategory) return false;

    if (!query) return true;

    const haystack = [
      game.title,
      game.categoryLabel,
      game.era,
      game.tagline,
      game.controlsSnippet,
      ...(game.specs || [])
    ].join(" ").toLowerCase();

    return haystack.includes(query);
  });

  gamesGrid.innerHTML = "";

  if (filteredGames.length === 0) {
    noResults.classList.remove("hidden");
    return;
  } else {
    noResults.classList.add("hidden");
  }

  filteredGames.forEach(game => {
    const card = document.createElement("article");
    card.className = "game-card";
    card.dataset.id = game.id;

    card.innerHTML = `
      <div class="card-media">
        <img class="card-cover-img" src="${game.cover}" alt="${game.title} Cover Banner" loading="lazy">
        <div class="card-overlay-badges">
          <span class="badge-pill ${game.category}">${game.category}</span>
        </div>
        <div class="card-era-badge">${game.era}</div>
      </div>

      <div class="card-body">
        <div class="card-header-row">
          <h3 class="game-title">${game.title}</h3>
        </div>

        <p class="game-tagline">${game.tagline}</p>

        <div class="card-specs-row">
          ${game.specs.map(s => `<span class="spec-chip">${s}</span>`).join("")}
        </div>

        <div class="card-controls-snippet">
          <strong>CONTROLS:</strong> ${game.controlsSnippet}
        </div>

        <div class="card-actions-row">
          <button class="btn-action primary btn-play-theater" data-id="${game.id}">
            ▶ Play Here
          </button>
          <a class="btn-action secondary" href="${game.path}">
            ↗ Direct
          </a>
          <button class="btn-action secondary icon-only btn-game-info" data-id="${game.id}" title="Controls & Story">
            ℹ
          </button>
        </div>
      </div>
    `;

    gamesGrid.appendChild(card);
  });
}

// Event Listeners Setup
function setupEventListeners() {
  // Category Filter Pills
  filterPills.forEach(pill => {
    pill.addEventListener("click", () => {
      filterPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      currentFilter = pill.dataset.category || "all";
      renderGames();
    });
  });

  // Search Input
  searchInput.addEventListener("input", (e) => {
    currentSearchQuery = e.target.value;
    searchClearBtn.classList.toggle("visible", Boolean(currentSearchQuery));
    renderGames();
  });

  searchClearBtn.addEventListener("click", () => {
    searchInput.value = "";
    currentSearchQuery = "";
    searchClearBtn.classList.remove("visible");
    searchInput.focus();
    renderGames();
  });

  // Reset Filters Button
  if (btnResetFilters) {
    btnResetFilters.addEventListener("click", () => {
      searchInput.value = "";
      currentSearchQuery = "";
      currentFilter = "all";
      searchClearBtn.classList.remove("visible");
      filterPills.forEach(p => p.classList.toggle("active", p.dataset.category === "all"));
      renderGames();
    });
  }

  // Random Game Launch
  if (btnRandomGame) {
    btnRandomGame.addEventListener("click", () => {
      const randomIndex = Math.floor(Math.random() * GAMES_DATA.length);
      openTheaterModal(GAMES_DATA[randomIndex]);
    });
  }

  // Grid Delegation: Play & Info buttons
  gamesGrid.addEventListener("click", (e) => {
    const playBtn = e.target.closest(".btn-play-theater");
    if (playBtn) {
      const gameId = playBtn.dataset.id;
      const game = GAMES_DATA.find(g => g.id === gameId);
      if (game) openTheaterModal(game);
      return;
    }

    const infoBtn = e.target.closest(".btn-game-info");
    if (infoBtn) {
      const gameId = infoBtn.dataset.id;
      const game = GAMES_DATA.find(g => g.id === gameId);
      if (game) openInfoModal(game);
      return;
    }
  });

  // Theater Modal Actions
  modalCloseBtn.addEventListener("click", closeTheaterModal);

  theaterModal.addEventListener("click", (e) => {
    if (e.target === theaterModal) {
      closeTheaterModal();
    }
  });

  modalFullscreenBtn.addEventListener("click", () => {
    const cabinet = document.querySelector(".modal-cabinet");
    if (!document.fullscreenElement) {
      if (cabinet.requestFullscreen) cabinet.requestFullscreen();
      else if (cabinet.webkitRequestFullscreen) cabinet.webkitRequestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  });

  modalLaunchNewTab.addEventListener("click", () => {
    if (activeModalGame) {
      window.open(activeModalGame.path, "_blank");
    }
  });

  // Info Modal Actions
  infoModalClose.addEventListener("click", closeInfoModal);
  infoModal.addEventListener("click", (e) => {
    if (e.target === infoModal) closeInfoModal();
  });

  infoModalPlayBtn.addEventListener("click", () => {
    if (activeModalGame) {
      closeInfoModal();
      openTheaterModal(activeModalGame);
    }
  });

  infoModalTabBtn.addEventListener("click", () => {
    if (activeModalGame) {
      window.open(activeModalGame.path, "_blank");
    }
  });

  // Keyboard Escape Handler
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (!theaterModal.classList.contains("hidden")) {
        closeTheaterModal();
      } else if (!infoModal.classList.contains("hidden")) {
        closeInfoModal();
      }
    }
  });

  // PostMessage listener from embedded games
  window.addEventListener("message", (event) => {
    if (event.data === "close-modal" || event.data === "back-to-hub") {
      closeTheaterModal();
    }
  });
}

// Open Theater Modal (Embedded Play)
function openTheaterModal(game) {
  activeModalGame = game;
  modalGameTitle.textContent = game.title;
  modalGameCategory.textContent = game.categoryLabel;

  cabinetIframe.src = game.path;
  theaterModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";

  // Focus iframe for immediate keyboard interaction
  setTimeout(() => {
    try {
      cabinetIframe.focus();
    } catch (_) {}
  }, 250);
}

// Close Theater Modal
function closeTheaterModal() {
  theaterModal.classList.add("hidden");
  cabinetIframe.src = "about:blank";
  document.body.style.overflow = "";

  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  }
}

// Open Info & Controls Modal
function openInfoModal(game) {
  activeModalGame = game;
  infoModalTitle.textContent = game.title;
  infoModalEra.textContent = game.era;

  let controlsHtml = `
    <table class="info-table">
      <tbody>
        ${game.controls.map(c => `
          <tr>
            <td class="key-col">${c.key}</td>
            <td>${c.desc}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;

  infoModalBody.innerHTML = `
    <div class="info-section">
      <h4>🕹️ Controls & Mappings</h4>
      ${controlsHtml}
    </div>

    <div class="info-section">
      <h4>📜 History & Gameplay</h4>
      <p>${game.lore}</p>
    </div>

    <div class="info-section">
      <h4>⚙️ Tech Architecture</h4>
      <p><strong>Engine:</strong> ${game.engine}</p>
      <p><strong>Key Highlights:</strong> ${game.specs.join(" • ")}</p>
    </div>
  `;

  infoModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

// Close Info Modal
function closeInfoModal() {
  infoModal.classList.add("hidden");
  document.body.style.overflow = "";
}

// Bootstrap
document.addEventListener("DOMContentLoaded", initArcadeHub);
