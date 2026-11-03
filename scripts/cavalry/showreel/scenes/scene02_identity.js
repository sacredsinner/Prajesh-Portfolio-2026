/**
 * Scene 02 — Identity & Macro Typography
 * Frames: 240 – 540 (0:04 – 0:09 @ 60 FPS)
 */

function buildScene02(api, rootGroup, CONFIG) {
  var s = CONFIG.scenes.s02;
  var g = api.create("group", "Scene_02_Identity");
  api.set(g, { "groupMode": 0 });
  if (rootGroup) {
    api.parent(g, rootGroup);
  }

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
    "font.font": CONFIG.fonts.mono.font,
    "font.style": CONFIG.fonts.mono.style,
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
    "font.font": CONFIG.fonts.serif.font,
    "font.style": CONFIG.fonts.serif.style,
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
    "font.font": CONFIG.fonts.serif.font,
    "font.style": CONFIG.fonts.serif.style,
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
      "font.font": CONFIG.fonts.sans.font,
      "font.style": CONFIG.fonts.sans.style,
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
