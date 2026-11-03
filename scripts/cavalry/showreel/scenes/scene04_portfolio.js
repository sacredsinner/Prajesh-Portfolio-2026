/**
 * Scene 04 — Portfolio Explosion
 * Frames: 840 – 1140 (0:14 – 0:19 @ 60 FPS)
 */

function buildScene04(api, rootGroup, CONFIG) {
  var s = CONFIG.scenes.s04;
  var g = api.create("group", "Scene_04_Portfolio_Explosion");
  api.set(g, { "groupMode": 0 });
  if (rootGroup) {
    api.parent(g, rootGroup);
  }

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

  // Center Monolith Title
  var centerTitle = api.create("textShape", "S04_CenterTitle");
  api.set(centerTitle, {
    "text": "Distinctive Identities Across 8 Sectors",
    "font.font": CONFIG.fonts.serif.font,
    "font.style": CONFIG.fonts.serif.style,
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
      "font.font": CONFIG.fonts.mono.font,
      "font.style": CONFIG.fonts.mono.style,
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
      "font.font": CONFIG.fonts.sans.font,
      "font.style": CONFIG.fonts.sans.style,
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
