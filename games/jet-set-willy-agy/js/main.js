// Jet Set Willy - Main Application Entry Point & Game Loop

window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;

    const game = new Game(canvas);

    // Populate Room Selector dropdown with all 60 rooms
    const roomSelect = document.getElementById('roomSelect');
    if (roomSelect && JSW_DATA.rooms) {
        roomSelect.innerHTML = '';
        JSW_DATA.rooms.forEach((room, idx) => {
            const opt = document.createElement('option');
            opt.value = idx;
            opt.textContent = `${idx < 10 ? '0' : ''}${idx}: ${room.title}`;
            if (idx === ROOM_THEBATHROOM) opt.selected = true;
            roomSelect.appendChild(opt);
        });

        roomSelect.addEventListener('change', (e) => {
            const roomId = parseInt(e.target.value, 10);
            game.warpToRoom(roomId);
            canvas.focus();
        });
    }

    // Audio unlock on user interaction
    const unlockAudio = () => {
        audio.init();
        audio.resume();
        window.removeEventListener('keydown', unlockAudio);
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
    };
    window.addEventListener('keydown', unlockAudio);
    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);

    // UI Buttons and Event Listeners
    const btnSound = document.getElementById('btnSound');
    if (btnSound) {
        btnSound.addEventListener('click', () => {
            const on = audio.toggleSound();
            btnSound.textContent = on ? '🔊 Sound: ON' : '🔇 Sound: OFF';
            btnSound.classList.toggle('off', !on);
        });
    }

    const btnMusic = document.getElementById('btnMusic');
    if (btnMusic) {
        btnMusic.addEventListener('click', () => {
            const on = audio.toggleMusic();
            btnMusic.textContent = on ? '🎵 Music: ON' : '🔇 Music: OFF';
            btnMusic.classList.toggle('off', !on);
        });
    }

    const volumeSlider = document.getElementById('volumeSlider');
    if (volumeSlider) {
        volumeSlider.value = audio.volume;
        volumeSlider.addEventListener('input', (e) => {
            audio.setVolume(parseFloat(e.target.value));
        });
    }

    const speedSelect = document.getElementById('speedSelect');
    if (speedSelect) {
        speedSelect.addEventListener('change', (e) => {
            game.speedMode = parseInt(e.target.value, 10);
            msPerTick = 1000 / game.speedMode;
        });
    }

    const crtToggle = document.getElementById('crtToggle');
    const screenFrame = document.getElementById('screenFrame');
    if (crtToggle && screenFrame) {
        crtToggle.addEventListener('change', (e) => {
            screenFrame.classList.toggle('crt-effect', e.target.checked);
        });
    }

    const btnFullscreen = document.getElementById('btnFullscreen');
    if (btnFullscreen) {
        btnFullscreen.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                const container = document.getElementById('gameContainer') || canvas;
                container.requestFullscreen?.().catch(() => {});
            } else {
                document.exitFullscreen?.().catch(() => {});
            }
        });
    }

    const btnSave = document.getElementById('btnSave');
    if (btnSave) {
        btnSave.addEventListener('click', () => {
            const ok = game.saveGame();
            showNotification(ok ? 'Game Saved!' : 'Save Failed');
        });
    }

    const btnLoad = document.getElementById('btnLoad');
    if (btnLoad) {
        btnLoad.addEventListener('click', () => {
            const ok = game.loadGame();
            showNotification(ok ? 'Game Loaded!' : 'No Save Found');
            if (ok && roomSelect) {
                roomSelect.value = game.currentRoomId;
            }
        });
    }

    const btnCheatLives = document.getElementById('btnCheatLives');
    if (btnCheatLives) {
        btnCheatLives.addEventListener('click', () => {
            game.infiniteLives = !game.infiniteLives;
            btnCheatLives.textContent = game.infiniteLives ? '♾️ Lives: INF' : '❤️ Lives: 7';
            btnCheatLives.classList.toggle('active', game.infiniteLives);
            showNotification(game.infiniteLives ? 'Infinite Lives Enabled' : 'Normal Lives Restored');
        });
    }

    const btnCollectAll = document.getElementById('btnCollectAll');
    if (btnCollectAll) {
        btnCollectAll.addEventListener('click', () => {
            game.itemsRemaining = 0;
            game.gameMode = GM_MARIA;
            showNotification('All Items Collected! Maria steps aside!');
        });
    }

    const btnHelp = document.getElementById('btnHelp');
    const helpModal = document.getElementById('helpModal');
    const closeHelp = document.getElementById('closeHelp');
    if (btnHelp && helpModal) {
        btnHelp.addEventListener('click', () => {
            helpModal.style.display = 'flex';
        });
    }
    if (closeHelp && helpModal) {
        closeHelp.addEventListener('click', () => {
            helpModal.style.display = 'none';
        });
    }
    if (helpModal) {
        helpModal.addEventListener('click', (e) => {
            if (e.target === helpModal) helpModal.style.display = 'none';
        });
    }

    function showNotification(msg) {
        const toast = document.getElementById('toastNotification');
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
    }

    // Start title screen
    game.startTitle();

    // Fixed-timestep 50Hz Game Loop (PAL ZX Spectrum timing)
    let lastTime = performance.now();
    let accumulator = 0;
    let msPerTick = 1000 / 50; // 20ms per tick

    function gameLoop(now) {
        const delta = Math.min(100, now - lastTime);
        lastTime = now;
        accumulator += delta;

        while (accumulator >= msPerTick) {
            game.tick();
            accumulator -= msPerTick;
        }

        game.draw();

        // Sync room select dropdown if room changed
        if (roomSelect && parseInt(roomSelect.value, 10) !== game.currentRoomId && game.state === STATE_PLAYING) {
            roomSelect.value = game.currentRoomId;
        }

        requestAnimationFrame(gameLoop);
    }

    requestAnimationFrame(gameLoop);
});
