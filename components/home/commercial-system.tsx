"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Check, Clock3, Globe2, LockKeyhole, ShieldCheck, X } from "lucide-react"
import { subscribeToNewsletter } from "@/app/actions/newsletter"

const methodology = [
  ["01", "Understand", "Stakeholder audits and friction diagnostics", "A clear view of what your business needs to say and why."],
  ["02", "Explore", "Positioning whitespace and territory matrix", "I find the strategic space where your brand can lead."],
  ["03", "Define", "Verbal architecture, voice and brand thesis", "The ideas become a sharp, ownable point of view."],
  ["04", "Design", "Design system, typography and Figma tokens", "Strategy becomes an identity people can recognize and use."],
  ["05", "Refine", "Stress-testing across web, packaging and signage", "Every decision is tested beyond the presentation deck."],
  ["06", "Deploy", "System governance, asset handover and guidelines", "You leave with a living system, not a one-off logo."],
] as const

const packages = {
  USD: ["$2,800", "$6,500", "$11,000+"],
  AUD: ["A$4,200", "A$9,750", "A$16,500+"],
  NPR: ["रु 370k", "रु 860k", "रु 1.45M+"],
} as const

const addOns = [
  ["Motion logo system", 1200],
  ["3D packaging renders", 850],
  ["Monthly advisory retainer", 1500],
] as const

