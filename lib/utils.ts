import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function makeSlug(title: string) {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

// "hamro-patro_logo.png" -> "Hamro Patro Logo"; "7.png" -> "Client 7".
export function nameFromFilename(filename: string) {
  const base = filename.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim()
  if (!base) return "Client"
  if (/^\d+$/.test(base)) return `Client ${base}`
  return base === base.toLowerCase() ? base.replace(/(^|\s)([a-z])/g, (_, space: string, letter: string) => space + letter.toUpperCase()) : base
}

// Names that came straight from a filename and still need a real client name.
export function needsClientName(name: string) {
  return /\.(png|jpe?g|webp|gif|svg|avif)$/i.test(name) || /^(client\s*)?\d+$/i.test(name.trim())
}
