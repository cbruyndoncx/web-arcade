// Jet Set Willy - Main Game State Machine and Room Controller

class Game {
    constructor(canvas) {
        this.renderer = new Renderer(canvas);
        this.willy = new Willy();
        this.robots = new RobotManager();
        this.rope = new Rope();

        this.state = STATE_TITLE;
        this.gameMode = GM_NORMAL;

        this.currentRoomId = ROOM_THEBATHROOM;
        this.currentRoom = null;

        // Tile runtime data (copy of 512 tiles for current room)
        this.roomTiles = new Int32Array(512);

        // Score, lives, clock
        this.totalItems = 82;
        this.itemsRemaining = 82;
        this.itemsCollected = 0;
        this.lives = 7;

        this.clockTicks = 0;
        this.clockMinutes = 0;
        this.clockHours = 7;
        this.clockAmPm = 0; // 0 = AM, 1 = PM

        // Title Screen animation state
        this.titleTickerText = "      Press ENTER or SPACE to Start                JET-SET WILLY by Matthew Smith   1984 SOFTWARE PROJECTS Ltd                Guide Willy to collect all the items around the house before Midnight so Maria will let you get to your bed                Press ENTER to Start      ";
        this.titleTickerPos = 0;
        this.titleTickerFrame = 0;
        this.titleColourCycle = 1;
        this.titleTextJsw = "\x01\x02\x02\x0b\x14";

        // Game Over animation state
        this.bootTicks = 0;

        // Dying animation state
        this.dieTicks = 0;

        // Pause state
        this.paused = false;
        this.pauseTicks = 0;

        // Cheats and Settings
        this.cheatEnabled = false;
        this.infiniteLives = false;
        this.speedMode = 50; // 50 FPS default ZX Spectrum speed

        // Conveyor animation state
        this.conveyAnim = 0;

        // Initialize rooms copy
        this.roomsData = JSON.parse(JSON.stringify(JSW_DATA.rooms));

        // Count total items
        this.countItems();
    }

    countItems() {
        let count = 0;
        for (const room of this.roomsData) {
            count += room.itemCount;
        }
        this.totalItems = count;
        this.itemsRemaining = count;
    }

    resetAllItems() {
        this.roomsData = JSON.parse(JSON.stringify(JSW_DATA.rooms));
        for (const room of this.roomsData) {
            for (const itemIdx of room.items) {
                room.data[itemIdx] = 1; // T_ITEM
            }
        }
        this.countItems();
        this.itemsCollected = 0;
    }

    startTitle() {
        this.state = STATE_TITLE;
        this.titleTickerPos = 0;
        this.titleTickerFrame = 0;
        this.titleColourCycle = 1;

        audio.playMusic(MUS_TITLE, true);
        this.renderer.borderColour = 0;
    }

    startGame(startRoom = ROOM_THEBATHROOM) {
        this.resetAllItems();

        this.lives = 7;
        this.clockTicks = 0;
        this.clockMinutes = 0;
        this.clockHours = 7;
        this.clockAmPm = 0;

        this.gameMode = GM_NORMAL;
        this.paused = false;

        this.currentRoomId = startRoom;
        this.willy.init(20 * 8, 13 * 8);

        this.loadRoom(this.currentRoomId);
        this.state = STATE_PLAYING;

        audio.playMusic(MUS_GAME, true);
    }

    loadRoom(roomId) {
        this.currentRoomId = roomId;
        this.currentRoom = this.roomsData[roomId];

        // Copy room tile data
        for (let i = 0; i < 512; i++) {
            this.roomTiles[i] = this.currentRoom.data[i];
        }

        // Initialize robots
        this.robots.initRoom(roomId, this.gameMode);

        // Initialize rope
        this.rope.init(roomId);

        // Willy room setup
        this.willy.attrSplit = (roomId === ROOM_SWIMMINGPOOL) ? 5 : 6;
        this.willy.save();

        // Set border color
        this.renderer.borderColour = JSW_DATA.levelBorders[roomId] || 0;
        this.updateBorderDOM();
    }

    updateBorderDOM() {
        const borderElement = document.getElementById('screenBorder');
        if (borderElement) {
            const [r, g, b] = PALETTE[this.renderer.borderColour & 15];
            borderElement.style.borderColor = `rgb(${r}, ${g}, ${b})`;
        }
    }

