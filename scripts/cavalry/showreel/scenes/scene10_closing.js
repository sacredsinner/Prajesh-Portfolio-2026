/**
 * Scene 10 — Closing & Resonance
 * Frames: 2760 – 3000 (0:46 – 0:50 @ 60 FPS)
 */

function buildScene10(api, rootGroup, CONFIG) {
  var s = CONFIG.scenes.s10;
  var g = api.create("group", "Scene_10_Closing");
  api.set(g, { "groupMode": 0 });
  if (rootGroup) {
    api.parent(g, rootGroup);
  }

  // Group Visibility Keyframes
  api.keyframe(g, s.start, { "opacity": 0 });
  api.keyframe(g, s.start + 15, { "opacity": 100 });
  // magicEasing on group omitted for Cavalry compatibility
  api.keyframe(g, s.end - 25, { "opacity": 100 });
  api.keyframe(g, s.end, { "opacity": 0 });
  // magicEasing on group omitted for Cavalry compatibility

  // Eyebrow
  var eyebrow = api.create("textShape", "S10_Eyebrow");
  api.set(eyebrow, {
    "text": "10 // PHILOSOPHY & VISION",
    "font.font": CONFIG.fonts.mono.font,
    "font.style": CONFIG.fonts.mono.style,
    "fontSize": 14,
    "letterSpacing": 0.25,
    "position.x": 0,
    "position.y": 240,
    "horizontalAlignment": 1,
    "material.materialColor": CONFIG.colors.accentBlue
  });
  api.parent(eyebrow, g);

  // Main Closing Manifesto (Instrument Serif, 72pt)
  var manifesto = api.create("textShape", "S10_Manifesto");
  api.set(manifesto, {
    "text": "Crafting Authentic\nBrand Identities\nThat Resonate.",
    "font.font": CONFIG.fonts.serif.font,
    "font.style": CONFIG.fonts.serif.style,
    "fontSize": 72,
    "lineSpacing": 1.15,
    "letterSpacing": -0.02,
    "position.x": 0,
    "position.y": 40,
    "horizontalAlignment": 1,
    "material.materialColor": CONFIG.colors.primaryWhite
  });
  api.parent(manifesto, g);

  // Manifesto animation: gentle entrance
  api.keyframe(manifesto, s.start + 10, { "position.y": 10, "opacity": 0 });
  api.keyframe(manifesto, s.start + 45, { "position.y": 40, "opacity": 100 });
  api.keyframe(manifesto, s.start + 120, { "opacity": 0 }); // Dissolve out to reveal final domain
  api.magicEasing(manifesto, "position.y", s.start + 45, "EaseOut");
  api.magicEasing(manifesto, "opacity", s.start + 120, "EaseInOut");

  // Final Domain Lockup Group
  var domainGroup = api.create("group", "S10_Domain_Lockup");
  api.parent(domainGroup, g);

  // Final PS Monogram Core
  var finalHex = api.create("basicShape", "S10_Final_Hex");
  api.set(finalHex, {
    "generator.sides": 4,
    "rotation": 45,
    "generator.radius.x": 36,
    "generator.radius.y": 36,
    "position.x": 0,
    "position.y": 70,
    "material.materialColor": CONFIG.colors.accentBlue
  });
  api.parent(finalHex, domainGroup);

  var finalPSText = api.create("textShape", "S10_Final_PSText");
  api.set(finalPSText, {
    "text": "PS",
    "font.font": CONFIG.fonts.serif.font,
    "font.style": CONFIG.fonts.serif.style,
    "fontSize": 34,
    "position.x": 0,
    "position.y": 60,
    "horizontalAlignment": 1,
    "material.materialColor": CONFIG.colors.primaryWhite
  });
  api.parent(finalPSText, domainGroup);

  // Domain Text (Geist Mono, 42pt)
  var domainText = api.create("textShape", "S10_DomainText");
  api.set(domainText, {
    "text": "shakyaprajesh.com.np",
    "font.font": CONFIG.fonts.mono.font,
    "font.style": CONFIG.fonts.mono.style,
    "fontSize": 42,
    "letterSpacing": 0.08,
    "position.x": 0,
    "position.y": -30,
    "horizontalAlignment": 1,
    "material.materialColor": CONFIG.colors.primaryWhite
  });
  api.parent(domainText, domainGroup);

  var subRole = api.create("textShape", "S10_SubRole");
  api.set(subRole, {
    "text": "BRAND STRATEGY · IDENTITY DESIGN · CREATIVE CODE",
    "font.font": CONFIG.fonts.sans.font,
    "font.style": CONFIG.fonts.sans.style,
    "fontSize": 14,
    "letterSpacing": 0.2,
    "position.x": 0,
    "position.y": -90,
    "horizontalAlignment": 1,
    "material.materialColor": CONFIG.colors.secondaryGray
  });
  api.parent(subRole, domainGroup);

  // Domain lockup reveals after manifesto dissolves
  api.keyframe(domainGroup, s.start + 115, { "scale.x": 0.9, "scale.y": 0.9, "opacity": 0 });
  api.keyframe(domainGroup, s.start + 155, { "scale.x": 1.0, "scale.y": 1.0, "opacity": 100 });
  // magicEasing on domainGroup omitted
  // magicEasing on domainGroup omitted

  return g;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = buildScene10;
}
