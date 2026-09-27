// Jet Set Willy - Robot / Guardian AI and Animation Engine

class RobotManager {
    constructor() {
        this.robots = [];
        this.currentRoomId = -1;
    }

    initRoom(roomId, gameMode) {
        this.currentRoomId = roomId;
        this.robots = [];

        const roomDefs = JSW_DATA.roomRobots[roomId] || [];
        for (let i = 0; i < 8; i++) {
            const def = roomDefs[i];
            if (!def || !def.active) {
                this.robots.push({ active: false });
                continue;
            }

            const gfxFrames = JSW_DATA.robotGfx[def.gfx] || [];
            this.robots.push({
                active: true,
                pos: def.pos,
                min: def.min,
                max: def.max,
                move: def.move,
                draw: def.draw,
                speed: def.speed,
                gfx: gfxFrames,
                gfxName: def.gfx,
                ink: def.ink,
                fUpdate: def.fUpdate,
                fIndex: def.fIndex,
                fMask: def.fMask
            });
        }

        // When all items collected and Maria allows Willy to sleep,
        // Maria steps aside in Master Bedroom
        if (roomId === ROOM_MASTERBEDROOM && gameMode >= GM_MARIA) {
            if (this.robots[0]) this.robots[0].active = false;
            if (this.robots[1]) this.robots[1].active = false;
        }
    }

    flushToilet() {
        // Trigger toilet flush animation in The Bathroom (robot index 1)
        if (this.robots[1]) {
            this.robots[1].fMask = 3;
            this.robots[1].fIndex = 2;
            this.robots[1].fUpdate = 0;
        }
    }

    tick(willy, clockTicks) {
        for (const rob of this.robots) {
            if (!rob.active) continue;

            switch (rob.move) {
                case 'DoMoveLeft':
                    if (rob.fIndex > 0) {
                        rob.fIndex--;
                    } else {
                        if (rob.pos > rob.min) {
                            rob.pos -= 8;
                            rob.fIndex = 3;
                        } else {
                            rob.move = 'DoMoveRight';
                            rob.fIndex += 4;
                        }
                    }
                    break;

                case 'DoMoveRight':
                    if (rob.fIndex < 7) {
                        rob.fIndex++;
                    } else {
                        if (rob.pos < rob.max) {
                            rob.pos += 8;
                            rob.fIndex = 4;
                        } else {
                            rob.move = 'DoMoveLeft';
                            rob.fIndex &= 3;
                        }
                    }
                    break;

                case 'DoMoveUp':
                    rob.fUpdate ^= 1;
                    if (rob.fUpdate) rob.fIndex++;
                    rob.pos -= rob.speed * WIDTH;
                    if (rob.pos <= rob.min) {
                        rob.pos = rob.min;
                        rob.move = 'DoMoveDown';
                    }
                    break;

                case 'DoMoveDown':
                    rob.fUpdate ^= 1;
                    if (rob.fUpdate) rob.fIndex++;
                    rob.pos += rob.speed * WIDTH;
                    if (rob.pos >= rob.max) {
                        rob.move = 'DoMoveUp';
                    }
                    break;

                case 'DoMoveStatic':
                    rob.fUpdate ^= 1;
                    if (rob.fUpdate) rob.fIndex ^= 1;
                    break;

                case 'DoMoveArrowLeft':
                    rob.max--;
                    if (rob.max === 44) {
                        audio.playSfx(SFX_ARROW, 256);
                    }
                    if (rob.max < 0) rob.max = 255;
                    rob.min = rob.max * 8;
                    break;

                case 'DoMoveArrowRight':
                    rob.max++;
                    if (rob.max === 244) {
                        audio.playSfx(SFX_ARROW, 0);
                    }
                    if (rob.max > 255) rob.max = 0;
                    rob.min = rob.max * 8;
                    break;

                case 'DoMoveMaria':
                    if (willy.y < 96 && willy.air === 0) {
                        rob.fIndex = 3;
                    } else if (willy.y < 104 && willy.air === 0) {
                        rob.fIndex = 2;
                    } else {
                        rob.fIndex = (clockTicks & 2) >> 1;
                    }
                    break;
            }
        }
    }

    draw(renderer) {
        for (const rob of this.robots) {
            if (!rob.active) continue;

            if (rob.draw === 'DoDrawRobot') {
                if (!rob.gfx || rob.gfx.length === 0) continue;
                const frameIndex = rob.fIndex & rob.fMask;
                const frame = rob.gfx[frameIndex] || rob.gfx[0];
                if (frame) {
                    renderer.drawRobot(rob.pos, frame, rob.ink);
                }
            } else if (rob.draw === 'DoDrawArrow') {
                if (rob.max < 32) {
                    renderer.drawArrow(rob.pos + rob.min, rob.speed);
                }
            } else if (rob.draw === 'DoDrawToilet') {
                if (!rob.gfx || rob.gfx.length === 0) continue;
                const frameIndex = rob.fIndex & rob.fMask;
                const frame = rob.gfx[frameIndex] || rob.gfx[0];
                if (frame) {
                    renderer.drawSprite(rob.pos, frame, 0, 7);
                }
            }
        }
    }
}

if (typeof module !== "undefined") {
    module.exports = RobotManager;
}
