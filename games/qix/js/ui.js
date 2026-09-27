/**
 * NEO-QIX UI & HUD Manager
 * Handles responsive layout, animated score odometers, touch input handling,
 * modal dialogs, audio controls, and high-score leaderboards.
 */

export class UIManager {
  constructor(game) {
    this.game = game;

    // DOM Elements
    this.scoreValEl = document.getElementById('score-val');
    this.highScoreValEl = document.getElementById('high-score-val');
    this.levelValEl = document.getElementById('level-val');
    this.percentValEl = document.getElementById('percent-val');
    this.targetPercentValEl = document.getElementById('target-percent-val');
    this.progressBarFillEl = document.getElementById('progress-bar-fill');
    this.livesContainerEl = document.getElementById('lives-container');
    this.fuseWarningEl = document.getElementById('fuse-warning');
    this.buffContainerEl = document.getElementById('buff-container');

    // Modals / Overlays
    this.startScreenEl = document.getElementById('start-screen');
    this.gameOverScreenEl = document.getElementById('game-over-screen');
    this.levelClearScreenEl = document.getElementById('level-clear-screen');
    this.pauseScreenEl = document.getElementById('pause-screen');
    this.howToPlayModalEl = document.getElementById('how-to-play-modal');
    this.highScoresModalEl = document.getElementById('high-scores-modal');

    // Touch controls
    this.touchControlsEl = document.getElementById('touch-controls');

    this.displayedScore = 0;
    this.bindEvents();
  }