export function CommercialSystem() {
  const [activeMethod, setActiveMethod] = useState(0)
  const [currency, setCurrency] = useState<keyof typeof packages>("USD")
  const [selectedAddOns, setSelectedAddOns] = useState<number[]>([])
  const [inquiryOpen, setInquiryOpen] = useState(false)
  const [newsletterMessage, setNewsletterMessage] = useState("")
  const [newsletterBusy, setNewsletterBusy] = useState(false)

  const addOnTotal = selectedAddOns.reduce((total, index) => total + addOns[index][1], 0)
  const baseTotal = Number(packages.USD[1].replace(/[$,]/g, ""))

  async function joinNotes(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNewsletterBusy(true)
    const form = new FormData(event.currentTarget)
    const result = await subscribeToNewsletter({ email: form.get("email"), website: form.get("website") })
    setNewsletterMessage(result.ok ? "Check your inbox to confirm your subscription." : result.error)
    setNewsletterBusy(false)
  }

  return (
    <>
      <section className="border-y border-border bg-secondary/40" aria-label="Availability">
        <div className="page-container flex flex-col gap-3 py-4 text-xs uppercase tracking-[0.16em] text-muted-foreground md:flex-row md:items-center md:justify-between">
          <span className="inline-flex items-center gap-2 text-foreground"><span className="h-2 w-2 animate-pulse rounded-full bg-[#1c6538]" />2 of 2 client slots filled · Now booking next cohort</span>
          <span>Kathmandu (GMT+5:45) · Overlapping AEST / GMT / EST</span>
        </div>
      </section>

      <section id="selected-work" className="page-container grid gap-8 border-b border-border py-24 md:grid-cols-[1.2fr_0.8fr] md:py-32">
        <div><p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Commercial outcome positioning</p><h2 className="mt-5 max-w-3xl font-serif text-4xl leading-[0.98] tracking-tight md:text-6xl">I build category-defining identities that help ambitious founders command premium pricing.</h2></div>
        <div className="self-end"><p className="max-w-md text-lg leading-relaxed text-muted-foreground">Moving beyond decorative logos. I deliver enduring visual architecture that builds investor confidence, strengthens enterprise deal sizes, and earns customer loyalty.</p><div className="mt-6 flex flex-wrap gap-3"><button onClick={() => setInquiryOpen(true)} className="inline-flex items-center gap-2 bg-foreground px-5 py-3 text-sm text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Book Discovery (30m)<ArrowRight className="h-4 w-4" /></button><Link href="/packages" className="border border-foreground px-5 py-3 text-sm">View transparent packages</Link></div></div>
      </section>

      <section className="page-container border-b border-border py-16"><div className="grid grid-cols-2 gap-6 md:grid-cols-4"><Proof value="6+" label="Years experience" /><Proof value="80+" label="Projects completed" /><Proof value="7+" label="Countries" /><Proof value="AEST · GMT · EST" label="Timezone overlap" /></div></section>

      <section className="page-container border-b border-border py-24 md:py-32"><div className="grid gap-12 md:grid-cols-[0.75fr_1.25fr]"><div><p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Strategy methodology</p><h2 className="mt-5 font-serif text-4xl md:text-5xl">A brand system built to move.</h2><p className="mt-5 max-w-sm leading-relaxed text-muted-foreground">Six deliberate phases turn business context into a brand your team can confidently use.</p></div><div className="border-t border-border">{methodology.map((step, index) => <button key={step[0]} onClick={() => setActiveMethod(index)} className={`grid w-full grid-cols-[3rem_1fr_auto] gap-4 border-b border-border py-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${activeMethod === index ? "bg-secondary/60" : ""}`}><span className="font-mono text-xs text-muted-foreground">{step[0]}</span><span><strong className="block font-serif text-2xl font-normal">{step[1]}</strong><span className="mt-1 block text-sm text-muted-foreground">{activeMethod === index ? step[2] : "View phase deliverables"}</span></span><ArrowRight className={`mt-1 h-4 w-4 transition-transform ${activeMethod === index ? "translate-x-1" : ""}`} /></button>)}</div></div><div className="mt-8 border-l-2 border-[#1c6538] pl-5 text-sm text-muted-foreground"><span className="font-medium text-foreground">Current phase:</span> {methodology[activeMethod][1]} — {methodology[activeMethod][3]}</div></section>

      <section id="packages" className="page-container border-b border-border py-24 md:py-32"><div className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Transparent investment</p><h2 className="mt-5 font-serif text-4xl md:text-5xl">Choose the right depth of partnership.</h2></div><div className="flex w-fit rounded-full border border-border p-1" role="group" aria-label="Currency"><button className={`rounded-full px-3 py-1.5 text-xs ${currency === "USD" ? "bg-foreground text-background" : ""}`} onClick={() => setCurrency("USD")}>USD ($)</button><button className={`rounded-full px-3 py-1.5 text-xs ${currency === "AUD" ? "bg-foreground text-background" : ""}`} onClick={() => setCurrency("AUD")}>AUD (A$)</button><button className={`rounded-full px-3 py-1.5 text-xs ${currency === "NPR" ? "bg-foreground text-background" : ""}`} onClick={() => setCurrency("NPR")}>NPR (रु)</button></div></div><div className="mt-12 grid gap-px overflow-hidden border border-border bg-border md:grid-cols-3">{["Foundation Sprint", "Complete Visual System", "System & Governance"].map((name, index) => <article key={name} className="bg-background p-6 md:p-8"><div className="flex min-h-24 items-start justify-between gap-4"><h3 className="font-serif text-2xl">{name}</h3>{index === 1 && <span className="rounded-full bg-[#1c6538] px-2 py-1 text-[10px] uppercase tracking-wider text-white">Most comprehensive</span>}</div><p className="mt-2 font-mono text-2xl">From {packages[currency][index]}</p><p className="mt-4 min-h-16 text-sm leading-relaxed text-muted-foreground">{["Core identity for early-stage launches · 2–3 weeks", "Full strategy, scalable design system, brand book and 3 collateral touchpoints · 5–6 weeks", "Multi-market architecture, custom web design and 3 months advisory · 8+ weeks"][index]}</p><button onClick={() => setInquiryOpen(true)} className="mt-8 inline-flex items-center gap-2 border-b border-foreground pb-1 text-sm">Discuss this package<ArrowRight className="h-4 w-4" /></button></article>)}</div><div className="mt-6 border border-[#1c6538]/40 bg-[#1c6538]/5 p-6"><p className="font-serif text-2xl">The 90-Minute Brand Strategy Diagnostic — $500 USD</p><p className="mt-2 text-sm text-muted-foreground">A low-friction audit of your current messaging and brand friction. 100% of this fee is credited toward your full project if you move forward within 30 days.</p></div><div className="mt-12 grid gap-8 border-t border-border pt-8 md:grid-cols-[1fr_auto]"><div><p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Add-on calculator</p><div className="mt-4 grid gap-3">{addOns.map(([label, amount], index) => <label key={label} className="flex items-center gap-3 text-sm"><input type="checkbox" checked={selectedAddOns.includes(index)} onChange={() => setSelectedAddOns((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index])} className="h-4 w-4 accent-[#1c6538]" />{label} <span className="text-muted-foreground">+${amount.toLocaleString()}</span></label>)}</div></div><div className="border-l border-border pl-6 md:min-w-52"><p className="text-sm text-muted-foreground">Estimated system total</p><p className="mt-2 font-serif text-4xl">${(baseTotal + addOnTotal).toLocaleString()}</p></div></div></section>

      <section className="page-container border-b border-border py-24 md:py-32"><div className="grid gap-6 md:grid-cols-4">{[[FrictionlessIcon, "Frictionless invoicing", "Secure 50/25/25 milestones via Stripe or Wise in your local currency."], [Clock3, "Timezone overlap", "Dedicated communication windows across Australia, Europe and the US."], [LockKeyhole, "Complete IP ownership", "Full international intellectual property assignment before handover."], [ShieldCheck, "No blind handovers", "Every visual iteration is defended by strategic research, not subjective whim."]].map(([Icon, title, text]) => <div key={title as string} className="border-t border-border pt-5"><Icon className="h-5 w-5 text-[#1c6538]" /><h3 className="mt-5 font-serif text-xl">{title as string}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text as string}</p></div>)}</div></section>

      <section className="page-container grid gap-8 border-b border-border py-24 md:grid-cols-[1fr_0.8fr] md:py-32"><div><p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Thought leadership</p><h2 className="mt-5 max-w-xl font-serif text-4xl md:text-5xl">Stop decorating. Start deciding.</h2><p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">Get my free 10-Point Pre-Rebrand Diagnostic Checklist for Founders, plus practical Notes on building brands that can breathe.</p><div className="mt-8 flex flex-wrap gap-5 text-sm"><Link href="/blog" className="border-b border-foreground pb-1">Read the Notes <ArrowRight className="ml-1 inline h-4 w-4" /></Link><Link href="/contact" className="border-b border-foreground pb-1">Get the checklist</Link></div></div><div className="border border-border p-6"><p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Free guide</p><h3 className="mt-4 font-serif text-2xl">The 10-Point Pre-Rebrand Diagnostic Checklist</h3><form onSubmit={joinNotes} className="mt-6 grid gap-3"><input name="email" type="email" required placeholder="Your work email" className="border-b border-input bg-transparent px-0 py-3 text-sm outline-none focus-visible:border-foreground" /><input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" /><button disabled={newsletterBusy} className="bg-foreground px-5 py-3 text-sm text-background disabled:opacity-50">{newsletterBusy ? "Sending…" : "Send me the guide"}</button>{newsletterMessage && <p className="text-sm text-muted-foreground" role="status">{newsletterMessage}</p>}</form></div></section>

      {inquiryOpen && <InquiryModal onClose={() => setInquiryOpen(false)} />}
    </>
  )
}

