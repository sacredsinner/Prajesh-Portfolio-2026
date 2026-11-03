/**
 * Scene 03 — The Process & Floating Multi-Plane Assets
 * Frames: 540 – 840 (0:09 – 0:14 @ 60 FPS)
 */

function buildScene03(api, rootGroup, CONFIG) {
  var s = CONFIG.scenes.s03;
  var g = api.create("group", "Scene_03_Process");
  api.set(g, { "groupMode": 0 });
  if (rootGroup) {
    api.parent(g, rootGroup);
  }

  // Group Visibility Keyframes
  api.keyframe(g, s.start, { "opacity": 0 });
  api.keyframe(g, s.start + 20, { "opacity": 100 });
  // magicEasing on group omitted for Cavalry compatibility
  api.keyframe(g, s.end - 20, { "opacity": 100 });
  api.keyframe(g, s.end, { "opacity": 0 });
  // magicEasing on group omitted for Cavalry compatibility

  // Scene Section Header
  var header = api.create("textShape", "S03_Header");
  api.set(header, {
    "text": "03 // STRATEGY · ARCHITECTURE · FORM",
    "font.font": CONFIG.fonts.mono.font,
    "font.style": CONFIG.fonts.mono.style,
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
    "font.font": CONFIG.fonts.serif.font,
    "font.style": CONFIG.fonts.serif.style,
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
      "font.font": CONFIG.fonts.mono.font,
      "font.style": CONFIG.fonts.mono.style,
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
      "font.font": CONFIG.fonts.sans.font,
      "font.style": CONFIG.fonts.sans.style,
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
    // magicEasing on cardGroup omitted
    // magicEasing on cardGroup omitted
  }

  return g;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = buildScene03;
}
