/**
 * Scene 08 — AI + Creative Technology Node Graph
 * Frames: 2100 – 2460 (0:35 – 0:41 @ 60 FPS)
 */

function buildScene08(api, rootGroup, CONFIG) {
  var s = CONFIG.scenes.s08;
  var g = api.create("group", "Scene_08_AI_Design");
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
  var header = api.create("textShape", "S08_Header");
  api.set(header, {
    "text": "08 // AI AGENTS · CREATIVE CODING · MCP CONNECTIVITY",
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

  // Center Core Node (Creative Intelligence Engine)
  var coreGroup = api.create("group", "S08_CenterCore");
  api.parent(coreGroup, g);

  var coreCircle = api.create("basicShape", "S08_CoreCircle");
  api.set(coreCircle, {
    "generator.sides": 4,
    "rotation": 45,
    "generator.radius.x": 80,
    "generator.radius.y": 80,
    "material.materialColor": CONFIG.colors.accentBlue
  });
  api.parent(coreCircle, coreGroup);

  var coreLabel = api.create("textShape", "S08_CoreLabel");
  api.set(coreLabel, {
    "text": "AI DESIGN\nCORE",
    "font.font": CONFIG.fonts.mono.font,
    "font.style": CONFIG.fonts.mono.style,
    "fontSize": 14,
    "position.x": 0,
    "position.y": 0,
    "horizontalAlignment": 1,
    "material.materialColor": CONFIG.colors.primaryWhite
  });
  api.parent(coreLabel, coreGroup);

  // Pulse animation on center core
  api.keyframe(coreGroup, s.start + 20, { "scale.x": 0.9, "scale.y": 0.9 });
  api.keyframe(coreGroup, s.start + 180, { "scale.x": 1.15, "scale.y": 1.15 });
  api.keyframe(coreGroup, s.end - 20, { "scale.x": 1.0, "scale.y": 1.0 });
  api.magicEasing(coreGroup, "scale.x", s.start + 180, "EaseInOut");

  // 6 Satellite Connected Nodes
  var nodes = [
    { title: "AUTONOMOUS AGENTS", x: -440, y: 160 },
    { title: "MCP PROTOCOLS", x: 440, y: 160 },
    { title: "CREATIVE CODING", x: -500, y: -60 },
    { title: "MOTION ENGINES", x: 500, y: -60 },
    { title: "BROWSER AUTOMATION", x: -320, y: -240 },
    { title: "DESIGN SYSTEMS", x: 320, y: -240 }
  ];

  for (var i = 0; i < nodes.length; i++) {
    var n = nodes[i];
    var nodeGroup = api.create("group", "S08_NodeGroup_" + i);
    api.parent(nodeGroup, g);

    // Node Box
    var nodeCard = api.create("basicShape", "S08_NodeCard_" + i);
    api.set(nodeCard, {
      "generator.sides": 4,
      "rotation": 45,
      "generator.radius.x": 130,
      "generator.radius.y": 32,
      "position.x": n.x,
      "position.y": n.y,
      "material.materialColor": CONFIG.colors.surfaceCard
    });
    api.parent(nodeCard, nodeGroup);

    // Node Title (Plus Jakarta Sans)
    var nodeTitle = api.create("textShape", "S08_NTitle_" + i);
    api.set(nodeTitle, {
      "text": n.title,
      "font.font": CONFIG.fonts.sans.font,
      "font.style": CONFIG.fonts.sans.style,
      "fontSize": 12,
      "letterSpacing": 0.1,
      "position.x": n.x,
      "position.y": n.y - 5,
      "horizontalAlignment": 1,
      "material.materialColor": CONFIG.colors.primaryWhite
    });
    api.parent(nodeTitle, nodeGroup);

    // Staggered node entrance
    var nEntry = s.start + 30 + i * 16;
    api.keyframe(nodeGroup, nEntry, { "scale.x": 0.5, "scale.y": 0.5, "opacity": 0 });
    api.keyframe(nodeGroup, nEntry + 24, { "scale.x": 1.0, "scale.y": 1.0, "opacity": 100 });
    api.magicEasing(nodeGroup, "scale.x", nEntry + 24, "ElasticOut");
  }

  return g;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = buildScene08;
}
