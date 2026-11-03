/**
 * Shakyaprajesh.com.np Showreel — Global Configuration
 * "Crafting Brands That People Remember"
 */

const CONFIG = {
  // Master Composition Settings
  comp: {
    name: "Shakyaprajesh_Showreel_Master",
    width: 1920,
    height: 1080,
    fps: 60,
    totalFrames: 3000, // 50.0s @ 60fps
    render4K: {
      width: 3840,
      height: 2160
    }
  },

  // Color Palette
  colors: {
    background: "#070707",
    surfaceDark: "#0D0D0E",
    surfaceCard: "#141416",
    primaryWhite: "#FFFFFF",
    accentBlue: "#2563EB",
    accentGlow: "#3B82F6",
    accentCyan: "#06B6D4",
    secondaryGray: "#D1D5DB",
    mutedGray: "#6B7280",
    hairline: "#222226"
  },

  // Typography Tokens
  fonts: {
    serif: { font: "Instrument Serif", style: "Regular" },
    sans: { font: "Plus Jakarta Sans", style: "Regular" },
    mono: { font: "Geist Mono", style: "Regular" }
  },

  // Timeline Scene Timecodes & Frame Ranges (60 FPS)
  scenes: {
    s01: { id: "s01", name: "01_Darkness", start: 0, end: 240, duration: 240 },
    s02: { id: "s02", name: "02_Identity", start: 240, end: 540, duration: 300 },
    s03: { id: "s03", name: "03_Process", start: 540, end: 840, duration: 300 },
    s04: { id: "s04", name: "04_Portfolio_Explosion", start: 840, end: 1140, duration: 300 },
    s05: { id: "s05", name: "05_UI_Sequence", start: 1140, end: 1440, duration: 300 },
    s06: { id: "s06", name: "06_Motion_Graphics", start: 1440, end: 1800, duration: 360 },
    s07: { id: "s07", name: "07_Creative_Workflow", start: 1800, end: 2100, duration: 300 },
    s08: { id: "s08", name: "08_AI_Design", start: 2100, end: 2460, duration: 360 },
    s09: { id: "s09", name: "09_Numbers", start: 2460, end: 2760, duration: 300 },
    s10: { id: "s10", name: "10_Closing", start: 2760, end: 3000, duration: 240 }
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = CONFIG;
}


/**
 * Scene 01 — Darkness & Terminal Genesis
 * Frames: 0 – 240 (0:00 – 0:04 @ 60 FPS)
 */

function buildScene01(api, rootGroup, CONFIG) {
  var s = CONFIG.scenes.s01;
  var g = api.create("group", "Scene_01_Darkness");
  api.parent(g, rootGroup);

  // Scene Visibility Keyframes (Active: 0 - 240)
  api.keyframe(g, s.start, { "opacity": 0 });
  api.keyframe(g, s.start + 20, { "opacity": 100 });
  api.magicEasing(g, "opacity", s.start + 20, "EaseOut");
  api.keyframe(g, s.end - 20, { "opacity": 100 });
  api.keyframe(g, s.end, { "opacity": 0 });
  api.magicEasing(g, "opacity", s.end, "EaseInOut");

  // Subtle camera drift on group scale
  api.keyframe(g, s.start, { "scale.x": 0.95, "scale.y": 0.95 });
  api.keyframe(g, s.end, { "scale.x": 1.05, "scale.y": 1.05 });
  api.magicEasing(g, "scale.x", s.end, "EaseInOut");
  api.magicEasing(g, "scale.y", s.end, "EaseInOut");

  // Corner specs (Geist Mono)
  var specTL = api.create("textShape", "S01_Spec_TL");
  api.set(specTL, {
    "text": "[ 01 / 10 ] INITIALIZING BRAND FILM",
    "font": CONFIG.fonts.mono,
    "fontSize": 14,
    "letterSpacing": 0.1,
    "position.x": -880,
    "position.y": 480,
    "horizontalAlignment": 0,
    "material.materialColor": CONFIG.colors.mutedGray
  });
  api.parent(specTL, g);

  var specTR = api.create("textShape", "S01_Spec_TR");
  api.set(specTR, {
    "text": "REC ● 00:00:00 // 60 FPS",
    "font": CONFIG.fonts.mono,
    "fontSize": 14,
    "letterSpacing": 0.1,
    "position.x": 880,
    "position.y": 480,
    "horizontalAlignment": 2,
    "material.materialColor": CONFIG.colors.accentBlue
  });
  api.parent(specTR, g);

  // Terminal Prompt Text (shakyaprajesh.com.np)
  var promptText = api.create("textShape", "S01_Domain_Prompt");
  api.set(promptText, {
    "text": "shakyaprajesh.com.np",
    "font": CONFIG.fonts.mono,
    "fontSize": 48,
    "letterSpacing": 0.06,
    "position.x": -20,
    "position.y": 0,
    "horizontalAlignment": 1,
    "material.materialColor": CONFIG.colors.primaryWhite
  });
  api.parent(promptText, g);

  // Fade-in reveal for domain text
  api.keyframe(promptText, s.start + 20, { "opacity": 0 });
  api.keyframe(promptText, s.start + 70, { "opacity": 100 });
  api.magicEasing(promptText, "opacity", s.start + 70, "EaseOut");

  // Glowing Blinking Cursor (capsule dash)
  var cursor = api.create("basicShape", "S01_Cursor");
  api.set(cursor, {
    "generator.sides": 4,
    "rotation": 45,
    "generator.radius.x": 4,
    "generator.radius.y": 28,
    "position.x": 300,
    "position.y": 0,
    "material.materialColor": CONFIG.colors.accentBlue
  });
  api.parent(cursor, g);

  // Blink cycle for cursor
  for (var f = s.start + 20; f < s.end - 30; f += 24) {
    api.keyframe(cursor, f, { "opacity": 100 });
    api.keyframe(cursor, f + 12, { "opacity": 0 });
  }

  return g;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = buildScene01;
}


/**
 * Scene 02 — Identity & Macro Typography
 * Frames: 240 – 540 (0:04 – 0:09 @ 60 FPS)
 */

function buildScene02(api, rootGroup, CONFIG) {
  var s = CONFIG.scenes.s02;
  var g = api.create("group", "Scene_02_Identity");
  api.parent(g, rootGroup);

  // Group Visibility Keyframes
  api.keyframe(g, s.start, { "opacity": 0 });
  api.keyframe(g, s.start + 20, { "opacity": 100 });
  api.magicEasing(g, "opacity", s.start + 20, "EaseOut");
  api.keyframe(g, s.end - 20, { "opacity": 100 });
  api.keyframe(g, s.end, { "opacity": 0 });
  api.magicEasing(g, "opacity", s.end, "EaseInOut");

  // Eyebrow label (Geist Mono)
  var eyebrow = api.create("textShape", "S02_Eyebrow");
  api.set(eyebrow, {
    "text": "02 // IDENTITY & CREATIVE DIRECTION",
    "font": CONFIG.fonts.mono,
    "fontSize": 14,
    "letterSpacing": 0.2,
    "position.x": 0,
    "position.y": 280,
    "horizontalAlignment": 1,
    "material.materialColor": CONFIG.colors.accentBlue
  });
  api.parent(eyebrow, g);

  // First Name: PRAJESH (Instrument Serif)
  var first = api.create("textShape", "S02_First_Name");
  api.set(first, {
    "text": "Prajesh",
    "font": CONFIG.fonts.serif,
    "fontSize": 140,
    "letterSpacing": -0.02,
    "position.x": 0,
    "position.y": 90,
    "horizontalAlignment": 1,
    "material.materialColor": CONFIG.colors.primaryWhite
  });
  api.parent(first, g);

  api.keyframe(first, s.start + 10, { "position.y": 120, "opacity": 0 });
  api.keyframe(first, s.start + 45, { "position.y": 90, "opacity": 100 });
  api.magicEasing(first, "position.y", s.start + 45, "EaseOut");
  api.magicEasing(first, "opacity", s.start + 45, "EaseOut");

  // Last Name: SHAKYA (Instrument Serif)
  var last = api.create("textShape", "S02_Last_Name");
  api.set(last, {
    "text": "Shakya",
    "font": CONFIG.fonts.serif,
    "fontSize": 140,
    "letterSpacing": -0.02,
    "position.x": 0,
    "position.y": -50,
    "horizontalAlignment": 1,
    "material.materialColor": CONFIG.colors.primaryWhite
  });
  api.parent(last, g);

  api.keyframe(last, s.start + 35, { "position.y": -20, "opacity": 0 });
  api.keyframe(last, s.start + 70, { "position.y": -50, "opacity": 100 });
  api.magicEasing(last, "position.y", s.start + 70, "EaseOut");
  api.magicEasing(last, "opacity", s.start + 70, "EaseOut");

  // Discipline Subtitle Cascade (Plus Jakarta Sans)
  var subtitles = [
    "Brand Identity Designer",
    "Creative Technologist",
    "Graphic Designer"
  ];
  for (var i = 0; i < subtitles.length; i++) {
    var sub = api.create("textShape", "S02_Sub_" + i);
    api.set(sub, {
      "text": subtitles[i],
      "font": CONFIG.fonts.sans,
      "fontSize": 20,
      "letterSpacing": 0.15,
      "position.x": (i - 1) * 360,
      "position.y": -190,
      "horizontalAlignment": 1,
      "material.materialColor": CONFIG.colors.secondaryGray
    });
    api.parent(sub, g);

    api.keyframe(sub, s.start + 70 + i * 20, { "opacity": 0 });
    api.keyframe(sub, s.start + 105 + i * 20, { "opacity": 100 });
    api.magicEasing(sub, "opacity", s.start + 105 + i * 20, "EaseOut");
  }

  // 45° Corner Guidelines
  var angles = [-45, 45, 135, 225];
  for (var a = 0; a < angles.length; a++) {
    var tick = api.create("basicShape", "S02_GridTick_" + a);
    api.set(tick, {
      "generator.sides": 4,
      "rotation": angles[a],
      "generator.radius.x": 2,
      "generator.radius.y": 30,
      "position.x": Math.cos(angles[a] * Math.PI / 180) * 560,
      "position.y": Math.sin(angles[a] * Math.PI / 180) * 320,
      "material.materialColor": CONFIG.colors.accentBlue
    });
    api.parent(tick, g);
  }

  return g;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = buildScene02;
}


/**
 * Scene 03 — The Process & Floating Multi-Plane Assets
 * Frames: 540 – 840 (0:09 – 0:14 @ 60 FPS)
 */

function buildScene03(api, rootGroup, CONFIG) {
  var s = CONFIG.scenes.s03;
  var g = api.create("group", "Scene_03_Process");
  api.parent(g, rootGroup);

  // Group Visibility Keyframes
  api.keyframe(g, s.start, { "opacity": 0 });
  api.keyframe(g, s.start + 20, { "opacity": 100 });
  api.magicEasing(g, "opacity", s.start + 20, "EaseOut");
  api.keyframe(g, s.end - 20, { "opacity": 100 });
  api.keyframe(g, s.end, { "opacity": 0 });
  api.magicEasing(g, "opacity", s.end, "EaseInOut");

  // Scene Section Header
  var header = api.create("textShape", "S03_Header");
  api.set(header, {
    "text": "03 // STRATEGY · ARCHITECTURE · FORM",
    "font": CONFIG.fonts.mono,
    "fontSize": 14,
    "letterSpacing": 0.2,
    "position.x": 0,
    "position.y": 380,
    "horizontalAlignment": 1,
    "material.materialColor": CONFIG.colors.accentBlue
  });
  api.parent(header, g);

  var mainTitle = api.create("textShape", "S03_Title");
  api.set(mainTitle, {
    "text": "The Methodical Craft of enduring brand systems",
    "font": CONFIG.fonts.serif,
    "fontSize": 52,
    "letterSpacing": -0.015,
    "position.x": 0,
    "position.y": 310,
    "horizontalAlignment": 1,
    "material.materialColor": CONFIG.colors.primaryWhite
  });
  api.parent(mainTitle, g);

  // 5 Floating Process Cards across depth planes
  var cardsData = [
    { label: "01 STRATEGY", sub: "Brand Positioning & Narrative", x: -500, y: -40, accent: false },
    { label: "02 IDENTITY", sub: "PS Monogram & 45° Geometry", x: -250, y: 30, accent: true },
    { label: "03 TYPOGRAPHY", sub: "Instrument Serif + Jakarta", x: 0, y: -60, accent: false },
    { label: "04 SYSTEMS", sub: "8pt Baseline & Contrast Rules", x: 250, y: 20, accent: false },
    { label: "05 MOTION", sub: "Cavalry Generative Physics", x: 500, y: -50, accent: true }
  ];

  for (var i = 0; i < cardsData.length; i++) {
    var c = cardsData[i];
    var cardGroup = api.create("group", "S03_CardGroup_" + i);
    api.parent(cardGroup, g);

    // Card background panel (using basicShape sides:4 rotation:45)
    var cardBg = api.create("basicShape", "S03_CardBg_" + i);
    api.set(cardBg, {
      "generator.sides": 4,
      "rotation": 45,
      "generator.radius.x": 100,
      "generator.radius.y": 140,
      "position.x": c.x,
      "position.y": c.y,
      "material.materialColor": c.accent ? CONFIG.colors.accentBlue : CONFIG.colors.surfaceCard
    });
    api.parent(cardBg, cardGroup);

    // Card Header Pill
    var cardPill = api.create("textShape", "S03_CardLabel_" + i);
    api.set(cardPill, {
      "text": c.label,
      "font": CONFIG.fonts.mono,
      "fontSize": 12,
      "letterSpacing": 0.1,
      "position.x": c.x,
      "position.y": c.y + 70,
      "horizontalAlignment": 1,
      "material.materialColor": c.accent ? CONFIG.colors.primaryWhite : CONFIG.colors.accentBlue
    });
    api.parent(cardPill, cardGroup);

    // Card description
    var cardDesc = api.create("textShape", "S03_CardDesc_" + i);
    api.set(cardDesc, {
      "text": c.sub,
      "font": CONFIG.fonts.sans,
      "fontSize": 15,
      "position.x": c.x,
      "position.y": c.y - 40,
      "horizontalAlignment": 1,
      "material.materialColor": CONFIG.colors.primaryWhite
    });
    api.parent(cardDesc, cardGroup);

    // Floating parallax motion on cards
    var drift = (i % 2 === 0) ? 20 : -20;
    api.keyframe(cardGroup, s.start + 20, { "position.y": -drift });
    api.keyframe(cardGroup, s.start + 160, { "position.y": drift });
    api.keyframe(cardGroup, s.end - 20, { "position.y": -drift });
    api.magicEasing(cardGroup, "position.y", s.start + 160, "EaseInOut");
    api.magicEasing(cardGroup, "position.y", s.end - 20, "EaseInOut");
  }

  return g;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = buildScene03;
}


/**
 * Scene 04 — Portfolio Explosion
 * Frames: 840 – 1140 (0:14 – 0:19 @ 60 FPS)
 */

function buildScene04(api, rootGroup, CONFIG) {
  var s = CONFIG.scenes.s04;
  var g = api.create("group", "Scene_04_Portfolio_Explosion");
  api.parent(g, rootGroup);

  // Group Visibility Keyframes
  api.keyframe(g, s.start, { "opacity": 0 });
  api.keyframe(g, s.start + 15, { "opacity": 100 });
  api.magicEasing(g, "opacity", s.start + 15, "EaseOut");
  api.keyframe(g, s.end - 15, { "opacity": 100 });
  api.keyframe(g, s.end, { "opacity": 0 });
  api.magicEasing(g, "opacity", s.end, "EaseInOut");

  // Section Header
  var header = api.create("textShape", "S04_Header");
  api.set(header, {
    "text": "04 // PORTFOLIO DISCIPLINES & GLOBAL REACH",
    "font": CONFIG.fonts.mono,
    "fontSize": 14,
    "letterSpacing": 0.2,
    "position.x": 0,
    "position.y": 420,
    "horizontalAlignment": 1,
    "material.materialColor": CONFIG.colors.accentBlue
  });
  api.parent(header, g);

  // Center Monolith Title
  var centerTitle = api.create("textShape", "S04_CenterTitle");
  api.set(centerTitle, {
    "text": "Distinctive Identities Across 8 Sectors",
    "font": CONFIG.fonts.serif,
    "fontSize": 56,
    "letterSpacing": -0.02,
    "position.x": 0,
    "position.y": 0,
    "horizontalAlignment": 1,
    "material.materialColor": CONFIG.colors.primaryWhite
  });
  api.parent(centerTitle, g);

  // Center title fades back as panels explode outward
  api.keyframe(centerTitle, s.start + 20, { "scale.x": 0.8, "opacity": 0 });
  api.keyframe(centerTitle, s.start + 60, { "scale.x": 1.0, "opacity": 100 });
  api.keyframe(centerTitle, s.start + 140, { "opacity": 30 });
  api.magicEasing(centerTitle, "scale.x", s.start + 60, "EaseOut");

  // 8 Exploding Portfolio Discipline Panels
  var panels = [
    { title: "LUXURY BRANDING", num: "01", x: -550, y: 220 },
    { title: "HOSPITALITY", num: "02", x: -220, y: 240 },
    { title: "EDUCATION & LMS", num: "03", x: 220, y: 240 },
    { title: "TECHNOLOGY & SAAS", num: "04", x: 550, y: 220 },
    { title: "PACKAGING CRAFT", num: "05", x: -550, y: -220 },
    { title: "CAMPAIGN SYSTEMS", num: "06", x: -220, y: -240 },
    { title: "SOCIAL ARCHITECTURE", num: "07", x: 220, y: -240 },
    { title: "VISUAL IDENTITY", num: "08", x: 550, y: -220 }
  ];

  for (var i = 0; i < panels.length; i++) {
    var p = panels[i];
    var panelGroup = api.create("group", "S04_Panel_" + i);
    api.parent(panelGroup, g);

    // Panel card box
    var card = api.create("basicShape", "S04_Card_" + i);
    api.set(card, {
      "generator.sides": 4,
      "rotation": 45,
      "generator.radius.x": 140,
      "generator.radius.y": 65,
      "position.x": p.x,
      "position.y": p.y,
      "material.materialColor": (i === 0 || i === 7) ? CONFIG.colors.accentBlue : CONFIG.colors.surfaceCard
    });
    api.parent(card, panelGroup);

    // Panel Index Tag
    var numTag = api.create("textShape", "S04_Num_" + i);
    api.set(numTag, {
      "text": p.num,
      "font": CONFIG.fonts.mono,
      "fontSize": 13,
      "position.x": p.x - 100,
      "position.y": p.y + 20,
      "horizontalAlignment": 0,
      "material.materialColor": (i === 0 || i === 7) ? CONFIG.colors.primaryWhite : CONFIG.colors.accentBlue
    });
    api.parent(numTag, panelGroup);

    // Panel Title
    var titleTag = api.create("textShape", "S04_TitleTag_" + i);
    api.set(titleTag, {
      "text": p.title,
      "font": CONFIG.fonts.sans,
      "fontSize": 14,
      "letterSpacing": 0.1,
      "position.x": p.x,
      "position.y": p.y - 15,
      "horizontalAlignment": 1,
      "material.materialColor": CONFIG.colors.primaryWhite
    });
    api.parent(titleTag, panelGroup);

    // Radial Explosion Animation from center (0,0) to target (p.x, p.y)
    api.keyframe(panelGroup, s.start + 50 + i * 8, {
      "position.x": - p.x * 0.4,
      "position.y": - p.y * 0.4,
      "scale.x": 0.5,
      "scale.y": 0.5,
      "opacity": 0
    });
    api.keyframe(panelGroup, s.start + 100 + i * 8, {
      "position.x": 0,
      "position.y": 0,
      "scale.x": 1.0,
      "scale.y": 1.0,
      "opacity": 100
    });
    api.magicEasing(panelGroup, "position.x", s.start + 100 + i * 8, "ElasticOut");
    api.magicEasing(panelGroup, "opacity", s.start + 100 + i * 8, "EaseOut");
  }

  return g;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = buildScene04;
}


/**
 * Scene 05 — Modern UI & Glassmorphism Experience
 * Frames: 1140 – 1440 (0:19 – 0:24 @ 60 FPS)
 */

function buildScene05(api, rootGroup, CONFIG) {
  var s = CONFIG.scenes.s05;
  var g = api.create("group", "Scene_05_UI_Sequence");
  api.parent(g, rootGroup);

  // Group Visibility Keyframes
  api.keyframe(g, s.start, { "opacity": 0 });
  api.keyframe(g, s.start + 15, { "opacity": 100 });
  api.magicEasing(g, "opacity", s.start + 15, "EaseOut");
  api.keyframe(g, s.end - 15, { "opacity": 100 });
  api.keyframe(g, s.end, { "opacity": 0 });
  api.magicEasing(g, "opacity", s.end, "EaseInOut");

  // Section Header
  var header = api.create("textShape", "S05_Header");
  api.set(header, {
    "text": "05 // DIGITAL CRAFT · RESPONSIVE SYSTEMS · GSAP PHYSICS",
    "font": CONFIG.fonts.mono,
    "fontSize": 14,
    "letterSpacing": 0.2,
    "position.x": 0,
    "position.y": 420,
    "horizontalAlignment": 1,
    "material.materialColor": CONFIG.colors.accentBlue
  });
  api.parent(header, g);

  // Browser Window Container
  var winGroup = api.create("group", "S05_Browser_Window");
  api.parent(winGroup, g);

  var winBg = api.create("basicShape", "S05_Win_Bg");
  api.set(winBg, {
    "generator.sides": 4,
    "rotation": 45,
    "generator.radius.x": 560,
    "generator.radius.y": 320,
    "position.x": 0,
    "position.y": -10,
    "material.materialColor": CONFIG.colors.surfaceCard
  });
  api.parent(winBg, winGroup);

  // URL Bar in Window
  var urlText = api.create("textShape", "S05_Win_URL");
  api.set(urlText, {
    "text": "https://shakyaprajesh.com.np/portfolio",
    "font": CONFIG.fonts.mono,
    "fontSize": 13,
    "position.x": 0,
    "position.y": 280,
    "horizontalAlignment": 1,
    "material.materialColor": CONFIG.colors.mutedGray
  });
  api.parent(urlText, winGroup);

  // Page Hero Heading (Instrument Serif)
  var pageHero = api.create("textShape", "S05_Page_Hero");
  api.set(pageHero, {
    "text": "Crafting Authentic Brand Identities",
    "font": CONFIG.fonts.serif,
    "fontSize": 52,
    "letterSpacing": -0.015,
    "position.x": 0,
    "position.y": 140,
    "horizontalAlignment": 1,
    "material.materialColor": CONFIG.colors.primaryWhite
  });
  api.parent(pageHero, winGroup);

  // 3 Category Chips
  var chips = ["STRATEGY", "SYSTEMS", "INTERACTION"];
  for (var c = 0; c < 3; c++) {
    var chip = api.create("basicShape", "S05_ChipBg_" + c);
    api.set(chip, {
      "generator.sides": 4,
      "rotation": 45,
      "generator.radius.x": 65,
      "generator.radius.y": 16,
      "position.x": (c - 1) * 160,
      "position.y": 60,
      "material.materialColor": (c === 1) ? CONFIG.colors.accentBlue : CONFIG.colors.surfaceDark
    });
    api.parent(chip, winGroup);

    var chipText = api.create("textShape", "S05_ChipText_" + c);
    api.set(chipText, {
      "text": chips[c],
      "font": CONFIG.fonts.sans,
      "fontSize": 12,
      "position.x": (c - 1) * 160,
      "position.y": 55,
      "horizontalAlignment": 1,
      "material.materialColor": CONFIG.colors.primaryWhite
    });
    api.parent(chipText, winGroup);
  }

  // Interactive Animated Cursor Pointer
  var cursor = api.create("basicShape", "S05_Mouse_Pointer");
  api.set(cursor, {
    "generator.sides": 4,
    "rotation": 45,
    "generator.radius.x": 10,
    "generator.radius.y": 10,
    "position.x": -200,
    "position.y": 20,
    "material.materialColor": CONFIG.colors.accentBlue
  });
  api.parent(cursor, winGroup);

  // Cursor trajectory across screen with click pulse
  api.keyframe(cursor, s.start + 40, { "position.x": -300, "position.y": -100 });
  api.keyframe(cursor, s.start + 120, { "position.x": 0, "position.y": 60, "scale.x": 1.0 });
  api.keyframe(cursor, s.start + 140, { "scale.x": 1.8, "scale.y": 1.8 }); // Click pulse!
  api.keyframe(cursor, s.start + 160, { "scale.x": 1.0, "scale.y": 1.0 });
  api.keyframe(cursor, s.start + 240, { "position.x": 280, "position.y": -80 });
  api.magicEasing(cursor, "position.x", s.start + 120, "EaseInOut");

  return g;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = buildScene05;
}


/**
 * Scene 06 — Motion Graphics & Radial Kinetic Moiré
 * Frames: 1440 – 1800 (0:24 – 0:30 @ 60 FPS)
 */

function buildScene06(api, rootGroup, CONFIG) {
  var s = CONFIG.scenes.s06;
  var g = api.create("group", "Scene_06_Motion_Graphics");
  api.parent(g, rootGroup);

  // Group Visibility Keyframes
  api.keyframe(g, s.start, { "opacity": 0 });
  api.keyframe(g, s.start + 15, { "opacity": 100 });
  api.magicEasing(g, "opacity", s.start + 15, "EaseOut");
  api.keyframe(g, s.end - 15, { "opacity": 100 });
  api.keyframe(g, s.end, { "opacity": 0 });
  api.magicEasing(g, "opacity", s.end, "EaseInOut");

  // Section Header
  var header = api.create("textShape", "S06_Header");
  api.set(header, {
    "text": "06 // GENERATIVE KINETIC MOIRÉ · PS MONOGRAM · WAVE PHYSICS",
    "font": CONFIG.fonts.mono,
    "fontSize": 14,
    "letterSpacing": 0.2,
    "position.x": 0,
    "position.y": 440,
    "horizontalAlignment": 1,
    "material.materialColor": CONFIG.colors.accentBlue
  });
  api.parent(header, g);

  // 6 Concentric Kinetic Rings with Traveling Waveform
  var rings = [
    { r: 85,  count: 18, w: 2.2, h: 12 },
    { r: 145, count: 26, w: 2.4, h: 16 },
    { r: 215, count: 36, w: 2.6, h: 20 },
    { r: 295, count: 48, w: 2.8, h: 24 },
    { r: 385, count: 62, w: 3.0, h: 28 },
    { r: 485, count: 78, w: 3.2, h: 32 }
  ];

  for (var rIdx = 0; rIdx < rings.length; rIdx++) {
    var cfg = rings[rIdx];
    var ringGroup = api.create("group", "S06_Ring_" + (rIdx + 1));
    api.parent(ringGroup, g);

    // Alternating Rotary Drift over scene duration
    var rotDir = (rIdx % 2 === 0) ? 1 : -1;
    api.keyframe(ringGroup, s.start, { "rotation": 0 });
    api.keyframe(ringGroup, s.end, { "rotation": rotDir * 24 });
    api.magicEasing(ringGroup, "rotation", s.end, "Linear");

    var wavePeak1 = s.start + 60 + rIdx * 12;
    var wavePeak2 = wavePeak1 + 140;

    for (var i = 0; i < cfg.count; i++) {
      var deg = i * (360.0 / cfg.count);
      var rad = deg * (Math.PI / 180.0);
      var x = cfg.r * Math.cos(rad);
      var y = cfg.r * Math.sin(rad);

      var dash = api.create("basicShape", "S06_D_" + (rIdx + 1) + "_" + i);
      api.set(dash, {
        "position.x": x,
        "position.y": y,
        "rotation": deg + 90,
        "generator.radius.x": cfg.w,
        "generator.radius.y": cfg.h,
        "material.materialColor": (rIdx === 2 || rIdx === 4) ? CONFIG.colors.primaryWhite : CONFIG.colors.secondaryGray
      });
      api.parent(dash, ringGroup);

      // Sinusoidal Shockwave Keyframes
      var f1Start = Math.max(s.start, wavePeak1 - 10);
      var f1End = Math.min(s.end, wavePeak1 + 10);
      api.keyframe(dash, f1Start, { "scale.y": 1.0 });
      api.keyframe(dash, wavePeak1, { "scale.y": 2.5 });
      api.keyframe(dash, f1End, { "scale.y": 1.0 });
      api.magicEasing(dash, "scale.y", wavePeak1, "EaseInOut");

      if (wavePeak2 <= s.end) {
        var f2Start = Math.max(s.start, wavePeak2 - 10);
        var f2End = Math.min(s.end, wavePeak2 + 10);
        api.keyframe(dash, f2Start, { "scale.y": 1.0 });
        api.keyframe(dash, wavePeak2, { "scale.y": 2.5 });
        api.keyframe(dash, f2End, { "scale.y": 1.0 });
        api.magicEasing(dash, "scale.y", wavePeak2, "EaseInOut");
      }
    }
  }

  // Center Core: 45° Isometric PS Monogram Shape
  var monoGroup = api.create("group", "S06_PS_CenterCore");
  api.parent(monoGroup, g);

  var coreBox = api.create("basicShape", "S06_Core_Hex");
  api.set(coreBox, {
    "generator.sides": 4,
    "rotation": 45,
    "generator.radius.x": 42,
    "generator.radius.y": 42,
    "position.x": 0,
    "position.y": 0,
    "material.materialColor": CONFIG.colors.accentBlue
  });
  api.parent(coreBox, monoGroup);

  var monoText = api.create("textShape", "S06_PS_Text");
  api.set(monoText, {
    "text": "PS",
    "font": CONFIG.fonts.serif,
    "fontSize": 40,
    "position.x": 0,
    "position.y": -8,
    "horizontalAlignment": 1,
    "material.materialColor": CONFIG.colors.primaryWhite
  });
  api.parent(monoText, monoGroup);

  // Breathing rotation & scale oscillation on core
  api.keyframe(monoGroup, s.start + 30, { "scale.x": 0.8, "scale.y": 0.8 });
  api.keyframe(monoGroup, s.start + 180, { "scale.x": 1.2, "scale.y": 1.2 });
  api.keyframe(monoGroup, s.end - 30, { "scale.x": 1.0, "scale.y": 1.0 });
  api.magicEasing(monoGroup, "scale.x", s.start + 180, "EaseInOut");

  return g;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = buildScene06;
}


/**
 * Scene 07 — Creative Workflow Montage
 * Frames: 1800 – 2100 (0:30 – 0:35 @ 60 FPS)
 */

function buildScene07(api, rootGroup, CONFIG) {
  var s = CONFIG.scenes.s07;
  var g = api.create("group", "Scene_07_Creative_Workflow");
  api.parent(g, rootGroup);

  // Group Visibility Keyframes
  api.keyframe(g, s.start, { "opacity": 0 });
  api.keyframe(g, s.start + 15, { "opacity": 100 });
  api.magicEasing(g, "opacity", s.start + 15, "EaseOut");
  api.keyframe(g, s.end - 15, { "opacity": 100 });
  api.keyframe(g, s.end, { "opacity": 0 });
  api.magicEasing(g, "opacity", s.end, "EaseInOut");

  // Section Header
  var header = api.create("textShape", "S07_Header");
  api.set(header, {
    "text": "07 // MULTIDISCIPLINARY TOOL CHAIN · SYNCHRONIZED PIPELINE",
    "font": CONFIG.fonts.mono,
    "fontSize": 14,
    "letterSpacing": 0.2,
    "position.x": 0,
    "position.y": 420,
    "horizontalAlignment": 1,
    "material.materialColor": CONFIG.colors.accentBlue
  });
  api.parent(header, g);

  var subTitle = api.create("textShape", "S07_SubTitle");
  api.set(subTitle, {
    "text": "From Concept to Motion Master",
    "font": CONFIG.fonts.serif,
    "fontSize": 52,
    "position.x": 0,
    "position.y": 350,
    "horizontalAlignment": 1,
    "material.materialColor": CONFIG.colors.primaryWhite
  });
  api.parent(subTitle, g);

  // 8 Tool Sequence
  var tools = [
    { name: "01 SKETCH", desc: "Raw Conceptualization", highlight: false },
    { name: "02 ILLUSTRATOR", desc: "Vector Geometry & Precision", highlight: false },
    { name: "03 PHOTOSHOP", desc: "Textural Alchemy", highlight: false },
    { name: "04 FIGMA", desc: "Component Systems & Specs", highlight: false },
    { name: "05 AFTER EFFECTS", desc: "Cinematic Choreography", highlight: false },
    { name: "06 CAVALRY", desc: "Procedural Kinetic Engines", highlight: true },
    { name: "07 BLENDER", desc: "Spatial Dimensions & Light", highlight: false },
    { name: "08 FINAL BRAND", desc: "Living Identity System", highlight: true }
  ];

  var rowStep = 68;
  var startY = 180;

  for (var i = 0; i < tools.length; i++) {
    var t = tools[i];
    var toolGroup = api.create("group", "S07_ToolRow_" + i);
    api.parent(toolGroup, g);

    var yPos = startY - i * rowStep;

    // Background pill stripe
    var pill = api.create("basicShape", "S07_Pill_" + i);
    api.set(pill, {
      "generator.sides": 4,
      "rotation": 45,
      "generator.radius.x": 440,
      "generator.radius.y": 24,
      "position.x": 0,
      "position.y": yPos,
      "material.materialColor": t.highlight ? CONFIG.colors.accentBlue : CONFIG.colors.surfaceCard
    });
    api.parent(pill, toolGroup);

    // Tool Name (Plus Jakarta Sans)
    var toolName = api.create("textShape", "S07_TName_" + i);
    api.set(toolName, {
      "text": t.name,
      "font": CONFIG.fonts.sans,
      "fontSize": 16,
      "letterSpacing": 0.15,
      "position.x": -400,
      "position.y": yPos - 5,
      "horizontalAlignment": 0,
      "material.materialColor": CONFIG.colors.primaryWhite
    });
    api.parent(toolName, toolGroup);

    // Tool Description (Geist Mono)
    var toolDesc = api.create("textShape", "S07_TDesc_" + i);
    api.set(toolDesc, {
      "text": t.desc,
      "font": CONFIG.fonts.mono,
      "fontSize": 13,
      "position.x": 400,
      "position.y": yPos - 5,
      "horizontalAlignment": 2,
      "material.materialColor": t.highlight ? CONFIG.colors.primaryWhite : CONFIG.colors.mutedGray
    });
    api.parent(toolDesc, toolGroup);

    // Staggered High-Velocity Entrance
    var entryFrame = s.start + 20 + i * 24;
    api.keyframe(toolGroup, entryFrame, { "position.x": -60, "opacity": 0 });
    api.keyframe(toolGroup, entryFrame + 18, { "position.x": 0, "opacity": 100 });
    api.magicEasing(toolGroup, "position.x", entryFrame + 18, "EaseOut");
    api.magicEasing(toolGroup, "opacity", entryFrame + 18, "EaseOut");
  }

  return g;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = buildScene07;
}


/**
 * Scene 08 — AI + Creative Technology Node Graph
 * Frames: 2100 – 2460 (0:35 – 0:41 @ 60 FPS)
 */

function buildScene08(api, rootGroup, CONFIG) {
  var s = CONFIG.scenes.s08;
  var g = api.create("group", "Scene_08_AI_Design");
  api.parent(g, rootGroup);

  // Group Visibility Keyframes
  api.keyframe(g, s.start, { "opacity": 0 });
  api.keyframe(g, s.start + 15, { "opacity": 100 });
  api.magicEasing(g, "opacity", s.start + 15, "EaseOut");
  api.keyframe(g, s.end - 15, { "opacity": 100 });
  api.keyframe(g, s.end, { "opacity": 0 });
  api.magicEasing(g, "opacity", s.end, "EaseInOut");

  // Section Header
  var header = api.create("textShape", "S08_Header");
  api.set(header, {
    "text": "08 // AI AGENTS · CREATIVE CODING · MCP CONNECTIVITY",
    "font": CONFIG.fonts.mono,
    "fontSize": 14,
    "letterSpacing": 0.2,
    "position.x": 0,
    "position.y": 440,
    "horizontalAlignment": 1,
    "material.materialColor": CONFIG.colors.accentBlue
  });
  api.parent(header, g);

  // Center Core Node (Creative Intelligence Engine)
  var coreGroup = api.create("group", "S08_CenterCore");
  api.parent(coreGroup, g);

  var coreCircle = api.create("basicShape", "S08_CoreCircle");
  api.set(coreCircle, {
    "generator.sides": 4,
    "rotation": 45,
    "generator.radius.x": 80,
    "generator.radius.y": 80,
    "material.materialColor": CONFIG.colors.accentBlue
  });
  api.parent(coreCircle, coreGroup);

  var coreLabel = api.create("textShape", "S08_CoreLabel");
  api.set(coreLabel, {
    "text": "AI DESIGN\nCORE",
    "font": CONFIG.fonts.mono,
    "fontSize": 14,
    "position.x": 0,
    "position.y": 0,
    "horizontalAlignment": 1,
    "material.materialColor": CONFIG.colors.primaryWhite
  });
  api.parent(coreLabel, coreGroup);

  // Pulse animation on center core
  api.keyframe(coreGroup, s.start + 20, { "scale.x": 0.9, "scale.y": 0.9 });
  api.keyframe(coreGroup, s.start + 180, { "scale.x": 1.15, "scale.y": 1.15 });
  api.keyframe(coreGroup, s.end - 20, { "scale.x": 1.0, "scale.y": 1.0 });
  api.magicEasing(coreGroup, "scale.x", s.start + 180, "EaseInOut");

  // 6 Satellite Connected Nodes
  var nodes = [
    { title: "AUTONOMOUS AGENTS", x: -440, y: 160 },
    { title: "MCP PROTOCOLS", x: 440, y: 160 },
    { title: "CREATIVE CODING", x: -500, y: -60 },
    { title: "MOTION ENGINES", x: 500, y: -60 },
    { title: "BROWSER AUTOMATION", x: -320, y: -240 },
    { title: "DESIGN SYSTEMS", x: 320, y: -240 }
  ];

  for (var i = 0; i < nodes.length; i++) {
    var n = nodes[i];
    var nodeGroup = api.create("group", "S08_NodeGroup_" + i);
    api.parent(nodeGroup, g);

    // Node Box
    var nodeCard = api.create("basicShape", "S08_NodeCard_" + i);
    api.set(nodeCard, {
      "generator.sides": 4,
      "rotation": 45,
      "generator.radius.x": 130,
      "generator.radius.y": 32,
      "position.x": n.x,
      "position.y": n.y,
      "material.materialColor": CONFIG.colors.surfaceCard
    });
    api.parent(nodeCard, nodeGroup);

    // Node Title (Plus Jakarta Sans)
    var nodeTitle = api.create("textShape", "S08_NTitle_" + i);
    api.set(nodeTitle, {
      "text": n.title,
      "font": CONFIG.fonts.sans,
      "fontSize": 12,
      "letterSpacing": 0.1,
      "position.x": n.x,
      "position.y": n.y - 5,
      "horizontalAlignment": 1,
      "material.materialColor": CONFIG.colors.primaryWhite
    });
    api.parent(nodeTitle, nodeGroup);

    // Staggered node entrance
    var nEntry = s.start + 30 + i * 16;
    api.keyframe(nodeGroup, nEntry, { "scale.x": 0.5, "scale.y": 0.5, "opacity": 0 });
    api.keyframe(nodeGroup, nEntry + 24, { "scale.x": 1.0, "scale.y": 1.0, "opacity": 100 });
    api.magicEasing(nodeGroup, "scale.x", nEntry + 24, "ElasticOut");
  }

  return g;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = buildScene08;
}


/**
 * Scene 09 — Numbers & Impact
 * Frames: 2460 – 2760 (0:41 – 0:46 @ 60 FPS)
 */

function buildScene09(api, rootGroup, CONFIG) {
  var s = CONFIG.scenes.s09;
  var g = api.create("group", "Scene_09_Numbers");
  api.parent(g, rootGroup);

  // Group Visibility Keyframes
  api.keyframe(g, s.start, { "opacity": 0 });
  api.keyframe(g, s.start + 15, { "opacity": 100 });
  api.magicEasing(g, "opacity", s.start + 15, "EaseOut");
  api.keyframe(g, s.end - 15, { "opacity": 100 });
  api.keyframe(g, s.end, { "opacity": 0 });
  api.magicEasing(g, "opacity", s.end, "EaseInOut");

  // Section Header
  var header = api.create("textShape", "S09_Header");
  api.set(header, {
    "text": "09 // PROVEN TRACK RECORD · REPUTATION & LONGEVITY",
    "font": CONFIG.fonts.mono,
    "fontSize": 14,
    "letterSpacing": 0.2,
    "position.x": 0,
    "position.y": 420,
    "horizontalAlignment": 1,
    "material.materialColor": CONFIG.colors.accentBlue
  });
  api.parent(header, g);

  // 3 Monumental Stat Columns
  var stats = [
    { num: "6+", label: "Years of Craft", sub: "Deep positioning & systems", x: -480 },
    { num: "100+", label: "Brand Projects", sub: "Global clients across 7 regions", x: 0 },
    { num: "100%", label: "Bespoke Vision", sub: "No generic templates or shortcuts", x: 480 }
  ];

  for (var i = 0; i < stats.length; i++) {
    var st = stats[i];
    var colGroup = api.create("group", "S09_StatCol_" + i);
    api.parent(colGroup, g);

    // Number (Instrument Serif, massive 140pt)
    var numText = api.create("textShape", "S09_Num_" + i);
    api.set(numText, {
      "text": st.num,
      "font": CONFIG.fonts.serif,
      "fontSize": 140,
      "letterSpacing": -0.03,
      "position.x": st.x,
      "position.y": 40,
      "horizontalAlignment": 1,
      "material.materialColor": (i === 1) ? CONFIG.colors.primaryWhite : CONFIG.colors.secondaryGray
    });
    api.parent(numText, colGroup);

    // Label (Plus Jakarta Sans)
    var labelText = api.create("textShape", "S09_Label_" + i);
    api.set(labelText, {
      "text": st.label,
      "font": CONFIG.fonts.sans,
      "fontSize": 22,
      "letterSpacing": 0.05,
      "position.x": st.x,
      "position.y": -80,
      "horizontalAlignment": 1,
      "material.materialColor": (i === 1) ? CONFIG.colors.accentBlue : CONFIG.colors.primaryWhite
    });
    api.parent(labelText, colGroup);

    // Subtitle (Geist Mono)
    var subText = api.create("textShape", "S09_Sub_" + i);
    api.set(subText, {
      "text": st.sub,
      "font": CONFIG.fonts.mono,
      "fontSize": 13,
      "position.x": st.x,
      "position.y": -120,
      "horizontalAlignment": 1,
      "material.materialColor": CONFIG.colors.mutedGray
    });
    api.parent(subText, colGroup);

    // Staggered rise animation
    var entryFrame = s.start + 20 + i * 25;
    api.keyframe(colGroup, entryFrame, { "position.y": -50, "opacity": 0 });
    api.keyframe(colGroup, entryFrame + 35, { "position.y": 0, "opacity": 100 });
    api.magicEasing(colGroup, "position.y", entryFrame + 35, "EaseOut");
    api.magicEasing(colGroup, "opacity", entryFrame + 35, "EaseOut");
  }

  // Footer Tagline
  var footerTag = api.create("textShape", "S09_Footer");
  api.set(footerTag, {
    "text": "BRAND SYSTEMS · MOTION DESIGN · CREATIVE STRATEGY",
    "font": CONFIG.fonts.mono,
    "fontSize": 14,
    "letterSpacing": 0.25,
    "position.x": 0,
    "position.y": -280,
    "horizontalAlignment": 1,
    "material.materialColor": CONFIG.colors.secondaryGray
  });
  api.parent(footerTag, g);

  return g;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = buildScene09;
}


/**
 * Scene 10 — Closing & Resonance
 * Frames: 2760 – 3000 (0:46 – 0:50 @ 60 FPS)
 */

function buildScene10(api, rootGroup, CONFIG) {
  var s = CONFIG.scenes.s10;
  var g = api.create("group", "Scene_10_Closing");
  api.parent(g, rootGroup);

  // Group Visibility Keyframes
  api.keyframe(g, s.start, { "opacity": 0 });
  api.keyframe(g, s.start + 15, { "opacity": 100 });
  api.magicEasing(g, "opacity", s.start + 15, "EaseOut");
  api.keyframe(g, s.end - 25, { "opacity": 100 });
  api.keyframe(g, s.end, { "opacity": 0 });
  api.magicEasing(g, "opacity", s.end, "EaseInOut");

  // Eyebrow
  var eyebrow = api.create("textShape", "S10_Eyebrow");
  api.set(eyebrow, {
    "text": "10 // PHILOSOPHY & VISION",
    "font": CONFIG.fonts.mono,
    "fontSize": 14,
    "letterSpacing": 0.25,
    "position.x": 0,
    "position.y": 240,
    "horizontalAlignment": 1,
    "material.materialColor": CONFIG.colors.accentBlue
  });
  api.parent(eyebrow, g);

  // Main Closing Manifesto (Instrument Serif, 72pt)
  var manifesto = api.create("textShape", "S10_Manifesto");
  api.set(manifesto, {
    "text": "Crafting Authentic\nBrand Identities\nThat Resonate.",
    "font": CONFIG.fonts.serif,
    "fontSize": 72,
    "lineSpacing": 1.15,
    "letterSpacing": -0.02,
    "position.x": 0,
    "position.y": 40,
    "horizontalAlignment": 1,
    "material.materialColor": CONFIG.colors.primaryWhite
  });
  api.parent(manifesto, g);

  // Manifesto animation: gentle entrance
  api.keyframe(manifesto, s.start + 10, { "position.y": 10, "opacity": 0 });
  api.keyframe(manifesto, s.start + 45, { "position.y": 40, "opacity": 100 });
  api.keyframe(manifesto, s.start + 120, { "opacity": 0 }); // Dissolve out to reveal final domain
  api.magicEasing(manifesto, "position.y", s.start + 45, "EaseOut");
  api.magicEasing(manifesto, "opacity", s.start + 120, "EaseInOut");

  // Final Domain Lockup Group
  var domainGroup = api.create("group", "S10_Domain_Lockup");
  api.parent(domainGroup, g);

  // Final PS Monogram Core
  var finalHex = api.create("basicShape", "S10_Final_Hex");
  api.set(finalHex, {
    "generator.sides": 4,
    "rotation": 45,
    "generator.radius.x": 36,
    "generator.radius.y": 36,
    "position.x": 0,
    "position.y": 70,
    "material.materialColor": CONFIG.colors.accentBlue
  });
  api.parent(finalHex, domainGroup);

  var finalPSText = api.create("textShape", "S10_Final_PSText");
  api.set(finalPSText, {
    "text": "PS",
    "font": CONFIG.fonts.serif,
    "fontSize": 34,
    "position.x": 0,
    "position.y": 60,
    "horizontalAlignment": 1,
    "material.materialColor": CONFIG.colors.primaryWhite
  });
  api.parent(finalPSText, domainGroup);

  // Domain Text (Geist Mono, 42pt)
  var domainText = api.create("textShape", "S10_DomainText");
  api.set(domainText, {
    "text": "shakyaprajesh.com.np",
    "font": CONFIG.fonts.mono,
    "fontSize": 42,
    "letterSpacing": 0.08,
    "position.x": 0,
    "position.y": -30,
    "horizontalAlignment": 1,
    "material.materialColor": CONFIG.colors.primaryWhite
  });
  api.parent(domainText, domainGroup);

  var subRole = api.create("textShape", "S10_SubRole");
  api.set(subRole, {
    "text": "BRAND STRATEGY · IDENTITY DESIGN · CREATIVE CODE",
    "font": CONFIG.fonts.sans,
    "fontSize": 14,
    "letterSpacing": 0.2,
    "position.x": 0,
    "position.y": -90,
    "horizontalAlignment": 1,
    "material.materialColor": CONFIG.colors.secondaryGray
  });
  api.parent(subRole, domainGroup);

  // Domain lockup reveals after manifesto dissolves
  api.keyframe(domainGroup, s.start + 115, { "scale.x": 0.9, "scale.y": 0.9, "opacity": 0 });
  api.keyframe(domainGroup, s.start + 155, { "scale.x": 1.0, "scale.y": 1.0, "opacity": 100 });
  api.magicEasing(domainGroup, "scale.x", s.start + 155, "EaseOut");
  api.magicEasing(domainGroup, "opacity", s.start + 155, "EaseOut");

  return g;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = buildScene10;
}


/**
 * Shakyaprajesh.com.np Showreel — Master Orchestrator
 * "Crafting Brands That People Remember"
 * Duration: 50.0s (3,000 frames @ 60 FPS)
 * Format: 1920x1080 (4K master switchable in config)
 */

function executeMasterShowreel() {
  console.log("=== Initializing Shakyaprajesh Showreel Master ===");

  var comp = api.getActiveComp();
  if (!comp) {
    console.log("No active composition found. Creating or selecting default.");
  }

  // 1. Setup Composition Resolution & Frame Range
  api.set(comp, {
    "frameRate": CONFIG.comp.fps,
    "endFrame": CONFIG.comp.totalFrames
  });

  // Clean old showreel root group if existing
  var children = api.getChildren(comp);
  for (var c = 0; c < children.length; c++) {
    var cName = api.getName(children[c]);
    if (cName === "Shakyaprajesh_Showreel_Master" || cName.indexOf("Scene_") === 0 || cName === "Master_Background") {
      api.deleteLayer(children[c]);
    }
  }

  // 2. Global Deep-Black Canvas Background
  var bg = api.create("backgroundShape", "Master_Background");
  api.set(bg, {
    "material.materialColor": CONFIG.colors.background
  });

  // 3. Master Root Group
  var rootGroup = api.create("group", "Shakyaprajesh_Showreel_Master");

  // 4. Instantiate 10 Scenes
  console.log("Building Scene 01: Darkness...");
  buildScene01(api, rootGroup, CONFIG);

  console.log("Building Scene 02: Identity...");
  buildScene02(api, rootGroup, CONFIG);

  console.log("Building Scene 03: Process...");
  buildScene03(api, rootGroup, CONFIG);

  console.log("Building Scene 04: Portfolio Explosion...");
  buildScene04(api, rootGroup, CONFIG);

  console.log("Building Scene 05: UI Sequence...");
  buildScene05(api, rootGroup, CONFIG);

  console.log("Building Scene 06: Motion Graphics...");
  buildScene06(api, rootGroup, CONFIG);

  console.log("Building Scene 07: Creative Workflow...");
  buildScene07(api, rootGroup, CONFIG);

  console.log("Building Scene 08: AI + Design...");
  buildScene08(api, rootGroup, CONFIG);

  console.log("Building Scene 09: Numbers...");
  buildScene09(api, rootGroup, CONFIG);

  console.log("Building Scene 10: Closing...");
  buildScene10(api, rootGroup, CONFIG);

  console.log("=== Showreel Master Assembled Successfully (3,000 Frames @ 60 FPS) ===");
}



executeMasterShowreel();

