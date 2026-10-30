"use client"

import Image from "next/image"
import { motion } from "framer-motion"

interface PrajAvatarProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  isSpeaking?: boolean
  showStatus?: boolean
  className?: string
}

export function PrajAvatar({
  size = "md",
  isSpeaking = false,
  showStatus = false,
  className = "",
}: PrajAvatarProps) {
  const sizeMap = {
    xs: "h-6 w-6",
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-14 w-14",
    xl: "h-20 w-20",
  }

  const pxMap = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80,
  }

  return (
    <div className={`relative inline-flex shrink-0 items-center justify-center ${className}`}>
      {/* Speaking/Thinking pulse aura rings */}
      {isSpeaking && (
        <>
          <motion.span
            className="absolute inset-0 rounded-full bg-emerald-500/25 blur-[4px]"
            animate={{
              scale: [1, 1.45, 1],
              opacity: [0.7, 0.1, 0.7],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.8,
              ease: "easeInOut",
            }}
          />
          <motion.span
            className="absolute inset-0 rounded-full border border-emerald-500/50"
            animate={{
              scale: [1, 1.28, 1],
              opacity: [0.8, 0.2, 0.8],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.8,
              delay: 0.25,
              ease: "easeInOut",
            }}
          />
        </>
      )}

      {/* Main Avatar Container with breathing / speaking animation */}
      <motion.div
        animate={
          isSpeaking
            ? {
                scale: [1, 1.04, 0.99, 1.03, 1],
                rotate: [0, 0.8, -0.8, 0.4, 0],
              }
            : {
                scale: [1, 1.02, 1],
              }
        }
        transition={
          isSpeaking
            ? {
                repeat: Infinity,
                duration: 2.2,
                ease: "easeInOut",
              }
            : {
                repeat: Infinity,
                duration: 4.5,
                ease: "easeInOut",
              }
        }
        className={`relative overflow-hidden rounded-full border border-border/80 bg-neutral-900 shadow-sm ${sizeMap[size]}`}
      >
        <Image
          src="/images/praj-avatar.png"
          alt="Praj — AI Brand Strategist for Prajesh Shakya"
          width={pxMap[size]}
          height={pxMap[size]}
          className="h-full w-full object-cover object-top select-none"
          priority
        />
      </motion.div>

      {/* Live status dot */}
      {showStatus && (
        <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-background bg-emerald-500" />
        </span>
      )}
    </div>
  )
}
