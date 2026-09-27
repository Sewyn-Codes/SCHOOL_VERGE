/**
 * Sector 404 - Main Interactive Orchestrator
 * Controls starfield canvas, zero-g astronaut physics, terminal, search, and themes.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Subsystems
  initStarfield();
  initAstronautPhysics();
  initHeroTilt();
  initTerminal();
  initSearch();
  initThemeManager();
  initAudioControls();
  initTelemetryClock();
});

/* ==========================================================================
   1. Dynamic Starfield Canvas & Gravitational Lensing
   ========================================================================== */

let starfieldState = {
  canvas: null,
  ctx: null,
  stars: [],
  shootingStars: [],
  mouse: { x: -1000, y: -1000, active: false },
  isWarping: false,
  warpFactor: 1
};

function initStarfield() {
  const canvas = document.getElementById("space-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  starfieldState.canvas = canvas;
  starfieldState.ctx = ctx;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    createStars();
  }

  window.addEventListener("resize", resize);
  resize();

  window.addEventListener("mousemove", (e) => {
    starfieldState.mouse.x = e.clientX;
    starfieldState.mouse.y = e.clientY;
    starfieldState.mouse.active = true;
  });

  window.addEventListener("mouseleave", () => {
    starfieldState.mouse.active = false;
  });

  // Touch support for gravity well
  window.addEventListener("touchmove", (e) => {
    const t = e.touches[0];
    if (t) {
      starfieldState.mouse.x = t.clientX;
      starfieldState.mouse.y = t.clientY;
      starfieldState.mouse.active = true;
    }
  }, { passive: true });

  window.addEventListener("touchend", () => {
    starfieldState.mouse.active = false;
  });

  requestAnimationFrame(starfieldLoop);
}

function createStars() {
  const count = Math.floor((window.innerWidth * window.innerHeight) / 3000);
  starfieldState.stars = [];
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;

  for (let i = 0; i < count; i++) {
    starfieldState.stars.push({
      x: (Math.random() - 0.5) * window.innerWidth * 2,
      y: (Math.random() - 0.5) * window.innerHeight * 2,
      z: Math.random() * 1000 + 1,
      origZ: Math.random() * 1000 + 1,
      size: Math.random() * 1.6 + 0.4,
      hue: Math.random() > 0.8 ? (Math.random() > 0.5 ? 180 : 280) : 0, // cyan or violet tint
      twinkle: Math.random() * Math.PI * 2
    });
  }
}

function triggerShootingStar() {
  if (starfieldState.isWarping) return;
  const startX = Math.random() * window.innerWidth;
  const startY = Math.random() * (window.innerHeight * 0.4);
  const length = 100 + Math.random() * 140;
  const speed = 15 + Math.random() * 10;
  const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.3;

  starfieldState.shootingStars.push({
    x: startX,
    y: startY,
    dx: Math.cos(angle) * speed,
    dy: Math.sin(angle) * speed,
    length,
    life: 1,
    decay: 0.02
  });
}

// Random shooting star interval
setInterval(() => {
  if (Math.random() > 0.4) triggerShootingStar();
}, 3500);

