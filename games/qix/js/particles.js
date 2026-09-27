/**
 * NEO-QIX Particle & Visual FX System
 * High performance pooled particle engine, shockwaves, floating text & screen shake
 */

export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.maxParticles = 600;
    this.shockwaves = [];
    this.floatingTexts = [];
    this.shakeAmount = 0;
    this.shakeDecay = 0.92;
  }

  reset() {
    this.particles = [];
    this.shockwaves = [];
    this.floatingTexts = [];
    this.shakeAmount = 0;
  }

  triggerScreenShake(magnitude = 10) {
    this.shakeAmount = Math.max(this.shakeAmount, magnitude);
  }

  getShakeOffset() {
    if (this.shakeAmount <= 0.2) {
      this.shakeAmount = 0;
      return { x: 0, y: 0 };
    }
    const angle = Math.random() * Math.PI * 2;
    const dist = (Math.random() * 0.5 + 0.5) * this.shakeAmount;
    this.shakeAmount *= this.shakeDecay;
    return {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist
    };
  }

  // --- Emitters ---

  emitSparks(x, y, count = 8, color = '#00ffff', speed = 3) {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = Math.random() * Math.PI * 2;
      const vel = (Math.random() * 0.8 + 0.2) * speed;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * vel,
        vy: Math.sin(angle) * vel,
        color,
        size: Math.random() * 2.5 + 1.5,
        life: 1.0,
        decay: Math.random() * 0.04 + 0.03,
        glow: true,
        type: 'spark'
      });
    }
  }

  emitFuse(x, y) {
    for (let i = 0; i < 3; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = Math.random() * Math.PI * 2;
      const vel = Math.random() * 2 + 0.5;
      const colors = ['#ff0055', '#ff5500', '#ffff00', '#ffffff'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      this.particles.push({
        x: x + (Math.random() * 4 - 2),
        y: y + (Math.random() * 4 - 2),
        vx: Math.cos(angle) * vel,
        vy: Math.sin(angle) * vel - 0.5, // drift upward
        color,
        size: Math.random() * 3 + 1,
        life: 1.0,
        decay: Math.random() * 0.06 + 0.04,
        glow: true,
        type: 'fuse'
      });
    }
  }

  emitCaptureDebris(x, y, w, h, count = 35, color = '#00f0ff') {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const px = x + Math.random() * w;
      const py = y + Math.random() * h;
      const angle = Math.random() * Math.PI * 2;
      const vel = Math.random() * 4 + 1;
      this.particles.push({
        x: px,
        y: py,
        vx: Math.cos(angle) * vel,
        vy: Math.sin(angle) * vel,
        color,
        size: Math.random() * 3 + 1.5,
        life: 1.0,
        decay: Math.random() * 0.03 + 0.02,
        glow: true,
        type: 'debris'
      });
    }
  }

  emitExplosion(x, y, count = 50, color = '#ff007f') {
    this.triggerScreenShake(12);
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = Math.random() * Math.PI * 2;
      const vel = Math.random() * 6 + 1.5;
      const colors = [color, '#ffffff', '#ffff00', '#ff00aa'];
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * vel,
        vy: Math.sin(angle) * vel,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 4 + 2,
        life: 1.0,
        decay: Math.random() * 0.025 + 0.015,
        glow: true,
        type: 'explosion'
      });
    }
  }

  addShockwave(x, y, maxRadius = 80, color = '#00ffff') {
    this.shockwaves.push({
      x,
      y,
      radius: 5,
      maxRadius,
      color,
      alpha: 1.0,
      decay: 0.03
    });
  }

  addFloatingText(text, x, y, color = '#ffffff', fontSize = 16, subtext = '') {
    this.floatingTexts.push({
      text,
      subtext,
      x,
      y,
      color,
      fontSize,
      alpha: 1.0,
      vy: -1.2,
      decay: 0.02
    });
  }

  update(dt = 1) {
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= p.decay * dt;

      if (p.type === 'fuse') {
        p.size *= 0.95;
      }

      if (p.life <= 0 || p.size <= 0.3) {
        this.particles.splice(i, 1);
      }
    }

    // Update shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const s = this.shockwaves[i];
      s.radius += (s.maxRadius - s.radius) * 0.15 * dt;
      s.alpha -= s.decay * dt;
      if (s.alpha <= 0 || s.radius >= s.maxRadius * 0.98) {
        this.shockwaves.splice(i, 1);
      }
    }

    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy * dt;
      ft.alpha -= ft.decay * dt;
      if (ft.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    ctx.save();

    // Draw Shockwaves
    for (const s of this.shockwaves) {
      const r = Math.max(0.1, s.radius || 0);
      ctx.beginPath();
      ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 3;
      ctx.globalAlpha = Math.max(0, s.alpha);
      ctx.shadowColor = s.color;
      ctx.shadowBlur = 12;
      ctx.stroke();
    }

    // Draw Particles
    for (const p of this.particles) {
      const pr = Math.max(0.1, p.size || 0);
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      if (p.glow) {
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
      } else {
        ctx.shadowBlur = 0;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, pr, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw Floating Texts
    ctx.shadowBlur = 10;
    for (const ft of this.floatingTexts) {
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.fillStyle = ft.color;
      ctx.shadowColor = ft.color;
      ctx.font = `bold ${ft.fontSize}px 'Orbitron', 'Courier New', monospace, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);

      if (ft.subtext) {
        ctx.font = `600 ${Math.max(10, ft.fontSize * 0.65)}px 'Orbitron', 'Courier New', monospace, sans-serif`;
        ctx.fillStyle = '#00ffff';
        ctx.shadowColor = '#00ffff';
        ctx.fillText(ft.subtext, ft.x, ft.y + ft.fontSize * 0.85);
      }
    }

    ctx.restore();
  }
}
