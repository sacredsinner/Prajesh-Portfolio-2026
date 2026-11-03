/**
 * Prajesh Shakya — PS Monogram Logo Animation (Cavalry Scene)
 * Concept 01: "The Architectural Trace"
 * Frames: 0 – 300 (5.0 Seconds @ 60 FPS)
 * Resolution: 1920×1080 (Scalable to 4K 3840×2160)
 */

function buildLogoAnimationScene(api, rootGroup, CONFIG) {
  CONFIG = CONFIG || {
    colors: {
      ground: "#F5F5F3",
      ink: "#1B1A16",
      hairline: "#D9D7CD",
      muted: "#6F6D63",
      accentBlue: "#2447FF"
    },
    fonts: {
      serif: { font: "Instrument Serif", style: "Regular" },
      sans: { font: "Plus Jakarta Sans", style: "Bold" },
      mono: { font: "Geist Mono", style: "Regular" }
    }
  };

  var g = api.create("group", "Logo_Animation_Trace");
  api.set(g, { "groupMode": 0 });
  if (rootGroup) {
    api.parent(g, rootGroup);
  }

  // 1. Warm Parchment Canvas Background
  var bg = api.create("basicShape", "Logo_Canvas_BG");
  api.set(bg, {
    "generator.sides": 4,
    "generator.radius.x": 1920,
    "generator.radius.y": 1080,
    "position.x": 0,
    "position.y": 0,
    "material.materialColor": CONFIG.colors.ground
  });
  api.parent(bg, g);

  // 2. Isometric 45° Diagonal Grid Crosshatch Group
  var gridGroup = api.create("group", "Logo_Isometric_Grid");
  api.parent(gridGroup, g);

  var GRID_LINES = 14;
  var SPACING = 36;
  for (var i = -GRID_LINES; i <= GRID_LINES; i++) {
    var lineA = api.create("basicShape", "Grid_Diag_A_" + i);
    api.set(lineA, {
      "generator.radius.x": 0.6,
      "generator.radius.y": 420,
      "position.x": i * SPACING,
      "position.y": 0,
      "rotation": 45,
      "material.materialColor": CONFIG.colors.hairline
    });
    api.parent(lineA, gridGroup);

    var lineB = api.create("basicShape", "Grid_Diag_B_" + i);
    api.set(lineB, {
      "generator.radius.x": 0.6,
      "generator.radius.y": 420,
      "position.x": i * SPACING,
      "position.y": 0,
      "rotation": -45,
      "material.materialColor": CONFIG.colors.hairline
    });
    api.parent(lineB, gridGroup);
  }

  // Fade grid in from frame 10 to 40, soften after trace
  api.keyframe(gridGroup, 0, { "opacity": 0 });
  api.keyframe(gridGroup, 30, { "opacity": 30 });
  api.keyframe(gridGroup, 150, { "opacity": 30 });
  api.keyframe(gridGroup, 210, { "opacity": 10 });

  // 3. Central Monogram Diamond Bounding Frame
  var diamond = api.create("basicShape", "Logo_Diamond_Frame");
  api.set(diamond, {
    "generator.sides": 4,
    "generator.radius.x": 120,
    "generator.radius.y": 120,
    "position.x": 0,
    "position.y": 30,
    "rotation": 45,
    "stroke.color": CONFIG.colors.hairline,
    "stroke.width": 1.0,
    "material.materialColor": "transparent"
  });
  api.parent(diamond, g);

  api.keyframe(diamond, 15, { "scale.x": 0.85, "scale.y": 0.85, "opacity": 0 });
  api.keyframe(diamond, 60, { "scale.x": 1.0, "scale.y": 1.0, "opacity": 60 });
  api.magicEasing(diamond, "scale.x", 60, "EaseOut");
  api.magicEasing(diamond, "scale.y", 60, "EaseOut");

  // 4. PS Monogram Vector Core
  var monoGroup = api.create("group", "Logo_PS_Core");
  api.set(monoGroup, { "position.x": 0, "position.y": 30 });
  api.parent(monoGroup, g);

  // Stylized Core Hex / Diamond Base
  var monoBase = api.create("basicShape", "Logo_PS_Base");
  api.set(monoBase, {
    "generator.sides": 4,
    "generator.radius.x": 64,
    "generator.radius.y": 64,
    "position.x": 0,
    "position.y": 0,
    "rotation": 45,
    "material.materialColor": CONFIG.colors.ink
  });
  api.parent(monoBase, monoGroup);

  // Stroke Outline Reveal (Frames 30 – 150)
  api.keyframe(monoBase, 30, { "scale.x": 0.7, "scale.y": 0.7, "opacity": 0 });
  api.keyframe(monoBase, 150, { "scale.x": 1.0, "scale.y": 1.0, "opacity": 100 });
  api.magicEasing(monoBase, "scale.x", 150, "EaseOut");
  api.magicEasing(monoBase, "scale.y", 150, "EaseOut");

  // PS Glyph Text on core
  var glyph = api.create("textShape", "Logo_PS_Glyph");
  api.set(glyph, {
    "text": "PS",
    "font.font": CONFIG.fonts.serif.font,
    "font.style": CONFIG.fonts.serif.style,
    "fontSize": 56,
    "position.x": 0,
    "position.y": -14,
    "horizontalAlignment": 1,
    "material.materialColor": CONFIG.colors.ground
  });
  api.parent(glyph, monoGroup);

  api.keyframe(glyph, 60, { "opacity": 0, "scale.x": 0.8, "scale.y": 0.8 });
  api.keyframe(glyph, 160, { "opacity": 100, "scale.x": 1.0, "scale.y": 1.0 });
  api.magicEasing(glyph, "opacity", 160, "EaseOut");

  // 5. Wordmark: PRAJESH SHAKYA
  var wordmark = api.create("textShape", "Logo_Wordmark");
  api.set(wordmark, {
    "text": "PRAJESH SHAKYA",
    "font.font": CONFIG.fonts.sans.font,
    "font.style": CONFIG.fonts.sans.style,
    "fontSize": 15,
    "letterSpacing": 0.1,
    "position.x": 0,
    "position.y": -110,
    "horizontalAlignment": 1,
    "material.materialColor": CONFIG.colors.ink
  });
  api.parent(wordmark, g);

  api.keyframe(wordmark, 180, { "position.y": -125, "opacity": 0, "letterSpacing": 0.1 });
  api.keyframe(wordmark, 240, { "position.y": -110, "opacity": 100, "letterSpacing": 0.28 });
  api.magicEasing(wordmark, "position.y", 240, "EaseOut");
  api.magicEasing(wordmark, "opacity", 240, "EaseOut");
  api.magicEasing(wordmark, "letterSpacing", 240, "EaseOut");

  // 6. Subtitle: BRAND STRATEGY & IDENTITY
  var sub = api.create("textShape", "Logo_Subtitle");
  api.set(sub, {
    "text": "BRAND STRATEGY & IDENTITY",
    "font.font": CONFIG.fonts.mono.font,
    "font.style": CONFIG.fonts.mono.style,
    "fontSize": 9.5,
    "letterSpacing": 0.2,
    "position.x": 0,
    "position.y": -136,
    "horizontalAlignment": 1,
    "material.materialColor": CONFIG.colors.muted
  });
  api.parent(sub, g);

  api.keyframe(sub, 210, { "opacity": 0 });
  api.keyframe(sub, 260, { "opacity": 100 });
  api.magicEasing(sub, "opacity", 260, "EaseOut");

  // 7. Hairline Baseline Rule
  var rule = api.create("basicShape", "Logo_Baseline_Rule");
  api.set(rule, {
    "generator.radius.x": 0,
    "generator.radius.y": 0.6,
    "position.x": 0,
    "position.y": -90,
    "material.materialColor": CONFIG.colors.hairline
  });
  api.parent(rule, g);

  api.keyframe(rule, 190, { "generator.radius.x": 0, "opacity": 0 });
  api.keyframe(rule, 250, { "generator.radius.x": 160, "opacity": 80 });
  api.magicEasing(rule, "generator.radius.x", 250, "EaseOut");

  return g;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = buildLogoAnimationScene;
}
