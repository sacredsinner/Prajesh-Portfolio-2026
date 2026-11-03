import fs from "node:fs/promises"
import path from "node:path"

// Generator for a production-grade Bodymovin / Lottie JSON specification
// Represents Concept 01: "The Architectural Trace" (300 frames @ 60 FPS)

export function buildLogoLottieJson(): any {
  return {
    v: "5.7.4",
    fr: 60,
    ip: 0,
    op: 300,
    w: 1920,
    h: 1080,
    nm: "Prajesh Shakya - Logo Animation (The Architectural Trace)",
    ddd: 0,
    assets: [],
    layers: [
      // Layer 1: Wordmark & Subtitle Lockup (Instrument Sans)
      {
        ddd: 0,
        ind: 1,
        ty: 4, // Shape layer
        nm: "Wordmark Typography & Baseline",
        sr: 1,
        ks: {
          o: {
            a: 1,
            k: [
              { t: 180, s: [0], e: [100], i: { x: [0.16], y: [1] }, o: { x: [0.16], y: [0] } },
              { t: 240, s: [100] },
            ],
          },
          r: { a: 0, k: 0 },
          p: {
            a: 1,
            k: [
              { t: 180, s: [960, 720, 0], e: [960, 690, 0], i: { x: [0.16], y: [1] }, o: { x: [0.16], y: [0] } },
              { t: 240, s: [960, 690, 0] },
            ],
          },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 0, k: [100, 100, 100] },
        },
        ao: 0,
        shapes: [
          // Baseline hairline rule
          {
            ty: "gr",
            it: [
              {
                ty: "rc",
                d: 1,
                s: {
                  a: 1,
                  k: [
                    { t: 180, s: [0, 1], e: [320, 1], i: { x: [0.16], y: [1] }, o: { x: [0.16], y: [0] } },
                    { t: 240, s: [320, 1] },
                  ],
                },
                p: { a: 0, k: [0, -30] },
                r: { a: 0, k: 0 },
                nm: "Baseline Rule",
              },
              {
                ty: "fl",
                c: { a: 0, k: [0.85, 0.84, 0.8, 1] }, // #D9D7CD Hairline
                o: { a: 0, k: 80 },
                r: 1,
                bm: 0,
                nm: "Rule Fill",
              },
              {
                ty: "tr",
                p: { a: 0, k: [0, 0] },
                a: { a: 0, k: [0, 0] },
                s: { a: 0, k: [100, 100] },
                r: { a: 0, k: 0 },
                o: { a: 0, k: 100 },
                sk: { a: 0, k: 0 },
                sa: { a: 0, k: 0 },
                nm: "Transform Rule",
              },
            ],
            nm: "Baseline Group",
          },
        ],
        ip: 180,
        op: 300,
        st: 180,
        bm: 0,
      },

      // Layer 2: PS Monogram Solid Fill Bloom (Frames 150 - 300)
      {
        ddd: 0,
        ind: 2,
        ty: 4,
        nm: "PS Monogram Solid Fill",
        sr: 1,
        ks: {
          o: {
            a: 1,
            k: [
              { t: 150, s: [0], e: [100], i: { x: [0.16], y: [1] }, o: { x: [0.16], y: [0] } },
              { t: 190, s: [100] },
            ],
          },
          r: { a: 0, k: 45 },
          p: { a: 0, k: [960, 480, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: {
            a: 1,
            k: [
              { t: 150, s: [92, 92, 100], e: [100, 100, 100], i: { x: [0.16], y: [1] }, o: { x: [0.16], y: [0] } },
              { t: 190, s: [100, 100, 100] },
            ],
          },
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ty: "rc",
                d: 1,
                s: { a: 0, k: [120, 120] },
                p: { a: 0, k: [0, 0] },
                r: { a: 0, k: 18 },
                nm: "Monogram Outer Form",
              },
              {
                ty: "fl",
                c: { a: 0, k: [0.106, 0.102, 0.086, 1] }, // #1B1A16 Obsidian Ink
                o: { a: 0, k: 100 },
                r: 1,
                bm: 0,
                nm: "Ink Fill",
              },
              {
                ty: "tr",
                p: { a: 0, k: [0, 0] },
                a: { a: 0, k: [0, 0] },
                s: { a: 0, k: [100, 100] },
                r: { a: 0, k: 0 },
                o: { a: 0, k: 100 },
                sk: { a: 0, k: 0 },
                sa: { a: 0, k: 0 },
                nm: "Transform Core",
              },
            ],
            nm: "Core Diamond Fill",
          },
        ],
        ip: 140,
        op: 300,
        st: 140,
        bm: 0,
      },

      // Layer 3: PS Monogram Stroke Trim Path (Frames 30 - 180)
      {
        ddd: 0,
        ind: 3,
        ty: 4,
        nm: "PS Monogram Stroke Trim",
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: { a: 0, k: 45 },
          p: { a: 0, k: [960, 480, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 0, k: [100, 100, 100] },
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ty: "rc",
                d: 1,
                s: { a: 0, k: [120, 120] },
                p: { a: 0, k: [0, 0] },
                r: { a: 0, k: 18 },
                nm: "Trim Rect Path",
              },
              {
                ty: "st",
                c: { a: 0, k: [0.106, 0.102, 0.086, 1] }, // #1B1A16 Obsidian Ink
                o: { a: 0, k: 100 },
                w: { a: 0, k: 3.5 },
                lc: 2,
                lj: 2,
                nm: "Stroke Ink",
              },
              // Trim Path Operator
              {
                ty: "tm",
                s: { a: 0, k: 0 },
                e: {
                  a: 1,
                  k: [
                    { t: 30, s: [0], e: [100], i: { x: [0.2], y: [1] }, o: { x: [0.2], y: [0] } },
                    { t: 150, s: [100] },
                  ],
                },
                o: { a: 0, k: 0 },
                m: 1,
                nm: "Trim Path Animation",
              },
              {
                ty: "tr",
                p: { a: 0, k: [0, 0] },
                a: { a: 0, k: [0, 0] },
                s: { a: 0, k: [100, 100] },
                r: { a: 0, k: 0 },
                o: { a: 0, k: 100 },
                sk: { a: 0, k: 0 },
                sa: { a: 0, k: 0 },
                nm: "Transform Stroke",
              },
            ],
            nm: "Stroke Group",
          },
        ],
        ip: 20,
        op: 210,
        st: 20,
        bm: 0,
      },

      // Layer 4: 45° Isometric Matrix & Bounding Diamond (Frames 0 - 300)
      {
        ddd: 0,
        ind: 4,
        ty: 4,
        nm: "Isometric 45 Matrix",
        sr: 1,
        ks: {
          o: {
            a: 1,
            k: [
              { t: 10, s: [0], e: [30], i: { x: [0.16], y: [1] }, o: { x: [0.16], y: [0] } },
              { t: 40, s: [30], e: [10], i: { x: [0.16], y: [1] }, o: { x: [0.16], y: [0] } },
              { t: 160, s: [10] },
            ],
          },
          r: { a: 0, k: 45 },
          p: { a: 0, k: [960, 480, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 0, k: [100, 100, 100] },
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ty: "rc",
                d: 1,
                s: { a: 0, k: [220, 220] },
                p: { a: 0, k: [0, 0] },
                r: { a: 0, k: 0 },
                nm: "Bounding Diamond",
              },
              {
                ty: "st",
                c: { a: 0, k: [0.85, 0.84, 0.8, 1] }, // #D9D7CD Hairline
                o: { a: 0, k: 60 },
                w: { a: 0, k: 1 },
                lc: 2,
                lj: 2,
                nm: "Hairline Stroke",
              },
              {
                ty: "tr",
                p: { a: 0, k: [0, 0] },
                a: { a: 0, k: [0, 0] },
                s: { a: 0, k: [100, 100] },
                r: { a: 0, k: 0 },
                o: { a: 0, k: 100 },
                sk: { a: 0, k: 0 },
                sa: { a: 0, k: 0 },
                nm: "Transform Grid",
              },
            ],
            nm: "Grid Group",
          },
        ],
        ip: 0,
        op: 300,
        st: 0,
        bm: 0,
      },

      // Layer 5: Parchment Ground Background (#F5F5F3)
      {
        ddd: 0,
        ind: 5,
        ty: 1, // Solid layer
        nm: "Parchment Ground (#F5F5F3)",
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: { a: 0, k: 0 },
          p: { a: 0, k: [960, 540, 0] },
          a: { a: 0, k: [960, 540, 0] },
          s: { a: 0, k: [100, 100, 100] },
        },
        ao: 0,
        sw: 1920,
        sh: 1080,
        sc: "#F5F5F3",
        ip: 0,
        op: 300,
        st: 0,
        bm: 0,
      },
    ],
  }
}

