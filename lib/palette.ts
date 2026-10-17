// Pulls a palette out of an image in the browser (canvas + median-cut quantisation).
// Works on a File before upload, or on an image URL that allows cross-origin reads.

type Rgb = [number, number, number]

function loadImage(source: File | string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    if (typeof source === "string") img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("Couldn't load the image"))
    img.src = typeof source === "string" ? source : URL.createObjectURL(source)
  })
}

function medianCut(pixels: Rgb[], count: number): Rgb[] {
  const boxes: Rgb[][] = [pixels]
  while (boxes.length < count) {
    boxes.sort((a, b) => b.length - a.length)
    const box = boxes.shift()!
    if (box.length < 2) {
      boxes.push(box)
      break
    }
    const ranges = [0, 1, 2].map((c) => Math.max(...box.map((p) => p[c])) - Math.min(...box.map((p) => p[c])))
    const channel = ranges.indexOf(Math.max(...ranges))
    box.sort((a, b) => a[channel] - b[channel])
    const mid = box.length >> 1
    boxes.push(box.slice(0, mid), box.slice(mid))
  }
  return boxes
    .filter((box) => box.length)
    .map((box) => box.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1], acc[2] + p[2]] as Rgb, [0, 0, 0] as Rgb).map((v) => Math.round(v / box.length)) as Rgb)
}

const toHex = (rgb: Rgb) => `#${rgb.map((v) => v.toString(16).padStart(2, "0")).join("")}`.toUpperCase()
const distance = (a: Rgb, b: Rgb) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])

// Up to `count` colours, most prominent first, with near-duplicates removed.
export async function extractPalette(source: File | string, count = 6): Promise<string[]> {
  const img = await loadImage(source)
  const canvas = document.createElement("canvas")
  const size = 96
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext("2d", { willReadFrequently: true })
  if (!context) throw new Error("Canvas isn't available")
  context.drawImage(img, 0, 0, size, size)
  if (typeof source !== "string") URL.revokeObjectURL(img.src)
  let data: Uint8ClampedArray
  try {
    data = context.getImageData(0, 0, size, size).data
  } catch {
    throw new Error("This image doesn't allow colour reading from the browser. Upload it again to extract its colours.")
  }
  const pixels: Rgb[] = []
  for (let i = 0; i < data.length; i += 4) if (data[i + 3] > 128) pixels.push([data[i], data[i + 1], data[i + 2]])
  if (!pixels.length) return []
  const boxes = medianCut(pixels, count * 2)
  // Rank by how much of the image each colour covers, then drop near-identical ones.
  const ranked = boxes
    .map((colour) => ({ colour, weight: pixels.filter((p) => distance(p, colour) < 40).length }))
    .sort((a, b) => b.weight - a.weight)
    .map((entry) => entry.colour)
  const kept: Rgb[] = []
  for (const colour of ranked) {
    if (kept.every((k) => distance(k, colour) > 28)) kept.push(colour)
    if (kept.length === count) break
  }
  return kept.map(toHex)
}
