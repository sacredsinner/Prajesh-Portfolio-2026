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
  api.keyframe(g, s.start + 15, { "opacity": 100 });
  api.magicEasing(g, "opacity", s.start + 15, "EaseOut");
  api.keyframe(g, s.end - 20, { "opacity": 100 });
  api.keyframe(g, s.end, { "opacity": 0 });
  api.magicEasing(g, "opacity", s.end, "EaseInOut");

  // Subtle camera drift on group scale
  api.keyframe(g, s.start, { "scale.x": 0.96, "scale.y": 0.96 });
  api.keyframe(g, s.end, { "scale.x": 1.04, "scale.y": 1.04 });
  api.magicEasing(g, "scale.x", s.end, "EaseInOut");
  api.magicEasing(g, "scale.y", s.end, "EaseInOut");

  // Inset hairline frame (48px margin)
  var frameBorder = api.create("basicShape", "S01_Hairline_Frame");
  api.set(frameBorder, {
    "generator": "rectangle",
    "generator.radius.x": 1920 / 2 - 48,
    "generator.radius.y": 1080 / 2 - 48,
    "position.x": 0,
    "position.y": 0,
    "stroke.color": CONFIG.colors.hairline,
    "stroke.width": 1.0,
    "fill.color": "#00000000"
  });
  api.parent(frameBorder, g);

  // Corner specs (Geist Mono)
  var specTL = api.create("textShape", "S01_Spec_TL");
  api.set(specTL, {
    "text": "[ 01 / 10 ] INITIALIZING BRAND FILM",
    "font": CONFIG.fonts.mono,
    "fontSize": 12,
    "letterSpacing": 0.08,
    "position.x": - (1920 / 2 - 64),
    "position.y": (1080 / 2 - 64),
    "horizontalAlignment": 0,
    "material.materialColor": CONFIG.colors.mutedGray
  });
  api.parent(specTL, g);

  var specTR = api.create("textShape", "S01_Spec_TR");
  api.set(specTR, {
    "text": "REC ● 00:00:00 // 60 FPS",
    "font": CONFIG.fonts.mono,
    "fontSize": 12,
    "letterSpacing": 0.08,
    "position.x": (1920 / 2 - 64),
    "position.y": (1080 / 2 - 64),
    "horizontalAlignment": 2,
    "material.materialColor": CONFIG.colors.accentBlue
  });
  api.parent(specTR, g);

  // Terminal Prompt Text (shakyaprajesh.com.np)
  var promptText = api.create("textShape", "S01_Domain_Prompt");
  api.set(promptText, {
    "text": "shakyaprajesh.com.np",
    "font": CONFIG.fonts.mono,
    "fontSize": 42,
    "letterSpacing": 0.05,
    "position.x": -20,
    "position.y": 0,
    "horizontalAlignment": 1,
    "material.materialColor": CONFIG.colors.primaryWhite
  });
  api.parent(promptText, g);

  // Fade-in type reveal
  api.keyframe(promptText, s.start + 30, { "opacity": 0 });
  api.keyframe(promptText, s.start + 80, { "opacity": 100 });
  api.magicEasing(promptText, "opacity", s.start + 80, "EaseOut");

  // Glowing Blinking Cursor
  var cursor = api.create("basicShape", "S01_Cursor");
  api.set(cursor, {
    "generator": "rectangle",
    "generator.radius.x": 3,
    "generator.radius.y": 24,
    "position.x": 260,
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