function starfieldLoop() {
  const { canvas, ctx, stars, shootingStars, mouse, isWarping } = starfieldState;
  if (!ctx || !canvas) return;

  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2;

  // Clear with slight trail during warp
  ctx.fillStyle = isWarping ? "rgba(5, 7, 14, 0.25)" : "#05070e";
  ctx.fillRect(0, 0, w, h);

  // Animate & draw 3D stars
  const speed = isWarping ? 45 * starfieldState.warpFactor : 0.8;

  for (let i = 0; i < stars.length; i++) {
    const s = stars[i];
    s.z -= speed;

    if (s.z <= 0) {
      s.z = 1000;
      s.x = (Math.random() - 0.5) * w * 2;
      s.y = (Math.random() - 0.5) * h * 2;
    }

    const k = 250 / s.z;
    const px = s.x * k + cx;
    const py = s.y * k + cy;

    if (px < 0 || px >= w || py < 0 || py >= h) continue;

    // Gravitational pull toward mouse cursor
    let drawX = px;
    let drawY = py;

    if (mouse.active && !isWarping) {
      const dx = mouse.x - px;
      const dy = mouse.y - py;
      const dist = Math.hypot(dx, dy);
      if (dist < 200 && dist > 1) {
        const pull = (1 - dist / 200) * 12;
        drawX += (dx / dist) * pull;
        drawY += (dy / dist) * pull;
      }
    }

    const size = Math.max(0.6, (1 - s.z / 1000) * 2.5 * s.size);
    const alpha = Math.min(1, (1 - s.z / 1000) * (0.6 + Math.sin(s.twinkle += 0.05) * 0.4));

    ctx.save();
    if (isWarping) {
      // Warp speed stretch line
      const prevK = 250 / (s.z + speed * 1.5);
      const prevX = s.x * prevK + cx;
      const prevY = s.y * prevK + cy;

      ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
      ctx.lineWidth = size * 1.5;
      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(drawX, drawY);
      ctx.stroke();
    } else {
      if (s.hue > 0) {
        ctx.fillStyle = `hsla(${s.hue}, 90%, 75%, ${alpha})`;
        ctx.shadowColor = `hsla(${s.hue}, 100%, 65%, 0.8)`;
        ctx.shadowBlur = 4;
      } else {
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      }
      ctx.beginPath();
      ctx.arc(drawX, drawY, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Draw Shooting Stars
  for (let i = shootingStars.length - 1; i >= 0; i--) {
    const ss = shootingStars[i];
    ss.x += ss.dx;
    ss.y += ss.dy;
    ss.life -= ss.decay;

    if (ss.life <= 0) {
      shootingStars.splice(i, 1);
      continue;
    }

    const tailX = ss.x - (ss.dx / Math.hypot(ss.dx, ss.dy)) * ss.length;
    const tailY = ss.y - (ss.dy / Math.hypot(ss.dx, ss.dy)) * ss.length;

    const grad = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
    grad.addColorStop(0, "rgba(0, 240, 255, 0)");
    grad.addColorStop(1, `rgba(255, 255, 255, ${ss.life})`);

    ctx.strokeStyle = grad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(ss.x, ss.y);
    ctx.stroke();
  }

  requestAnimationFrame(starfieldLoop);
}

/* ==========================================================================
   2. Astronaut Zero-G Physics & Draggable Mechanics
   ========================================================================== */

function initAstronautPhysics() {
  const container = document.querySelector(".astronaut-container");
  const astro = document.getElementById("draggable-astronaut");
  const tetherCanvas = document.getElementById("tether-canvas");
  if (!container || !astro || !tetherCanvas) return;

  const tetherCtx = tetherCanvas.getContext("2d");

  // Physics state
  const physics = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    rot: 0,
    vRot: 0,
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    lastX: 0,
    lastY: 0,
    lastTime: 0,
    particles: []
  };

  function resizeTether() {
    tetherCanvas.width = container.clientWidth;
    tetherCanvas.height = container.clientHeight;
  }
  window.addEventListener("resize", resizeTether);
  resizeTether();

  // Pointer Down
  function onPointerDown(clientX, clientY) {
    physics.isDragging = true;
    physics.dragStartX = clientX - physics.x;
    physics.dragStartY = clientY - physics.y;
    physics.lastX = clientX;
    physics.lastY = clientY;
    physics.lastTime = performance.now();
    physics.vx = 0;
    physics.vy = 0;

    if (window.soundEffects) {
      window.soundEffects.ensureContext();
      window.soundEffects.playClick(1000);
    }
  }

  // Pointer Move
  function onPointerMove(clientX, clientY) {
    if (!physics.isDragging) return;
    const now = performance.now();
    const dt = Math.max(1, now - physics.lastTime);

    const nextX = clientX - physics.dragStartX;
    const nextY = clientY - physics.dragStartY;

    // Track instant velocity for toss
    physics.vx = (nextX - physics.x) / (dt * 0.06);
    physics.vy = (nextY - physics.y) / (dt * 0.06);

    physics.x = nextX;
    physics.y = nextY;
    physics.rot = physics.vx * 1.5;

    physics.lastX = clientX;
    physics.lastY = clientY;
    physics.lastTime = now;

    // Emit thruster smoke when dragging fast
    if (Math.hypot(physics.vx, physics.vy) > 3) {
      spawnThrusterParticle(physics);
      if (Math.random() > 0.75 && window.soundEffects) {
        window.soundEffects.playThrusterBurst(0.1);
      }
    }
  }

  // Pointer Up
  function onPointerUp() {
    if (!physics.isDragging) return;
    physics.isDragging = false;

    // Fling spin
    physics.vRot = physics.vx * 0.4;

    // Cap velocity
    const speed = Math.hypot(physics.vx, physics.vy);
    if (speed > 18) {
      physics.vx = (physics.vx / speed) * 18;
      physics.vy = (physics.vy / speed) * 18;
    }

    if (speed > 6 && window.soundEffects) {
      window.soundEffects.playThrusterBurst(0.3);
    }
  }

  // Mouse Listeners
  astro.addEventListener("mousedown", (e) => {
    e.preventDefault();
    onPointerDown(e.clientX, e.clientY);
  });

  window.addEventListener("mousemove", (e) => {
    onPointerMove(e.clientX, e.clientY);
  });

  window.addEventListener("mouseup", onPointerUp);

  // Touch Listeners
  astro.addEventListener("touchstart", (e) => {
    const t = e.touches[0];
    if (t) onPointerDown(t.clientX, t.clientY);
  }, { passive: true });

  window.addEventListener("touchmove", (e) => {
    const t = e.touches[0];
    if (t) onPointerMove(t.clientX, t.clientY);
  }, { passive: true });

  window.addEventListener("touchend", onPointerUp);

  function spawnThrusterParticle(p) {
    const cx = tetherCanvas.width / 2 + p.x;
    const cy = tetherCanvas.height / 2 + p.y + 40;
    p.particles.push({
      x: cx + (Math.random() - 0.5) * 10,
      y: cy + (Math.random() - 0.5) * 10,
      vx: -p.vx * 0.3 + (Math.random() - 0.5) * 2,
      vy: -p.vy * 0.3 + (Math.random() - 0.5) * 2,
      life: 1,
      decay: 0.04
    });
  }

  // Physics animation loop
  function physicsLoop() {
    const boundX = tetherCanvas.width * 0.42;
    const boundY = tetherCanvas.height * 0.42;

    if (!physics.isDragging) {
      // Gentle spring tension pulling astronaut back toward home center
      const springK = 0.015;
      const damping = 0.94;

      physics.vx += -physics.x * springK;
      physics.vy += -physics.y * springK;

      physics.vx *= damping;
      physics.vy *= damping;

      physics.x += physics.vx;
      physics.y += physics.vy;

      // Soft rotation decay
      physics.vRot *= 0.96;
      physics.rot += physics.vRot;
      physics.rot *= 0.95;

      // Subtle zero-G float bobbing when mostly still
      if (Math.hypot(physics.vx, physics.vy) < 0.2) {
        physics.y += Math.sin(performance.now() * 0.002) * 0.4;
        physics.rot += Math.sin(performance.now() * 0.0015) * 0.15;
      }
    }

    // Apply transform to astronaut DOM element
    astro.style.transform = `translate(${physics.x}px, ${physics.y}px) rotate(${physics.rot}deg)`;

    // Draw flexible safety tether line & thruster particles
    tetherCtx.clearRect(0, 0, tetherCanvas.width, tetherCanvas.height);

    const anchorX = tetherCanvas.width / 2;
    const anchorY = tetherCanvas.height - 10;
    const astroX = tetherCanvas.width / 2 + physics.x;
    const astroY = tetherCanvas.height / 2 + physics.y + 20;

    // Curved bezier tether
    const ctrlX = (anchorX + astroX) / 2 + Math.sin(performance.now() * 0.003) * 15;
    const ctrlY = (anchorY + astroY) / 2 + 35;

    tetherCtx.strokeStyle = "rgba(0, 240, 255, 0.45)";
    tetherCtx.lineWidth = 2.5;
    tetherCtx.beginPath();
    tetherCtx.moveTo(anchorX, anchorY);
    tetherCtx.quadraticCurveTo(ctrlX, ctrlY, astroX, astroY);
    tetherCtx.stroke();

    // Thruster particles
    for (let i = physics.particles.length - 1; i >= 0; i--) {
      const pt = physics.particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life -= pt.decay;

      if (pt.life <= 0) {
        physics.particles.splice(i, 1);
        continue;
      }

      tetherCtx.save();
      tetherCtx.fillStyle = `rgba(0, 240, 255, ${pt.life * 0.8})`;
      tetherCtx.shadowColor = "#00f0ff";
      tetherCtx.shadowBlur = 8;
      tetherCtx.beginPath();
      tetherCtx.arc(pt.x, pt.y, pt.life * 4, 0, Math.PI * 2);
      tetherCtx.fill();
      tetherCtx.restore();
    }

    requestAnimationFrame(physicsLoop);
  }

  requestAnimationFrame(physicsLoop);
}

/* ==========================================================================
   3. 3D Tilt on "404" & Glitch Trigger
   ========================================================================== */

function initHeroTilt() {
  const glitch = document.getElementById("glitch-404");
  if (!glitch) return;

  window.addEventListener("mousemove", (e) => {
    const rect = glitch.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (window.innerWidth / 2);
    const dy = (e.clientY - cy) / (window.innerHeight / 2);

    glitch.style.transform = `perspective(600px) rotateY(${dx * 16}deg) rotateX(${-dy * 16}deg)`;
  });

  // Clicking 404 triggers glitch audio and quick shake
  glitch.addEventListener("click", () => {
    if (window.soundEffects) {
      window.soundEffects.ensureContext();
      window.soundEffects.playGlitch();
    }
    glitch.classList.add("glitching");
    setTimeout(() => glitch.classList.remove("glitching"), 400);
  });
}

/* ==========================================================================
   4. Diagnostic Cyber Terminal
   ========================================================================== */

function initTerminal() {
  const drawer = document.getElementById("terminal-drawer");
  const header = document.getElementById("terminal-header");
  const body = document.getElementById("terminal-body");
  const input = document.getElementById("terminal-input");
  const toggleIcon = document.getElementById("terminal-toggle-icon");
  if (!drawer || !header || !input) return;

  header.addEventListener("click", () => {
    drawer.classList.toggle("collapsed");
    if (toggleIcon) {
      toggleIcon.textContent = drawer.classList.contains("collapsed") ? "[+]" : "[-]";
    }
    if (!drawer.classList.contains("collapsed")) {
      input.focus();
    }
  });

  const cmdHistory = [];
  let historyIdx = -1;

  function appendLog(text, type = "system") {
    const line = document.createElement("div");
    line.className = `terminal-log ${type}`;
    line.textContent = text;
    body.appendChild(line);
    body.scrollTop = body.scrollHeight;
  }

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const val = input.value.trim();
      input.value = "";
      if (!val) return;

      cmdHistory.push(val);
      historyIdx = cmdHistory.length;

      appendLog(`> ${val}`, "prompt-echo");
      if (window.soundEffects) window.soundEffects.playClick(1400);
      handleTerminalCommand(val, appendLog);
    } else if (e.key === "ArrowUp") {
      if (historyIdx > 0) {
        historyIdx--;
        input.value = cmdHistory[historyIdx] || "";
      }
    } else if (e.key === "ArrowDown") {
      if (historyIdx < cmdHistory.length - 1) {
        historyIdx++;
        input.value = cmdHistory[historyIdx] || "";
      } else {
        historyIdx = cmdHistory.length;
        input.value = "";
      }
    }
  });
}

