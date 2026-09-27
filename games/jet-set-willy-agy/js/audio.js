// Jet Set Willy - Web Audio Engine (ZX Spectrum 1-Bit Beeper Simulation)

class AudioManager {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;

        this.soundEnabled = true;
        this.musicEnabled = true;
        this.volume = 0.5;

        // Music Channels (5 polyphonic voices)
        this.musicChannels = [];
        this.musicTrack = null;
        this.musicPtr = 0;
        this.musicClock = 0;
        this.musicDelta = 0;
        this.musicPlaying = false;
        this.musicPitch = 0;
        this.musicLoop = false;

        // SFX Channels (3 voices)
        this.sfxChannels = [];
        this.activeSfx = null;

        // Tick timer (50 Hz = 20ms)
        this.timerId = null;

        // Load preferences
        this.loadSettings();
    }

    init() {
        if (this.ctx) return;
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();

            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
            this.masterGain.connect(this.ctx.destination);

            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.setValueAtTime(this.musicEnabled ? 0.35 : 0, this.ctx.currentTime);
            this.musicGain.connect(this.masterGain);

            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.setValueAtTime(this.soundEnabled ? 0.45 : 0, this.ctx.currentTime);
            this.sfxGain.connect(this.masterGain);

            // Initialize 5 music channels
            for (let i = 0; i < 5; i++) {
                const osc = this.ctx.createOscillator();
                osc.type = 'square';
                const gain = this.ctx.createGain();
                gain.gain.setValueAtTime(0, this.ctx.currentTime);

                let panner = null;
                if (this.ctx.createStereoPanner) {
                    panner = this.ctx.createStereoPanner();
                    panner.pan.setValueAtTime((i % 2 === 0 ? -0.2 : 0.2), this.ctx.currentTime);
                    osc.connect(gain);
                    gain.connect(panner);
                    panner.connect(this.musicGain);
                } else {
                    osc.connect(gain);
                    gain.connect(this.musicGain);
                }

                osc.start();
                this.musicChannels.push({ osc, gain, panner, note: 0 });
            }

            // Initialize 3 SFX channels
            for (let i = 0; i < 3; i++) {
                const osc = this.ctx.createOscillator();
                osc.type = 'square';
                const gain = this.ctx.createGain();
                gain.gain.setValueAtTime(0, this.ctx.currentTime);

                let panner = null;
                if (this.ctx.createStereoPanner) {
                    panner = this.ctx.createStereoPanner();
                    osc.connect(gain);
                    gain.connect(panner);
                    panner.connect(this.sfxGain);
                } else {
                    osc.connect(gain);
                    gain.connect(this.sfxGain);
                }

                osc.start();
                this.sfxChannels.push({ osc, gain, panner });
            }

            // Start 50Hz audio ticker
            if (!this.timerId) {
                this.timerId = setInterval(() => this.tick(), 20);
            }
        } catch (e) {
            console.warn("Web Audio initialization error:", e);
        }
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    loadSettings() {
        try {
            const savedSound = localStorage.getItem('jsw_sound');
            if (savedSound !== null) this.soundEnabled = savedSound === 'true';

            const savedMusic = localStorage.getItem('jsw_music');
            if (savedMusic !== null) this.musicEnabled = savedMusic === 'true';

            const savedVol = localStorage.getItem('jsw_volume');
            if (savedVol !== null) this.volume = parseFloat(savedVol);
        } catch (e) {}
    }

    saveSettings() {
        try {
            localStorage.setItem('jsw_sound', this.soundEnabled);
            localStorage.setItem('jsw_music', this.musicEnabled);
            localStorage.setItem('jsw_volume', this.volume);
        } catch (e) {}
    }

    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        }
        this.saveSettings();
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        if (this.sfxGain && this.ctx) {
            this.sfxGain.gain.setValueAtTime(this.soundEnabled ? 0.45 : 0, this.ctx.currentTime);
        }
        this.saveSettings();
        return this.soundEnabled;
    }

    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        if (this.musicGain && this.ctx) {
            this.musicGain.gain.setValueAtTime(this.musicEnabled ? 0.35 : 0, this.ctx.currentTime);
        }
        this.saveSettings();
        return this.musicEnabled;
    }

    getNoteFrequency(note) {
        // Standard equal-temperament tuning
        // Note 69 is A4 (440Hz), Note 60 is Middle C (261.63Hz)
        return 440 * Math.pow(2, (note - 69) / 12);
    }

    playMusic(trackIndex, loop = true) {
        this.init();
        this.resume();

        if (!JSW_DATA.musicScores || !JSW_DATA.musicScores[trackIndex]) return;

        this.musicTrack = JSW_DATA.musicScores[trackIndex];
        this.musicPtr = 0;
        this.musicClock = 0;
        this.musicDelta = 0;
        this.musicLoop = loop;
        this.musicPlaying = true;
        this.musicPitch = 0;

        // Silence existing notes
        for (const ch of this.musicChannels) {
            if (ch.gain) ch.gain.gain.setValueAtTime(0, this.ctx.currentTime);
        }
    }

    stopMusic() {
        this.musicPlaying = false;
        if (this.ctx) {
            for (const ch of this.musicChannels) {
                if (ch.gain) ch.gain.gain.setValueAtTime(0, this.ctx.currentTime);
            }
        }
    }

    reduceMusicSpeed() {
        // On Willy death, music pitch drops 1 semitone
        this.musicPitch--;
    }

    // 50Hz Tick Handler
    tick() {
        if (!this.ctx) return;

        // Handle Music
        if (this.musicPlaying && this.musicTrack) {
            if (this.musicDelta <= this.musicClock) {
                let time = 0;
                do {
                    if (this.musicPtr >= this.musicTrack.length) {
                        if (this.musicLoop) {
                            this.musicPtr = 0;
                            this.musicClock = 0;
                            this.musicDelta = 0;
                        } else {
                            this.stopMusic();
                            break;
                        }
                    }

                    const data = this.musicTrack[this.musicPtr++];
                    const channel = data & 0x0f;
                    const eventType = data & 0xf0;

                    if (eventType === 0x40) { // EV_END
                        const loopFlag = this.musicTrack[this.musicPtr++];
                        if (loopFlag === 1 || this.musicLoop) {
                            this.musicPtr = 0;
                            this.musicClock = 0;
                            this.musicDelta = 0;
                            time = 0;
                            continue;
                        } else {
                            this.stopMusic();
                            break;
                        }
                    } else if (eventType === 0x00) { // EV_NOTEOFF
                        if (channel < this.musicChannels.length) {
                            this.musicChannels[channel].gain.gain.setValueAtTime(0, this.ctx.currentTime);
                        }
                    } else if (eventType === 0x10) { // EV_NOTEON
                        const note = this.musicTrack[this.musicPtr++] + this.musicPitch;
                        if (channel < this.musicChannels.length) {
                            const freq = this.getNoteFrequency(note);
                            const ch = this.musicChannels[channel];
                            ch.osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
                            ch.gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
                        }
                    }

                    time = this.musicTrack[this.musicPtr++];
                    this.musicDelta += time;
                } while (time === 0 && this.musicPlaying);
            }
            this.musicClock++;
        }

        // Handle SFX Sequence
        if (this.activeSfx) {
            const sfx = this.activeSfx;
            if (sfx.step >= sfx.pitches.length || sfx.pitches[sfx.step] === 0) {
                // SFX finished
                if (sfx.channel && sfx.channel.gain) {
                    sfx.channel.gain.gain.setValueAtTime(0, this.ctx.currentTime);
                }
                this.activeSfx = null;
            } else {
                if (sfx.clock % sfx.length === 0) {
                    const note = sfx.pitches[sfx.step];
                    const freq = this.getNoteFrequency(note);
                    sfx.channel.osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
                    sfx.channel.gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
                    sfx.step++;
                }
                sfx.clock++;
            }
        }
    }

    setChannelPan(channel, x) {
        if (channel && channel.panner && this.ctx) {
            // Map x from 0..256 to -0.8..+0.8
            const pan = Math.max(-0.8, Math.min(0.8, (x - 128) / 160));
            channel.panner.pan.setValueAtTime(pan, this.ctx.currentTime);
        }
    }

    playSfx(type, panX = 128) {
        this.init();
        this.resume();
        if (!this.soundEnabled || !this.ctx) return;

        const ch = (type === SFX_GAMEOVER || type === SFX_DIE) ? this.sfxChannels[2] : this.sfxChannels[1];
        this.setChannelPan(ch, panX);

        if (type === SFX_ITEM) {
            const pitches = [96, 90, 84, 78, 72, 66, 60, 54, 0];
            this.activeSfx = { channel: ch, pitches, step: 0, clock: 0, length: 1 };
        } else if (type === SFX_DIE) {
            const pitches = [84, 81, 78, 75, 72, 69, 66, 63, 60, 57, 54, 51, 48, 45, 42, 39, 0];
            this.activeSfx = { channel: ch, pitches, step: 0, clock: 0, length: 1 };
        } else if (type === SFX_ARROW) {
            const pitches = [48, 54, 60, 66, 72, 78, 84, 90, 0];
            this.activeSfx = { channel: ch, pitches, step: 0, clock: 0, length: 1 };
        } else if (type === SFX_GAMEOVER) {
            const pitches = [];
            for (let p = 36; p <= 84; p++) pitches.push(p);
            pitches.push(0);
            this.activeSfx = { channel: ch, pitches, step: 0, clock: 0, length: 2 };
        }
    }

    playWillySfx(note, length, panX = 128) {
        this.init();
        this.resume();
        if (!this.soundEnabled || !this.ctx) return;

        const ch = this.sfxChannels[0];
        this.setChannelPan(ch, panX);

        const freq = this.getNoteFrequency(note);
        ch.osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        ch.gain.gain.setValueAtTime(0.25, this.ctx.currentTime);

        const durationMs = Math.max(10, length * 20);
        setTimeout(() => {
            if (ch && ch.gain && this.ctx) {
                ch.gain.gain.setValueAtTime(0, this.ctx.currentTime);
            }
        }, durationMs);
    }
}

const audio = new AudioManager();
if (typeof module !== "undefined") {
    module.exports = audio;
}
