/**
 * Sector 404 Rescue - Arcade Mini-Game
 * A fast-paced canvas arcade game where players recover lost data packets
 * amidst cosmic anomalies to restore the broken connection.
 */

class RescueGame {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.modal = null;
    this.isRunning = false;
    this.animationId = null;

    // Game state
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem("sector404_highscore") || "0", 10);
    this.lives = 3;
    this.gameOver = false;
    this.packetsCollected = 0;
    this.multiplier = 1;

    // Ship / Probe
    this.probe = {
      x: 300,
      y: 200,
      radius: 16,
      vx: 0,
      vy: 0,
      angle: 0,
      speed: 4.5,
      shield: 0 // invulnerability timer
    };

    // Controls
    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false
    };

    // Entities
    this.packets = [];
    this.anomalies = [];
    this.particles = [];
    this.stars = [];

    // Pointer steer
    this.mouseTarget = null;
    this.isTouch = false;
  }

  init() {
    this.modal = document.getElementById("game-modal");
    this.canvas = document.getElementById("game-canvas");
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");

    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());

    // Controls listeners
    window.addEventListener("keydown", (e) => this.handleKeyDown(e));
    window.addEventListener("keyup", (e) => this.handleKeyUp(e));

    // Mouse / Touch steering inside canvas
    this.canvas.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouseTarget = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    });

    this.canvas.addEventListener("mouseleave", () => {
      this.mouseTarget = null;
    });

    this.canvas.addEventListener("touchmove", (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const t = e.touches[0];
      if (t) {
        this.mouseTarget = {
          x: t.clientX - rect.left,
          y: t.clientY - rect.top
        };
      }
    }, { passive: false });

    // UI Buttons
    const restartBtn = document.getElementById("game-restart-btn");
    if (restartBtn) {
      restartBtn.addEventListener("click", () => this.start());
    }

    const closeBtn = document.getElementById("game-close-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.close());
    }

    this.initBackgroundStars();
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const container = this.canvas.parentElement;
    const width = Math.min(container.clientWidth || 640, 720);
    const height = Math.min(Math.round(width * 0.65), 460);
    this.canvas.width = width;
    this.canvas.height = height;
  }

  initBackgroundStars() {
    this.stars = [];
    const w = this.canvas ? this.canvas.width : 640;
    const h = this.canvas ? this.canvas.height : 400;
    for (let i = 0; i < 45; i++) {
      this.stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 1.8 + 0.5,
        speed: Math.random() * 0.4 + 0.1
      });
    }
  }

  open() {
    if (!this.modal) this.init();
    if (window.soundEffects) {
      window.soundEffects.ensureContext();
      window.soundEffects.playClick(900);
    }
    this.modal.classList.add("active");
    this.resizeCanvas();
    this.start();
  }

  close() {
    this.isRunning = false;
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.modal) this.modal.classList.remove("active");
    if (window.soundEffects) window.soundEffects.playClick(700);
  }

  start() {
    this.resizeCanvas();
    this.isRunning = true;
    this.gameOver = false;
    this.score = 0;
    this.lives = 3;
    this.packetsCollected = 0;
    this.multiplier = 1;

    this.probe.x = this.canvas.width / 2;
    this.probe.y = this.canvas.height / 2;
    this.probe.vx = 0;
    this.probe.vy = 0;
    this.probe.shield = 60; // 1 second invulnerable start

    this.packets = [];
    this.anomalies = [];
    this.particles = [];

    // Spawn initial entities
    for (let i = 0; i < 4; i++) this.spawnPacket();
    for (let i = 0; i < 3; i++) this.spawnAnomaly();

    this.updateHUD();

    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.loop();
  }

  handleKeyDown(e) {
    if (!this.isRunning) return;
    if (["ArrowUp", "KeyW"].includes(e.code)) this.keys.up = true;
    if (["ArrowDown", "KeyS"].includes(e.code)) this.keys.down = true;
    if (["ArrowLeft", "KeyA"].includes(e.code)) this.keys.left = true;
    if (["ArrowRight", "KeyD"].includes(e.code)) this.keys.right = true;
    if (e.code === "Escape") this.close();
  }

  handleKeyUp(e) {
    if (["ArrowUp", "KeyW"].includes(e.code)) this.keys.up = false;
    if (["ArrowDown", "KeyS"].includes(e.code)) this.keys.down = false;
    if (["ArrowLeft", "KeyA"].includes(e.code)) this.keys.left = false;
    if (["ArrowRight", "KeyD"].includes(e.code)) this.keys.right = false;
  }

  spawnPacket() {
    const types = [
      { name: "HTTP 200 Packet", color: "#00ffcc", pts: 100, radius: 11 },
      { name: "DNS Record", color: "#39ff14", pts: 150, radius: 9 },
      { name: "SSL Cert Beacon", color: "#ffe600", pts: 250, radius: 13 }
    ];
    const type = types[Math.floor(Math.random() * types.length)];
    this.packets.push({
      x: 30 + Math.random() * (this.canvas.width - 60),
      y: 30 + Math.random() * (this.canvas.height - 60),
      radius: type.radius,
      color: type.color,
      pts: type.pts,
      pulse: Math.random() * Math.PI,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8
    });
  }

  spawnAnomaly() {
    const edge = Math.floor(Math.random() * 4);
    let x, y;
    if (edge === 0) { x = Math.random() * this.canvas.width; y = -20; }
    else if (edge === 1) { x = this.canvas.width + 20; y = Math.random() * this.canvas.height; }
    else if (edge === 2) { x = Math.random() * this.canvas.width; y = this.canvas.height + 20; }
    else { x = -20; y = Math.random() * this.canvas.height; }

    const speed = 1.2 + Math.random() * 1.5;
    const angle = Math.atan2(this.probe.y - y, this.probe.x - x) + (Math.random() - 0.5) * 0.6;

    this.anomalies.push({
      x,
      y,
      radius: 14 + Math.random() * 8,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rot: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.08
    });
  }

  spawnExplosion(x, y, color = "#ff3366", count = 16) {
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = Math.random() * 3.5 + 1;
      this.particles.push({
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        life: 1,
        decay: 0.02 + Math.random() * 0.03,
        color,
        size: Math.random() * 3.5 + 1.5
      });
    }
  }

  update() {
    if (this.gameOver) return;

    if (this.probe.shield > 0) this.probe.shield--;

    // Movement from keys
    let moveX = 0;
    let moveY = 0;
    if (this.keys.up) moveY -= 1;
    if (this.keys.down) moveY += 1;
    if (this.keys.left) moveX -= 1;
    if (this.keys.right) moveX += 1;

    // Movement from mouse steering if active
    if (this.mouseTarget) {
      const dx = this.mouseTarget.x - this.probe.x;
      const dy = this.mouseTarget.y - this.probe.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 8) {
        moveX = dx / dist;
        moveY = dy / dist;
        this.probe.angle = Math.atan2(dy, dx);
      }
    } else if (moveX !== 0 || moveY !== 0) {
      this.probe.angle = Math.atan2(moveY, moveX);
    }

    // Apply acceleration
    this.probe.vx += moveX * 0.5;
    this.probe.vy += moveY * 0.5;
    this.probe.vx *= 0.91; // friction
    this.probe.vy *= 0.91;

    this.probe.x += this.probe.vx;
    this.probe.y += this.probe.vy;

    // Canvas boundary bounce
    if (this.probe.x < this.probe.radius) {
      this.probe.x = this.probe.radius;
      this.probe.vx *= -0.5;
    }
    if (this.probe.x > this.canvas.width - this.probe.radius) {
      this.probe.x = this.canvas.width - this.probe.radius;
      this.probe.vx *= -0.5;
    }
    if (this.probe.y < this.probe.radius) {
      this.probe.y = this.probe.radius;
      this.probe.vy *= -0.5;
    }
    if (this.probe.y > this.canvas.height - this.probe.radius) {
      this.probe.y = this.canvas.height - this.probe.radius;
      this.probe.vy *= -0.5;
    }

    // Engine exhaust particles when moving
    if (Math.hypot(this.probe.vx, this.probe.vy) > 0.5) {
      const backX = this.probe.x - Math.cos(this.probe.angle) * 14;
      const backY = this.probe.y - Math.sin(this.probe.angle) * 14;
      this.particles.push({
        x: backX + (Math.random() - 0.5) * 4,
        y: backY + (Math.random() - 0.5) * 4,
        vx: -this.probe.vx * 0.4 + (Math.random() - 0.5) * 0.8,
        vy: -this.probe.vy * 0.4 + (Math.random() - 0.5) * 0.8,
        life: 1,
        decay: 0.06,
        color: "#00f0ff",
        size: Math.random() * 2.5 + 1
      });
    }

    // Background stars drift
    this.stars.forEach((s) => {
      s.x -= s.speed;
      if (s.x < 0) s.x = this.canvas.width;
    });

    // Update Packets
    this.packets.forEach((p, idx) => {
      p.pulse += 0.06;
      p.x += p.vx;
      p.y += p.vy;

      // Bounce
      if (p.x < p.radius || p.x > this.canvas.width - p.radius) p.vx *= -1;
      if (p.y < p.radius || p.y > this.canvas.height - p.radius) p.vy *= -1;

      // Collision with probe
      const dist = Math.hypot(p.x - this.probe.x, p.y - this.probe.y);
      if (dist < p.radius + this.probe.radius) {
        this.packetsCollected++;
        this.score += p.pts * this.multiplier;
        if (this.score > this.highScore) {
          this.highScore = this.score;
          localStorage.setItem("sector404_highscore", this.highScore.toString());
        }

        if (window.soundEffects) window.soundEffects.playPickup();
        this.spawnExplosion(p.x, p.y, p.color, 12);
        this.packets.splice(idx, 1);

        // Spawn replacement
        this.spawnPacket();
        if (this.packetsCollected % 4 === 0) {
          this.multiplier++;
          this.spawnAnomaly(); // ramp difficulty
        }
        this.updateHUD();
      }
    });

    // Update Anomalies
    this.anomalies.forEach((a, idx) => {
      a.x += a.vx;
      a.y += a.vy;
      a.rot += a.vRot;

      // Screen wrap or bounce
      if (a.x < -40 || a.x > this.canvas.width + 40 || a.y < -40 || a.y > this.canvas.height + 40) {
        this.anomalies.splice(idx, 1);
        this.spawnAnomaly();
        return;
      }

      // Check collision with probe
      if (this.probe.shield === 0) {
        const dist = Math.hypot(a.x - this.probe.x, a.y - this.probe.y);
        if (dist < a.radius + this.probe.radius) {
          this.lives--;
          this.multiplier = 1;
          this.probe.shield = 75; // invulnerable brief period
          this.spawnExplosion(this.probe.x, this.probe.y, "#ff0055", 22);

          if (window.soundEffects) window.soundEffects.playImpact();
          this.updateHUD();

          if (this.lives <= 0) {
            this.triggerGameOver();
          }
        }
      }
    });

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life -= pt.decay;
      if (pt.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  triggerGameOver() {
    this.gameOver = true;
    const overDisplay = document.getElementById("game-over-screen");
    const finalScore = document.getElementById("game-final-score");
    if (finalScore) finalScore.textContent = this.score;
    if (overDisplay) overDisplay.style.display = "flex";
  }

  updateHUD() {
    const scoreEl = document.getElementById("game-score");
    const livesEl = document.getElementById("game-lives");
    const highEl = document.getElementById("game-highscore");
    const multiEl = document.getElementById("game-multiplier");

    if (scoreEl) scoreEl.textContent = this.score;
    if (livesEl) livesEl.textContent = "❤️".repeat(Math.max(0, this.lives));
    if (highEl) highEl.textContent = this.highScore;
    if (multiEl) multiEl.textContent = `${this.multiplier}x`;

    const overDisplay = document.getElementById("game-over-screen");
    if (overDisplay && !this.gameOver) overDisplay.style.display = "none";
  }

  draw() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Clear background
    ctx.fillStyle = "#070913";
    ctx.fillRect(0, 0, w, h);

    // Draw grid lines
    ctx.strokeStyle = "rgba(0, 240, 255, 0.05)";
    ctx.lineWidth = 1;
    const step = 40;
    for (let x = 0; x < w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Stars
    this.stars.forEach((s) => {
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.fillRect(s.x, s.y, s.size, s.size);
    });

    // Particles
    this.particles.forEach((pt) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, pt.life);
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Packets (Collectibles)
    this.packets.forEach((p) => {
      ctx.save();
      const glow = Math.sin(p.pulse) * 4 + 8;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = glow;
      ctx.fillStyle = p.color;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();

      // Inner ring
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 0.5, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    });

    // Anomalies (Obstacles)
    this.anomalies.forEach((a) => {
      ctx.save();
      ctx.translate(a.x, a.y);
      ctx.rotate(a.rot);

      ctx.shadowColor = "#ff0055";
      ctx.shadowBlur = 10;
      ctx.fillStyle = "#ff0055";
      ctx.strokeStyle = "#ff77aa";
      ctx.lineWidth = 2;

      // Jagged polygon
      ctx.beginPath();
      const spikes = 6;
      for (let i = 0; i < spikes * 2; i++) {
        const rad = i % 2 === 0 ? a.radius : a.radius * 0.55;
        const ang = (i / (spikes * 2)) * Math.PI * 2;
        const px = Math.cos(ang) * rad;
        const py = Math.sin(ang) * rad;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    });

    // Probe (Ship)
    if (!this.gameOver) {
      ctx.save();
      ctx.translate(this.probe.x, this.probe.y);
      ctx.rotate(this.probe.angle);

      // Shield flicker if invincible
      if (this.probe.shield > 0) {
        ctx.strokeStyle = `rgba(0, 240, 255, ${0.4 + Math.sin(Date.now() * 0.02) * 0.3})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, this.probe.radius + 6, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Ship body (sleek triangular interceptor)
      ctx.shadowColor = "#00f0ff";
      ctx.shadowBlur = 12;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(18, 0);
      ctx.lineTo(-12, -11);
      ctx.lineTo(-6, 0);
      ctx.lineTo(-12, 11);
      ctx.closePath();
      ctx.fill();

      // Cockpit / Core
      ctx.fillStyle = "#00f0ff";
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  loop() {
    if (!this.isRunning) return;
    this.update();
    this.draw();
    this.animationId = requestAnimationFrame(() => this.loop());
  }
}

// Global game instance
window.sectorRescueGame = new RescueGame();
