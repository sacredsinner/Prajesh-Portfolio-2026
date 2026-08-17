"use client"

import Link from "next/link"
import { Section } from "@/components/section"
import { motion } from "framer-motion"
import type { InferSelectModel } from "drizzle-orm"
import type { clients } from "@/lib/db/schema"

type Client = InferSelectModel<typeof clients>

const seededPartnershipImage = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-fetkO6AI97PCFncd2smo7cffxpsTNG.png"

export function TrustedPartnershipsSection({ clients }: { clients: Client[] }) {
  return (
    <Section className="border-t border-border">
      <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center text-xs uppercase tracking-widest">[ Trusted partnerships ]</motion.p>
      {clients.length > 0 ? (
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }} className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {clients.slice(0, 12).map((client) => (
            <motion.div key={client.id} variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.45 }} className="flex aspect-[1.35] items-center justify-center border border-foreground/80 p-5">
              <img src={client.logoUrl} alt={`${client.name} logo`} className="mx-auto max-h-20 w-full object-contain object-center" />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="mt-12 overflow-hidden border border-foreground/80">
          <img src={seededPartnershipImage} alt="Trusted partnership client logos" className="mx-auto h-auto w-full object-center" />
        </div>
      )}
      <div className="mt-12 flex justify-center"><Link href="/clients" className="rounded-full border border-foreground px-5 py-2 text-xs uppercase tracking-wide transition-colors hover:bg-foreground hover:text-background">All clients <span aria-hidden="true">↗</span></Link></div>
    </Section>
  )
}