function handleTerminalCommand(rawCmd, log) {
  const parts = rawCmd.toLowerCase().split(" ");
  const cmd = parts[0];
  const arg = parts[1];

  switch (cmd) {
    case "help":
      log("Available Terminal Commands:", "system");
      log("  scan          - Probe deep space for active routes", "system");
      log("  ping          - Test subspace beacon latency", "system");
      log("  warp / home   - Engage hyperspace jump back to home", "system");
      log("  game          - Launch Sector 404 Rescue Probe", "system");
      log("  theme <name>  - Set theme: 'cosmos', 'cyberpunk', or 'crt'", "system");
      log("  radar         - Emit sonar ping", "system");
      log("  clear         - Wipe terminal display", "system");
      break;

    case "scan":
      log("INITIATING SECTOR SCAN...", "system");
      setTimeout(() => {
        log("[OK] Signal cluster located: Home Base (100% integrity)", "success");
        log("[OK] Signal cluster located: Documentation (98% integrity)", "success");
        log("[OK] Signal cluster located: Support Hub (100% integrity)", "success");
        log("[404] Requested URL packet not found in local sector.", "error");
      }, 300);
      break;

    case "ping":
      log("PINGING HOME BASE [127.0.0.1]...", "system");
      setTimeout(() => {
        const ms = Math.floor(Math.random() * 25 + 8);
        log(`64 bytes from home: icmp_seq=1 ttl=64 time=${ms}ms`, "success");
        if (window.soundEffects) window.soundEffects.playRadarPing();
      }, 250);
      break;

    case "radar":
      log("TRANSMITTING SONAR PULSE...", "system");
      if (window.soundEffects) window.soundEffects.playRadarPing();
      break;

    case "warp":
    case "home":
      log("ENGAGING WARP DRIVE IN 3 SECONDS...", "warning");
      triggerWarpSequence();
      break;

    case "game":
    case "rescue":
      log("LAUNCHING SECTOR 404 RESCUE MODULE...", "success");
      if (window.sectorRescueGame) window.sectorRescueGame.open();
      break;

    case "theme":
      if (["cosmos", "cyberpunk", "crt"].includes(arg)) {
        setTheme(arg);
        log(`THEME SWITCHED TO [${arg.toUpperCase()}]`, "success");
      } else {
        log("Invalid theme! Usage: theme cosmos | cyberpunk | crt", "error");
      }
      break;

    case "clear":
      const body = document.getElementById("terminal-body");
      if (body) {
        body.innerHTML = `
          <div class="terminal-log system">[DIAGNOSTIC CONSOLE INITIALIZED]</div>
          <div class="terminal-log system">Type 'help' for available commands.</div>
        `;
      }
      break;

    default:
      log(`Command not recognized: '${cmd}'. Type 'help' for list.`, "error");
  }
}