    getTileType(tileIndex) {
        if (tileIndex < 0 || tileIndex >= 512) return T_SPACE;
        const tileVal = this.roomTiles[tileIndex];
        const info = this.currentRoom.info[tileVal];
        if (!info) return T_SPACE;

        const type = info.type;
        if (type === T_RAMPLC) return T_CONVEYR;
        if (type === T_RAMPRC) return T_CONVEYL;
        if (type !== T_SOLIDFLOOR) return type;

        if (this.willy.air === 1 && this.willy.jump === 0) {
            return T_SOLID;
        }
        return T_FLOOR;
    }

    getTileRamp(tileIndex) {
        if (tileIndex < 0 || tileIndex >= 512) return T_SPACE;
        const tileVal = this.roomTiles[tileIndex];
        const info = this.currentRoom.info[tileVal];
        if (!info) return T_SPACE;

        if (info.type === T_RAMPLC) return T_RAMPL;
        if (info.type === T_RAMPRC) return T_RAMPR;
        return info.type;
    }

    eraseItem(tileIndex) {
        this.roomTiles[tileIndex] = 0; // Empty space
        this.currentRoom.data[tileIndex] = 0;
    }

    gotItem() {
        this.itemsCollected++;
        this.itemsRemaining = Math.max(0, this.itemsRemaining - 1);
        audio.playSfx(SFX_ITEM, this.willy.x);

        if (this.itemsRemaining === 0) {
            this.gameMode = GM_MARIA;
            // Maria steps aside
            if (this.currentRoomId === ROOM_MASTERBEDROOM) {
                this.robots.initRoom(ROOM_MASTERBEDROOM, GM_MARIA);
            }
        }
    }

    getRoomExit(dir) {
        if (!this.currentRoom || !this.currentRoom.map) return 0;
        return this.currentRoom.map[dir] || 0;
    }

    changeLevel(dir) {
        const nextRoomId = this.getRoomExit(dir);

        // Special ramp jump checks from original game:
        // Jumping up from ramp in Under the Drive (45) into The Drive (4)
        if (dir === R_ABOVE) {
            if ((nextRoomId === ROOM_THEDRIVE && this.willy.x > 22 && this.willy.x < 32) ||
                (nextRoomId === ROOM_FIRSTLANDING && this.willy.x > 182)) {
                this.willy.air = 2;
                return;
            }
        }

        switch (dir) {
            case R_ABOVE:
                this.willy.y = 13 * 8;
                this.willy.x = (this.willy.tile & 31) * 8;
                this.willy.tile = 13 * 32 + (this.willy.tile & 31);
                this.willy.align = 4;
                this.willy.air = 0;
                break;

            case R_RIGHT:
                this.willy.x = 0;
                this.willy.tile &= ~31;
                break;

            case R_BELOW:
                if (this.willy.air < 11) {
                    this.willy.air = 2;
                }
                this.willy.y = 0;
                this.willy.tile &= 31;
                break;

            case R_LEFT:
                this.willy.x = 30 * 8;
                this.willy.tile |= 30;
                break;
        }

        this.loadRoom(nextRoomId);
    }

    die() {
        if (this.state === STATE_DYING || this.state === STATE_GAMEOVER) return;

        if (!this.infiniteLives) {
            this.lives--;
        }

        this.state = STATE_DYING;
        this.dieTicks = 15;

        audio.playSfx(SFX_DIE, this.willy.x);
        this.renderer.borderColour = 0;
        this.updateBorderDOM();
    }

    findSafeSpawn(roomId) {
        if (roomId === ROOM_THEBATHROOM) return { x: 20 * 8, y: 13 * 8 };
        const room = this.roomsData[roomId];
        if (!room) return { x: 20 * 8, y: 13 * 8 };

        for (let r = 13; r >= 1; r--) {
            for (let c = 1; c < 30; c++) {
                const t0 = r * 32 + c;
                const t1 = t0 + 1;
                const t2 = (r + 1) * 32 + c;
                const t3 = t2 + 1;
                const f0 = (r + 2) * 32 + c;
                const f1 = f0 + 1;

                const type_t0 = room.info[room.data[t0]]?.type;
                const type_t1 = room.info[room.data[t1]]?.type;
                const type_t2 = room.info[room.data[t2]]?.type;
                const type_t3 = room.info[room.data[t3]]?.type;
                const type_f0 = room.info[room.data[f0]]?.type;
                const type_f1 = room.info[room.data[f1]]?.type;

                if ((type_t0 <= 1) && (type_t1 <= 1) && (type_t2 <= 1) && (type_t3 <= 1)) {
                    if (type_f0 >= 2 && type_f0 <= 10 && type_f1 >= 2 && type_f1 <= 10) {
                        return { x: c * 8, y: r * 8 };
                    }
                }
            }
        }
        return { x: 2 * 8, y: 10 * 8 };
    }

