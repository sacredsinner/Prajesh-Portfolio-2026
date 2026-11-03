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

  // Inset hairline frame
  var frameBorder = api.create("basicShape", "S05_Hairline_Frame");
  api.set(frameBorder, {
    "generator": "rectangle",
    "generator.radius.x": 1920 / 2 - 48,
    "generator.radius.y": 1080 / 2 - 48,
    "stroke.color": CONFIG.colors.hairline,
    "stroke.width": 1.0,
    "fill.color": "#00000000"
  });
  api.parent(frameBorder, g);

  // Section Header
  var header = api.create("textShape", "S05_Header");
  api.set(header, {
    "text": "05 // DIGITAL CRAFT · RESPONSIVE SYSTEMS · GSAP PHYSICS",
    "font": CONFIG.fonts.mono,
    "fontSize": 12,
    "letterSpacing": 0.2,
    "position.x": 0,
    "position.y": 420,
    "horizontalAlignment": 1,
    "material.materialColor": CONFIG.colors.accentBlue
  });
  api.parent(header, g);

  // Browser / Device Window Container (Glassmorphic Window)
  var winGroup = api.create("group", "S05_Browser_Window");
  api.parent(winGroup, g);

  var winBg = api.create("basicShape", "S05_Win_Bg");
  api.set(winBg, {
    "generator": "rectangle",
    "generator.radius.x": 600,
    "generator.radius.y": 340,
    "generator.cornerRadius": 12,
    "position.x": 0,
    "position.y": -10,
    "material.materialColor": CONFIG.colors.surfaceCard,
    "stroke.color": CONFIG.colors.hairline,
    "stroke.width": 1.0
  });
  api.parent(winBg, winGroup);

  // Window Titlebar
  var titlebar = api.create("basicShape", "S05_Titlebar");
  api.set(titlebar, {
    "generator": "rectangle",
    "generator.radius.x": 600,
    "generator.radius.y": 20,
    "position.x": 0,
    "position.y": 310,
    "material.materialColor": CONFIG.colors.surfaceDark
  });
  api.parent(titlebar, winGroup);

  // 3 Traffic Light Dots
  var dotColors = ["#EF4444", "#F59E0B", "#10B981"];
  for (var d = 0; d < 3; d++) {
    var dot = api.create("basicShape", "S05_Dot_" + d);
    api.set(dot, {
      "generator": "ellipse",
      "generator.radius.x": 5,
      "generator.radius.y": 5,
      "position.x": -560 + d * 20,
      "position.y": 310,
      "material.materialColor": dotColors[d]
    });
    api.parent(dot, winGroup);
  }

  // URL Bar in Window
  var urlText = api.create("textShape", "S05_Win_URL");
  api.set(urlText, {
    "text": "https://shakyaprajesh.com.np/portfolio",
    "font": CONFIG.fonts.mono,
    "fontSize": 11,
    "position.x": 0,
    "position.y": 310,
    "horizontalAlignment": 1,
    "material.materialColor": CONFIG.colors.mutedGray
  });
  api.parent(urlText, winGroup);

  // Scrolling Content Container
  var scrollGroup = api.create("group", "S05_Scroll_Content");
  api.parent(scrollGroup, winGroup);

  // Simulated Page Hero Heading (Instrument Serif)
  var pageHero = api.create("textShape", "S05_Page_Hero");
  api.set(pageHero, {
    "text": "Crafting Authentic Brand Identities",
    "font": CONFIG.fonts.serif,
    "fontSize": 48,
    "letterSpacing": -0.015,
    "position.x": 0,
    "position.y": 180,
    "horizontalAlignment": 1,
    "material.materialColor": CONFIG.colors.primaryWhite
  });
  api.parent(pageHero, scrollGroup);

  // 3 Interactive Category Chips
  var chips = ["STRATEGY", "SYSTEMS", "INTERACTION"];
  for (var c = 0; c < 3; c++) {
    var chip = api.create("basicShape", "S05_ChipBg_" + c);
    api.set(chip, {
      "generator": "rectangle",
      "generator.radius.x": 65,
      "generator.radius.y": 14,
      "generator.cornerRadius": 14,
      "position.x": (c - 1) * 160,
      "position.y": 110,
      "material.materialColor": (c === 1) ? CONFIG.colors.accentBlue : CONFIG.colors.surfaceDark,
      "stroke.color": CONFIG.colors.hairline,
      "stroke.width": 1.0
    });
    api.parent(chip, scrollGroup);

    var chipText = api.create("textShape", "S05_ChipText_" + c);
    api.set(chipText, {
      "text": chips[c],
      "font": CONFIG.fonts.sans,
      "fontSize": 11,
      "position.x": (c - 1) * 160,
      "position.y": 110,
      "horizontalAlignment": 1,
      "material.materialColor": CONFIG.colors.primaryWhite
    });
    api.parent(chipText, scrollGroup);
  }

  // Simulated Portfolio Cards in Viewport
  for (var col = 0; col < 2; col++) {
    var mockCard = api.create("basicShape", "S05_MockCard_" + col);
    api.set(mockCard, {
      "generator": "rectangle",
      "generator.radius.x": 260,
      "generator.radius.y": 110,
      "generator.cornerRadius": 8,
      "position.x": (col === 0) ? -280 : 280,
      "position.y": -80,
      "material.materialColor": CONFIG.colors.surfaceDark,
      "stroke.color": CONFIG.colors.hairline,
      "stroke.width": 1.0
    });
    api.parent(mockCard, scrollGroup);
  }

  // Page Scroll Animation
  api.keyframe(scrollGroup, s.start + 60, { "position.y": 0 });
  api.keyframe(scrollGroup, s.start + 180, { "position.y": 90 });
  api.magicEasing(scrollGroup, "position.y", s.start + 180, "EaseInOut");

  // Interactive Animated Cursor Pointer
  var cursor = api.create("basicShape", "S05_Mouse_Pointer");
  api.set(cursor, {
    "generator": "ellipse",
    "generator.radius.x": 8,
    "generator.radius.y": 8,
    "position.x": -200,
    "position.y": 20,
    "material.materialColor": CONFIG.colors.accentBlue
  });
  api.parent(cursor, winGroup);

  // Cursor trajectory across screen with click pulse
  api.keyframe(cursor, s.start + 40, { "position.x": -300, "position.y": -100 });
  api.keyframe(cursor, s.start + 120, { "position.x": 0, "position.y": 110, "scale.x": 1.0 });
  api.keyframe(cursor, s.start + 140, { "scale.x": 1.8, "scale.y": 1.8 }); // Click pulse!
  api.keyframe(cursor, s.start + 160, { "scale.x": 1.0, "scale.y": 1.0 });
  api.keyframe(cursor, s.start + 240, { "position.x": 280, "position.y": -80 });
  api.magicEasing(cursor, "position.x", s.start + 120, "EaseInOut");

  return g;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = buildScene05;
}
