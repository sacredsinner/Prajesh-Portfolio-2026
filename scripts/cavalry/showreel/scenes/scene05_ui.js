/**
 * Scene 05 — Modern UI & Glassmorphism Experience
 * Frames: 1140 – 1440 (0:19 – 0:24 @ 60 FPS)
 */

function buildScene05(api, rootGroup, CONFIG) {
  var s = CONFIG.scenes.s05;
  var g = api.create("group", "Scene_05_UI_Sequence");
  api.set(g, { "groupMode": 0 });
  if (rootGroup) {
    api.parent(g, rootGroup);
  }

  // Group Visibility Keyframes
  api.keyframe(g, s.start, { "opacity": 0 });
  api.keyframe(g, s.start + 15, { "opacity": 100 });
  // magicEasing on group omitted for Cavalry compatibility
  api.keyframe(g, s.end - 15, { "opacity": 100 });
  api.keyframe(g, s.end, { "opacity": 0 });
  // magicEasing on group omitted for Cavalry compatibility

  // Section Header
  var header = api.create("textShape", "S05_Header");
  api.set(header, {
    "text": "05 // DIGITAL CRAFT · RESPONSIVE SYSTEMS · GSAP PHYSICS",
    "font.font": CONFIG.fonts.mono.font,
    "font.style": CONFIG.fonts.mono.style,
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
    "font.font": CONFIG.fonts.mono.font,
    "font.style": CONFIG.fonts.mono.style,
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
    "font.font": CONFIG.fonts.serif.font,
    "font.style": CONFIG.fonts.serif.style,
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
      "font.font": CONFIG.fonts.sans.font,
      "font.style": CONFIG.fonts.sans.style,
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