    warpToRoom(roomId) {
        if (roomId >= 0 && roomId < 60) {
            this.currentRoomId = roomId;
            const spawn = this.findSafeSpawn(roomId);
            this.willy.init(spawn.x, spawn.y);
            this.loadRoom(roomId);
            if (this.state !== STATE_PLAYING) {
                this.state = STATE_PLAYING;
                audio.playMusic(MUS_GAME, true);
            }
        }
    }

    tickClock() {
        // 256 frames = 1 game minute
        this.clockTicks++;
        if (this.clockTicks >= 256) {
            this.clockTicks = 0;
            this.clockMinutes++;
            if (this.clockMinutes === 60) {
                this.clockMinutes = 0;
                this.clockHours++;
                if (this.clockHours === 12) {
                    this.clockAmPm = 1 - this.clockAmPm;
                    // Reached Midnight before finishing
                    if (this.clockAmPm === 0 && this.gameMode < GM_MARIA) {
                        this.state = STATE_GAMEOVER;
                        this.bootTicks = 0;
                        audio.playMusic(MUS_STOP);
                        audio.playSfx(SFX_GAMEOVER);
                    }
                } else if (this.clockHours === 13) {
                    this.clockHours = 1;
                }
            }
        }
    }

    // Main 50Hz Game Update
    tick() {
        input.poll();

        // Check cheat code "writetyper"
        if (!this.cheatEnabled && input.cheatBuffer.includes("writetyper")) {
            this.cheatEnabled = true;
            input.cheatBuffer = "";
        }

        // Toggle sound via 'M'
        if (input.mute) {
            input.mute = false;
            audio.toggleSound();
        }

        // Handle Escape to return to Title
        if (input.escape && this.state !== STATE_TITLE) {
            input.escape = false;
            this.startTitle();
            return;
        }

        // State: TITLE SCREEN
        if (this.state === STATE_TITLE) {
            if (input.enter || input.enterTrigger || input.jump || input.jumpTrigger) {
                input.enter = false;
                input.enterTrigger = false;
                input.jump = false;
                input.jumpTrigger = false;
                this.startGame();
                return;
            }

            // Scroll ticker message
            this.titleTickerFrame += 2;
            if (this.titleTickerFrame >= 6) {
                this.titleTickerFrame = 0;
                this.titleTickerPos++;
                if (this.titleTickerPos >= this.titleTickerText.length - 33) {
                    this.titleTickerPos = 0;
                }
            }

            this.renderer.updateFlash();
            return;
        }

        // State: PAUSED
        if (this.state === STATE_PAUSED) {
            if (input.pause || input.enter) {
                input.pause = false;
                input.enter = false;
                this.state = STATE_PLAYING;
                audio.playMusic(MUS_GAME, true);
                this.renderer.borderColour = JSW_DATA.levelBorders[this.currentRoomId] || 0;
                this.updateBorderDOM();
                return;
            }
            this.pauseTicks++;
            if (this.pauseTicks >= 16) {
                this.pauseTicks = 0;
                this.renderer.borderColour = (this.renderer.borderColour + 1) % 8;
                this.updateBorderDOM();
            }
            return;
        }

        // Toggle pause during gameplay
        if (input.pause) {
            input.pause = false;
            this.state = STATE_PAUSED;
            audio.stopMusic();
            return;
        }

        // State: DYING
        if (this.state === STATE_DYING) {
            this.dieTicks--;
            if (this.dieTicks <= 0) {
                if (this.lives < 0) {
                    this.state = STATE_GAMEOVER;
                    this.bootTicks = 0;
                    audio.playMusic(MUS_STOP);
                    audio.playSfx(SFX_GAMEOVER);
                } else {
                    this.willy.restore();
                    audio.reduceMusicSpeed();
                    this.renderer.borderColour = JSW_DATA.levelBorders[this.currentRoomId] || 0;
                    this.updateBorderDOM();
                    this.state = STATE_PLAYING;
                }
            }
            return;
        }

        // State: GAME OVER
        if (this.state === STATE_GAMEOVER) {
            this.bootTicks++;
            if (this.bootTicks >= 256 || input.enter || input.jump) {
                input.enter = false;
                input.jump = false;
                this.startTitle();
            }
            return;
        }

        // State: VICTORY / ENDING SEQUENCE
        if (this.state === STATE_VICTORY) {
            this.clockTicks++;
            if (this.clockTicks >= 256 || input.enter) {
                input.enter = false;
                this.startTitle();
            }
            return;
        }

        // State: NORMAL PLAYING
        this.renderer.updateFlash();

        // Update conveyors
        this.conveyAnim = (this.conveyAnim + 1) & 3;

        // Update Robots
        this.robots.tick(this.willy, this.clockTicks);

        // Update Willy
        this.willy.tick(input, this);

        // Check Sleepwalker / Ending sequence
        if (this.gameMode === GM_RUNNING) {
            this.willy.frame |= 1;
            // Willy reached The Bathroom toilet at x = 224!
            if (this.willy.x === 224 && this.currentRoomId === ROOM_THEBATHROOM) {
                this.gameMode = GM_TOILET;
                this.robots.flushToilet();
                this.state = STATE_VICTORY;
                this.clockTicks = 0;
            }
        } else if (this.gameMode === GM_MARIA && this.currentRoomId === ROOM_MASTERBEDROOM) {
            // Reached bed in Master Bedroom
            if (this.willy.air === 0 && this.willy.x === 40) {
                this.gameMode = GM_RUNNING;
            }
        }

        // Update Rope
        this.rope.tick();

        // Update Clock
        this.tickClock();
    }