  bindEvents() {
    // Start button
    const btnStart = document.getElementById('btn-start');
    if (btnStart) {
      btnStart.addEventListener('click', () => {
        this.game.startNewGame();
      });
    }

    // Restart button
    const btnRestart = document.getElementById('btn-restart');
    if (btnRestart) {
      btnRestart.addEventListener('click', () => {
        this.game.startNewGame();
      });
    }

    // Resume button
    const btnResume = document.getElementById('btn-resume');
    if (btnResume) {
      btnResume.addEventListener('click', () => {
        this.game.togglePause();
      });
    }

    // How to Play buttons
    const btnHow = document.getElementById('btn-how-to-play');
    if (btnHow) {
      btnHow.addEventListener('click', () => {
        this.howToPlayModalEl.classList.remove('hidden');
      });
    }

    const btnCloseHow = document.getElementById('btn-close-how');
    if (btnCloseHow) {
      btnCloseHow.addEventListener('click', () => {
        this.howToPlayModalEl.classList.add('hidden');
      });
    }

    // High Scores buttons
    const btnScores = document.getElementById('btn-scores');
    if (btnScores) {
      btnScores.addEventListener('click', () => {
        this.renderHighScoresList();
        this.highScoresModalEl.classList.remove('hidden');
      });
    }

    const btnCloseScores = document.getElementById('btn-close-scores');
    if (btnCloseScores) {
      btnCloseScores.addEventListener('click', () => {
        this.highScoresModalEl.classList.add('hidden');
      });
    }

    // Fullscreen toggle
    const btnFullscreen = document.getElementById('btn-fullscreen');
    if (btnFullscreen) {
      btnFullscreen.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      });
    }

    // Audio toggles
    const btnAudio = document.getElementById('btn-audio');
    if (btnAudio) {
      btnAudio.addEventListener('click', () => {
        const muted = this.game.audio.toggleMute();
        btnAudio.textContent = muted ? '🔇 SOUND: OFF' : '🔊 SOUND: ON';
        btnAudio.classList.toggle('muted', muted);
      });
    }

    // Mode Selector (Arcade, Hardcore, Zen)
    const modeSelect = document.getElementById('mode-select');
    if (modeSelect) {
      modeSelect.addEventListener('change', (e) => {
        this.game.setGameMode(e.target.value);
      });
    }

    // CRT Scanline Filter Toggle
    const crtToggle = document.getElementById('crt-toggle');
    if (crtToggle) {
      crtToggle.addEventListener('change', (e) => {
        document.body.classList.toggle('crt-active', e.target.checked);
      });
    }

    // Setup Touch / Mobile Controls
    this.setupTouchControls();
  }

  setupTouchControls() {
    // Detect touch device or always allow on screen
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouch) {
      this.touchControlsEl.classList.remove('hidden');
    }

    const bindTouchButton = (elemId, keyProp) => {
      const el = document.getElementById(elemId);
      if (!el) return;

      const press = (e) => {
        e.preventDefault();
        this.game.inputs[keyProp] = true;
        el.classList.add('active');
        this.game.audio.init();
      };
      const release = (e) => {
        e.preventDefault();
        this.game.inputs[keyProp] = false;
        el.classList.remove('active');
      };

      el.addEventListener('touchstart', press, { passive: false });
      el.addEventListener('touchend', release, { passive: false });
      el.addEventListener('touchcancel', release, { passive: false });
      el.addEventListener('mousedown', press);
      el.addEventListener('mouseup', release);
      el.addEventListener('mouseleave', release);
    };

    bindTouchButton('touch-up', 'up');
    bindTouchButton('touch-down', 'down');
    bindTouchButton('touch-left', 'left');
    bindTouchButton('touch-right', 'right');
    bindTouchButton('touch-slow', 'drawSlow');
    bindTouchButton('touch-fast', 'drawFast');
  }

  updateHUD(score, highScore, level, percent, targetPercent, lives, fuseLit, buffs) {
    // Smooth score odometer lerp
    if (this.displayedScore < score) {
      const diff = score - this.displayedScore;
      this.displayedScore += Math.max(1, Math.ceil(diff * 0.15));
    } else {
      this.displayedScore = score;
    }

    if (this.scoreValEl) this.scoreValEl.textContent = this.displayedScore.toLocaleString();
    if (this.highScoreValEl) this.highScoreValEl.textContent = highScore.toLocaleString();
    if (this.levelValEl) this.levelValEl.textContent = level;

    // Territory percentage
    const roundedPercent = percent.toFixed(1);
    if (this.percentValEl) this.percentValEl.textContent = `${roundedPercent}%`;
    if (this.targetPercentValEl) this.targetPercentValEl.textContent = `${targetPercent}%`;

    if (this.progressBarFillEl) {
      const fillRatio = Math.min(100, (percent / targetPercent) * 100);
      this.progressBarFillEl.style.width = `${fillRatio}%`;

      if (fillRatio >= 90) {
        this.progressBarFillEl.style.background = 'linear-gradient(90deg, #ff007f, #ffff00)';
      } else if (fillRatio >= 70) {
        this.progressBarFillEl.style.background = 'linear-gradient(90deg, #00f0ff, #00ff88)';
      } else {
        this.progressBarFillEl.style.background = 'linear-gradient(90deg, #0088ff, #00f0ff)';
      }
    }

    // Lives display
    if (this.livesContainerEl) {
      let html = '';
      for (let i = 0; i < lives; i++) {
        html += '<span class="life-marker">◆</span>';
      }
      this.livesContainerEl.innerHTML = html;
    }

    // Fuse warning
    if (this.fuseWarningEl) {
      this.fuseWarningEl.classList.toggle('active', fuseLit);
    }

    // Buffs display
    if (this.buffContainerEl) {
      let bHtml = '';
      if (buffs.hasShield) bHtml += '<span class="buff-badge shield">🛡️ SHIELD</span>';
      if (buffs.speedBuffTimer > 0) bHtml += '<span class="buff-badge speed">🚀 HYPER</span>';
      if (buffs.multiplierActive) bHtml += '<span class="buff-badge mult">💎 3X</span>';
      this.buffContainerEl.innerHTML = bHtml;
    }
  }

  showStartScreen() {
    this.startScreenEl.classList.remove('hidden');
    this.gameOverScreenEl.classList.add('hidden');
    this.levelClearScreenEl.classList.add('hidden');
    this.pauseScreenEl.classList.add('hidden');
  }

  hideStartScreen() {
    this.startScreenEl.classList.add('hidden');
  }

  showGameOver(finalScore, territory, highCut, isNewHigh) {
    document.getElementById('final-score-val').textContent = finalScore.toLocaleString();
    document.getElementById('final-territory-val').textContent = `${territory.toFixed(1)}%`;
    document.getElementById('final-cut-val').textContent = `${highCut.toFixed(1)}%`;

    const newHighBanner = document.getElementById('new-high-score-banner');
    if (newHighBanner) {
      newHighBanner.classList.toggle('hidden', !isNewHigh);
    }

    this.gameOverScreenEl.classList.remove('hidden');
  }

  hideGameOver() {
    this.gameOverScreenEl.classList.add('hidden');
  }

  showLevelClear(level, score, bonus, totalPercent) {
    document.getElementById('clear-level-num').textContent = level;
    document.getElementById('clear-bonus-val').textContent = `+${bonus.toLocaleString()}`;
    document.getElementById('clear-total-percent').textContent = `${totalPercent.toFixed(1)}%`;

    this.levelClearScreenEl.classList.remove('hidden');
    setTimeout(() => {
      this.levelClearScreenEl.classList.add('hidden');
    }, 2400);
  }

  showPause(isPaused) {
    this.pauseScreenEl.classList.toggle('hidden', !isPaused);
  }

  renderHighScoresList() {
    const listEl = document.getElementById('high-scores-list');
    if (!listEl) return;

    const scores = this.game.getHighScores();
    if (scores.length === 0) {
      listEl.innerHTML = '<li class="no-scores">NO HIGH SCORES YET</li>';
      return;
    }

    listEl.innerHTML = scores
      .map(
        (s, idx) => `
        <li class="score-row ${idx === 0 ? 'first-place' : ''}">
          <span class="rank">#${idx + 1}</span>
          <span class="name">${s.name || 'CYBER-PILOT'}</span>
          <span class="points">${s.score.toLocaleString()} PTS</span>
          <span class="round">R${s.round || 1}</span>
        </li>`
      )
      .join('');
  }
}
