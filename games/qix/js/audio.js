/**
 * NEO-QIX Audio Engine
 * Procedural Web Audio API sound effects and dynamic Synthwave soundtrack
 * 100% self-contained - zero external audio files required!
 */

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.sfxMuted = false;
    this.musicMuted = false;
    this.masterVolume = 0.7;
    this.sfxVolume = 0.8;
    this.musicVolume = 0.5;

    this.masterGain = null;
    this.sfxGain = null;
    this.musicGain = null;

    // Ongoing draw sound oscillator
    this.drawOsc = null;
    this.drawGain = null;
    this.isDrawingSoundPlaying = false;

    // Ongoing fuse sound
    this.fuseNoiseNode = null;
    this.fuseGain = null;
    this.isFuseSoundPlaying = false;

    // BGM sequencer state
    this.bgmPlaying = false;
    this.bgmStep = 0;
    this.bgmTimer = null;
    this.bgmBpm = 124;
    this.intensityLevel = 0; // 0: normal, 1: 50%+ captured, 2: 70%+ urgent

    // Synthwave bass and lead sequences (chords in A minor / F / G / Em)
    this.bassNotes = [
      55, 55, 55, 55, 55, 55, 55, 55, // A1
      53, 53, 53, 53, 53, 53, 53, 53, // F1
      50, 50, 50, 50, 50, 50, 50, 50, // D1
      52, 52, 52, 52, 55, 55, 57, 55  // E1 -> A1
    ];

    this.arpNotes = [
      [220, 261.63, 329.63, 440],       // Am: A3, C4, E4, A4
      [174.61, 220, 261.63, 349.23],    // F: F3, A3, C4, F4
      [146.83, 220, 293.66, 369.99],    // Dm: D3, A3, D4, F#4
      [164.81, 246.94, 329.63, 392.00]  // Em: E3, B3, E4, G4
    ];
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();

      // Master bus
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // SFX bus
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxMuted ? 0 : this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      // Music bus
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicMuted ? 0 : this.musicVolume, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      // Pre-create white noise buffer for Fuse and explosions
      this._createNoiseBuffer();
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  _createNoiseBuffer() {
    const bufferSize = this.ctx.sampleRate * 2;
    this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = this.noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
  }

  setMasterVolume(val) {
    this.masterVolume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.masterVolume, this.ctx.currentTime, 0.05);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  toggleMusic() {
    this.musicMuted = !this.musicMuted;
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(this.musicMuted ? 0 : this.musicVolume, this.ctx.currentTime, 0.05);
    }
    return this.musicMuted;
  }

  toggleSfx() {
    this.sfxMuted = !this.sfxMuted;
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setTargetAtTime(this.sfxMuted ? 0 : this.sfxVolume, this.ctx.currentTime, 0.05);
    }
    return this.sfxMuted;
  }

  // --- Sound Effects ---

  playMove() {
    if (!this.ctx || this.sfxMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(360, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.03);

    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.035);
  }

  startDraw(isSlow = false) {
    if (!this.ctx || this.sfxMuted) return;
    if (this.isDrawingSoundPlaying) return;

    this.drawOsc = this.ctx.createOscillator();
    this.drawGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    this.drawOsc.type = isSlow ? 'sawtooth' : 'sine';
    const baseFreq = isSlow ? 180 : 320;
    this.drawOsc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isSlow ? 600 : 1200, this.ctx.currentTime);

    this.drawGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.drawGain.gain.exponentialRampToValueAtTime(0.08, this.ctx.currentTime + 0.05);

    this.drawOsc.connect(filter);
    filter.connect(this.drawGain);
    this.drawGain.connect(this.sfxGain);

    this.drawOsc.start();
    this.isDrawingSoundPlaying = true;
  }

  updateDraw(isSlow, length = 0) {
    if (!this.drawOsc || !this.ctx || !this.isDrawingSoundPlaying) return;
    // Modulate pitch subtly as line extends
    const baseFreq = isSlow ? 180 : 320;
    const modFreq = baseFreq + Math.min(200, length * 1.5);
    this.drawOsc.frequency.setTargetAtTime(modFreq, this.ctx.currentTime, 0.05);
  }

  stopDraw() {
    if (!this.drawGain || !this.ctx || !this.isDrawingSoundPlaying) return;
    try {
      this.drawGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.04);
      if (this.drawOsc) {
        this.drawOsc.stop(this.ctx.currentTime + 0.06);
      }
    } catch (_) {}
    this.drawOsc = null;
    this.drawGain = null;
    this.isDrawingSoundPlaying = false;
  }

  startFuse() {
    if (!this.ctx || this.sfxMuted || this.isFuseSoundPlaying) return;
    if (!this.noiseBuffer) this._createNoiseBuffer();

    this.fuseNoiseNode = this.ctx.createBufferSource();
    this.fuseNoiseNode.buffer = this.noiseBuffer;
    this.fuseNoiseNode.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, this.ctx.currentTime);
    filter.Q.setValueAtTime(3.0, this.ctx.currentTime);

    this.fuseGain = this.ctx.createGain();
    this.fuseGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.fuseGain.gain.exponentialRampToValueAtTime(0.07, this.ctx.currentTime + 0.1);

    this.fuseNoiseNode.connect(filter);
    filter.connect(this.fuseGain);
    this.fuseGain.connect(this.sfxGain);

    this.fuseNoiseNode.start();
    this.isFuseSoundPlaying = true;
  }

  stopFuse() {
    if (!this.fuseGain || !this.ctx || !this.isFuseSoundPlaying) return;
    try {
      this.fuseGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.05);
      if (this.fuseNoiseNode) {
        this.fuseNoiseNode.stop(this.ctx.currentTime + 0.08);
      }
    } catch (_) {}
    this.fuseNoiseNode = null;
    this.fuseGain = null;
    this.isFuseSoundPlaying = false;
  }

  playCapture(percent = 5, isSlow = false) {
    if (!this.ctx || this.sfxMuted) return;

    // Harmonic chord fanfare based on percentage captured
    const rootNotes = [261.63, 293.66, 329.63, 392.00, 523.25]; // C4, D4, E4, G4, C5
    const rootIdx = Math.min(rootNotes.length - 1, Math.floor(percent / 10));
    const base = rootNotes[rootIdx];

    const chord = isSlow 
      ? [base, base * 1.25, base * 1.5, base * 1.875] // Major 7th
      : [base, base * 1.2, base * 1.5, base * 1.778];  // Minor 7th

    chord.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = isSlow ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.04);

      gain.gain.setValueAtTime(0.001, this.ctx.currentTime + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.09 / (idx + 1), this.ctx.currentTime + idx * 0.04 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + idx * 0.04 + 0.45);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(this.ctx.currentTime + idx * 0.04);
      osc.stop(this.ctx.currentTime + idx * 0.04 + 0.5);
    });

    // Sub-bass thump for physical feel
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(110, this.ctx.currentTime);
    subOsc.frequency.exponentialRampToValueAtTime(45, this.ctx.currentTime + 0.2);

    subGain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    subGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

    subOsc.connect(subGain);
    subGain.connect(this.sfxGain);

    subOsc.start();
    subOsc.stop(this.ctx.currentTime + 0.26);
  }

  playDeath() {
    if (!this.ctx || this.sfxMuted) return;
    this.stopDraw();
    this.stopFuse();

    // Noise explosion
    if (this.noiseBuffer) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.6);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      noise.start();
      noise.stop(this.ctx.currentTime + 0.65);
    }

    // Downward pitch zap
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(650, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.55);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.55);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.6);
  }

  playLevelWin() {
    if (!this.ctx || this.sfxMuted) return;
    this.stopDraw();
    this.stopFuse();

    // Victory cyber fanfare
    const notes = [329.63, 392.00, 493.88, 587.33, 659.25, 783.99, 987.77];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0.001, this.ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.12, this.ctx.currentTime + idx * 0.08 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.08 + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(this.ctx.currentTime + idx * 0.08);
      osc.stop(this.ctx.currentTime + idx * 0.08 + 0.4);
    });
  }

  playGameOver() {
    if (!this.ctx || this.sfxMuted) return;
    this.stopDraw();
    this.stopFuse();

    const notes = [220, 207.65, 196.00, 185.00, 146.83];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.18);

      gain.gain.setValueAtTime(0.001, this.ctx.currentTime + idx * 0.18);
      gain.gain.exponentialRampToValueAtTime(0.12, this.ctx.currentTime + idx * 0.18 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.18 + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(this.ctx.currentTime + idx * 0.18);
      osc.stop(this.ctx.currentTime + idx * 0.18 + 0.45);
    });
  }

  playPowerup() {
    if (!this.ctx || this.sfxMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1320, this.ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.26);
  }

  playNearMiss() {
    if (!this.ctx || this.sfxMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.16);
  }

  // --- Dynamic Procedural Synthwave BGM ---

  startBGM() {
    if (this.bgmPlaying || !this.ctx) return;
    this.bgmPlaying = true;
    this.bgmStep = 0;
    const stepDurationMs = (60 / this.bgmBpm / 4) * 1000; // 16th notes

    this.bgmTimer = setInterval(() => {
      this._tickBGM();
    }, stepDurationMs);
  }

  stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  setIntensity(level) {
    this.intensityLevel = Math.max(0, Math.min(2, level));
  }

  _tickBGM() {
    if (!this.ctx || this.musicMuted || !this.bgmPlaying) {
      this.bgmStep = (this.bgmStep + 1) % 32;
      return;
    }

    const t = this.ctx.currentTime;
    const step = this.bgmStep;

    // 1. Synth Kick on beats 0, 4, 8, 12, 16, 20, 24, 28 (every quarter note)
    if (step % 4 === 0) {
      this._playSynthKick(t);
    }

    // 2. Synth Snare on beats 4, 12, 20, 28 (backbeat)
    if (step % 8 === 4) {
      this._playSynthSnare(t);
    }

    // 3. Hi-hat (8th notes when intensity >= 1, 16th notes when intensity >= 2)
    if ((this.intensityLevel >= 1 && step % 2 === 0) || (this.intensityLevel >= 2)) {
      this._playSynthHiHat(t, step % 4 === 2 ? 0.04 : 0.02);
    }

    // 4. Synth Bass (driving rolling 16th/8th notes)
    if (step % 2 === 0 || this.intensityLevel >= 1) {
      const noteFreq = this.bassNotes[step];
      this._playSynthBass(t, noteFreq);
    }

    // 5. Arpeggio lead
    const chordIdx = Math.floor(step / 8);
    const arpChord = this.arpNotes[chordIdx];
    const arpNote = arpChord[step % 4];
    this._playArpLead(t, arpNote);

    this.bgmStep = (this.bgmStep + 1) % 32;
  }

  _playSynthKick(t) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.1);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(t);
    osc.stop(t + 0.13);
  }

  _playSynthSnare(t) {
    if (!this.noiseBuffer) return;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    noise.start(t);
    noise.stop(t + 0.16);
  }

  _playSynthHiHat(t, vol = 0.03) {
    if (!this.noiseBuffer) return;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    noise.start(t);
    noise.stop(t + 0.05);
  }

  _playSynthBass(t, freq) {
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, t);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(380 + this.intensityLevel * 150, t);
    filter.Q.setValueAtTime(4, t);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  _playArpLead(t, freq) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);

    const baseVol = 0.04 + this.intensityLevel * 0.02;
    gain.gain.setValueAtTime(baseVol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(t);
    osc.stop(t + 0.11);
  }
}