    // Main Draw Routine
    draw() {
        if (this.state === STATE_TITLE) {
            this.drawTitleScreen();
            this.renderer.render();
            return;
        }

        if (this.state === STATE_GAMEOVER) {
            this.drawGameOverScreen();
            this.renderer.render();
            return;
        }

        if (this.state === STATE_DYING) {
            // Screen color flash on death
            this.renderer.clearGameplayArea(this.dieTicks >> 1);
            this.renderer.clearStatusArea();
            this.renderer.drawStatus(
                this.itemsRemaining, this.lives,
                this.clockHours, this.clockMinutes, this.clockAmPm,
                this.cheatEnabled
            );
            this.renderer.render();
            return;
        }

        // Normal Gameplay Rendering
        this.renderer.clearGameplayArea(0);
        this.renderer.clearStatusArea();

        // 1. Draw Room Tiles (512 tiles: 32 cols x 16 rows)
        const room = this.currentRoom;
        for (let cell = 0; cell < 512; cell++) {
            const tileVal = this.roomTiles[cell];
            const info = room.info[tileVal];
            if (!info) continue;

            const gfx = room.gfx[tileVal] || [0,0,0,0,0,0,0,0];
            let paper = (info.attr >> 4) & 0x0f;
            let ink = info.attr & 0x0f;

            if (info.type === T_ITEM) {
                // Item shimmering animation
                ink = ((cell + this.clockTicks) & 3) + 3;
                this.renderer.drawItem(cell, gfx, ink);
            } else if (info.attr & 0x100) {
                // Flashing tile
                if (this.renderer.flashState) {
                    this.renderer.drawTile(cell, gfx, ink, paper);
                } else {
                    this.renderer.drawTile(cell, gfx, paper, ink);
                }
            } else {
                this.renderer.drawTile(cell, gfx, paper, ink);
            }
        }

        // 2. Draw Guardians / Robots
        this.robots.draw(this.renderer);

        // 3. Draw Willy
        if (this.gameMode !== GM_TOILET) {
            this.willy.draw(this.renderer, this);
        }

        // 4. Draw Rope
        this.rope.draw(this.renderer, this.willy, this);

        // 5. Draw Room Title Banner
        this.renderer.drawRoomTitle(room.title);

        // 6. Draw Status Bar (Items, Lives, Clock)
        this.renderer.drawStatus(
            this.itemsRemaining, this.lives,
            this.clockHours, this.clockMinutes, this.clockAmPm,
            this.cheatEnabled
        );

        // 7. Paused text overlay
        if (this.state === STATE_PAUSED) {
            this.renderer.drawTextLarge(96, 64, "\x01\x00\x02\x07 PAUSED ");
        }

        // Put image to canvas
        this.renderer.render();
    }

