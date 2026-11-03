/**
 * Scene 06 — Motion Graphics & Radial Kinetic Moiré
 * Frames: 1440 – 1800 (0:24 – 0:30 @ 60 FPS)
 */

function buildScene06(api, rootGroup, CONFIG) {
  var s = CONFIG.scenes.s06;
  var g = api.create("group", "Scene_06_Motion_Graphics");
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
  var header = api.create("textShape", "S06_Header");
  api.set(header, {
    "text": "06 // GENERATIVE KINETIC MOIRÉ · PS MONOGRAM · WAVE PHYSICS",
    "font.font": CONFIG.fonts.mono.font,
    "font.style": CONFIG.fonts.mono.style,
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
    // magicEasing on ringGroup omitted

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
    "font.font": CONFIG.fonts.serif.font,
    "font.style": CONFIG.fonts.serif.style,
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
  // magicEasing on monoGroup omitted

  return g;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = buildScene06;
}
