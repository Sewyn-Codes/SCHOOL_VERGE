# 🌌 Sector 404 - Creative Deep Space 404 Landing Page

A creative, interactive, and gamified 404 Error Landing Page designed to transform a dead end into an engaging zero-gravity exploration experience.

---

## 🚀 Features

- **Dynamic Interactive Starfield**:
  - Fullscreen 3D-projected starfield with cosmic dust and shooting stars.
  - Interactive gravitational cursor lensing: moving your cursor or finger gently bends nearby stars.
  - Hyperdrive warp speed animation when returning home.

- **Zero-Gravity Draggable Astronaut**:
  - Custom high-fidelity inline SVG astronaut with reflective visor and chest control pack.
  - Draggable with inertia and spring physics: fling the astronaut across the screen with real momentum!
  - Realistic thruster particle exhaust that fires whenever velocity increases.

- **Procedural Sci-Fi Web Audio Synthesizer**:
  - 100% self-contained Web Audio API sound generator (requires zero MP3 files or external CDN requests).
  - Ambient deep-space drone with smooth fade-in/fade-out.
  - Sonar radar pings, thruster hisses, cyber UI clicks, glitch pops, and warp hyperspace jumps.

- **Integrated Arcade Mini-Game ("Sector 404 Rescue")**:
  - Collect lost HTTP packets and SSL beacons while evading swirling quantum anomalies.
  - Supports keyboard (WASD / Arrows) and mouse/touch steering.
  - Persistent high score saved to `localStorage`.

- **Diagnostic Cyber Console Terminal**:
  - Interactive command line with history navigation (Up/Down arrows).
  - Commands: `help`, `scan`, `ping`, `warp`, `game`, `theme <name>`, `radar`, `clear`.

- **Multi-Theme Switcher**:
  - **🌌 Deep Cosmos**: Dark obsidian, nebula purple, cyan starlight.
  - **⚡ Cyberpunk Neon**: High-contrast electric pink, cyan, and deep violet.
  - **📟 Retro CRT Green**: Vintage 1980s monochrome green terminal with authentic scanlines.

- **Search & Quick Navigation**:
  - Filterable search bar with autocomplete suggestions for popular destinations.

---

## 📁 File Structure

```text
404 error/
├── index.html     # Semantic HTML5 layout and custom SVG astronaut
├── style.css      # Sci-fi design system, glassmorphism, responsive styles & themes
├── script.js      # Starfield canvas, astronaut physics, terminal & orchestrator
├── audio.js       # Web Audio API procedural sound synthesizer
├── game.js        # Sector 404 Rescue arcade mini-game engine
└── README.md      # Documentation and integration guide
```

---

## 🛠️ Quick Start

Simply open `index.html` in any modern web browser:

```bash
# Option 1: Double-click index.html in file explorer

# Option 2: Run with Python's built-in HTTP server
python -m http.server 3000

# Option 3: Run with Node.js npx serve
npx serve .
```

---

## 🌐 Production Deployment

### 1. Nginx
Add this directive inside your `server` block:
```nginx
error_page 404 /404 error/index.html;
```

### 2. Apache (`.htaccess`)
```apache
ErrorDocument 404 /404\ error/index.html
```

### 3. Netlify (`netlify.toml` or `_redirects`)
```text
/*  /404 error/index.html  404
```

### 4. Vercel (`vercel.json`)
```json
{
  "routes": [
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/404 error/index.html", "status": 404 }
  ]
}
```

### 5. GitHub Pages
Rename or duplicate `index.html` to `404.html` in the root of your repository.