async function main() {
  console.log("Generating Bodymovin / Lottie JSON animation...")
  const lottieData = buildLogoLottieJson()
  const jsonStr = JSON.stringify(lottieData, null, 2)

  // 1. public/animations/
  const publicDir = path.resolve(process.cwd(), "public", "animations")
  await fs.mkdir(publicDir, { recursive: true })
  const publicFile = path.resolve(publicDir, "prajesh-shakya-logo.json")
  await fs.writeFile(publicFile, jsonStr)
  console.log(`Saved public Lottie file to: ${publicFile} (${(jsonStr.length / 1024).toFixed(1)} KB)`)

  // 2. Root
  const rootFile = path.resolve(process.cwd(), "Prajesh-Shakya-Logo.json")
  await fs.writeFile(rootFile, jsonStr)
  console.log(`Saved root Lottie file to: ${rootFile}`)

  // 3. Artifact directory
  const artifactFile = path.resolve(
    "C:\\Users\\blcne\\.gemini\\antigravity\\brain\\73afed7b-f00d-49d8-8d20-80d064c13651",
    "prajesh-shakya-logo.json"
  )
  try {
    await fs.writeFile(artifactFile, jsonStr)
    console.log(`Saved artifact Lottie file to: ${artifactFile}`)
  } catch (err) {
    console.warn("Could not write to artifact dir:", err)
  }

  console.log("✔ Lottie JSON generation complete!")
}

main().catch(console.error)
