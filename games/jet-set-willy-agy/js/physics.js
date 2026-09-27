// Jet Set Willy - Miner Willy Physics and Collision Engine

class Willy {
    constructor() {
        this.x = 20 * 8;
        this.y = 13 * 8;
        this.tile = 13 * 32 + 20;
        this.align = 4;
        this.frame = 0;
        this.dir = D_RIGHT;
        this.move = 0;
        this.air = 0;
        this.jump = 0;

        // Saved state for room transitions / respawns
        this.store = {
            x: this.x, y: this.y, tile: this.tile, align: this.align,
            frame: this.frame, dir: this.dir, move: this.move,
            air: this.air, jump: this.jump
        };

        this.ropeSeg = 0;
        this.attrSplit = 6;
        this.dead = false;
    }

    save() {
        this.store = {
            x: this.x, y: this.y, tile: this.tile, align: this.align,
            frame: this.frame, dir: this.dir, move: this.move,
            air: this.air, jump: this.jump
        };
    }

    restore() {
        this.x = this.store.x;
        this.y = this.store.y;
        this.tile = this.store.tile;
        this.align = this.store.align;
        this.frame = this.store.frame;
        this.dir = this.store.dir;
        this.move = this.store.move;
        this.air = this.store.air;
        this.jump = this.store.jump;
        this.ropeSeg = 0;
        this.dead = false;
    }

    init(x = 20 * 8, y = 13 * 8) {
        this.x = x;
        this.y = y;
        this.tile = Math.floor(y / 8) * 32 + Math.floor(x / 8);
        this.align = 4;
        this.frame = 0;
        this.dir = D_RIGHT;
        this.move = 0;
        this.air = 0;
        this.jump = 0;
        this.ropeSeg = 0;
        this.dead = false;
        this.save();
    }

    isSolid(tile, game) {
        if (tile < 0 || tile >= 512) return false;

        if (game.getTileType(tile) === T_SOLID) return true;
        if (game.getTileType(tile + 32) === T_SOLID) return true;

        if (tile + 64 >= 512) return false;
        if (game.getTileType(tile + 64) !== T_SOLID) return false;

        if (this.align === 6) return true;

        if (this.air === 1 && this.jump > 9) {
            this.air = 0;
        }

        return false;
    }

    moveLeftRight(game) {
        let offsetY = 0;
        let offsetTile = 0;

        if (this.move === 0) return;
        if (this.ropeSeg > 0) return;

        if (this.dir === D_RIGHT) {
            if (this.frame < 3) {
                this.frame++;
                return;
            }

            if (this.air === 0) {
                if (game.getTileRamp(this.tile + 64) === T_RAMPL) {
                    offsetY = 8;
                    offsetTile = 32;
                } else if (game.getTileRamp(this.tile + 34) === T_RAMPR) {
                    offsetY = -8;
                    offsetTile = -32;
                }
            }

            if (this.x === 30 * 8) {
                game.changeLevel(R_RIGHT);
                return;
            }

            if (this.isSolid(this.tile + offsetTile + 2, game)) {
                return;
            }

            this.x += 8;
            this.tile++;
            this.frame = 0;
        } else if (game.gameMode !== GM_RUNNING) {
            if (this.frame > 0) {
                this.frame--;
                return;
            }

            if (this.air === 0) {
                if (game.getTileRamp(this.tile + 31) === T_RAMPL) {
                    offsetY = -8;
                    offsetTile = -32;
                } else if (game.getTileRamp(this.tile + 65) === T_RAMPR) {
                    offsetY = 8;
                    offsetTile = 32;
                }
            }

            if (this.x === 0) {
                game.changeLevel(R_LEFT);
                return;
            }

            if (this.isSolid(this.tile + offsetTile - 1, game)) {
                return;
            }

            this.x -= 8;
            this.tile--;
            this.frame = 3;
        }

        this.y += offsetY;
        this.tile += offsetTile;
    }

    updateDir(conveyDir, input, game) {
        let dir = 0;

        if ((input.left || conveyDir === C_LEFT) && game.gameMode < GM_RUNNING) {
            dir += 1;
        }
        if ((input.right || conveyDir === C_RIGHT || game.gameMode === GM_RUNNING)) {
            dir += 2;
        }

        if (dir === 0) {
            this.move = 0;
        } else if (dir === 1) {
            if (this.dir === D_RIGHT) {
                this.dir = D_LEFT;
                this.move = 0;
            } else {
                this.move = 1;
            }
        } else if (dir === 2) {
            if (this.dir === D_LEFT) {
                this.dir = D_RIGHT;
                this.move = 0;
            } else {
                this.move = 1;
            }
        }

        // Jump trigger
        if ((input.jump || input.jumpTrigger) && game.gameMode < GM_RUNNING && this.air === 0) {
            input.jumpTrigger = false;
            this.air = 1;
            this.jump = 0;
            if (this.ropeSeg > 0) {
                this.ropeSeg = -16;
                this.y &= 120;
                this.align = 4;
                this.move = 1;
            }
        }
    }

