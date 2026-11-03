/**
 * Scene 09 — Numbers & Impact
 * Frames: 2460 – 2760 (0:41 – 0:46 @ 60 FPS)
 */

function buildScene09(api, rootGroup, CONFIG) {
  var s = CONFIG.scenes.s09;
  var g = api.create("group", "Scene_09_Numbers");
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
  var header = api.create("textShape", "S09_Header");
  api.set(header, {
    "text": "09 // PROVEN TRACK RECORD · REPUTATION & LONGEVITY",
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

  // 3 Monumental Stat Columns
  var stats = [
    { num: "6+", label: "Years of Craft", sub: "Deep positioning & systems", x: -480 },
    { num: "100+", label: "Brand Projects", sub: "Global clients across 7 regions", x: 0 },
    { num: "100%", label: "Bespoke Vision", sub: "No generic templates or shortcuts", x: 480 }
  ];

  for (var i = 0; i < stats.length; i++) {
    var st = stats[i];
    var colGroup = api.create("group", "S09_StatCol_" + i);
    api.parent(colGroup, g);

    // Number (Instrument Serif, massive 140pt)
    var numText = api.create("textShape", "S09_Num_" + i);
    api.set(numText, {
      "text": st.num,
      "font.font": CONFIG.fonts.serif.font,
      "font.style": CONFIG.fonts.serif.style,
      "fontSize": 140,
      "letterSpacing": -0.03,
      "position.x": st.x,
      "position.y": 40,
      "horizontalAlignment": 1,
      "material.materialColor": (i === 1) ? CONFIG.colors.primaryWhite : CONFIG.colors.secondaryGray
    });
    api.parent(numText, colGroup);

    // Label (Plus Jakarta Sans)
    var labelText = api.create("textShape", "S09_Label_" + i);
    api.set(labelText, {
      "text": st.label,
      "font.font": CONFIG.fonts.sans.font,
      "font.style": CONFIG.fonts.sans.style,
      "fontSize": 22,
      "letterSpacing": 0.05,
      "position.x": st.x,
      "position.y": -80,
      "horizontalAlignment": 1,
      "material.materialColor": (i === 1) ? CONFIG.colors.accentBlue : CONFIG.colors.primaryWhite
    });
    api.parent(labelText, colGroup);

    // Subtitle (Geist Mono)
    var subText = api.create("textShape", "S09_Sub_" + i);
    api.set(subText, {
      "text": st.sub,
      "font.font": CONFIG.fonts.mono.font,
      "font.style": CONFIG.fonts.mono.style,
      "fontSize": 13,
      "position.x": st.x,
      "position.y": -120,
      "horizontalAlignment": 1,
      "material.materialColor": CONFIG.colors.mutedGray
    });
    api.parent(subText, colGroup);

    // Staggered rise animation
    var entryFrame = s.start + 20 + i * 25;
    api.keyframe(colGroup, entryFrame, { "position.y": -50, "opacity": 0 });
    api.keyframe(colGroup, entryFrame + 35, { "position.y": 0, "opacity": 100 });
    api.magicEasing(colGroup, "position.y", entryFrame + 35, "EaseOut");
    api.magicEasing(colGroup, "opacity", entryFrame + 35, "EaseOut");
  }

  // Footer Tagline
  var footerTag = api.create("textShape", "S09_Footer");
  api.set(footerTag, {
    "text": "BRAND SYSTEMS · MOTION DESIGN · CREATIVE STRATEGY",
    "font.font": CONFIG.fonts.mono.font,
    "font.style": CONFIG.fonts.mono.style,
    "fontSize": 14,
    "letterSpacing": 0.25,
    "position.x": 0,
    "position.y": -280,
    "horizontalAlignment": 1,
    "material.materialColor": CONFIG.colors.secondaryGray
  });
  api.parent(footerTag, g);

  return g;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = buildScene09;
}
