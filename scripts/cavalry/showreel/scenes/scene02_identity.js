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

  // Hairline perimeter frame
  var frameBorder = api.create("basicShape", "S02_Hairline_Frame");
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

  // Eyebrow label (Geist Mono)
  var eyebrow = api.create("textShape", "S02_Eyebrow");
  api.set(eyebrow, {
    "text": "IDENTITY & CREATIVE DIRECTION",
    "font": CONFIG.fonts.mono,
    "fontSize": 13,
    "letterSpacing": 0.2,
    "position.x": 0,
    "position.y": 190,
    "horizontalAlignment": 1,
    "material.materialColor": CONFIG.colors.accentBlue
  });
  api.parent(eyebrow, g);

  // First Name: PRAJESH (Instrument Serif)
  var first = api.create("textShape", "S02_First_Name");
  api.set(first, {
    "text": "Prajesh",
    "font": CONFIG.fonts.serif,
    "fontSize": 130,
    "letterSpacing": -0.02,
    "position.x": 0,
    "position.y": 45,
    "horizontalAlignment": 1,
    "material.materialColor": CONFIG.colors.primaryWhite
  });
  api.parent(first, g);

  api.keyframe(first, s.start + 10, { "position.y": 75, "opacity": 0 });
  api.keyframe(first, s.start + 50, { "position.y": 45, "opacity": 100 });
  api.magicEasing(first, "position.y", s.start + 50, "EaseOut");
  api.magicEasing(first, "opacity", s.start + 50, "EaseOut");

  // Last Name: SHAKYA (Instrument Serif)
  var last = api.create("textShape", "S02_Last_Name");
  api.set(last, {
    "text": "Shakya",
    "font": CONFIG.fonts.serif,
    "fontSize": 130,
    "letterSpacing": -0.02,
    "position.x": 0,
    "position.y": -80,
    "horizontalAlignment": 1,
    "material.materialColor": CONFIG.colors.primaryWhite
  });
  api.parent(last, g);

  api.keyframe(last, s.start + 40, { "position.y": -50, "opacity": 0 });
  api.keyframe(last, s.start + 80, { "position.y": -80, "opacity": 100 });
  api.magicEasing(last, "position.y", s.start + 80, "EaseOut");
  api.magicEasing(last, "opacity", s.start + 80, "EaseOut");

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
      "fontSize": 18,
      "letterSpacing": 0.15,
      "position.x": (i - 1) * 320,
      "position.y": -200,
      "horizontalAlignment": 1,
      "material.materialColor": CONFIG.colors.secondaryGray
    });
    api.parent(sub, g);

    api.keyframe(sub, s.start + 80 + i * 20, { "opacity": 0, "scale.y": 0.8 });
    api.keyframe(sub, s.start + 120 + i * 20, { "opacity": 100, "scale.y": 1.0 });
    api.magicEasing(sub, "opacity", s.start + 120 + i * 20, "EaseOut");
  }

  // 45° Isometric Grid Accent Lines (4 corners)
  var angles = [-45, 45, 135, 225];
  for (var a = 0; a < angles.length; a++) {
    var tick = api.create("basicShape", "S02_GridTick_" + a);
    api.set(tick, {
      "generator": "rectangle",
      "generator.radius.x": 1,
      "generator.radius.y": 36,
      "rotation": angles[a],
      "position.x": Math.cos(angles[a] * Math.PI / 180) * 420,
      "position.y": Math.sin(angles[a] * Math.PI / 180) * 240,
      "material.materialColor": CONFIG.colors.accentBlue
    });
    api.parent(tick, g);
  }

  return g;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = buildScene02;
}
