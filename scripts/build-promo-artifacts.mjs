import fs from "node:fs";
import path from "node:path";

const ARTIFACT_DIR = "C:/Users/blcne/.gemini/antigravity/brain/b6616799-bffa-4bbf-8173-e770c2f667aa";
const BRAND_MARK_PATH =
  "M51.83 99.91C50.87 99.80 49.92 99.44 49 98.82C48.69 98.61 40.11 90.10 26.99 76.99L5.49 55.49L6.61 55.43C8.22 55.35 8.80 55.22 10.09 54.62C11.16 54.12 11.71 53.65 14.66 50.70C16.28 49.09 17.65 47.77 17.71 47.77C17.77 47.77 24.90 54.85 33.57 63.51C44.27 74.20 49.50 79.37 49.86 79.60C50.99 80.33 52.12 80.66 53.48 80.66C54.95 80.66 56.27 80.21 57.41 79.33C58.15 78.76 59.38 77.44 59.76 76.81C60.65 75.34 60.94 73.54 60.53 71.95C60.10 70.25 59.83 69.90 56.28 66.34C54.60 64.64 53.21 63.22 53.21 63.19C53.21 63.15 53.63 63.12 54.14 63.12C55.57 63.12 56.65 62.87 57.90 62.25C58.93 61.74 59.39 61.33 62.41 58.33C64.01 56.75 65.36 55.45 65.41 55.45C65.52 55.45 78.47 68.43 78.77 68.84C80.32 70.99 80.39 73.97 78.96 76.25C78.51 76.95 57.13 98.35 56.34 98.88C55.08 99.73 53.48 100.09 51.83 99.91ZM52.63 61.35C51.86 61.14 51.12 60.81 50.56 60.44C50.33 60.28 45.77 55.80 40.45 50.48C35.12 45.16 30.62 40.70 30.45 40.58C28.63 39.24 26.15 38.91 24.10 39.75C22.96 40.21 22.54 40.59 16.48 46.63C12.38 50.72 10.42 52.61 10.07 52.83C7.51 54.38 4.33 54.11 2.22 52.15C0.94 50.98 0.35 49.88 0.08 48.22C-0.17 46.65 0.23 44.94 1.18 43.54C1.66 42.83 42.84 1.65 43.56 1.17C44.71 0.38 45.75 0.07 47.23 0.06C48.73 0.05 49.83 0.37 50.97 1.15C51.70 1.65 79.87 29.82 80.37 30.55C81.19 31.76 81.46 32.70 81.46 34.29C81.46 35.40 81.43 35.56 81.18 36.32C81.02 36.78 80.71 37.44 80.48 37.80C80.16 38.30 77.84 40.68 69.34 49.18C57.65 60.89 57.92 60.64 56.35 61.19C55.67 61.43 55.44 61.46 54.42 61.49C53.49 61.51 53.13 61.48 52.63 61.35ZM91.65 59.95C91.55 59.93 91.25 59.86 90.98 59.81C90.39 59.69 89.20 59.11 88.71 58.71C88 58.13 75.44 45.50 75.47 45.39C75.48 45.32 76.80 43.96 78.40 42.35C80 40.74 81.47 39.18 81.67 38.88C82.15 38.17 82.53 37.39 82.72 36.74C82.81 36.45 82.92 36.08 82.96 35.94C83.01 35.79 83.07 35.13 83.09 34.47C83.11 33.82 83.14 33.26 83.16 33.24C83.18 33.22 86.66 36.67 90.89 40.90C98.83 48.85 99.11 49.16 99.49 50.22C99.78 51.05 99.83 51.24 99.92 52.01C100.11 53.48 99.69 55.11 98.81 56.45C98.29 57.23 96.57 58.83 95.84 59.21C94.78 59.77 94.19 59.92 92.95 59.96C92.33 59.98 91.75 59.97 91.65 59.95ZM56.59 42.05C57.93 41.69 59.06 40.97 60.23 39.71C61.65 38.19 62.19 36.87 62.18 34.96C62.18 34.03 62.15 33.78 61.93 33.12C61.42 31.56 61.52 31.68 55.86 26C53 23.13 50.50 20.67 50.30 20.53C49.75 20.15 48.72 19.65 48.14 19.49C47.42 19.29 45.67 19.29 44.93 19.49C43.44 19.89 42.50 20.54 40.94 22.23C39.87 23.39 39.30 24.88 39.29 26.49C39.28 27.97 39.61 29.03 40.42 30.21C40.80 30.76 50.37 40.39 51.07 40.92C51.76 41.45 52.34 41.74 53.22 42C54.22 42.30 55.58 42.32 56.59 42.05Z";

const rawAssets = JSON.parse(fs.readFileSync("lib/promo-assets.json", "utf8"));

const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Prajesh Shakya — Portfolio 2026 Promo Video Studio</title>
  <script src="https://www.gstatic.com/antigravity/web/dev/tailwindcss.min.js"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600&family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');
    
    :root {
      --bg-ground: #F5F5F3;
      --bg-ink: #1B1A16;
      --text-ink: #1B1A16;
      --text-soft: #45443D;
      --kicker: #6F6D63;
      --hairline: #D9D7CD;
      --border-dark: #3A3932;
    }
    
    .font-serif-brand {
      font-family: 'Instrument Serif', Georgia, serif;
    }
    
    .font-sans-brand {
      font-family: 'Instrument Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    
    .font-mono-brand {
      font-family: 'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
    }
    
    /* Custom Scrubber Track */
    input[type=range] {
      -webkit-appearance: none;
      background: transparent;
    }
    input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none;
      height: 16px;
      width: 16px;
      border-radius: 9999px;
      background: #1B1A16;
      cursor: pointer;
      margin-top: -6px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      border: 2px solid #F5F5F3;
    }
    input[type=range]::-webkit-slider-runnable-track {
      width: 100%;
      height: 4px;
      cursor: pointer;
      background: #D9D7CD;
      border-radius: 2px;
    }
    
    .pulse-record {
      animation: pulseRecord 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    @keyframes pulseRecord {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(1.1); }
    }
  </style>
