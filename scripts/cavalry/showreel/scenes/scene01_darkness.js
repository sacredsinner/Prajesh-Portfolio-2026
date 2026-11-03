/**
 * Scene 01 — Darkness & Terminal Genesis
 * Frames: 0 – 240 (0:00 – 0:04 @ 60 FPS)
 */

function buildScene01(api, rootGroup, CONFIG) {
  var s = CONFIG.scenes.s01;
  var g = api.create("group", "Scene_01_Darkness");
  api.set(g, { "groupMode": 0 });
  if (rootGroup) {
    api.parent(g, rootGroup);
  }

  // Scene Visibility Keyframes (Active: 0 - 240)
  api.keyframe(g, s.start, { "opacity": 0 });
  api.keyframe(g, s.start + 20, { "opacity": 100 });
  // magicEasing on group omitted for Cavalry compatibility
  api.keyframe(g, s.end - 20, { "opacity": 100 });
  api.keyframe(g, s.end, { "opacity": 0 });
  // magicEasing on group omitted for Cavalry compatibility

  // Subtle camera drift on group scale
  api.keyframe(g, s.start, { "scale.x": 0.95, "scale.y": 0.95 });
  api.keyframe(g, s.end, { "scale.x": 1.05, "scale.y": 1.05 });
  // magicEasing on group omitted for Cavalry compatibility
  // magicEasing on group omitted for Cavalry compatibility

  // Corner specs (Geist Mono)
  var specTL = api.create("textShape", "S01_Spec_TL");
  api.set(specTL, {
    "text": "[ 01 / 10 ] INITIALIZING BRAND FILM",
    "font.font": CONFIG.fonts.mono.font,
    "font.style": CONFIG.fonts.mono.style,
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
    "font.font": CONFIG.fonts.mono.font,
    "font.style": CONFIG.fonts.mono.style,
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
    "font.font": CONFIG.fonts.mono.font,
    "font.style": CONFIG.fonts.mono.style,
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
