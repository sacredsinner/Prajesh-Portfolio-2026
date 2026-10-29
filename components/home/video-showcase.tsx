"use client"

import { useState } from "react"
import { motion } from "framer-motion"

export function VideoShowcase({ video }: { video: { url: string; filename: string } | null }) {
  const [failed, setFailed] = useState(false)
  if (!video || failed) return null

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="group relative w-full overflow-hidden border-y border-border bg-foreground"
      aria-label="Selected work video showcase"
    >
      <video
        className="block aspect-video w-full origin-center object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        src={video.url}
        aria-label={`Showcase video: ${video.filename}`}
        autoPlay
        muted
        loop
        playsInline
        controls
        preload="metadata"
        onError={() => setFailed(true)}
      >
        <track kind="captions" />
        Your browser does not support video playback.
      </video>
      <span className="pointer-events-none absolute left-5 top-5 z-10 rounded-full border border-white/30 bg-black/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-0 motion-reduce:transition-none">Motion showcase</span>
    </motion.section>
  )
}
