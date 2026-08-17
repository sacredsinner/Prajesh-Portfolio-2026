"use client"

import { motion } from "framer-motion"
import type { Project } from "@/components/project-card"

interface ProjectContentProps {
  project: Project
}

interface ContentBlockProps {
  label: string
  content: string
  delay?: number
}

function ContentBlock({ label, content, delay = 0 }: ContentBlockProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="grid lg:grid-cols-5 gap-8 py-16 border-b border-border"
    >
      <div className="lg:col-span-2">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="lg:col-span-3">
        <p className="text-lg leading-relaxed">{content}</p>
      </div>
    </motion.div>
  )
}

export function ProjectContent({ project }: ProjectContentProps) {
  return (
    <section className="border-t border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {project.overview && (
          <ContentBlock label="Overview" content={project.overview} />
        )}
        {project.problem && (
          <ContentBlock label="Challenge" content={project.problem} delay={0.1} />
        )}
        {project.approach && (
          <ContentBlock label="Approach" content={project.approach} delay={0.2} />
        )}
        {project.solution && (
          <ContentBlock label="Solution" content={project.solution} delay={0.3} />
        )}
        {project.outcome && (
          <ContentBlock label="Outcome" content={project.outcome} delay={0.4} />
        )}
      </div>
    </section>
  )
}