    drawTitleScreen() {
        this.renderer.clear(0);

        // Draw "JET SET WILLY" logo using tile map
        const jswTiles = JSW_DATA.titleJswTiles || [];
        const logoInk = (this.renderer.flashState ? 3 : 6);
        for (const tilePos of jswTiles) {
            const row = Math.floor(tilePos / 32);
            const col = tilePos % 32;
            const pixelPos = (row * 8) * WIDTH + (col * 8);
            this.renderer.drawText(pixelPos, "\x15", logoInk, 0);
        }

        // Title Screen Piano Artwork
        this.renderer.drawText(16 * WIDTH + 144, "\x01\x00\x02\x05\x10\x11\x12\x13", 5, 0);
        this.renderer.drawText(24 * WIDTH + 128, "\x10\x14\x01\x05\x14\x14\x02\x09\x10\x14", 9, 0);
        this.renderer.drawText(32 * WIDTH + 112, "\x01\x00\x02\x05\x10\x11\x01\x05\x14\x14\x02\x09\x10\x11\x01\x09\x14\x14", 5, 0);
        this.renderer.drawText(40 * WIDTH + 96, "\x01\x00\x02\x05\x10\x14\x01\x05\x14\x14\x02\x09\x10\x14\x01\x09\x14\x14\x14\x14", 5, 0);
        this.renderer.drawText(48 * WIDTH + 80, "\x01\x00\x02\x05\x10\x11\x01\x05\x14\x14\x02\x09\x10\x11\x01\x09\x14\x14\x02\x01\x10\x14\x14\x14", 5, 0);
        this.renderer.drawText(56 * WIDTH + 64, "\x01\x00\x02\x05\x14\x14\x01\x05\x14\x14\x02\x09\x10\x14\x01\x09\x14\x14\x02\x00\x10\x14\x01\x01\x14\x14\x01\x09\x14\x14", 5, 0);
        this.renderer.drawText(64 * WIDTH + 64, "\x01\x05\x02\x01\x12\x13\x14\x14\x01\x09\x02\x05\x12\x13\x02\x00\x10\x11\x01\x00\x14\x14\x01\x01\x14\x14\x01\x09\x14\x14", 1, 5);
        this.renderer.drawText(72 * WIDTH + 64, "\x01\x01\x14\x14\x01\x05\x02\x01\x12\x13\x14\x14\x01\x00\x02\x05\x12\x13\x14\x14\x01\x01\x14\x14\x01\x09\x14\x14", 1, 1);
        this.renderer.drawText(80 * WIDTH + 64, "\x01\x01\x02\x00\x12\x13\x14\x14\x01\x05\x02\x01\x14\x13\x14\x14\x01\x00\x02\x05\x12\x13\x01\x01\x14\x14\x01\x09\x14\x14", 0, 1);
        this.renderer.drawText(88 * WIDTH + 80, "\x01\x01\x02\x00\x14\x13\x14\x14\x01\x05\x02\x01\x14\x13\x14\x14\x01\x01\x14\x14\x01\x09\x14\x14", 0, 1);
        this.renderer.drawText(96 * WIDTH + 96, "\x01\x01\x02\x00\x14\x13\x14\x14\x01\x05\x02\x01\x12\x13\x01\x01\x14\x14\x01\x09\x14\x14", 0, 1);
        this.renderer.drawText(104 * WIDTH + 112, "\x01\x01\x02\x00\x14\x13\x14\x14\x14\x14\x01\x09\x14\x14", 0, 1);
        this.renderer.drawText(112 * WIDTH + 128, "\x01\x01\x14\x13\x14\x14\x01\x09\x14\x14", 1, 1);
        this.renderer.drawText(120 * WIDTH + 144, "\x01\x01\x12\x13\x01\x09\x10\x11", 1, 1);

        // Animated Miner Willy playing piano
        const pianoWillyFrame = JSW_DATA.minerSprites[(this.clockTicks >> 3) & 3];
        if (pianoWillyFrame) {
            this.renderer.drawSprite(92 * WIDTH + 72, pianoWillyFrame, 0, 7);
        }

        // Scrolling Ticker Banner
        const bannerSub = this.titleTickerText.substr(this.titleTickerPos, 34);
        this.renderer.drawTextLarge(-(this.titleTickerFrame & 6), 19 * 8, bannerSub);
    }