</head>
<body class="bg-transparent text-[var(--foreground)] antialiased p-3 sm:p-5 font-sans-brand">
  <div class="max-w-6xl mx-auto bg-[var(--card,#F5F5F3)] text-[var(--foreground,#1B1A16)] border border-[var(--border,#D9D7CD)] rounded-xl shadow-lg overflow-hidden">
    
    <!-- Header Bar -->
    <header class="px-5 py-4 border-b border-[var(--border,#D9D7CD)] flex flex-wrap items-center justify-between gap-4 bg-[var(--background,#F5F5F3)]">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-md bg-[#1B1A16] text-[#F5F5F3] flex items-center justify-center p-1.5 shadow-sm">
          <svg viewBox="0 0 100 100" fill="currentColor" class="w-full h-full">
            <path fill-rule="evenodd" d="${BRAND_MARK_PATH}" />
          </svg>
        </div>
        <div>
          <h1 class="text-base font-semibold tracking-tight text-[#1B1A16] flex items-center gap-2">
            Prajesh Shakya
            <span class="text-xs px-2 py-0.5 rounded-full font-mono-brand border border-[#D9D7CD] bg-[#ECEBE5] text-[#45443D]">Promo Studio 2026</span>
          </h1>
          <p class="text-xs text-[#6F6D63] font-mono-brand">1080p 60fps · Canvas & Web Audio Motion Exporter</p>
        </div>
      </div>

      <!-- Quick Action Controls -->
      <div class="flex items-center flex-wrap gap-2 text-xs">
        <!-- Aspect Ratio Selector -->
        <div class="flex items-center bg-[#ECEBE5] p-1 rounded-lg border border-[#D9D7CD]">
          <button id="ratio-16-9" onclick="setAspectRatio('16:9')" class="px-2.5 py-1 rounded font-medium bg-[#1B1A16] text-[#F5F5F3] transition-all">16:9 Landscape</button>
          <button id="ratio-9-16" onclick="setAspectRatio('9:16')" class="px-2.5 py-1 rounded font-medium text-[#45443D] hover:text-[#1B1A16] transition-all">9:16 Reels</button>
          <button id="ratio-1-1" onclick="setAspectRatio('1:1')" class="px-2.5 py-1 rounded font-medium text-[#45443D] hover:text-[#1B1A16] transition-all">1:1 Square</button>
        </div>

        <!-- Audio Toggle -->
        <button id="audio-toggle" onclick="toggleAudio()" class="px-3 py-1.5 rounded-lg border border-[#D9D7CD] bg-[#ECEBE5] hover:bg-[#D9D7CD]/50 font-mono-brand flex items-center gap-1.5 transition">
          <span id="audio-icon">🔊</span>
          <span id="audio-label">Sound ON</span>
        </button>

        <!-- Record / Export Video Button -->
        <button id="export-btn" onclick="startExport()" class="px-4 py-1.5 rounded-lg bg-[#1B1A16] hover:bg-black text-[#F5F5F3] font-medium flex items-center gap-2 shadow-sm transition">
          <span id="record-dot" class="w-2.5 h-2.5 rounded-full bg-red-500"></span>
          <span id="record-label">Export MP4/WebM</span>
        </button>
      </div>
    </header>

    <!-- Main Player Stage -->
    <main class="p-4 sm:p-6 flex flex-col items-center bg-[#ECEBE5]/40">
      
      <!-- Viewport Frame Box -->
      <div id="canvas-container" class="relative w-full max-w-4xl bg-black rounded-lg overflow-hidden shadow-2xl border border-[#D9D7CD] flex items-center justify-center transition-all duration-300" style="aspect-ratio: 16 / 9;">
        
        <canvas id="promoCanvas" class="w-full h-full object-contain cursor-pointer" onclick="togglePlay()"></canvas>

        <!-- Live Overlay Status Badge -->
        <div class="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
          <span id="live-scene-badge" class="px-2.5 py-1 rounded font-mono-brand text-[11px] uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/20">
            SCENE 01 / GENESIS
          </span>
          <span id="live-rec-badge" class="hidden px-2 py-0.5 rounded font-mono-brand text-[10px] uppercase font-bold tracking-widest bg-red-600 text-white flex items-center gap-1.5 shadow">
            <span class="w-2 h-2 rounded-full bg-white pulse-record"></span> REC 60 FPS
          </span>
        </div>

        <div class="absolute top-3 right-3 pointer-events-none">
          <span class="px-2.5 py-1 rounded font-mono-brand text-[11px] bg-black/60 backdrop-blur-md text-[#ECEBE5] border border-white/20">
            PRARESH SHAKYA © 2026
          </span>
        </div>

        <!-- Big Play Button Overlay when Paused -->
        <div id="play-overlay" onclick="togglePlay()" class="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/10 cursor-pointer transition">
          <div class="w-16 h-16 rounded-full bg-[#1B1A16]/90 border border-white/20 text-[#F5F5F3] flex items-center justify-center shadow-xl hover:scale-105 transition">
            <svg id="play-overlay-icon" class="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Video Control Deck -->
      <div class="w-full max-w-4xl mt-4 bg-[var(--background,#F5F5F3)] p-4 rounded-xl border border-[var(--border,#D9D7CD)] shadow-sm">
        
        <!-- Timeline Slider & Time Display -->
        <div class="flex items-center gap-3">
          <span id="time-current" class="text-xs font-mono-brand font-medium w-12 text-[#1B1A16]">00:00</span>
          <div class="relative flex-1 flex items-center">
            <input type="range" id="timeline" min="0" max="42" step="0.05" value="0" class="w-full h-2" oninput="onSeek(this.value)">
          </div>
          <span class="text-xs font-mono-brand text-[#6F6D63] w-12 text-right">00:42</span>
        </div>

        <!-- Secondary Controls: Play/Pause, Scene Jumping, Speed -->
        <div class="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#D9D7CD]/60">
          <div class="flex items-center gap-2">
            <button id="play-btn" onclick="togglePlay()" class="w-8 h-8 rounded-lg bg-[#1B1A16] text-[#F5F5F3] flex items-center justify-center hover:bg-black transition">
              <svg id="play-btn-icon" class="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </button>
            <button onclick="restartVideo()" class="p-1.5 rounded-lg border border-[#D9D7CD] hover:bg-[#ECEBE5] text-[#45443D] text-xs font-mono-brand flex items-center gap-1 transition" title="Replay">
              ↺ Reset
            </button>
          </div>

          <!-- Scene Quick Select Pills -->
          <div class="flex items-center gap-1.5 overflow-x-auto text-xs py-1">
            <button onclick="jumpTo(0)" class="scene-tab px-2.5 py-1 rounded-md border border-[#D9D7CD] bg-[#1B1A16] text-[#F5F5F3] font-mono-brand whitespace-nowrap transition">01 Genesis</button>
            <button onclick="jumpTo(7.5)" class="scene-tab px-2.5 py-1 rounded-md border border-[#D9D7CD] bg-transparent text-[#45443D] hover:bg-[#ECEBE5] font-mono-brand whitespace-nowrap transition">02 Aurora</button>
            <button onclick="jumpTo(16.5)" class="scene-tab px-2.5 py-1 rounded-md border border-[#D9D7CD] bg-transparent text-[#45443D] hover:bg-[#ECEBE5] font-mono-brand whitespace-nowrap transition">03 Atlas</button>
            <button onclick="jumpTo(25.5)" class="scene-tab px-2.5 py-1 rounded-md border border-[#D9D7CD] bg-transparent text-[#45443D] hover:bg-[#ECEBE5] font-mono-brand whitespace-nowrap transition">04 Studio</button>
            <button onclick="jumpTo(34.0)" class="scene-tab px-2.5 py-1 rounded-md border border-[#D9D7CD] bg-transparent text-[#45443D] hover:bg-[#ECEBE5] font-mono-brand whitespace-nowrap transition">05 Outro</button>
          </div>

          <!-- Speed & Fullscreen -->
          <div class="flex items-center gap-2 text-xs font-mono-brand text-[#45443D]">
            <span>Speed:</span>
            <select id="playback-rate" onchange="setPlaybackRate(this.value)" class="bg-[#ECEBE5] border border-[#D9D7CD] rounded px-2 py-1 text-xs outline-none">
              <option value="1">1.0x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
            </select>
          </div>
        </div>

      </div>

    </main>

    <!-- Scene Breakdown & Marketing Guide -->
    <footer class="p-5 border-t border-[var(--border,#D9D7CD)] bg-[var(--background,#F5F5F3)] grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[#45443D]">
      <div>
        <h3 class="font-semibold text-[#1B1A16] mb-1.5 uppercase font-mono-brand tracking-wider">Cinematic Narrative</h3>
        <p class="leading-relaxed">
          5-scene editorial promo showing the interlocking PS Monogram, flagship case studies (Aurora Wellness & Atlas Ventures $120M fund rebrand), the proprietary Content Studio, and client moodboards.
        </p>
      </div>
      <div>
        <h3 class="font-semibold text-[#1B1A16] mb-1.5 uppercase font-mono-brand tracking-wider">Direct Social Export</h3>
        <p class="leading-relaxed">
          Switch between <strong>16:9</strong> (Homepage Video Showcase & YouTube), <strong>9:16</strong> (Instagram Reels & TikTok), and <strong>1:1</strong> (LinkedIn Feed). Click "Export MP4/WebM" to record and download high-bitrate video with procedural audio.
        </p>
      </div>
      <div>
        <h3 class="font-semibold text-[#1B1A16] mb-1.5 uppercase font-mono-brand tracking-wider">Homepage Integration</h3>
        <p class="leading-relaxed">
          The exported video can be directly uploaded to <code class="bg-[#ECEBE5] px-1 py-0.5 rounded text-[#1B1A16]">/admin/showcase</code> to activate the homepage hero showcase video slot on <a href="https://shakyaprajesh.com.np" target="_blank" class="underline text-[#1B1A16]">shakyaprajesh.com.np</a>.
        </p>
      </div>
    </footer>

  </div>

  <script>
    // Embedded Project Assets & Brand Geometry
    const BRAND_MARK_PATH_STR = "${BRAND_MARK_PATH}";
    const brandMarkPath2D = new Path2D(BRAND_MARK_PATH_STR);
    const ASSETS = ${JSON.stringify(rawAssets)};

    // Preload image elements
    const images = {};
    for (const [key, b64] of Object.entries(ASSETS)) {
      const img = new Image();
      img.src = b64;
      images[key] = img;
    }

    // Canvas & State Setup
    const canvas = document.getElementById('promoCanvas');
    const ctx = canvas.getContext('2d');
    const container = document.getElementById('canvas-container');
    
    let currentRatio = '16:9';
    let duration = 42.0; // 42 seconds
    let currentTime = 0;
    let isPlaying = false;
    let isRecording = false;
    let playbackSpeed = 1.0;
    let lastTimestamp = null;
    let currentSceneIdx = -1;
    let mediaRecorder = null;
    let recordedChunks = [];

    // Aspect Ratio Configuration
    const RATIO_SPECS = {
      '16:9': { width: 1920, height: 1080, aspect: '16 / 9' },
      '9:16': { width: 1080, height: 1920, aspect: '9 / 16', maxW: 'max-w-md' },
      '1:1':  { width: 1080, height: 1080, aspect: '1 / 1', maxW: 'max-w-xl' }
    };

    function updateCanvasResolution() {
      const spec = RATIO_SPECS[currentRatio];
      canvas.width = spec.width;
      canvas.height = spec.height;
      container.style.aspectRatio = spec.aspect;
      if (spec.maxW) {
        container.className = \`relative w-full \${spec.maxW} bg-black rounded-lg overflow-hidden shadow-2xl border border-[#D9D7CD] flex items-center justify-center transition-all duration-300\`;
      } else {
        container.className = 'relative w-full max-w-4xl bg-black rounded-lg overflow-hidden shadow-2xl border border-[#D9D7CD] flex items-center justify-center transition-all duration-300';
      }
      renderFrame(currentTime);
    }

    function setAspectRatio(ratio) {
      if (!RATIO_SPECS[ratio]) return;
      currentRatio = ratio;
      ['16-9', '9-16', '1-1'].forEach(r => {
        const btn = document.getElementById('ratio-' + r);
        if (r === ratio.replace(':', '-')) {
          btn.className = 'px-2.5 py-1 rounded font-medium bg-[#1B1A16] text-[#F5F5F3] transition-all';
        } else {
          btn.className = 'px-2.5 py-1 rounded font-medium text-[#45443D] hover:text-[#1B1A16] transition-all';
        }
      });
      updateCanvasResolution();
    }

    // Audio Engine via Web Audio API
    class AudioEngine {
      constructor() {
        this.ctx = null;
        this.muted = false;
        this.masterGain = null;
        this.dest = null;
      }
      init() {
        if (this.ctx) return;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
        this.dest = this.ctx.createMediaStreamDestination();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
        this.masterGain.connect(this.dest);
      }
      toggleMute() {
        this.muted = !this.muted;
        if (this.masterGain) {
          this.masterGain.gain.setValueAtTime(this.muted ? 0 : 0.4, this.ctx ? this.ctx.currentTime : 0);
        }
        return !this.muted;
      }
      playTransition(sceneIndex) {
        if (!this.ctx || this.muted) return;
        const t = this.ctx.currentTime;
        
        // Deep sub-bass drop
        const sub = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        sub.type = 'sine';
        const freqs = [65.4, 73.4, 55.0, 82.4, 65.4];
        const f0 = freqs[sceneIndex % freqs.length];
        sub.frequency.setValueAtTime(f0 * 1.5, t);
        sub.frequency.exponentialRampToValueAtTime(f0, t + 0.35);
        subGain.gain.setValueAtTime(0, t);
        subGain.gain.linearRampToValueAtTime(0.45, t + 0.04);
        subGain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
        sub.connect(subGain);
        subGain.connect(this.masterGain);
        sub.start(t);
        sub.stop(t + 1.3);

        // Tactile high-frequency tick / shutter
        const tick = this.ctx.createOscillator();
        const tickGain = this.ctx.createGain();
        tick.type = 'triangle';
        tick.frequency.setValueAtTime(1400, t);
        tick.frequency.exponentialRampToValueAtTime(300, t + 0.05);
        tickGain.gain.setValueAtTime(0.18, t);
        tickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
        tick.connect(tickGain);
        tickGain.connect(this.masterGain);
        tick.start(t);
        tick.stop(t + 0.07);

        // Warm harmonic chord
        const chord = [
          [261.63, 329.63, 392.0],
          [220.00, 261.63, 329.63],
          [174.61, 220.00, 261.63],
          [196.00, 246.94, 293.66],
          [261.63, 392.00, 523.25]
        ][sceneIndex % 5];
        
        chord.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const filter = this.ctx.createBiquadFilter();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, t);
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(350 + idx * 120, t);
          filter.frequency.linearRampToValueAtTime(650 + idx * 150, t + 1.0);
          filter.frequency.exponentialRampToValueAtTime(150, t + 3.0);
          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(0.05, t + 0.3);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);
          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.masterGain);
          osc.start(t);
          osc.stop(t + 3.3);
        });
      }
    }
    const audio = new AudioEngine();

    function toggleAudio() {
      audio.init();
      const isSoundOn = audio.toggleMute();
      document.getElementById('audio-icon').textContent = isSoundOn ? '🔊' : '🔇';
      document.getElementById('audio-label').textContent = isSoundOn ? 'Sound ON' : 'Sound OFF';
    }

    // Easing helpers
    function easeOutCubic(t) { return 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3); }
    function easeInOutCubic(t) { 
      t = Math.max(0, Math.min(1, t));
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; 
    }

    // Helper: Draw Ken Burns Image
    function drawKenBurns(ctx, img, x, y, w, h, progress, maxZoom = 1.08, radius = 8) {
      ctx.save();
      if (radius > 0) {
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, radius);
        ctx.clip();
      }
      if (!img || !img.complete || img.naturalWidth === 0) {
        ctx.fillStyle = '#2A2925';
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#8B897F';
        ctx.font = '16px "Geist Mono", monospace';
        ctx.fillText('LOADING ASSET...', x + 20, y + h/2);
        ctx.restore();
        return;
      }
      const zoom = 1 + (maxZoom - 1) * progress;
      const panX = (progress - 0.5) * 24;
      const panY = (progress - 0.5) * 16;
      const destW = w * zoom;
      const destH = h * zoom;
      const destX = x - (destW - w) / 2 + panX;
      const destY = y - (destH - h) / 2 + panY;

      const imgAspect = img.naturalWidth / img.naturalHeight;
      const boxAspect = destW / destH;
      let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
      if (imgAspect > boxAspect) {
        sw = img.naturalHeight * boxAspect;
        sx = (img.naturalWidth - sw) / 2;
      } else {
        sh = img.naturalWidth / boxAspect;
        sy = (img.naturalHeight - sh) / 2;
      }
      ctx.drawImage(img, sx, sy, sw, sh, destX, destY, destW, destH);

      // Subtle editorial vignette
      const grad = ctx.createLinearGradient(x, y, x, y + h);
      grad.addColorStop(0, 'rgba(0,0,0,0.02)');
      grad.addColorStop(0.7, 'rgba(0,0,0,0.05)');
      grad.addColorStop(1, 'rgba(0,0,0,0.35)');
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, w, h);

      ctx.restore();
    }

    // Helper: Draw Brand Mark
    function drawBrandMark(ctx, cx, cy, size, color) {
      ctx.save();
      ctx.translate(cx - size/2, cy - size/2);
      ctx.scale(size / 100, size / 100);
      ctx.fillStyle = color;
      ctx.fill(brandMarkPath2D);
      ctx.restore();
    }

    // MAIN RENDER LOOP: Renders frame at given time t (0 to 42 seconds)
    function renderFrame(t) {
      const W = canvas.width;
      const H = canvas.height;
      const isVertical = currentRatio === '9:16';
      const isSquare = currentRatio === '1:1';

      // Determine active scene
      let scene = 0;
      let sceneName = "01 / GENESIS & IDENTITY";
      if (t < 7.5) {
        scene = 0;
        sceneName = "01 / GENESIS & MONOGRAM";
      } else if (t < 16.5) {
        scene = 1;
        sceneName = "02 / CASE STUDY: AURORA";
      } else if (t < 25.5) {
        scene = 2;
        sceneName = "03 / CASE STUDY: ATLAS";
      } else if (t < 34.0) {
        scene = 3;
        sceneName = "04 / PROPRIETARY STUDIO";
      } else {
        scene = 4;
        sceneName = "05 / EDITORIAL MANIFESTO";
      }

      // Check scene transition sound trigger
      if (scene !== currentSceneIdx) {
        currentSceneIdx = scene;
        audio.playTransition(scene);
        document.getElementById('live-scene-badge').textContent = sceneName;
        // Update scene quick pills
        const pills = document.querySelectorAll('.scene-tab');
        pills.forEach((p, idx) => {
          if (idx === scene) {
            p.className = 'scene-tab px-2.5 py-1 rounded-md border border-[#D9D7CD] bg-[#1B1A16] text-[#F5F5F3] font-mono-brand whitespace-nowrap transition';
          } else {
            p.className = 'scene-tab px-2.5 py-1 rounded-md border border-[#D9D7CD] bg-transparent text-[#45443D] hover:bg-[#ECEBE5] font-mono-brand whitespace-nowrap transition';
          }
        });
      }

      // Palette definition
      const GROUND = "#F5F5F3";
      const INK = "#1B1A16";
      const INK_SOFT = "#45443D";
      const KICKER = "#6F6D63";
      const HAIRLINE = "#D9D7CD";
      const HAIRLINE_DARK = "#3A3932";

      // Clear Canvas
      ctx.save();

      // ==========================================
      // SCENE 0: GENESIS & PS MONOGRAM (0.0s - 7.5s)
      // ==========================================
      if (scene === 0) {
        const p = t / 7.5;
        const enter = easeOutCubic(p / 0.3);
        const exit = t > 6.8 ? (t - 6.8) / 0.7 : 0;

        ctx.fillStyle = GROUND;
        ctx.fillRect(0, 0, W, H);

        // Isometric drafting grid lines
        ctx.strokeStyle = "rgba(217, 215, 205, 0.45)";
        ctx.lineWidth = 1;
        const gridStep = W / 16;
        for (let x = -H; x < W + H; x += gridStep) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x + H, H);
          ctx.stroke();
        }

        // Monogram scale & reveal
        const markSize = isVertical ? 180 : 160;
        const markX = W / 2;
        const markY = isVertical ? H * 0.38 : H * 0.42;
        const scaleVal = 0.85 + 0.15 * enter - exit * 0.1;
        
        ctx.save();
        ctx.translate(markX, markY);
        ctx.scale(scaleVal, scaleVal);

        // Golden drafting circle
        ctx.strokeStyle = "rgba(27, 26, 22, 0.15)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.arc(0, 0, markSize * 0.78, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Mark
        drawBrandMark(ctx, 0, 0, markSize, INK);
        ctx.restore();

        // Typography reveal
        const textY = isVertical ? H * 0.58 : H * 0.65;
        ctx.textAlign = "center";

        // Kicker
        ctx.font = '500 14px "Geist Mono", monospace';
        ctx.fillStyle = KICKER;
        ctx.letterSpacing = "0.22em";
        ctx.fillText("01 / BRAND IDENTITY ARCHITECTURE", W / 2, textY - 35);
        ctx.letterSpacing = "0px";

        // Main Name
        ctx.font = 'italic 72px "Instrument Serif", Georgia, serif';
        ctx.fillStyle = INK;
        ctx.fillText("Prajesh Shakya", W / 2, textY + 30);

        // Subtitle
        ctx.font = '500 18px "Instrument Sans", sans-serif';
        ctx.fillStyle = INK_SOFT;
        ctx.fillText("Portfolio & Content Studio · 2026 Edition", W / 2, textY + 70);

        // Philosophy Badge
        ctx.font = '400 13px "Geist Mono", monospace';
        ctx.fillStyle = KICKER;
        ctx.fillText("Quiet Editorial Confidence · Typographic Truth · Digital Craft", W / 2, textY + 115);
      }

      // ==========================================
      // SCENE 1: AURORA WELLNESS (7.5s - 16.5s)
      // ==========================================
      else if (scene === 1) {
        const p = (t - 7.5) / 9.0;
        const enter = easeOutCubic(p / 0.25);

        ctx.fillStyle = GROUND;
        ctx.fillRect(0, 0, W, H);

        if (!isVertical) {
          // Landscape split layout
          const margin = W * 0.08;
          const leftW = W * 0.44;
          const rightX = margin + leftW + W * 0.05;
          const rightW = W - rightX - margin;
          const boxY = H * 0.15;
          const boxH = H * 0.70;

          // Left: Image Frame with Ken Burns
          ctx.save();
          drawKenBurns(ctx, images.aurora, margin, boxY, leftW, boxH, p, 1.08, 6);
          // Hairline frame
          ctx.strokeStyle = HAIRLINE;
          ctx.lineWidth = 1;
          ctx.strokeRect(margin, boxY, leftW, boxH);
          ctx.restore();

          // Right: Editorial Content
          ctx.textAlign = "left";
          let ty = boxY + 40;

          // Kicker
          ctx.font = '500 13px "Geist Mono", monospace';
          ctx.fillStyle = KICKER;
          ctx.letterSpacing = "0.2em";
          ctx.fillText("SELECTED WORK · HOSPITALITY", rightX, ty);
          ctx.letterSpacing = "0px";
          ty += 55;

          // Title
          ctx.font = 'italic 58px "Instrument Serif", Georgia, serif';
          ctx.fillStyle = INK;
          ctx.fillText("Aurora Wellness", rightX, ty);
          ty += 35;

          // Subtitle
          ctx.font = '400 18px "Instrument Sans", sans-serif';
          ctx.fillStyle = INK_SOFT;
          ctx.fillText("Mindful luxury retreat identity & brand experience", rightX, ty);
          ty += 60;

          // Metric Card Box
          ctx.fillStyle = "#ECEBE5";
          ctx.beginPath();
          ctx.roundRect(rightX, ty, rightW, 110, 6);
          ctx.fill();
          ctx.strokeStyle = HAIRLINE;
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.font = 'italic 44px "Instrument Serif", Georgia, serif';
          ctx.fillStyle = INK;
          ctx.fillText("+45%", rightX + 24, ty + 50);

          ctx.font = '600 14px "Instrument Sans", sans-serif';
          ctx.fillStyle = INK;
          ctx.fillText("Direct Bookings Surge", rightX + 150, ty + 38);

          ctx.font = '400 12px "Geist Mono", monospace';
          ctx.fillStyle = KICKER;
          ctx.fillText("Himalayan sanctuary rebrand · $2.4M pipeline", rightX + 150, ty + 62);
          ty += 145;

          // Tags Pill Row
          ctx.font = '500 12px "Geist Mono", monospace';
          ctx.fillStyle = INK_SOFT;
          ctx.fillText("FIELDS: Brand Identity · Packaging · Spatial Architecture", rightX, ty);

        } else {
          // Vertical Layout (9:16)
          const margin = W * 0.08;
          const boxW = W - margin * 2;
          const imgH = H * 0.42;
          const imgY = H * 0.12;

          drawKenBurns(ctx, images.aurora, margin, imgY, boxW, imgH, p, 1.08, 8);
          ctx.strokeStyle = HAIRLINE;
          ctx.lineWidth = 1;
          ctx.strokeRect(margin, imgY, boxW, imgH);

          // Details below
          ctx.textAlign = "center";
          let ty = imgY + imgH + 45;

          ctx.font = '500 13px "Geist Mono", monospace';
          ctx.fillStyle = KICKER;
          ctx.fillText("SELECTED WORK · HOSPITALITY", W/2, ty);
          ty += 50;

          ctx.font = 'italic 52px "Instrument Serif", Georgia, serif';
          ctx.fillStyle = INK;
          ctx.fillText("Aurora Wellness", W/2, ty);
          ty += 35;

          ctx.font = '400 18px "Instrument Sans", sans-serif';
          ctx.fillStyle = INK_SOFT;
          ctx.fillText("Mindful luxury retreat identity system", W/2, ty);
          ty += 65;

          // Metric Card
          ctx.fillStyle = "#ECEBE5";
          ctx.beginPath();
          ctx.roundRect(margin, ty, boxW, 90, 6);
          ctx.fill();
          ctx.strokeStyle = HAIRLINE;
          ctx.stroke();

          ctx.font = 'italic 38px "Instrument Serif", Georgia, serif';
          ctx.fillStyle = INK;
          ctx.fillText("+45% Direct Bookings Surge", W/2, ty + 42);
          ctx.font = '400 13px "Geist Mono", monospace';
          ctx.fillStyle = KICKER;
          ctx.fillText("Himalayan retreat rebrand · 6-month metric", W/2, ty + 68);
        }
      }

      // ==========================================
      // SCENE 2: ATLAS VENTURES ($120M REBRAND) (16.5s - 25.5s)
      // ==========================================
      else if (scene === 2) {
        const p = (t - 16.5) / 9.0;
        const enter = easeOutCubic(p / 0.25);

        // INVERTED OBSIDIAN BOARD
        ctx.fillStyle = "#1B1A16";
        ctx.fillRect(0, 0, W, H);

        // Geometric navigation lines
        ctx.strokeStyle = "rgba(58, 57, 50, 0.6)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(W * 0.8, H * 0.5, H * 0.35, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, H * 0.5);
        ctx.lineTo(W, H * 0.5);
        ctx.stroke();

        if (!isVertical) {
          const margin = W * 0.08;
          const leftW = W * 0.44;
          const rightX = margin + leftW + W * 0.05;
          const rightW = W - rightX - margin;
          const boxY = H * 0.15;
          const boxH = H * 0.70;

          // Left: Image Frame
          ctx.save();
          drawKenBurns(ctx, images.atlas, margin, boxY, leftW, boxH, p, 1.08, 6);
          ctx.strokeStyle = HAIRLINE_DARK;
          ctx.lineWidth = 1;
          ctx.strokeRect(margin, boxY, leftW, boxH);
          ctx.restore();

          // Right: Content
          ctx.textAlign = "left";
          let ty = boxY + 40;

          ctx.font = '500 13px "Geist Mono", monospace';
          ctx.fillStyle = "#A3A196";
          ctx.letterSpacing = "0.2em";
          ctx.fillText("VENTURE CAPITAL · CORPORATE IDENTITY", rightX, ty);
          ctx.letterSpacing = "0px";
          ty += 55;

          ctx.font = 'italic 58px "Instrument Serif", Georgia, serif';
          ctx.fillStyle = "#F5F5F3";
          ctx.fillText("Atlas Ventures", rightX, ty);
          ty += 35;

          ctx.font = '400 18px "Instrument Sans", sans-serif';
          ctx.fillStyle = "#C7C5BA";
          ctx.fillText("Precision monogram & institutional investor collateral", rightX, ty);
          ty += 60;

          // Metric Card Box in Dark
          ctx.fillStyle = "#2C2B25";
          ctx.beginPath();
          ctx.roundRect(rightX, ty, rightW, 110, 6);
          ctx.fill();
          ctx.strokeStyle = HAIRLINE_DARK;
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.font = 'italic 44px "Instrument Serif", Georgia, serif';
          ctx.fillStyle = "#F5F5F3";
          ctx.fillText("$120M", rightX + 24, ty + 50);

          ctx.font = '600 14px "Instrument Sans", sans-serif';
          ctx.fillStyle = "#F5F5F3";
          ctx.fillText("Closed Institutional Fund", rightX + 170, ty + 38);

          ctx.font = '400 12px "Geist Mono", monospace';
          ctx.fillStyle = "#A3A196";
          ctx.fillText("Global founder network & dealflow monograph", rightX + 170, ty + 62);
          ty += 145;

          // Quote
          ctx.font = 'italic 16px "Instrument Serif", Georgia, serif';
          ctx.fillStyle = "#C7C5BA";
          ctx.fillText('"The identity immediately commands respect in boardroom presentations."', rightX, ty);

        } else {
          // Vertical Layout (9:16)
          const margin = W * 0.08;
          const boxW = W - margin * 2;
          const imgH = H * 0.42;
          const imgY = H * 0.12;

          drawKenBurns(ctx, images.atlas, margin, imgY, boxW, imgH, p, 1.08, 8);
          ctx.strokeStyle = HAIRLINE_DARK;
          ctx.strokeRect(margin, imgY, boxW, imgH);

          ctx.textAlign = "center";
          let ty = imgY + imgH + 45;

          ctx.font = '500 13px "Geist Mono", monospace';
          ctx.fillStyle = "#A3A196";
          ctx.fillText("VENTURE CAPITAL · INSTITUTIONAL", W/2, ty);
          ty += 50;

          ctx.font = 'italic 52px "Instrument Serif", Georgia, serif';
          ctx.fillStyle = "#F5F5F3";
          ctx.fillText("Atlas Ventures", W/2, ty);
          ty += 35;

          ctx.font = '400 18px "Instrument Sans", sans-serif';
          ctx.fillStyle = "#C7C5BA";
          ctx.fillText("Monogram system & investor collateral", W/2, ty);
          ty += 65;

          ctx.fillStyle = "#2C2B25";
          ctx.beginPath();
          ctx.roundRect(margin, ty, boxW, 90, 6);
          ctx.fill();
          ctx.strokeStyle = HAIRLINE_DARK;
          ctx.stroke();

          ctx.font = 'italic 38px "Instrument Serif", Georgia, serif';
          ctx.fillStyle = "#F5F5F3";
          ctx.fillText("$120M Closed Fund", W/2, ty + 42);
          ctx.font = '400 13px "Geist Mono", monospace';
          ctx.fillStyle = "#A3A196";
          ctx.fillText("Modern frontier technology & sustainable commerce", W/2, ty + 68);
        }
      }

      // ==========================================
      // SCENE 3: CONTENT STUDIO & PORTALS (25.5s - 34.0s)
      // ==========================================
      else if (scene === 3) {
        const p = (t - 25.5) / 8.5;
        const enter = easeOutCubic(p / 0.25);

        ctx.fillStyle = GROUND;
        ctx.fillRect(0, 0, W, H);

        ctx.textAlign = "center";
        let topY = isVertical ? H * 0.08 : H * 0.12;

        ctx.font = '500 13px "Geist Mono", monospace';
        ctx.fillStyle = KICKER;
        ctx.letterSpacing = "0.22em";
        ctx.fillText("03 / PROPRIETARY CONTENT STUDIO", W / 2, topY);
        ctx.letterSpacing = "0px";

        ctx.font = 'italic 48px "Instrument Serif", Georgia, serif';
        ctx.fillStyle = INK;
        ctx.fillText("Engineered for Creative Precision", W / 2, topY + 50);

        // Dynamic 3-Card Stack representing the Studio Capabilities
        const cardY = topY + 95;
        const cardH = isVertical ? 150 : 220;

        if (!isVertical) {
          const cardW = (W * 0.84 - 40) / 3;
          const startX = W * 0.08;

          const cards = [
            {
              num: "01",
              title: "Behance-Style Studio",
              sub: "15 Content Blocks",
              desc: "Carousels, Before/After Slider, Video MP4, Focal crop & Multi-device 1440/768/375px preview."
            },
            {
              num: "02",
              title: "Client Moodboards",
              sub: "Infinite Pinboard (/m/)",
              desc: "Tokenized client review boards with interactive commenting and live approval workflows."
            },
            {
              num: "03",
              title: "Automated Invoicing",
              sub: "Multi-Currency Engine (/i/)",
              desc: "Direct client quotes & invoices with high-precision automated PDF generation and online tracking."
            }
          ];

          cards.forEach((c, idx) => {
            const cx = startX + idx * (cardW + 20);
            ctx.fillStyle = "#FFFFFF";
            ctx.beginPath();
            ctx.roundRect(cx, cardY, cardW, cardH, 8);
            ctx.fill();
            ctx.strokeStyle = HAIRLINE;
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.textAlign = "left";
            ctx.font = '600 12px "Geist Mono", monospace';
            ctx.fillStyle = KICKER;
            ctx.fillText(c.num + " / ARCHITECTURE", cx + 24, cardY + 36);

            ctx.font = 'italic 26px "Instrument Serif", Georgia, serif';
            ctx.fillStyle = INK;
            ctx.fillText(c.title, cx + 24, cardY + 75);

            ctx.font = '600 13px "Instrument Sans", sans-serif';
            ctx.fillStyle = "#2447FF";
            ctx.fillText(c.sub, cx + 24, cardY + 105);

            ctx.font = '400 13px "Instrument Sans", sans-serif';
            ctx.fillStyle = INK_SOFT;
            // wrap text simply
            const words = c.desc.split(" ");
            let line = "";
            let ly = cardY + 140;
            words.forEach(w => {
              if (ctx.measureText(line + w).width > cardW - 48) {
                ctx.fillText(line, cx + 24, ly);
                line = w + " ";
                ly += 20;
              } else {
                line += w + " ";
              }
            });
            ctx.fillText(line, cx + 24, ly);
          });

          // Tech badge strip at bottom
          ctx.textAlign = "center";
          ctx.font = '500 13px "Geist Mono", monospace';
          ctx.fillStyle = KICKER;
          ctx.fillText("TECH STACK: Next.js 16 App Router · Neon Postgres · Drizzle · Better Auth · Vercel Blob", W / 2, H * 0.88);

        } else {
          // Vertical layout for Scene 3
          const cardW = W * 0.84;
          const cx = W * 0.08;
          const cards = [
            { num: "01", title: "Behance Studio", sub: "15 Modular CMS Blocks & Preview" },
            { num: "02", title: "Client Portals", sub: "Tokenized Infinite Canvas Moodboards" },
            { num: "03", title: "Invoicing Engine", sub: "Automated Multi-Currency PDF Generation" }
          ];
          cards.forEach((c, idx) => {
            const cy = cardY + idx * 170;
            ctx.fillStyle = "#FFFFFF";
            ctx.beginPath();
            ctx.roundRect(cx, cy, cardW, 140, 8);
            ctx.fill();
            ctx.strokeStyle = HAIRLINE;
            ctx.stroke();

            ctx.textAlign = "left";
            ctx.font = '600 12px "Geist Mono", monospace';
            ctx.fillStyle = KICKER;
            ctx.fillText(c.num + " / SYSTEM", cx + 20, cy + 32);

            ctx.font = 'italic 28px "Instrument Serif", Georgia, serif';
            ctx.fillStyle = INK;
            ctx.fillText(c.title, cx + 20, cy + 72);

            ctx.font = '500 14px "Instrument Sans", sans-serif';
            ctx.fillStyle = INK_SOFT;
            ctx.fillText(c.sub, cx + 20, cy + 105);
          });
        }
      }

      // ==========================================
      // SCENE 4: MANIFESTO & OUTRO (34.0s - 42.0s)
      // ==========================================
      else if (scene === 4) {
        const p = (t - 34.0) / 8.0;
        const enter = easeOutCubic(p / 0.3);
        const exit = t > 40.8 ? (t - 40.8) / 1.2 : 0;

        ctx.fillStyle = GROUND;
        ctx.fillRect(0, 0, W, H);

        // Center Monogram with breathing halo
        const markSize = isVertical ? 150 : 130;
        const markX = W / 2;
        const markY = isVertical ? H * 0.28 : H * 0.30;
        
        ctx.save();
        ctx.translate(markX, markY);
        
        // Ambient pulse ring
        const ringScale = 1 + Math.sin(t * 2) * 0.05;
        ctx.strokeStyle = "rgba(27, 26, 22, 0.12)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, markSize * 0.72 * ringScale, 0, Math.PI * 2);
        ctx.stroke();

        drawBrandMark(ctx, 0, 0, markSize, INK);
        ctx.restore();

        ctx.textAlign = "center";
        let ty = markY + markSize * 0.65 + 30;

        // Manifesto Headline
        ctx.font = 'italic 52px "Instrument Serif", Georgia, serif';
        ctx.fillStyle = INK;
        ctx.fillText("Crafted for Visionaries Who Value Restraint.", W / 2, ty);
        ty += 50;

        // Subtitle
        ctx.font = '400 18px "Instrument Sans", sans-serif';
        ctx.fillStyle = INK_SOFT;
        ctx.fillText("Independent Creative Direction & Bespoke Identity Systems", W / 2, ty);
        ty += 65;

        // Live Availability Pill
        const pillW = isVertical ? W * 0.84 : 440;
        const pillX = (W - pillW) / 2;
        ctx.fillStyle = "#ECEBE5";
        ctx.beginPath();
        ctx.roundRect(pillX, ty, pillW, 44, 22);
        ctx.fill();
        ctx.strokeStyle = HAIRLINE;
        ctx.stroke();

        // Pulsing emerald status dot
        ctx.fillStyle = "#10B981";
        ctx.beginPath();
        ctx.arc(pillX + 24, ty + 22, 4.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '600 12px "Geist Mono", monospace';
        ctx.fillStyle = INK;
        ctx.textAlign = "left";
        ctx.fillText("ACCEPTING COMMISSIONS · Q1/Q2 2026", pillX + 38, ty + 26);
        ty += 90;

        // Links & Contact
        ctx.textAlign = "center";
        ctx.font = 'italic 26px "Instrument Serif", Georgia, serif';
        ctx.fillStyle = INK;
        ctx.fillText("shakyaprajesh.com.np", W / 2, ty);
        ty += 28;

        ctx.font = '400 13px "Geist Mono", monospace';
        ctx.fillStyle = KICKER;
        ctx.fillText("Kathmandu, Nepal · Global Remote · hello@shakyaprajesh.com.np", W / 2, ty);

        // Black fade out on very final 1 second
        if (exit > 0) {
          ctx.fillStyle = \`rgba(27, 26, 22, \${Math.min(1, exit)})\`;
          ctx.fillRect(0, 0, W, H);
        }
      }

      ctx.restore();
    }

    // Animation Loop
    function step(timestamp) {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const dt = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      if (isPlaying) {
        currentTime += dt * playbackSpeed;
        if (currentTime >= duration) {
          currentTime = duration;
          isPlaying = false;
          updatePlayUI();
          if (isRecording && mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
          }
        }
        updateTimelineUI();
      }

      renderFrame(currentTime);
      requestAnimationFrame(step);
    }

    function togglePlay() {
      audio.init();
      isPlaying = !isPlaying;
      lastTimestamp = null;
      updatePlayUI();
    }

    function restartVideo() {
      currentTime = 0;
      isPlaying = true;
      lastTimestamp = null;
      updatePlayUI();
      updateTimelineUI();
    }

    function jumpTo(sec) {
      audio.init();
      currentTime = Math.min(duration, Math.max(0, sec));
      lastTimestamp = null;
      updateTimelineUI();
      renderFrame(currentTime);
    }

    function onSeek(val) {
      currentTime = parseFloat(val);
      lastTimestamp = null;
      updateTimelineUI();
      renderFrame(currentTime);
    }

    function setPlaybackRate(rate) {
      playbackSpeed = parseFloat(rate);
    }

    function updatePlayUI() {
      const playIcon = document.getElementById('play-btn-icon');
      const overlay = document.getElementById('play-overlay');
      if (isPlaying) {
        playIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
        overlay.classList.add('hidden');
      } else {
        playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
        overlay.classList.remove('hidden');
      }
    }

    function updateTimelineUI() {
      document.getElementById('timeline').value = currentTime;
      const mins = Math.floor(currentTime / 60);
      const secs = Math.floor(currentTime % 60);
      document.getElementById('time-current').textContent = 
        String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
    }

    // Video Recording & Export with MediaRecorder
    function startExport() {
      audio.init();
      if (isRecording) return;

      const exportBtn = document.getElementById('export-btn');
      const recDot = document.getElementById('record-dot');
      const recLabel = document.getElementById('record-label');
      const recBadge = document.getElementById('live-rec-badge');

      isRecording = true;
      recDot.classList.add('pulse-record');
      recLabel.textContent = 'Recording 60 FPS...';
      recBadge.classList.remove('hidden');
      exportBtn.classList.replace('bg-[#1B1A16]', 'bg-red-600');

      // Setup audio and canvas streams
      const videoStream = canvas.captureStream(60);
      let tracks = [...videoStream.getVideoTracks()];
      
      if (audio.dest && audio.dest.stream.getAudioTracks().length > 0) {
        tracks.push(...audio.dest.stream.getAudioTracks());
      }

      const combinedStream = new MediaStream(tracks);

      // Determine optimal MIME type
      let mimeType = 'video/webm;codecs=vp9,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm;codecs=vp8,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm';
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/mp4';

      recordedChunks = [];
      mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 16000000 // 16 Mbps
      });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) recordedChunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        isRecording = false;
        recDot.classList.remove('pulse-record');
        recLabel.textContent = 'Export MP4/WebM';
        recBadge.classList.add('hidden');
        exportBtn.classList.replace('bg-red-600', 'bg-[#1B1A16]');

        const blob = new Blob(recordedChunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
        const a = document.createElement('a');
        a.href = url;
        a.download = \`prajesh-shakya-portfolio-2026-promo-\${currentRatio.replace(':', 'x')}.\${ext}\`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 20000);
      };

      // Rewind to 0 and begin playback
      currentTime = 0;
      isPlaying = true;
      lastTimestamp = null;
      updatePlayUI();
      mediaRecorder.start();
    }

    // Initialize on page load
    updateCanvasResolution();
    requestAnimationFrame(step);
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(ARTIFACT_DIR, "promo-video.html"), htmlTemplate, "utf8");
console.log("✓ Built promo-video.html successfully in artifact directory:", ARTIFACT_DIR);
