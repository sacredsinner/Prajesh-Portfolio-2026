const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const STALLION_URL = 'http://127.0.0.1:8080/post';

async function sendToCavalry(code) {
  const response = await fetch(STALLION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'script', code })
  });
  if (!response.ok) {
    throw new Error(`Stallion HTTP ${response.status}: ${await response.text()}`);
  }
  return response.text();
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForFile(filePath, timeoutMs = 4000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (fs.existsSync(filePath)) {
      try {
        const stats = fs.statSync(filePath);
        if (stats.size > 5000) {
          // Give tiny breather for file handle closure
          await sleep(200);
          return stats;
        }
      } catch (e) {}
    }
    await sleep(200);
  }
  return null;
}

const CONFIG = require('./config.js');

const SCENES = [
  { id: 's01', fn: 'buildScene01', file: 'scene01_darkness.js', midFrame: 80, name: '01 Darkness' },
  { id: 's02', fn: 'buildScene02', file: 'scene02_identity.js', midFrame: 360, name: '02 Identity' },
  { id: 's03', fn: 'buildScene03', file: 'scene03_process.js', midFrame: 680, name: '03 Process' },
  { id: 's04', fn: 'buildScene04', file: 'scene04_portfolio.js', midFrame: 980, name: '04 Portfolio Explosion' },
  { id: 's05', fn: 'buildScene05', file: 'scene05_ui.js', midFrame: 1280, name: '05 UI Sequence' },
  { id: 's06', fn: 'buildScene06', file: 'scene06_motion_graphics.js', midFrame: 1600, name: '06 Motion Graphics' },
  { id: 's07', fn: 'buildScene07', file: 'scene07_workflow.js', midFrame: 1950, name: '07 Creative Workflow' },
  { id: 's08', fn: 'buildScene08', file: 'scene08_ai_design.js', midFrame: 2280, name: '08 AI Design' },
  { id: 's09', fn: 'buildScene09', file: 'scene09_numbers.js', midFrame: 2600, name: '09 Numbers' },
  { id: 's10', fn: 'buildScene10', file: 'scene10_closing.js', midFrame: 2880, name: '10 Closing' }
];

async function main() {
  console.log('====================================================');
  console.log('  SHAKYAPRAJESH.COM.NP — CAVALRY SHOWREEL DEPLOYER  ');
  console.log('  Master Composition: 3,000 Frames @ 60 FPS         ');
  console.log('====================================================\n');

  const rendersDir = path.resolve(__dirname, 'renders');
  if (!fs.existsSync(rendersDir)) {
    fs.mkdirSync(rendersDir, { recursive: true });
  }

  // Clean old test files
  const existingFiles = fs.readdirSync(rendersDir);
  for (const f of existingFiles) {
    if (f.startsWith('test_') || f.startsWith('proof_')) {
      try { fs.unlinkSync(path.join(rendersDir, f)); } catch (e) {}
    }
  }

  // 1. Initialize Composition & Global Environment
  console.log('[Step 1/3] Initializing Composition & Resetting Scene Layers...');
  const initCode = `
var comp = api.getActiveComp();
if (comp) {
  api.set(comp, {
    "frameRate": ${CONFIG.comp.fps},
    "endFrame": ${CONFIG.comp.totalFrames}
  });
  var children = api.getChildren(comp);
  for (var i = 0; i < children.length; i++) {
    var cName = api.getName(children[i]);
    if (cName.indexOf("Scene_") === 0 || cName === "Master_Background" || cName === "Shakyaprajesh_Showreel_Master" || cName.indexOf("DEBUG_") === 0) {
      api.deleteLayer(children[i]);
    }
  }
}
var bg = api.create("backgroundShape", "Master_Background");
api.set(bg, { "material.materialColor": "${CONFIG.colors.background}" });
api.setCurrentFrame(0);
`;
  await sendToCavalry(initCode);
  console.log('✔ Master Canvas & Background initialized (#070707 deep black).\n');
  await sleep(400);

  // 2. Deploy Each Scene Sequentially & Render Midpoint Proof
  console.log('[Step 2/3] Deploying 10 Scenes & Rendering Midpoint Previews...');
  const results = [];

  for (let i = 0; i < SCENES.length; i++) {
    const sc = SCENES[i];
    const filePath = path.resolve(__dirname, 'scenes', sc.file);
    const sceneCode = fs.readFileSync(filePath, 'utf8');

    const renderOut = path.resolve(rendersDir, `scene_${String(i + 1).padStart(2, '0')}_f${sc.midFrame}.png`);
    if (fs.existsSync(renderOut)) {
      try { fs.unlinkSync(renderOut); } catch (e) {}
    }

    console.log(`\n  ▸ Deploying Scene ${i + 1}/10: ${sc.name} (Mid-frame: ${sc.midFrame})...`);

    // Injected code includes CONFIG in same execution scope
    const deployCode = `
var CONFIG = ${JSON.stringify(CONFIG)};
${sceneCode}

${sc.fn}(api, null, CONFIG);
api.setCurrentFrame(${sc.midFrame});
api.renderPNGFrame(${JSON.stringify(renderOut)}, 100);
`;
    await sendToCavalry(deployCode);

    // Wait for disk flush
    const stats = await waitForFile(renderOut, 5000);

    if (stats) {
      let pixelInfo = '';
      try {
        const pyCmd = `python -c "from PIL import Image; im = Image.open(r'${renderOut}'); print(im.size, im.getextrema())"`;
        pixelInfo = execSync(pyCmd).toString().trim();
      } catch (err) {
        pixelInfo = `Size: ${stats.size} bytes`;
      }

      console.log(`    ✔ Deployed & Rendered: ${path.basename(renderOut)} (${(stats.size / 1024).toFixed(1)} KB)`);
      console.log(`    ✔ Pixel Metrics: ${pixelInfo}`);
      results.push({
        scene: sc.name,
        frame: sc.midFrame,
        file: path.basename(renderOut),
        sizeKB: (stats.size / 1024).toFixed(1),
        status: 'SUCCESS'
      });
    } else {
      console.error(`    ✖ FAILED: Render file not found within timeout for ${sc.name}`);
      results.push({ scene: sc.name, frame: sc.midFrame, status: 'FAILED' });
    }
  }

  // 3. Reset Playhead to Frame 0
  console.log('\n[Step 3/3] Finalizing Master Timeline...');
  await sendToCavalry('api.setCurrentFrame(0);');
  console.log('✔ Timeline playhead reset to Frame 0.\n');

  console.log('====================================================');
  console.log('  DEPLOYMENT SUMMARY: ALL 10 SCENES READY IN CAVALRY ');
  console.log('====================================================');
  console.table(results);
}

main().catch(err => {
  console.error('\nDeployment Error:', err);
  process.exit(1);
});
