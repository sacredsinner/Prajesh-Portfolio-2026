"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight } from "lucide-react"
import type { Project } from "@/components/project-card"

interface ProjectNavigationProps {
  prev: Project | null
  next: Project | null
}

export function ProjectNavigation({ prev, next }: ProjectNavigationProps) {
  return (
    <section className="border-t border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 divide-x divide-border"
        >
          {/* Previous Project */}
          <div className="py-12 pr-8">
            {prev ? (
              <Link
                href={`/projects/${prev.slug}`}
                className="group flex items-start gap-4"
              >
                <ArrowLeft className="h-5 w-5 mt-1 transition-transform group-hover:-translate-x-1" />
                <div>
                  <span className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                    Previous
                  </span>
                  <span className="font-serif text-lg group-hover:opacity-70 transition-opacity">
                    {prev.title}
                  </span>
                </div>
              </Link>
            ) : (
              <div className="text-muted-foreground/50">
                <span className="block text-xs uppercase tracking-widest mb-2">
                  Previous
                </span>
                <span className="text-lg">No previous project</span>
              </div>
            )}
          </div>

          {/* Next Project */}
          <div className="py-12 pl-8 text-right">
            {next ? (
              <Link
                href={`/projects/${next.slug}`}
                className="group inline-flex items-start gap-4 justify-end"
              >
                <div>
                  <span className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                    Next
                  </span>
                  <span className="font-serif text-lg group-hover:opacity-70 transition-opacity">
                    {next.title}
                  </span>
                </div>
                <ArrowRight className="h-5 w-5 mt-1 transition-transform group-hover:translate-x-1" />
              </Link>
            ) : (
              <div className="text-muted-foreground/50">
                <span className="block text-xs uppercase tracking-widest mb-2">
                  Next
                </span>
                <span className="text-lg">No next project</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
