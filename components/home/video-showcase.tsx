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
      className="w-full overflow-hidden border-y border-border bg-foreground"
      aria-label="Selected work video showcase"
    >
      <video
        className="block aspect-video w-full object-cover"
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
    </motion.section>
  )
}