/* ==========================================================================
   5. Warp Drive Hyperspace Sequence
   ========================================================================== */

function triggerWarpSequence() {
  if (starfieldState.isWarping) return;
  starfieldState.isWarping = true;
  starfieldState.warpFactor = 1;

  if (window.soundEffects) {
    window.soundEffects.ensureContext();
    window.soundEffects.playWarpJump();
  }

  // Gradually accelerate stars
  const interval = setInterval(() => {
    starfieldState.warpFactor += 0.8;
  }, 100);

  const overlay = document.getElementById("warp-overlay");
  setTimeout(() => {
    if (overlay) overlay.classList.add("active");
  }, 1100);

  setTimeout(() => {
    clearInterval(interval);
    // Navigate home
    window.location.href = "/";
  }, 1800);
}

// Attach Warp Home Button
document.addEventListener("DOMContentLoaded", () => {
  const warpBtn = document.getElementById("warp-home-btn");
  if (warpBtn) {
    warpBtn.addEventListener("click", (e) => {
      e.preventDefault();
      triggerWarpSequence();
    });
  }

  const openTerminalBtn = document.getElementById("open-terminal-btn");
  if (openTerminalBtn) {
    openTerminalBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const drawer = document.getElementById("terminal-drawer");
      const input = document.getElementById("terminal-input");
      if (drawer) {
        drawer.classList.remove("collapsed");
        if (input) input.focus();
      }
    });
  }

  const launchGameBtn = document.getElementById("launch-game-btn");
  if (launchGameBtn) {
    launchGameBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (window.sectorRescueGame) window.sectorRescueGame.open();
    });
  }

  const hudGameBtn = document.getElementById("hud-game-btn");
  if (hudGameBtn) {
    hudGameBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (window.sectorRescueGame) window.sectorRescueGame.open();
    });
  }
});

