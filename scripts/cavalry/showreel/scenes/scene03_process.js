/**
 * Scene 03 — The Process & Floating Multi-Plane Assets
 * Frames: 540 – 840 (0:09 – 0:14 @ 60 FPS)
 */

function buildScene03(api, rootGroup, CONFIG) {
  var s = CONFIG.scenes.s03;
  var g = api.create("group", "Scene_03_Process");
  api.parent(g, rootGroup);

  // Group Visibility Keyframes
  api.keyframe(g, s.start, { "opacity": 0 });
  api.keyframe(g, s.start + 20, { "opacity": 100 });
  api.magicEasing(g, "opacity", s.start + 20, "EaseOut");
  api.keyframe(g, s.end - 20, { "opacity": 100 });
  api.keyframe(g, s.end, { "opacity": 0 });
  api.magicEasing(g, "opacity", s.end, "EaseInOut");

  // Hairline perimeter frame
  var frameBorder = api.create("basicShape", "S03_Hairline_Frame");
  api.set(frameBorder, {
    "generator": "rectangle",
    "generator.radius.x": 1920 / 2 - 48,
    "generator.radius.y": 1080 / 2 - 48,
    "stroke.color": CONFIG.colors.hairline,
    "stroke.width": 1.0,
    "fill.color": "#00000000"
  });
  api.parent(frameBorder, g);

  // Scene Section Header
  var header = api.create("textShape", "S03_Header");
  api.set(header, {
    "text": "03 // STRATEGY · ARCHITECTURE · FORM",
    "font": CONFIG.fonts.mono,
    "fontSize": 13,
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
    "font": CONFIG.fonts.serif,
    "fontSize": 48,
    "letterSpacing": -0.015,
    "position.x": 0,
    "position.y": 320,
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

    // Card background panel
    var cardBg = api.create("basicShape", "S03_CardBg_" + i);
    api.set(cardBg, {
      "generator": "rectangle",
      "generator.radius.x": 105,
      "generator.radius.y": 140,
      "generator.cornerRadius": 8,
      "position.x": c.x,
      "position.y": c.y,
      "material.materialColor": c.accent ? CONFIG.colors.surfaceCard : CONFIG.colors.surfaceDark,
      "stroke.color": c.accent ? CONFIG.colors.accentBlue : CONFIG.colors.hairline,
      "stroke.width": 1.0
    });
    api.parent(cardBg, cardGroup);

    // Card Header Pill
    var cardPill = api.create("textShape", "S03_CardLabel_" + i);
    api.set(cardPill, {
      "text": c.label,
      "font": CONFIG.fonts.mono,
      "fontSize": 11,
      "letterSpacing": 0.1,
      "position.x": c.x,
      "position.y": c.y + 100,
      "horizontalAlignment": 1,
      "material.materialColor": c.accent ? CONFIG.colors.accentBlue : CONFIG.colors.mutedGray
    });
    api.parent(cardPill, cardGroup);

    // Card description
    var cardDesc = api.create("textShape", "S03_CardDesc_" + i);
    api.set(cardDesc, {
      "text": c.sub,
      "font": CONFIG.fonts.sans,
      "fontSize": 14,
      "position.x": c.x,
      "position.y": c.y - 80,
      "horizontalAlignment": 1,
      "material.materialColor": CONFIG.colors.secondaryGray
    });
    api.parent(cardDesc, cardGroup);

    // Floating parallax motion on cards
    var drift = (i % 2 === 0) ? 18 : -18;
    api.keyframe(cardGroup, s.start + 20, { "position.y": -drift });
    api.keyframe(cardGroup, s.start + 160, { "position.y": drift });
    api.keyframe(cardGroup, s.end - 20, { "position.y": -drift });
    api.magicEasing(cardGroup, "position.y", s.start + 160, "EaseInOut");
    api.magicEasing(cardGroup, "position.y", s.end - 20, "EaseInOut");
  }

  // Connecting motion path line (central hairline)
  var line = api.create("basicShape", "S03_ConnectPath");
  api.set(line, {
    "generator": "rectangle",
    "generator.radius.x": 550,
    "generator.radius.y": 0.5,
    "position.x": 0,
    "position.y": -20,
    "material.materialColor": CONFIG.colors.hairline
  });
  api.parent(line, g);

  return g;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = buildScene03;
}
