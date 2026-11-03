# Shakyaprajesh.com.np — Flagship Kinetic Showreel (Cavalry)

> **"Crafting Brands That People Remember"**  
> Duration: 50.0 seconds (3,000 frames @ 60 FPS)  
> Resolution: 1920×1080 (Switchable to 3840×2160 4K Master)  
> Aesthetic: Minimal Luxury · Swiss Design · Apple Keynote Motion · Instrument Serif + Plus Jakarta Sans + Geist Mono

---

## 🎬 Master Timeline Architecture

| Scene | Name | Timecode | Frames | Focal Visual & Mechanics |
| :---: | :--- | :---: | :---: | :--- |
| **01** | **Darkness & Genesis** | 0:00 – 0:04 | `0 – 240` | Terminal prompt typing `shakyaprajesh.com.np`, 24f blinking royal blue cursor, technical mono framing. |
| **02** | **Identity & Macro Type** | 0:04 – 0:09 | `240 – 540` | Monumental 140pt **Instrument Serif** `Prajesh` & `Shakya`, 3-discipline subtitle cascade, 45° grid snap lines. |
| **03** | **The Process** | 0:09 – 0:14 | `540 – 840` | 5 floating depth-plane cards (*Strategy, Identity, Typography, Systems, Motion*) with sinusoidal parallax drift. |
| **04** | **Portfolio Explosion** | 0:14 – 0:19 | `840 – 1140` | Center monolith title breaks into 8 radial discipline cards (*Luxury Branding, Hospitality, SaaS, etc.*). |
| **05** | **UI & Glassmorphism** | 0:19 – 0:24 | `1140 – 1440` | Minimal browser mockup window (`shakyaprajesh.com.np/portfolio`), interactive mouse pointer with click pulse. |
| **06** | **Motion Graphics & Moiré**| 0:24 – 0:30 | `1440 – 1800` | 6 concentric rotary kinetic rings (268 procedural elements) with travelling shockwaves + central PS Monogram. |
| **07** | **Creative Workflow** | 0:30 – 0:35 | `1800 – 2100` | 8-tool cascade montage (*Sketch → Illustrator → Photoshop → Figma → After Effects → Cavalry → Blender → Final Brand*). |
| **08** | **AI + Creative Tech** | 0:35 – 0:41 | `2100 – 2460` | Central AI Design Core pulsating with 6 satellite connected capability nodes (*Agents, MCP, Automation*). |
| **09** | **Numbers & Impact** | 0:41 – 0:46 | `2460 – 2760` | Monumental statistical columns: `6+ Years of Craft`, `100+ Brand Projects`, `100% Bespoke Vision`. |
| **10** | **Closing & Resonance** | 0:46 – 0:50 | `2760 – 3000` | Closing manifesto *"Crafting Authentic Brand Identities That Resonate."*, dissolving to final domain `shakyaprajesh.com.np`. |

---

## 🎨 Design System & Color Tokens

- **Deep Black Canvas**: `#070707`
- **Surface Dark**: `#0D0D0E`
- **Surface Card**: `#141416`
- **Primary White**: `#FFFFFF`
- **Accent Royal Blue**: `#2563EB`
- **Accent Glow**: `#3B82F6`
- **Secondary Gray**: `#D1D5DB`
- **Muted Gray**: `#6B7280`

### Typography Tokens
- **Display Serif**: `Instrument Serif` (Installed in Windows fonts)
- **Primary Sans**: `Plus Jakarta Sans` (Installed in Windows fonts)
- **Technical Mono**: `Geist Mono` (Installed in Windows fonts)

---

## 🚀 How to Play and Preview in Cavalry

1. Open **Cavalry**.
2. The active composition is named `Shakyaprajesh_Showreel_Master`.
3. In the Timeline window:
   - Hit **Spacebar** to play the full 50-second showreel at 60 FPS.
   - Scrub the playhead to any scene frame (e.g., Frame `80`, `360`, `680`, `980`, `1280`, `1600`, `1950`, `2280`, `2600`, `2880`).
4. In the Scene Layer Tree:
   - Each scene is neatly organized into its own top-level group (`Scene_01_Darkness`, `Scene_02_Identity`, etc.).
   - You can toggle visibility, solo layers, or adjust keyframes individually.

---

## 🎥 Exporting Videos from Cavalry

### 16:9 4K UHD Master (3840×2160 @ 60 FPS)
1. Go to **Composition > Settings** (`Ctrl+K`).
2. Set **Width**: `3840`, **Height**: `2160`, **Frame Rate**: `60`.
3. Open the **Render Manager** (`Ctrl+B`).
4. Add Composition to Render Queue.
5. Format: **ProRes 422 HQ** or **H.264 (MP4)**.
6. Click **Render**.

### 9:16 Social Cut (1080×1920)
1. Duplicate Composition.
2. In Composition Settings, change resolution to `1080` × `1920`.
3. Elements auto-center on the vertical baseline.

---

## 📁 Project File Directory

```
scripts/cavalry/
├── fonts/                          # Windows-registered font TTFs
│   ├── InstrumentSerif-Regular.ttf
│   ├── InstrumentSans-Regular.ttf
│   ├── GeistMono-Regular.ttf
│   └── PlusJakartaSans-Variable.ttf
└── showreel/
    ├── config.js                   # Master configuration & color palette
    ├── build_master_reel.js        # Cavalry composition orchestrator
    ├── deploy_showreel.js          # Deployment & automated render verification
    ├── scenes/
    │   ├── scene01_darkness.js
    │   ├── scene02_identity.js
    │   ├── scene03_process.js
    │   ├── scene04_portfolio.js
    │   ├── scene05_ui.js
    │   ├── scene06_motion_graphics.js
    │   ├── scene07_workflow.js
    │   ├── scene08_ai_design.js
    │   ├── scene09_numbers.js
    │   └── scene10_closing.js
    └── renders/                    # 1080p rendered proof stills (Frames 80-2880)
        ├── scene_01_f80.png
        ├── scene_02_f360.png
        ├── scene_03_f680.png
        ├── scene_04_f980.png
        ├── scene_05_f1280.png
        ├── scene_06_f1600.png
        ├── scene_07_f1950.png
        ├── scene_08_f2280.png
        ├── scene_09_f2600.png
        └── scene_10_f2880.png
```
