/**
 * Scene 07 — Creative Workflow Montage
 * Frames: 1800 – 2100 (0:30 – 0:35 @ 60 FPS)
 */

function buildScene07(api, rootGroup, CONFIG) {
  var s = CONFIG.scenes.s07;
  var g = api.create("group", "Scene_07_Creative_Workflow");
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
  var header = api.create("textShape", "S07_Header");
  api.set(header, {
    "text": "07 // MULTIDISCIPLINARY TOOL CHAIN · SYNCHRONIZED PIPELINE",
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

  var subTitle = api.create("textShape", "S07_SubTitle");
  api.set(subTitle, {
    "text": "From Concept to Motion Master",
    "font.font": CONFIG.fonts.serif.font,
    "font.style": CONFIG.fonts.serif.style,
    "fontSize": 52,
    "position.x": 0,
    "position.y": 350,
    "horizontalAlignment": 1,
    "material.materialColor": CONFIG.colors.primaryWhite
  });
  api.parent(subTitle, g);

  // 8 Tool Sequence
  var tools = [
    { name: "01 SKETCH", desc: "Raw Conceptualization", highlight: false },
    { name: "02 ILLUSTRATOR", desc: "Vector Geometry & Precision", highlight: false },
    { name: "03 PHOTOSHOP", desc: "Textural Alchemy", highlight: false },
    { name: "04 FIGMA", desc: "Component Systems & Specs", highlight: false },
    { name: "05 AFTER EFFECTS", desc: "Cinematic Choreography", highlight: false },
    { name: "06 CAVALRY", desc: "Procedural Kinetic Engines", highlight: true },
    { name: "07 BLENDER", desc: "Spatial Dimensions & Light", highlight: false },
    { name: "08 FINAL BRAND", desc: "Living Identity System", highlight: true }
  ];

  var rowStep = 68;
  var startY = 180;

  for (var i = 0; i < tools.length; i++) {
    var t = tools[i];
    var toolGroup = api.create("group", "S07_ToolRow_" + i);
    api.parent(toolGroup, g);

    var yPos = startY - i * rowStep;

    // Background pill stripe
    var pill = api.create("basicShape", "S07_Pill_" + i);
    api.set(pill, {
      "generator.sides": 4,
      "rotation": 45,
      "generator.radius.x": 440,
      "generator.radius.y": 24,
      "position.x": 0,
      "position.y": yPos,
      "material.materialColor": t.highlight ? CONFIG.colors.accentBlue : CONFIG.colors.surfaceCard
    });
    api.parent(pill, toolGroup);

    // Tool Name (Plus Jakarta Sans)
    var toolName = api.create("textShape", "S07_TName_" + i);
    api.set(toolName, {
      "text": t.name,
      "font.font": CONFIG.fonts.sans.font,
      "font.style": CONFIG.fonts.sans.style,
      "fontSize": 16,
      "letterSpacing": 0.15,
      "position.x": -400,
      "position.y": yPos - 5,
      "horizontalAlignment": 0,
      "material.materialColor": CONFIG.colors.primaryWhite
    });
    api.parent(toolName, toolGroup);

    // Tool Description (Geist Mono)
    var toolDesc = api.create("textShape", "S07_TDesc_" + i);
    api.set(toolDesc, {
      "text": t.desc,
      "font.font": CONFIG.fonts.mono.font,
      "font.style": CONFIG.fonts.mono.style,
      "fontSize": 13,
      "position.x": 400,
      "position.y": yPos - 5,
      "horizontalAlignment": 2,
      "material.materialColor": t.highlight ? CONFIG.colors.primaryWhite : CONFIG.colors.mutedGray
    });
    api.parent(toolDesc, toolGroup);

    // Staggered High-Velocity Entrance
    var entryFrame = s.start + 20 + i * 24;
    api.keyframe(toolGroup, entryFrame, { "position.x": -60, "opacity": 0 });
    api.keyframe(toolGroup, entryFrame + 18, { "position.x": 0, "opacity": 100 });
    api.magicEasing(toolGroup, "position.x", entryFrame + 18, "EaseOut");
    api.magicEasing(toolGroup, "opacity", entryFrame + 18, "EaseOut");
  }

  return g;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = buildScene07;
}
