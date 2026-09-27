// Jet Set Willy - Authentic Swinging Rope Engine

class Rope {
    constructor() {
        this.active = false;
        this.ropeX = 16;
        this.ropeInk = 7;
        this.ropeDir = 0;
        this.ropePos = 34;
        this.ropeSide = 0;
        this.ropeHold = false;
        this.ropeMove = [-1, 1];
    }

    init(roomId) {
        if (roomId === ROOM_QUIRKAFLEEG) {
            this.ropeX = 16;
            this.ropeInk = 6;
            this.active = true;
        } else if (roomId === ROOM_ONTHEROOF) {
            this.ropeX = 16;
            this.ropeInk = 4;
            this.active = true;
        } else if (roomId === ROOM_COLDSTORE) {
            this.ropeX = 16;
            this.ropeInk = 6;
            this.active = true;
        } else if (roomId === ROOM_SWIMMINGPOOL) {
            this.ropeX = 16;
            this.ropeInk = 7;
            this.active = true;
        } else if (roomId === ROOM_THEBEACH) {
            this.ropeX = 14;
            this.ropeInk = 5;
            this.active = true;
        } else {
            this.active = false;
            return;
        }

        this.ropeDir = 0;
        this.ropePos = 34;
        this.ropeSide = 0;
        this.ropeHold = false;
    }

    tick() {
        if (!this.active) return;

        const move = this.ropeMove[this.ropeDir ^ this.ropeSide] * 2;
        this.ropePos += move;
        if (this.ropePos < 16) {
            this.ropePos += move;
        } else if (this.ropePos === 54) {
            this.ropeDir ^= 1;
        }
    }

    draw(renderer, willy, game) {
        if (!this.active) return;

        let x = this.ropeX * 8;
        let y = 0;

        renderer.drawRopeSeg(x, this.ropeInk);

        if (this.ropePos === 0) {
            this.ropeSide ^= 1;
        }

        const ropePoints = JSW_DATA.ropeData;
        let pIndex = this.ropePos;

        for (let seg = 1; seg < 33; seg++, pIndex++) {
            if (pIndex >= ropePoints.length) break;
            const pt = ropePoints[pIndex];
            y += pt.y;
            x -= pt.x * this.ropeMove[this.ropeSide];

            const pos = y * WIDTH + x;
            if (willy.ropeSeg === 0 && (renderer.pointBuffer[pos] & B_WILLY)) {
                willy.ropeSeg = seg;
                this.ropeHold = true;
            }

            if (willy.ropeSeg === seg && this.ropeHold) {
                willy.x = x & 248;
                willy.y = y - 8;

                if ((x & 6) === 6) {
                    willy.frame = 1;
                } else if (x & 4) {
                    willy.frame = 0;
                } else {
                    willy.x -= 8;
                    willy.frame = (x & 2) ? 3 : 2;
                }

                willy.tile = Math.floor(willy.y / 8) * 32 + Math.floor(willy.x / 8);
                willy.align = 4 | ((y & 4) >> 1) | (y & 2) | ((y & 1) << 1);
            }

            renderer.drawRopeSeg(pos, this.ropeInk);
        }

        if (willy.ropeSeg < 0) {
            willy.ropeSeg++;
            this.ropeHold = false;
            return;
        }

        if (this.ropeHold && willy.move) {
            let seg = willy.ropeSeg + this.ropeMove[this.ropeDir ^ willy.dir];
            const roomAbove = game.getRoomExit(R_ABOVE);
            if (roomAbove === 0 && seg < 15) {
                seg = 15;
            }

            if (seg < 33) {
                willy.ropeSeg = seg;
                return;
            }

            // Drop off bottom of rope
            willy.ropeSeg = -16;
            willy.y &= 124;
            willy.air = 0;
        }
    }
}

if (typeof module !== "undefined") {
    module.exports = Rope;
}