/* ==========================================================================
   6. Search & Autocomplete
   ========================================================================== */

function initSearch() {
  const searchInput = document.getElementById("site-search-input");
  const quickLinks = document.getElementById("quick-links");
  if (!searchInput || !quickLinks) return;

  const routes = [
    { title: "Home Base", url: "/", tags: ["home", "landing", "main"] },
    { title: "Mission Docs", url: "/docs", tags: ["docs", "documentation", "guide", "api"] },
    { title: "Telemetry Dashboard", url: "/dashboard", tags: ["dashboard", "metrics", "analytics"] },
    { title: "Pricing Plans", url: "/pricing", tags: ["pricing", "plans", "cost", "billing"] },
    { title: "Subspace Support", url: "/support", tags: ["support", "help", "contact", "bug"] },
    { title: "System Status", url: "/status", tags: ["status", "health", "uptime", "server"] }
  ];

  searchInput.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase().trim();
    if (!q) {
      renderQuickLinks(routes);
      return;
    }

    const matches = routes.filter((r) => 
      r.title.toLowerCase().includes(q) ||
      r.tags.some(tag => tag.includes(q))
    );

    renderQuickLinks(matches.length > 0 ? matches : [{ title: "No coordinates match. Try 'warp'", url: "#" }]);
  });

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const q = searchInput.value.toLowerCase().trim();
      const match = routes.find(r => r.title.toLowerCase().includes(q) || r.tags.includes(q));
      if (match && match.url !== "#") {
        window.location.href = match.url;
      }
    }
  });

  function renderQuickLinks(list) {
    quickLinks.innerHTML = "";
    list.forEach((item) => {
      const a = document.createElement("a");
      a.className = "quick-tag";
      a.href = item.url;
      a.textContent = item.title;
      quickLinks.appendChild(a);
    });
  }
}

