"use client"

import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { ArrowUpRight, Eye, Heart } from "lucide-react"
import type { ProjectBlock, ProjectAsset, ProjectAnalytics, ProjectTeamMember, ProjectCoverCrop } from "@/lib/project-editor-types"

export interface Project {
  id?: string
  slug: string
  title: string
  subtitle?: string
  status?: string
  category: string
  year: string
  thumbnail: string
  coverCrop?: ProjectCoverCrop | null
  client?: string
  role?: string
  overview?: string
  problem?: string
  approach?: string
  solution?: string
  outcome?: string
  images?: string[]
  creativeFields?: string[]
  tags?: string[]
  toolsUsed?: string[]
  team?: ProjectTeamMember[]
  industries?: string[]
  license?: string
  copyright?: string
  blocks?: ProjectBlock[]
  assets?: ProjectAsset[]
  analytics?: ProjectAnalytics
  seoTitle?: string
  seoDescription?: string
  ogImage?: string
}

interface ProjectCardProps {
  project: Project
  index?: number
  variant?: "standard" | "compact" | "cinematic"
}

export function ProjectCard({ project, index = 0, variant = "standard" }: ProjectCardProps) {
  const creativeDiscipline =
    project.creativeFields && project.creativeFields.length > 0
      ? project.creativeFields[0]
      : project.category

  const coverStyle = project.coverCrop
    ? {
        objectPosition: `${project.coverCrop.x}% ${project.coverCrop.y}%`,
        transform: `scale(${project.coverCrop.zoom || 1})`,
      }
    : undefined

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col"
    >
      <Link href={`/projects/${project.slug}`} className="flex flex-col h-full">
        {/* Media Container - Sharp Corners (no round corner) */}
        <div className="relative aspect-[16/11] w-full overflow-hidden border border-border/40 bg-secondary/20">
          <Image
            src={project.thumbnail || "/placeholder.jpg"}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            style={coverStyle}
          />

          {/* Gradient Tint Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Top Floating Badge (Discipline) - Sharp */}
          <div className="absolute left-3.5 top-3.5 flex items-center gap-1.5">
            <span className="border border-border/80 bg-background/95 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-foreground backdrop-blur-md transition-transform duration-300 group-hover:scale-105">
              {creativeDiscipline}
            </span>
          </div>

          {/* Floating Arrow (Appears on Hover) - Sharp */}
          <div className="absolute right-3.5 top-3.5 flex size-8 items-center justify-center border border-border/80 bg-background/95 text-foreground opacity-0 backdrop-blur-md transition-all duration-300 group-hover:opacity-100">
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>

          {/* Bottom Hover Details (Client & Stats) */}
          <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between text-xs text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="truncate font-medium">{project.client || "Studio Work"}</span>
            <div className="flex items-center gap-3 font-mono text-[11px]">
              {project.analytics?.appreciations ? (
                <span className="flex items-center gap-1">
                  <Heart className="size-3 fill-current" /> {project.analytics.appreciations}
                </span>
              ) : null}
              {project.analytics?.views ? (
                <span className="flex items-center gap-1">
                  <Eye className="size-3" /> {project.analytics.views}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Caption & Metadata */}
        <div className="mt-4 flex flex-1 flex-col justify-between">
          <div>
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="font-serif text-xl tracking-tight text-foreground transition-opacity group-hover:opacity-75 sm:text-2xl">
                {project.title}
              </h3>
              <span className="font-mono text-xs text-muted-foreground">{project.year}</span>
            </div>

            {project.subtitle ? (
              <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                {project.subtitle}
              </p>
            ) : project.overview ? (
              <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                {project.overview}
              </p>
            ) : null}
          </div>

          {/* Creative Fields tags (secondary preview) - Sharp */}
          {project.creativeFields && project.creativeFields.length > 1 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {project.creativeFields.slice(0, 3).map((field) => (
                <span
                  key={field}
                  className="border border-border/60 bg-secondary/30 px-2 py-0.5 text-[10px] text-muted-foreground"
                >
                  {field}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}

export function ProjectCardLarge({ project }: ProjectCardProps) {
  const creativeDiscipline =
    project.creativeFields && project.creativeFields.length > 0
      ? project.creativeFields[0]
      : project.category

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="group relative block w-full"
    >
      <Link href={`/projects/${project.slug}`} className="block">
        <div className="relative aspect-[16/9] w-full overflow-hidden border border-border/40 bg-secondary/50">
          <Image
            src={project.thumbnail || "/placeholder.jpg"}
            alt={project.title}
            fill
            sizes="100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Top Badge */}
          <div className="absolute left-6 top-6">
            <span className="border border-border/80 bg-background/95 px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider text-foreground backdrop-blur-md">
              Featured Case Study · {creativeDiscipline}
            </span>
          </div>

          {/* Content Overlay at Bottom */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col justify-end text-white md:bottom-10 md:left-10 md:right-10">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-neutral-300">
              <span>{project.client || "Client Work"}</span>
              <span>·</span>
              <span>{project.year}</span>
            </div>
            <h2 className="mt-2 font-serif text-3xl font-medium tracking-tight sm:text-5xl md:text-6xl text-white">
              {project.title}
            </h2>
            {project.subtitle && (
              <p className="mt-2 max-w-2xl text-sm text-neutral-200 line-clamp-2 md:text-lg">
                {project.subtitle}
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
