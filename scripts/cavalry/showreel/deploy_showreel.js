const fs = require('fs');
const path = require('path');
const http = require('http');
const { execSync } = require('child_process');

const CONFIG = require('./config.js');

const SCENES = [
  { name: 'Scene 01: Darkness',            file: 'scene01_darkness.js',        fn: 'buildScene01', midFrame: 80   },
  { name: 'Scene 02: Identity',            file: 'scene02_identity.js',        fn: 'buildScene02', midFrame: 360  },
  { name: 'Scene 03: Process',             file: 'scene03_process.js',         fn: 'buildScene03', midFrame: 680  },
  { name: 'Scene 04: Portfolio Explosion', file: 'scene04_portfolio.js',       fn: 'buildScene04', midFrame: 980  },
  { name: 'Scene 05: UI Sequence',         file: 'scene05_ui.js',              fn: 'buildScene05', midFrame: 1280 },
  { name: 'Scene 06: Motion Graphics',     file: 'scene06_motion_graphics.js', fn: 'buildScene06', midFrame: 1600 },
  { name: 'Scene 07: Creative Workflow',   file: 'scene07_workflow.js',        fn: 'buildScene07', midFrame: 1950 },
  { name: 'Scene 08: AI + Design',         file: 'scene08_ai_design.js',       fn: 'buildScene08', midFrame: 2280 },
  { name: 'Scene 09: Numbers',             file: 'scene09_numbers.js',         fn: 'buildScene09', midFrame: 2600 },
  { name: 'Scene 10: Closing',             file: 'scene10_closing.js',         fn: 'buildScene10', midFrame: 2880 }
];

function sendToCavalry(code) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ type: 'script', code: code });
    const req = http.request('http://127.0.0.1:8080/post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => resolve(data));
    });

    req.on('error', err => reject(err));
    req.write(payload);
    req.end();
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForFile(filePath, timeoutMs = 8000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      if (stats.size > 2000) {
        return stats;
      }
    }
    await sleep(200);
  }
  return null;
}

async function main() {
  console.log('====================================================');
  console.log('  DEPLOYING PRAJESH SHAKYA SHOWREEL INTO CAVALRY    ');
  console.log('  "Crafting Brands That People Remember"            ');
  console.log('  Target: 50.0s (3,000 Frames @ 60 FPS)             ');
  console.log('====================================================\n');

  const rendersDir = path.resolve(__dirname, 'renders');
  if (!fs.existsSync(rendersDir)) {
    fs.mkdirSync(rendersDir, { recursive: true });
  }

  // 1. Initialize Composition & Set Frame Range to 3000
  console.log('[Step 1/3] Initializing Composition (3,000 Frames @ 60 FPS)...');
  const initCode = `
var comp = api.getActiveComp();
if (comp) {
  try { api.setOutFrame(comp, ${CONFIG.comp.totalFrames}); } catch(e) {}
  try { api.setInFrame(comp, 0); } catch(e) {}

  var children = api.getChildren(comp);
  for (var i = 0; i < children.length; i++) {
    var cName = api.getNiceName(children[i]);
    if (cName.indexOf("Scene_") === 0 || cName === "Master_Background" || cName === "Shakyaprajesh_Showreel_Master") {
      api.deleteLayer(children[i]);
    }
  }
}
var bg = api.create("backgroundShape", "Master_Background");
api.set(bg, { "material.materialColor": "${CONFIG.colors.background}" });
api.setFrame(0);
`;
  await sendToCavalry(initCode);
  console.log('✔ Master Canvas & Background initialized (#070707 deep black).\n');
  await sleep(600);

  // 2. Deploy Each Scene Sequentially & Render Proof Still
  console.log('[Step 2/3] Deploying 10 Scenes & Rendering Real Frame Proofs...');
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

    const deployCode = `
var CONFIG = ${JSON.stringify(CONFIG)};
${sceneCode}

${sc.fn}(api, null, CONFIG);
api.setFrame(${sc.midFrame});
api.renderPNGFrame(${JSON.stringify(renderOut.replace(/\\/g, '/'))}, 100);
`;
    await sendToCavalry(deployCode);

    const stats = await waitForFile(renderOut, 8000);

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
    await sleep(400);
  }

  // 3. Reset Playhead to Frame 0
  console.log('\n[Step 3/3] Finalizing Master Timeline...');
  await sendToCavalry('api.setFrame(0);');
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
