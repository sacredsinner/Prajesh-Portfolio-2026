"use client"

import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export interface Project {
  slug: string
  title: string
  category: string
  year: string
  thumbnail: string
  client?: string
  overview?: string
  problem?: string
  approach?: string
  solution?: string
  outcome?: string
  images?: string[]
}

interface ProjectCardProps {
  project: Project
  index?: number
}

export function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link href={`/projects/${project.slug}`} className="group block">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted mb-4">
          <Image
            src={project.thumbnail}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-300" />
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-serif text-xl tracking-tight group-hover:opacity-70 transition-opacity">
              {project.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {project.category}
            </p>
          </div>
          <span className="text-xs text-muted-foreground">{project.year}</span>
        </div>
      </Link>
    </motion.div>
  )
}

export function ProjectCardLarge({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.slug}`} className="group block">
      <div className="relative aspect-[16/9] overflow-hidden bg-muted mb-6">
        <Image
          src={project.thumbnail}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-300" />
      </div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-serif text-2xl md:text-3xl tracking-tight group-hover:opacity-70 transition-opacity">
            {project.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            {project.category}
          </p>
        </div>
        <span className="text-sm text-muted-foreground">{project.year}</span>
      </div>
    </Link>
  )
}
