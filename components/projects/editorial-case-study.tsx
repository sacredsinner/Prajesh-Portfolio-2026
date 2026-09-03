"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import type { Project } from "@/components/project-card"

const ease = [0.16, 1, 0.3, 1] as const

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const reduced = useReducedMotion()
  return <motion.div initial={reduced ? { opacity: 1 } : { opacity: 0, y: 24 }} whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.7, ease }} className={className}>{children}</motion.div>
}

function Label({ children }: { children: React.ReactNode }) {
  return <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">[ {children} ]</h2>
}

export function EditorialCaseStudy({ project, nextProject }: { project: Project; nextProject: Project }) {
  const images = project.images?.filter(Boolean) ?? []
  return <article className="bg-background text-foreground">
    <header className="mx-auto max-w-7xl px-5 pb-16 pt-20 md:px-10 md:pb-28 md:pt-32">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">{project.category} / {project.year}</p>
      <h1 className="mt-8 max-w-6xl font-serif text-[clamp(3.75rem,11vw,10rem)] uppercase leading-[0.82] tracking-[-0.06em]">{project.title}</h1>
    </header>
    <section className="mx-auto grid max-w-7xl gap-12 border-t border-border px-5 py-14 md:grid-cols-[0.8fr_1.6fr] md:px-10 md:py-24">
      <Label>Project Details</Label>
      <div><p className="max-w-4xl font-serif text-2xl leading-tight md:text-5xl">{project.overview}</p><dl className="mt-16 grid grid-cols-2 gap-x-8 gap-y-8 border-t border-border pt-6 sm:grid-cols-3"><div><dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Client</dt><dd className="mt-2 text-sm">{project.client || "Independent project"}</dd></div><div><dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Industry</dt><dd className="mt-2 text-sm">{project.category}</dd></div><div><dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Services</dt><dd className="mt-2 text-sm">Brand strategy, identity design</dd></div></dl></div>
    </section>
    <Reveal><div className="relative h-[60vh] min-h-[420px] w-full md:h-[78vh]"><Image src={project.thumbnail} alt={`${project.title} project overview`} fill priority sizes="100vw" className="object-cover" /></div></Reveal>
    <section className="mx-auto grid max-w-7xl gap-12 px-5 py-20 md:grid-cols-[0.8fr_1.6fr] md:px-10 md:py-32"><Label>Challenge</Label><p className="max-w-3xl text-xl leading-relaxed md:text-3xl">{project.problem}</p></section>
    <section className="mx-auto grid max-w-7xl gap-12 border-t border-border px-5 py-20 md:grid-cols-[0.8fr_1.6fr] md:px-10 md:py-32"><Label>Approach</Label><div className="max-w-3xl space-y-8 text-xl leading-relaxed md:text-3xl"><p>{project.approach}</p><p>{project.solution}</p></div></section>
    {images.slice(0, 2).map((image, index) => <Reveal key={image} className="mx-auto max-w-7xl px-5 py-4 md:px-10 md:py-8"><Image src={image} alt={`${project.title} project detail ${index + 1}`} width={1800} height={1200} className="h-auto w-full object-cover" /></Reveal>)}
    <section className="mx-auto max-w-4xl px-5 py-24 text-center md:px-10 md:py-40"><Label>Outcome</Label><p className="mt-8 font-serif text-3xl leading-tight md:text-6xl">{project.outcome || "A clear, memorable identity built to grow with the business."}</p></section>
    {images[2] && <Reveal className="relative mx-auto h-[65vh] max-w-7xl"><Image src={images[2]} alt={`${project.title} identity in context`} fill sizes="100vw" className="object-cover" /></Reveal>}
    <Link href={`/projects/${nextProject.slug}`} className="group block border-t border-border px-5 py-24 md:px-10 md:py-40"><div className="mx-auto max-w-7xl"><Label>Next Project</Label><p className="mt-8 max-w-5xl font-serif text-[clamp(3rem,8vw,8rem)] uppercase leading-[0.85] tracking-[-0.05em] transition-transform duration-500 group-hover:translate-x-3">{nextProject.title}</p></div></Link>
  </article>
}
