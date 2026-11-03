import fs from "node:fs"
import path from "node:path"
import http from "node:http"
import { execSync } from "node:child_process"

const FFMPEG_PATH = "C:\\Users\\blcne\\.spotdl\\ffmpeg.exe"

function sendToCavalry(code: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ type: "script", code })
    const req = http.request(
      "http://127.0.0.1:8080/post",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = ""
        res.on("data", (chunk) => {
          data += chunk
        })
        res.on("end", () => resolve(data))
      }
    )

    req.on("error", (err) => reject(err))
    req.write(payload)
    req.end()
  })
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
  console.log("=== Prajesh Shakya Logo Animation — Cavalry & Video Renderer ===")

  // 1. Prepare directories
  const rendersDir = path.resolve(__dirname, "logo_frames")
  if (!fs.existsSync(rendersDir)) {
    fs.mkdirSync(rendersDir, { recursive: true })
  }

  const videosDir = path.resolve(process.cwd(), "public", "videos")
  if (!fs.existsSync(videosDir)) {
    fs.mkdirSync(videosDir, { recursive: true })
  }

  // 2. Load scene generator script
  const sceneScriptPath = path.resolve(__dirname, "scenes", "scene_logo_animation.js")
  const sceneCode = fs.readFileSync(sceneScriptPath, "utf-8")

  // 3. Setup Composition (1920x1080 @ 60 FPS, 300 frames)
  console.log("[1/4] Setting up Cavalry composition (300 frames @ 60 FPS)...")
  const setupCode = `
var comp = api.getActiveComp();
if (comp) {
  try { api.setOutFrame(comp, 300); } catch(e) {}
  try { api.setInFrame(comp, 0); } catch(e) {}

  var children = api.getChildren(comp);
  for (var i = 0; i < children.length; i++) {
    api.deleteLayer(children[i]);
  }
}

${sceneCode}

buildLogoAnimationScene(api, null, null);
api.setFrame(0);
`
  await sendToCavalry(setupCode)
  console.log("✔ Composition and layers created in Cavalry.")
  await sleep(500)

  // 4. Render keyframe proof stills
  console.log("[2/4] Rendering keyframe stills (F30, F90, F150, F210, F270)...")
  const proofFrames = [30, 90, 150, 210, 270]
  for (const f of proofFrames) {
    const proofPath = path.resolve(rendersDir, `proof_f${String(f).padStart(3, "0")}.png`).replace(/\\/g, "/")
    const renderProofCode = `
api.setFrame(${f});
api.renderPNGFrame("${proofPath}", 100);
`
    await sendToCavalry(renderProofCode)
    await sleep(200)
    console.log(`  ▸ Rendered proof still for frame ${f}`)
  }

  // 5. Render smooth sequence (step of 2 frames = 150 frames for high performance 30/60fps playback)
  console.log("[3/4] Rendering frame sequence (150 frames @ 30 FPS)...")
  const TOTAL_FRAMES = 150
  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const cavalryFrame = i * 2 // map 0..149 to 0..298
    const outFrameFile = path.resolve(rendersDir, `frame_${String(i).padStart(4, "0")}.png`).replace(/\\/g, "/")
    const renderCode = `
api.setFrame(${cavalryFrame});
api.renderPNGFrame("${outFrameFile}", 100);
`
    await sendToCavalry(renderCode)
    await sleep(45)

    if (i % 15 === 0 || i === TOTAL_FRAMES - 1) {
      process.stdout.write(`  Rendered ${i + 1}/${TOTAL_FRAMES} frames...\r`)
    }
  }
  console.log(`\n✔ Rendered all ${TOTAL_FRAMES} frames to ${rendersDir}.`)

  // 6. Encode video with FFmpeg
  console.log("[4/4] Encoding H.264 MP4 video via FFmpeg...")
  const publicMp4 = path.resolve(videosDir, "prajesh-shakya-logo-animation.mp4")
  const rootMp4 = path.resolve(process.cwd(), "Prajesh-Shakya-Logo-Animation.mp4")
  const artifactMp4 = path.resolve("C:\\Users\\blcne\\.gemini\\antigravity\\brain\\73afed7b-f00d-49d8-8d20-80d064c13651", "Prajesh-Shakya-Logo-Animation.mp4")

  const ffmpegCmd = `"${FFMPEG_PATH}" -y -framerate 30 -i "${rendersDir}\\frame_%04d.png" -c:v libx264 -pix_fmt yuv420p -crf 18 -preset fast -movflags +faststart "${publicMp4}"`
  console.log(`Running FFmpeg: ${ffmpegCmd}`)
  execSync(ffmpegCmd, { stdio: "inherit" })

  // Copy to root & artifact dir
  fs.copyFileSync(publicMp4, rootMp4)
  try {
    fs.copyFileSync(publicMp4, artifactMp4)
  } catch (err) {
    console.warn("Could not copy to artifact dir:", err)
  }

  const stats = fs.statSync(publicMp4)
  console.log(`\n🎉 SUCCESS! Rendered video: ${publicMp4} (${(stats.size / 1024).toFixed(1)} KB)`)
  console.log(`Saved root video to: ${rootMp4}`)
  console.log(`Saved artifact video to: ${artifactMp4}`)
}

main().catch(console.error)
