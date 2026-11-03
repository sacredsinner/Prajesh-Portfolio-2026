/**
 * Shakyaprajesh.com.np Showreel — Master Orchestrator
 * "Crafting Brands That People Remember"
 * Duration: 50.0s (3,000 frames @ 60 FPS)
 * Format: 1920x1080 (Switchable to 3840x2160 4K Master)
 */

function executeMasterShowreel() {
  console.log("=== Initializing Shakyaprajesh Showreel Master ===");

  var comp = api.getActiveComp();
  if (comp) {
    api.set(comp, {
      "frameRate": CONFIG.comp.fps,
      "endFrame": CONFIG.comp.totalFrames
    });

    // Clean existing showreel layers
    var children = api.getChildren(comp);
    for (var c = 0; c < children.length; c++) {
      var cName = api.getName(children[c]);
      if (cName.indexOf("Scene_") === 0 || cName === "Master_Background" || cName === "Shakyaprajesh_Showreel_Master") {
        api.deleteLayer(children[c]);
      }
    }
  }

  // 1. Global Deep-Black Canvas Background
  var bg = api.create("backgroundShape", "Master_Background");
  api.set(bg, {
    "material.materialColor": CONFIG.colors.background
  });

  // 2. Instantiate All 10 Scenes
  console.log("Instantiating Scene 01: Darkness...");
  buildScene01(api, null, CONFIG);

  console.log("Instantiating Scene 02: Identity...");
  buildScene02(api, null, CONFIG);

  console.log("Instantiating Scene 03: Process...");
  buildScene03(api, null, CONFIG);

  console.log("Instantiating Scene 04: Portfolio Explosion...");
  buildScene04(api, null, CONFIG);

  console.log("Instantiating Scene 05: UI Sequence...");
  buildScene05(api, null, CONFIG);

  console.log("Instantiating Scene 06: Motion Graphics...");
  buildScene06(api, null, CONFIG);

  console.log("Instantiating Scene 07: Creative Workflow...");
  buildScene07(api, null, CONFIG);

  console.log("Instantiating Scene 08: AI + Design...");
  buildScene08(api, null, CONFIG);

  console.log("Instantiating Scene 09: Numbers...");
  buildScene09(api, null, CONFIG);

  console.log("Instantiating Scene 10: Closing...");
  buildScene10(api, null, CONFIG);

  // 3. Reset playhead to Frame 0
  api.setCurrentFrame(0);

  console.log("=== Master Showreel Successfully Assembled (3,000 Frames @ 60 FPS) ===");
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = executeMasterShowreel;
}