/* ==========================================================================
   7. Theme Manager
   ========================================================================== */

function initThemeManager() {
  const themeSelect = document.getElementById("theme-select");
  const savedTheme = localStorage.getItem("sector404_theme") || "cosmos";

  setTheme(savedTheme);
  if (themeSelect) {
    themeSelect.value = savedTheme;
    themeSelect.addEventListener("change", (e) => {
      setTheme(e.target.value);
    });
  }
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("sector404_theme", theme);
  const themeSelect = document.getElementById("theme-select");
  if (themeSelect) themeSelect.value = theme;
}

/* ==========================================================================
   8. Audio Control Button
   ========================================================================== */

function initAudioControls() {
  const audioBtn = document.getElementById("audio-toggle-btn");
  if (!audioBtn) return;

  audioBtn.addEventListener("click", () => {
    if (!window.soundEffects) return;
    const isMuted = window.soundEffects.toggleMute();
    audioBtn.classList.toggle("muted", isMuted);
    const label = audioBtn.querySelector(".audio-label");
    if (label) label.textContent = isMuted ? "Sound: Off" : "Sound: On";
  });
}

/* ==========================================================================
   9. HUD Telemetry Live Variance Clock
   ========================================================================== */

function initTelemetryClock() {
  const coordsEl = document.getElementById("telemetry-coords");
  if (!coordsEl) return;

  setInterval(() => {
    const lat = (40.404 + (Math.random() - 0.5) * 0.005).toFixed(4);
    const lng = (0.000 + (Math.random() - 0.5) * 0.005).toFixed(4);
    coordsEl.textContent = `[${lat}°, ${lng}°]`;
  }, 2000);
}