    drawGameOverScreen() {
        this.renderer.clearGameplayArea(0);

        // Crushing Boot descends onto Willy on plinth
        const bootY = Math.min(96, this.bootTicks & 126);
        const bootSprite = JSW_DATA.bootSprite;
        const plinthSprite = JSW_DATA.plinthSprite;
        const minerSprite = JSW_DATA.minerSprites[2];

        // Plinth and Willy
        this.renderer.drawSprite(112 * WIDTH + 15 * 8, plinthSprite, 0, 2);
        if (bootY < 90) {
            this.renderer.drawSprite(96 * WIDTH + 15 * 8, minerSprite, 0, 7);
        }

        // Monty Python Crushing Boot
        this.renderer.drawSprite(bootY * WIDTH + 15 * 8, bootSprite, 0, 7);

        // Flash "GAME OVER" text
        if (this.bootTicks >= 96) {
            const colors = [1, 2, 3, 4, 5, 6, 7];
            const c = (this.bootTicks >> 2);
            const textGame = String.fromCharCode(1, 0, 2, colors[c % 7]) + "G " +
                             String.fromCharCode(2, colors[(c + 1) % 7]) + "a " +
                             String.fromCharCode(2, colors[(c + 2) % 7]) + "m " +
                             String.fromCharCode(2, colors[(c + 3) % 7]) + "e";
            const textOver = String.fromCharCode(1, 0, 2, colors[(c + 4) % 7]) + "O " +
                             String.fromCharCode(2, colors[(c + 5) % 7]) + "v " +
                             String.fromCharCode(2, colors[(c + 6) % 7]) + "e " +
                             String.fromCharCode(2, colors[c % 7]) + "r";
            this.renderer.drawTextLarge(7 * 8, 6 * 8, textGame);
            this.renderer.drawTextLarge(18 * 8, 6 * 8, textOver);
        }
    }

    saveGame() {
        try {
            const state = {
                currentRoomId: this.currentRoomId,
                willy: {
                    x: this.willy.x, y: this.willy.y,
                    tile: this.willy.tile, dir: this.willy.dir
                },
                itemsRemaining: this.itemsRemaining,
                itemsCollected: this.itemsCollected,
                lives: this.lives,
                clockTicks: this.clockTicks,
                clockMinutes: this.clockMinutes,
                clockHours: this.clockHours,
                clockAmPm: this.clockAmPm,
                roomsData: this.roomsData,
                cheatEnabled: this.cheatEnabled
            };
            localStorage.setItem('jsw_savegame', JSON.stringify(state));
            return true;
        } catch (e) {
            return false;
        }
    }

    loadGame() {
        try {
            const str = localStorage.getItem('jsw_savegame');
            if (!str) return false;
            const state = JSON.parse(str);

            this.roomsData = state.roomsData;
            this.itemsRemaining = state.itemsRemaining;
            this.itemsCollected = state.itemsCollected;
            this.lives = state.lives;
            this.clockTicks = state.clockTicks;
            this.clockMinutes = state.clockMinutes;
            this.clockHours = state.clockHours;
            this.clockAmPm = state.clockAmPm;
            this.cheatEnabled = state.cheatEnabled;

            this.currentRoomId = state.currentRoomId;
            this.willy.init(state.willy.x, state.willy.y);
            this.willy.tile = state.willy.tile;
            this.willy.dir = state.willy.dir;

            this.loadRoom(this.currentRoomId);
            this.state = STATE_PLAYING;
            audio.playMusic(MUS_GAME, true);
            return true;
        } catch (e) {
            return false;
        }
    }
}

if (typeof module !== "undefined") {
    module.exports = Game;
}
