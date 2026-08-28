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

export function EditorialCaseStudy({ project, nextProject }: { project: Project; nextProject: Project }) {
  const images = project.images?.filter(Boolean) ?? []
  const sections = [["Overview", project.overview], ["Challenge", project.problem], ["Approach", project.approach], ["Solution", project.solution]]
  return <div className="bg-[#f5f5f3] text-[#1a1a18]">
    <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-[1400px] flex-col justify-between px-6 py-12 md:px-12 md:py-16">
      <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#6b6b63]">{project.category} · {project.year} · {project.client}</p>
      <div className="py-24"><h1 className="max-w-6xl font-serif text-[clamp(4rem,12vw,11rem)] leading-[0.86] tracking-[-0.05em]">{project.title}</h1><p className="mt-10 max-w-2xl font-sans text-xl leading-relaxed md:text-2xl">{project.overview}</p></div>
      <p className="font-sans text-xs uppercase tracking-[0.2em] text-[#6b6b63]">Scroll to explore ↓</p>
    </section>
    <Reveal><div className="relative h-[80vh] w-full"><Image src={project.thumbnail} alt={`${project.title} project hero`} fill priority sizes="100vw" className="object-cover" /></div></Reveal>
    <section className="grid grid-cols-2 border-y border-[#1a1a18]/15 md:grid-cols-4">
      {[['Client', project.client], ['Year', project.year], ['Discipline', project.category], ['Deliverables', 'Identity System, Packaging, Digital Art Direction, Launch Toolkit']].map(([label, value]) => <div key={label} className="border-[#1a1a18]/15 p-6 max-md:border-b md:border-r md:p-8 md:last:border-r-0"><p className="text-[11px] uppercase tracking-[0.2em] text-[#6b6b63]">{label}</p><p className="mt-3 text-base leading-relaxed">{value}</p></div>)}
    </section>
    <div className="mx-auto max-w-[1400px] px-6 md:px-12">
      {sections.map(([label, copy], index) => <div key={label}>
        <section className="grid grid-cols-1 gap-8 border-b border-[#1a1a18]/15 py-24 md:grid-cols-12 md:gap-6 md:py-32"><h2 className="text-[11px] uppercase tracking-[0.2em] text-[#6b6b63] md:sticky md:top-32 md:col-span-3 md:h-fit">{label}</h2><Reveal className="md:col-span-8 md:col-start-5"><p className="max-w-[60ch] text-xl leading-relaxed md:text-[22px]">{copy}</p></Reveal></section>
        {index === 1 && images.length > 0 && <div className="grid gap-8 py-16 md:grid-cols-2"><Reveal><Image src={images[0]} alt={`${project.title} detail one`} width={1200} height={900} className="w-full object-cover" /><p className="mt-3 text-xs text-[#6b6b63]">Identity detail</p></Reveal>{images[1] && <Reveal><Image src={images[1]} alt={`${project.title} detail two`} width={1200} height={900} className="w-full object-cover" /><p className="mt-3 text-xs text-[#6b6b63]">System in context</p></Reveal>}</div>}
        {index === 2 && images[2] && <Reveal className="relative my-16 h-[90vh] w-full"><Image src={images[2]} alt={`${project.title} visual language`} fill sizes="100vw" className="object-cover" /></Reveal>}
        {index === 3 && images[3] && <Reveal className="relative mx-auto my-16 h-[70vh] w-full md:w-10/12"><Image src={images[3]} alt={`${project.title} final application`} fill sizes="(min-width: 768px) 83vw, 100vw" className="object-cover" /></Reveal>}
      </div>)}
    </div>
    <section className="mx-auto max-w-4xl px-6 py-32 text-center md:px-12"><p className="text-[11px] uppercase tracking-[0.2em] text-[#6b6b63]">Outcome</p><p className="mt-8 font-serif text-[clamp(2rem,5vw,3.5rem)] leading-tight">{project.outcome || 'A recognizable brand system that scales from signage to social campaigns.'}</p></section>
    <Link href={`/projects/${nextProject.slug}`} className="group block border-t border-[#1a1a18]/15 px-6 py-32 md:px-12"><p className="mx-auto max-w-[1400px] text-[11px] uppercase tracking-[0.2em] text-[#6b6b63]">Next Project</p><p className="mx-auto mt-6 max-w-[1400px] font-serif text-[clamp(3rem,8vw,7rem)] leading-none transition-transform duration-500 group-hover:translate-x-3">{nextProject.title}</p></Link>
    <section className="px-6 py-24 text-center md:px-12"><h2 className="font-serif text-4xl md:text-6xl">Inspired by this project?</h2><Link href="/contact" className="mt-8 inline-block border-b border-[#1a1a18] pb-1 text-sm transition-opacity hover:opacity-60">Start a Project →</Link></section>
  </div>
}
