// Jet Set Willy - Pixel-Perfect Canvas Renderer

class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = WIDTH;
        this.height = HEIGHT;

        // RGBA image data buffer (256x192)
        this.imgData = this.ctx.createImageData(this.width, this.height);
        this.pixels = new Uint32Array(this.imgData.data.buffer);

        // Pixel collision / tag buffer: 1 = Level, 2 = Robot, 4 = Willy
        this.pointBuffer = new Uint8Array(this.width * this.height);

        // Flash timer
        this.flashState = 0;
        this.flashCounter = 0;

        // Precompute 32-bit RGBA palette from PALETTE
        this.palette32 = new Uint32Array(PALETTE.length);
        for (let i = 0; i < PALETTE.length; i++) {
            const [r, g, b] = PALETTE[i];
            // Little-endian RGBA: 0xAABBGGRR
            this.palette32[i] = (255 << 24) | (b << 16) | (g << 8) | r;
        }

        this.borderColour = 0;
    }

    clear(paperColorIndex = 0) {
        const color = this.palette32[paperColorIndex & 15];
        this.pixels.fill(color);
        this.pointBuffer.fill(0);
    }

    clearGameplayArea(paperColorIndex = 0) {
        const color = this.palette32[paperColorIndex & 15];
        const endPixel = 128 * this.width;
        this.pixels.fill(color, 0, endPixel);
        this.pointBuffer.fill(0, 0, endPixel);
    }

    clearStatusArea() {
        const color = this.palette32[0]; // black
        const startPixel = 128 * this.width;
        const endPixel = this.width * this.height;
        this.pixels.fill(color, startPixel, endPixel);
        this.pointBuffer.fill(0, startPixel, endPixel);
    }

    setPixel(pos, colorIndex) {
        if (pos >= 0 && pos < this.pixels.length) {
            this.pixels[pos] = this.palette32[colorIndex & 15];
        }
    }

    setPixelXY(x, y, colorIndex) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            const pos = y * this.width + x;
            this.pixels[pos] = this.palette32[colorIndex & 15];
        }
    }

    updateFlash() {
        if (++this.flashCounter >= 16) {
            this.flashCounter = 0;
            this.flashState ^= 1;
        }
    }

    // Draw 8x8 character cell tile
    drawTile(tileIndex, gfx8Bytes, paper, ink) {
        const tileCol = tileIndex % 32;
        const tileRow = Math.floor(tileIndex / 32);
        let pos = (tileRow * 8) * this.width + (tileCol * 8);

        const colors = [this.palette32[paper & 15], this.palette32[ink & 15]];

        for (let r = 0; r < 8; r++) {
            let byte = gfx8Bytes[r] || 0;
            let p = pos + 7;
            for (let b = 0; b < 8; b++, p--, byte >>= 1) {
                const bit = byte & 1;
                this.pointBuffer[p] = bit ? B_LEVEL : 0;
                this.pixels[p] = colors[bit];
            }
            pos += this.width;
        }
    }

    // Draw flashing item
    drawItem(tileIndex, gfx8Bytes, itemInk) {
        this.drawTile(tileIndex, gfx8Bytes, 0, itemInk);
    }

    // Draw 16x16 Sprite (Willy or item)
    drawSprite(pos, lineWords, paper, ink) {
        const colors = [this.palette32[paper & 15], this.palette32[ink & 15]];
        let curPos = pos + 15;

        for (let row = 0; row < 16; row++, curPos += this.width) {
            let word = lineWords[row] || 0;
            let p = curPos;
            for (let bit = 0; bit < 16; bit++, p--, word >>= 1) {
                if (p >= 0 && p < this.pixels.length) {
                    const b = word & 1;
                    this.pointBuffer[p] = b;
                    this.pixels[p] = colors[b];
                }
            }
        }
    }

    // Draw Robot (Guardian) and tag B_ROBOT in pointBuffer
    drawRobot(pos, lineWords, ink) {
        const color = this.palette32[ink & 15];
        let curPos = pos + 15;

        for (let row = 0; row < 16; row++, curPos += this.width) {
            let word = lineWords[row] || 0;
            let p = curPos;
            for (let bit = 0; bit < 16; bit++, p--, word >>= 1) {
                if (word & 1) {
                    if (p >= 0 && p < this.pixels.length) {
                        this.pointBuffer[p] |= (B_ROBOT | 1);
                        this.pixels[p] = color;
                    }
                }
            }
        }
    }

    // Draw Arrow (Flying hazard)
    drawArrow(pos, dir) {
        const white = this.palette32[7];
        let p = pos + dir;
        const setRobotPixel = (offset) => {
            const idx = p + offset;
            if (idx >= 0 && idx < this.pixels.length) {
                this.pointBuffer[idx] |= (B_ROBOT | 1);
                this.pixels[idx] = white;
            }
        };

        setRobotPixel(0);
        setRobotPixel(6);
        p += this.width;
        setRobotPixel(this.width);
        setRobotPixel(this.width + 6);
        p -= dir;

        for (let b = 0; b < 8; b++, p++) {
            if (p >= 0 && p < this.pixels.length) {
                this.pointBuffer[p] |= (B_ROBOT | 1);
                this.pixels[p] = white;
            }
        }
    }

    // Draw Willy and detect collision with robots
    drawMiner(pos, lineWords, attrSplit = 6) {
        let die = false;
        pos &= ~7;
        let y = Math.floor(pos / this.width);
        let curPos = pos + 15;

        // In swimming pool, Willy goes blue underwater
        const attrColors = [
            this.palette32[8], // bright grey
            this.palette32[8],
            this.palette32[8],
            this.palette32[1]  // blue
        ];

        for (let row = 0; row < 16; row++, curPos += this.width, y++) {
            let word = lineWords[row] || 0;
            let p = curPos;
            const inkColor = attrColors[(y >> attrSplit) & 3] || this.palette32[7];

            for (let bit = 0; bit < 16; bit++, p--, word >>= 1) {
                if (word & 1) {
                    if (p >= 0 && p < this.pixels.length) {
                        // Check collision with robot!
                        if (this.pointBuffer[p] & B_ROBOT) {
                            die = true;
                        }
                        this.pointBuffer[p] |= (B_WILLY | 1);
                        this.pixels[p] = inkColor;
                    }
                }
            }
        }

        return die;
    }

    // Draw rope segment pixel
    drawRopeSeg(pos, ink) {
        if (pos >= 0 && pos < this.pixels.length) {
            this.pointBuffer[pos] |= 1;
            this.pixels[pos] = this.palette32[ink & 15];
        }
    }

    // Standard font rendering (8x8) using charSet
    drawText(pos, text, ink = 6, paper = 0) {
        let curPos = pos;
        let curInk = ink;
        let curPaper = paper;

        for (let i = 0; i < text.length; i++) {
            const charCode = text.charCodeAt(i);

            // Control characters for color
            if (charCode === 0x01) { // paper
                curPaper = text.charCodeAt(++i);
                continue;
            }
            if (charCode === 0x02) { // ink
                curInk = text.charCodeAt(++i);
                continue;
            }

            const glyph = JSW_DATA.charSet[charCode] || JSW_DATA.charSet[32];
            if (!glyph || glyph.length < 2) {
                curPos += 6;
                continue;
            }

            const width = glyph[0];
            const inkColor = this.palette32[curInk & 15];
            const paperColor = this.palette32[curPaper & 15];

            for (let col = 0; col < width; col++, curPos++) {
                let line = glyph[col + 1] || 0;
                let p = curPos;
                for (let bit = 0; bit < 8; bit++, p += this.width, line >>= 1) {
                    if (p >= 0 && p < this.pixels.length) {
                        this.pixels[p] = (line & 1) ? inkColor : paperColor;
                    }
                }
            }
        }
    }

    getTextWidth(text) {
        let w = 0;
        for (let i = 0; i < text.length; i++) {
            const charCode = text.charCodeAt(i);
            if (charCode === 0x01 || charCode === 0x02) {
                i++;
                continue;
            }
            const glyph = JSW_DATA.charSet[charCode] || JSW_DATA.charSet[32];
            w += (glyph ? glyph[0] : 6);
        }
        return w;
    }

    // Large font rendering (16x8) using charSetLarge
    drawTextLarge(x, y, text) {
        let curX = x;
        let curInk = [this.palette32[0], this.palette32[7]];

        for (let i = 0; i < text.length; i++) {
            const charCode = text.charCodeAt(i);

            // Color escape sequences
            if (charCode === 0x01) {
                curInk[0] = this.palette32[text.charCodeAt(++i) & 15];
                continue;
            }
            if (charCode === 0x02) {
                curInk[1] = this.palette32[text.charCodeAt(++i) & 15];
                continue;
            }

            const glyphIndex = charCode - 32;
            const glyph = (glyphIndex >= 0 && glyphIndex < 96) ? JSW_DATA.charSetLarge[glyphIndex] : null;
            if (!glyph) {
                curX += 8;
                continue;
            }

            for (let col = 0; col < 8; col++, curX++) {
                if (curX >= 0 && curX < this.width) {
                    let p = y * this.width + curX;
                    let line = glyph[col] || 0;
                    for (let bit = 0; bit < 16; bit++, p += this.width, line >>= 1) {
                        if (p >= 0 && p < this.pixels.length) {
                            this.pixels[p] = curInk[line & 1];
                        }
                    }
                }
            }
        }
    }

    // Render Room Title Banner (Row 16: pixels 128 to 136)
    drawRoomTitle(title) {
        const startPos = 129 * this.width;
        const barColor = this.palette32[5]; // cyan banner
        for (let i = startPos; i < startPos + 8 * this.width; i++) {
            this.pixels[i] = barColor;
        }

        const titleWidth = this.getTextWidth(title);
        const titleX = Math.max(0, Math.floor((this.width - titleWidth) / 2));
        const textPos = (16 * 8 + 1) * this.width + titleX;
        this.drawText(textPos, "\x01\x05\x02\x00" + title, 0, 5); // black on cyan
    }

    // Render Lives (top hats)
    drawLives(gameLives) {
        // Draw top hat icons at row 18 (y = 148)
        const lifeColors = [2, 4, 6, 1, 3, 5, 7];
        const blankSprite = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

        for (let l = 0; l < 8; l++) {
            const pos = LIVES_OFFSET + l * 16;
            if (l < gameLives) {
                // Draw Willy top hat sprite
                const sprite = JSW_DATA.minerSprites[2]; // idle/hat frame
                this.drawSprite(pos, sprite, 0, lifeColors[l % lifeColors.length]);
            } else {
                this.drawSprite(pos, blankSprite, 0, 0);
            }
        }
    }

    // Render Status: Items count, Clock, Lives
    drawStatus(itemsRemaining, gameLives, clockHours, clockMinutes, clockAmPm, cheatEnabled) {
        // "Items " label and count
        const textItems = "\x01\x00\x02\x01I\x02\x02t\x02\x03e\x02\x04m\x02\x05s";
        this.drawTextLarge(4, STATUS_Y, textItems);

        const countStr = (itemsRemaining < 10 ? "0" : "") + itemsRemaining;
        this.drawTextLarge(6 * 8 + 4, STATUS_Y, `\x01\x00\x02\x06${countStr[0]}\x02\x07${countStr[1]}`);

        // Clock: e.g. " 7:00 am"
        const hrStr = (clockHours < 10 ? " " : "") + clockHours;
        const minStr = (clockMinutes < 10 ? "0" : "") + clockMinutes;
        const ampmStr = clockAmPm ? "pm" : "am";

        const clockText = `\x01\x00\x02\x07${hrStr[0]}\x02\x06${hrStr[1]}\x02\x05:\x02\x04${minStr[0]}\x02\x03${minStr[1]}\x02\x02 ${ampmStr}`;
        this.drawTextLarge(this.width - 64, STATUS_Y, clockText);

        // Lives
        this.drawLives(gameLives);

        // Cheat icon
        if (cheatEnabled && JSW_DATA.robotGfx["ROBOT_44"] && JSW_DATA.robotGfx["ROBOT_45"]) {
            const cheatPos = LIVES_OFFSET + this.width - 24;
            this.drawRobot(cheatPos, JSW_DATA.robotGfx["ROBOT_44"][0], 7);
            this.drawRobot(cheatPos, JSW_DATA.robotGfx["ROBOT_45"][0], 5);
        }
    }

    // Put rendered pixels to HTML5 Canvas
    render() {
        this.ctx.putImageData(this.imgData, 0, 0);
    }
}

if (typeof module !== "undefined") {
    module.exports = Renderer;
}
