"use client"

import { motion } from "framer-motion"

export function VideoShowcase({ video }: { video: { url: string; filename: string } | null }) {
  if (!video) return null

  return (
    <motion.section
      initial={{ height: 0, opacity: 0 }}
      whileInView={{ height: "auto", opacity: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="w-full overflow-hidden border-y border-border bg-foreground"
      aria-label="Selected work video showcase"
    >
      <video className="block aspect-video w-full object-cover" src={video.url} autoPlay muted loop playsInline preload="metadata">
        <track kind="captions" />
        Your browser does not support video playback.
      </video>
    </motion.section>
  )
}