    tick(input, game) {
        let conveyDir = C_NONE;

        if (this.ropeSeg > 0) {
            this.updateDir(conveyDir, input, game);
            return;
        }

        // Handle Jumping
        if (this.air === 1) {
            const jumpFrame = JSW_DATA.jumpInfo[this.jump];
            const newY = this.y + jumpFrame.jump;

            if (newY < 0) {
                game.changeLevel(R_ABOVE);
                return;
            }

            const targetTile = this.tile + jumpFrame.tile;
            if (game.getTileType(targetTile) === T_SOLID || game.getTileType(targetTile + 1) === T_SOLID) {
                // Head bump on solid ceiling!
                this.y = (newY + 8) & 120;
                this.tile = targetTile + 32;
                this.align = 4;
                this.air = 2;
                this.move = 0;
                return;
            }

            // Play jump sound
            audio.playWillySfx(jumpFrame.pitch, jumpFrame.length, this.x);

            this.y = newY;
            this.tile = targetTile;
            this.align = jumpFrame.align;
            this.jump++;

            if (this.jump === 18) {
                this.air = 6;
                return;
            }

            if (this.jump !== 13 && this.jump !== 16) {
                this.moveLeftRight(game);
                return;
            }
        }

        // Check ground and standing floor when vertically aligned
        if (this.align === 4) {
            const floorTile = this.tile + 64;
            if (floorTile >= 512) {
                game.changeLevel(R_BELOW);
                return;
            }

            const type0 = game.getTileType(floorTile);
            const type1 = game.getTileType(floorTile + 1);

            if (type0 === T_HARM || type1 === T_HARM) {
                if (this.air === 1 && (type0 <= T_SPACE || type1 <= T_SPACE)) {
                    this.moveLeftRight(game);
                } else {
                    game.die();
                }
                return;
            }

            if (type0 > T_SPACE || type1 > T_SPACE) {
                if (this.air >= 12) {
                    // Fatal fall!
                    game.die();
                    return;
                }

                this.air = 0;

                if (type0 === T_CONVEYL || type1 === T_CONVEYL) {
                    conveyDir = C_LEFT;
                } else if (type0 === T_CONVEYR || type1 === T_CONVEYR) {
                    conveyDir = C_RIGHT;
                }

                this.updateDir(conveyDir, input, game);
                this.moveLeftRight(game);
                return;
            }
        }

        if (this.air === 1) {
            this.moveLeftRight(game);
            return;
        }

        // Falling
        this.move = 0;
        if (this.air === 0) {
            this.air = 2;
            return;
        }

        this.air++;
        if (this.air === 16) {
            this.air = 12;
        }

        audio.playWillySfx(78 - this.air, 4, this.x);
        this.y += 4;
        this.align = 4;
        if (this.y & 7) {
            this.align += 2;
        } else {
            this.tile += 32;
        }

        if (this.y < 0) {
            game.changeLevel(R_ABOVE);
        }
    }

    draw(renderer, game) {
        let offset = 0;
        let align = this.align;

        if (this.air === 0) {
            if (game.getTileRamp(this.tile + 64) === T_RAMPL) {
                offset = this.frame << 1;
                align = 4 | ((offset & 4) >> 1) | (offset & 2) | ((offset & 1) << 1);
            } else if (game.getTileRamp(this.tile + 65) === T_RAMPR) {
                offset = 6 - (this.frame << 1);
                align = 4 | ((offset & 4) >> 1) | (offset & 2) | ((offset & 1) << 1);
            }
        }

        const spriteIndex = (this.dir << 2) | this.frame;
        // In Nightmare Room, Willy is transformed into the demon/pig sprite
        const spriteSet = (game.currentRoomId === ROOM_NIGHTMAREROOM) ? 8 : 0;
        const sprite = JSW_DATA.minerSprites[spriteSet + spriteIndex];

        const pixelPos = ((this.y + offset) * WIDTH) + this.x;
        const hitRobot = renderer.drawMiner(pixelPos, sprite, this.attrSplit);
        if (hitRobot) {
            game.die();
            return;
        }

        // Check deadly hazard tiles & collectible items within Willy's bounding tiles
        let t = this.tile;
        let adj = 1;
        for (let i = 0; i < align; i++, t += adj, adj ^= 30) {
            if (t >= 0 && t < 512) {
                if (game.getTileType(t) === T_HARM) {
                    game.die();
                    return;
                }
            }
        }

        t = this.tile;
        adj = 1;
        for (let i = 0; i < align; i++, t += adj, adj ^= 30) {
            if (t >= 0 && t < 512) {
                if (game.getTileType(t) === T_ITEM) {
                    game.eraseItem(t);
                    game.gotItem();
                }
            }
        }
    }
}

if (typeof module !== "undefined") {
    module.exports = Willy;
}
