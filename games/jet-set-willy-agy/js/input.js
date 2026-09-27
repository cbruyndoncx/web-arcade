// Jet Set Willy - Unified Input Manager (Keyboard, Gamepad, Touch)

class InputManager {
    constructor() {
        this.left = false;
        this.right = false;
        this.jump = false;
        this.pause = false;
        this.enter = false;
        this.escape = false;
        this.mute = false;

        this.enterTrigger = false;
        this.jumpTrigger = false;
        this.pauseTrigger = false;

        this.keyBuffer = [];
        this.cheatBuffer = "";
        this.lastCheatKeyTime = 0;

        this.setupKeyboard();
        this.setupTouch();
    }

    setupKeyboard() {
        if (typeof window === 'undefined' || !window.addEventListener) return;
        window.addEventListener('keydown', (e) => {
            // Prevent scrolling on space / arrow keys during gameplay
            if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                e.preventDefault();
            }

            const code = e.code;
            const key = e.key.toLowerCase();

            // Track cheat string "writetyper"
            const now = Date.now();
            if (now - this.lastCheatKeyTime > 2500) {
                this.cheatBuffer = "";
            }
            this.lastCheatKeyTime = now;
            if (key.length === 1 && key >= 'a' && key <= 'z') {
                this.cheatBuffer += key;
                if (this.cheatBuffer.length > 15) {
                    this.cheatBuffer = this.cheatBuffer.slice(-15);
                }
            }

            // Directional Input
            if (code === 'ArrowLeft' || code === 'KeyA' || key === 'o') {
                this.left = true;
            }
            if (code === 'ArrowRight' || code === 'KeyD' || key === 'p') {
                this.right = true;
            }
            if (code === 'Space' || code === 'ArrowUp' || code === 'KeyW' || key === 'q') {
                this.jump = true;
                this.jumpTrigger = true;
            }

            if (code === 'Enter' || code === 'NumpadEnter') {
                this.enter = true;
                this.enterTrigger = true;
            }
            if (code === 'Escape') {
                this.escape = true;
            }
            if (key === 'm') {
                this.mute = true;
            }
            if (code === 'KeyP' || key === 'p') {
                this.pause = true;
                this.pauseTrigger = true;
            }
        });

        window.addEventListener('keyup', (e) => {
            const code = e.code;
            const key = e.key.toLowerCase();

            if (code === 'ArrowLeft' || code === 'KeyA' || key === 'o') {
                this.left = false;
            }
            if (code === 'ArrowRight' || code === 'KeyD' || key === 'p') {
                this.right = false;
            }
            if (code === 'Space' || code === 'ArrowUp' || code === 'KeyW' || key === 'q') {
                this.jump = false;
            }

            if (code === 'Enter') {
                this.enter = false;
            }
            if (code === 'Escape') {
                this.escape = false;
            }
            if (key === 'm') {
                this.mute = false;
            }
        });
    }

    setupTouch() {
        // Will attach to touch buttons in DOM
        const bindBtn = (id, onDown, onUp) => {
            const btn = document.getElementById(id);
            if (!btn) return;

            const handleDown = (e) => {
                e.preventDefault();
                onDown();
                btn.classList.add('active');
            };

            const handleUp = (e) => {
                e.preventDefault();
                onUp();
                btn.classList.remove('active');
            };

            btn.addEventListener('touchstart', handleDown, { passive: false });
            btn.addEventListener('touchend', handleUp, { passive: false });
            btn.addEventListener('touchcancel', handleUp, { passive: false });
            btn.addEventListener('mousedown', handleDown);
            btn.addEventListener('mouseup', handleUp);
            btn.addEventListener('mouseleave', handleUp);
        };

        // Attach once DOM is ready
        if (typeof window !== 'undefined' && window.addEventListener) {
            window.addEventListener('DOMContentLoaded', () => {
            bindBtn('btnLeft', () => { this.left = true; }, () => { this.left = false; });
            bindBtn('btnRight', () => { this.right = true; }, () => { this.right = false; });
            bindBtn('btnJump', () => { this.jump = true; }, () => { this.jump = false; });
            bindBtn('btnStart', () => { this.enter = true; }, () => { this.enter = false; });
            });
        }
    }

    pollGamepad() {
        if (!navigator.getGamepads) return;
        const gamepads = navigator.getGamepads();
        for (let i = 0; i < gamepads.length; i++) {
            const gp = gamepads[i];
            if (!gp || !gp.connected) continue;

            // D-Pad or Left Stick
            const leftPressed = gp.buttons[14]?.pressed || gp.axes[0] < -0.4;
            const rightPressed = gp.buttons[15]?.pressed || gp.axes[0] > 0.4;
            const jumpPressed = gp.buttons[0]?.pressed || gp.buttons[1]?.pressed || gp.buttons[12]?.pressed || gp.axes[1] < -0.4;
            const startPressed = gp.buttons[9]?.pressed; // Start button

            if (leftPressed) this.left = true;
            if (rightPressed) this.right = true;
            if (jumpPressed) this.jump = true;
            if (startPressed) this.enter = true;
        }
    }

    poll() {
        this.pollGamepad();
    }
}

const input = new InputManager();
if (typeof module !== "undefined") {
    module.exports = input;
}