function Proof({ value, label }: { value: string; label: string }) { return <div className="border-t border-border pt-4"><p className="font-serif text-3xl">{value}</p><p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{label}</p></div> }
function FrictionlessIcon() { return <Globe2 className="h-5 w-5 text-[#1c6538]" /> }
function InquiryModal({ onClose }: { onClose: () => void }) { const [sent, setSent] = useState(false); return <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/60 p-4" role="dialog" aria-modal="true" aria-labelledby="inquiry-title"><div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-background p-6 md:p-10"><div className="flex items-start justify-between"><div><p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Start a conversation</p><h2 id="inquiry-title" className="mt-3 font-serif text-4xl">Tell me what you&apos;re building.</h2></div><button onClick={onClose} aria-label="Close inquiry form" className="rounded-full p-2 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><X className="h-5 w-5" /></button></div><form className="mt-8 grid gap-5" onSubmit={(event) => { event.preventDefault(); setSent(true) }}><div className="grid gap-5 md:grid-cols-2"><label className="grid gap-2 text-sm">Name<input required className="border-b border-input bg-transparent py-3 outline-none focus-visible:border-foreground" /></label><label className="grid gap-2 text-sm">Work email<input required type="email" className="border-b border-input bg-transparent py-3 outline-none focus-visible:border-foreground" /></label></div><label className="grid gap-2 text-sm">Company URL<input type="url" className="border-b border-input bg-transparent py-3 outline-none focus-visible:border-foreground" placeholder="https://" /></label><fieldset><legend className="text-sm">What do you need?</legend><div className="mt-3 grid gap-2 sm:grid-cols-2">{["Strategy", "Full rebrand", "New brand", "Retainer"].map((item) => <label key={item} className="flex items-center gap-2 text-sm"><input type="checkbox" />{item}</label>)}</div></fieldset><label className="grid gap-2 text-sm">Budget<select className="border-b border-input bg-transparent py-3"><option>$2,500–$5,000</option><option>$5,000–$10,000</option><option>$10,000+</option><option>Diagnostic Audit ($500)</option></select></label><button type="submit" className="bg-foreground px-5 py-3 text-sm text-background">{sent ? "Inquiry ready — I’ll be in touch" : "Send inquiry"}</button>{sent && <p className="text-sm text-[#1c6538]" role="status">Thanks — your project details are ready for our next conversation.</p>}<p className="text-sm text-muted-foreground">Prefer email? <a className="underline" href="mailto:hello@shakyaprajesh.com.np">hello@shakyaprajesh.com.np</a></p></form></div></div> }
