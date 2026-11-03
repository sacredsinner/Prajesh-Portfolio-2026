"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Layers,
  Sparkles,
} from "lucide-react"
import { CURRENCIES, formatMoney, guessCurrency, type Currency } from "@/lib/money"
import {
  calculateRecommendation,
  DELIVERABLE_ITEMS,
  PROJECT_STAGES,
  TIMELINE_OPTIONS,
} from "@/lib/funnel"
import { submitFunnelIntake } from "@/app/actions/funnel"
import { BOOKING_URL, CONTACT_EMAIL } from "@/lib/site"
import type { Pricing } from "@/lib/packages"
import { cn } from "@/lib/utils"

const TOTAL_STEPS = 5

export function IntakeWizard({ pricing }: { pricing: Pricing }) {
  const searchParams = useSearchParams()
  const initialPackageParam = searchParams.get("package")?.toLowerCase()

  const [step, setStep] = useState(1)
  const [currency, setCurrency] = useState<Currency>("USD")

  // Form State
  const [stage, setStage] = useState<string>("new-venture")
  const [deliverables, setDeliverables] = useState<string[]>([
    "visual-identity",
    "brand-guidelines",
  ])
  const [timeline, setTimeline] = useState<string>("month")
  const [budgetBand, setBudgetBand] = useState<string>("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [company, setCompany] = useState("")
  const [website, setWebsite] = useState("")
  const [notes, setNotes] = useState("")

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)

  // Initialize currency and prefilled packages
  useEffect(() => {
    setCurrency(guessCurrency())

    if (initialPackageParam) {
      if (initialPackageParam.includes("found")) {
        setStage("new-venture")
        setDeliverables(["visual-identity", "social-templates"])
      } else if (initialPackageParam.includes("sys")) {
        setStage("design-system")
        setDeliverables([
          "visual-identity",
          "brand-strategy",
          "brand-guidelines",
          "website-design",
          "motion-animation",
        ])
      } else {
        setStage("rebrand")
        setDeliverables(["visual-identity", "brand-strategy", "brand-guidelines"])
      }
    }
  }, [initialPackageParam])

  // Recommendation engine
  const recommendation = useMemo(() => {
    return calculateRecommendation(stage, deliverables, pricing, currency)
  }, [stage, deliverables, pricing, currency])

  // Dynamic budget options based on current currency
  const budgetOptions = useMemo(() => {
    const pkgPrices = pricing.packages
      .map((p) => p.from[currency])
      .filter((n) => n > 0)
      .sort((a, b) => a - b)

    if (pkgPrices.length === 0) {
      return ["Under $3,000", "$3,000 – $6,000", "$6,000 – $10,000", "$10,000+"]
    }

    const low = formatMoney(pkgPrices[0], currency)
    const mid = formatMoney(pkgPrices[1] ?? pkgPrices[0], currency)
    const high = formatMoney(pkgPrices[pkgPrices.length - 1], currency)

    return [
      `Under ${low}`,
      `${low} – ${mid}`,
      `${mid} – ${high}`,
      `${high}+ (Comprehensive System)`,
      "Flexible / To be scoped",
    ]
  }, [pricing, currency])

  // Default budget selection
  useEffect(() => {
    if (!budgetBand && budgetOptions.length > 1) {
      setBudgetBand(budgetOptions[1])
    }
  }, [budgetOptions, budgetBand])

  const toggleDeliverable = (id: string) => {
    setDeliverables((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleNext = () => {
    setSubmitError(null)
    if (step === 2 && deliverables.length === 0) {
      setSubmitError("Please select at least one deliverable to continue.")
      return
    }
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1)
      window.scrollTo({ top: 180, behavior: "smooth" })
    }
  }

  const handleBack = () => {
    setSubmitError(null)
    if (step > 1) {
      setStep((s) => s - 1)
      window.scrollTo({ top: 180, behavior: "smooth" })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!name.trim()) {
      setSubmitError("Please provide your name.")
      return
    }
    if (!email.trim() || !email.includes("@")) {
      setSubmitError("Please enter a valid business email.")
      return
    }

    setIsSubmitting(true)
    try {
      const result = await submitFunnelIntake({
        stage,
        deliverables,
        timeline,
        currency,
        budgetBand: budgetBand || "Flexible",
        name,
        email,
        company: company.trim() || undefined,
        website: website.trim() || undefined,
        notes: notes.trim() || undefined,
        recommendedPackage: `${recommendation.packageName} Package (~${recommendation.startingPrice})`,
      })

      if (!result.ok) {
        setSubmitError(result.error)
        return
      }

      setIsCompleted(true)
      window.scrollTo({ top: 160, behavior: "smooth" })
    } catch {
      setSubmitError(`Something went wrong. Please reach out directly to ${CONTACT_EMAIL}.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto py-12 px-6"
      >
        <div className="border border-border bg-background p-8 md:p-12 space-y-8">
          <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Intake Received
            </span>
          </div>

          <h2 className="font-serif text-3xl md:text-5xl tracking-tight leading-[1.1]">
            Thank you, {name.split(" ")[0]}. Your project brief is registered.
          </h2>

          <p className="text-muted-foreground text-lg leading-relaxed">
            I review each brief personally and will respond with a tailored proposal and strategic
            recommendations within one business day.
          </p>

          {/* Recommended tier card */}
          <div className="border border-border p-6 bg-secondary/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Tailored Recommendation
              </span>
              <span className="font-mono text-xs font-semibold">{recommendation.startingPrice}</span>
            </div>
            <h3 className="font-serif text-2xl">{recommendation.packageName} Package</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {recommendation.rationale}
            </p>
          </div>

          {/* Cal.com Discovery Booking Card */}
          <div className="border border-foreground bg-foreground text-background p-6 md:p-8 space-y-4">
            <div className="flex items-center gap-2 text-background/80">
              <Calendar className="h-4 w-4" />
              <span className="font-mono text-xs uppercase tracking-widest">
                Fast-Track Kickoff
              </span>
            </div>
            <h3 className="font-serif text-2xl md:text-3xl text-balance">
              Schedule Your Free 30-Minute Discovery Call
            </h3>
            <p className="text-background/80 text-sm leading-relaxed max-w-xl">
              Lock in a time directly on my calendar so we can talk through your brand challenges,
              timelines, and deliverable priorities.
            </p>
            <div className="pt-2">
              <a
                href={BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-background text-foreground text-sm font-medium tracking-wide hover:bg-background/90 transition-colors"
              >
                Open Calendar (Cal.com)
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between text-sm text-muted-foreground">
            <a href="/projects" className="underline underline-offset-4 hover:text-foreground">
              ← Explore Recent Case Studies
            </a>
            <span className="font-mono text-xs">Prajesh Shakya Studio</span>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      {/* Step Header & Progress */}
      <div className="space-y-4 mb-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Step {step} of {TOTAL_STEPS}
            </span>
            <span className="text-muted-foreground/40">•</span>
            <span className="font-mono text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> ~2 min
            </span>
          </div>

          {/* Currency Switcher */}
          <div className="flex items-center gap-1 border border-border p-0.5">
            {CURRENCIES.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setCurrency(code)}
                className={cn(
                  "px-2.5 py-1 text-xs font-mono transition-colors",
                  currency === code
                    ? "bg-foreground text-background font-medium"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {code}
              </button>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 w-full bg-border overflow-hidden">
          <motion.div
            className="h-full bg-foreground"
            initial={false}
            animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground block mb-2">
                01 • Project Stage
              </span>
              <h2 className="font-serif text-3xl md:text-5xl tracking-tight leading-[1.1]">
                Where is your brand today?
              </h2>
              <p className="mt-3 text-muted-foreground text-base md:text-lg">
                Select the context that best describes your current journey and primary objective.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PROJECT_STAGES.map((item) => {
                const isSelected = stage === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setStage(item.id)}
                    className={cn(
                      "text-left p-6 border transition-all relative flex flex-col justify-between group",
                      isSelected
                        ? "border-foreground bg-secondary/30 ring-1 ring-foreground"
                        : "border-border hover:border-foreground/40 bg-background"
                    )}
                  >
                    <div>
                      <span className="font-mono text-xs text-muted-foreground block mb-3">
                        {item.number}
                      </span>
                      <h3 className="font-serif text-xl mb-2 group-hover:text-foreground">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                      <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
                        {isSelected ? "Selected" : "Select stage"}
                      </span>
                      {isSelected ? (
                        <div className="h-5 w-5 rounded-full bg-foreground text-background flex items-center justify-center">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="h-5 w-5 rounded-full border border-border" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground block mb-2">
                02 • Deliverables & Scope
              </span>
              <h2 className="font-serif text-3xl md:text-5xl tracking-tight leading-[1.1]">
                What needs to be designed?
              </h2>
              <p className="mt-3 text-muted-foreground text-base md:text-lg">
                Choose the essential pillars for this project. You can select multiple items.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DELIVERABLE_ITEMS.map((item) => {
                const isSelected = deliverables.includes(item.id)
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleDeliverable(item.id)}
                    className={cn(
                      "text-left p-6 border transition-all relative flex flex-col justify-between group",
                      isSelected
                        ? "border-foreground bg-secondary/30 ring-1 ring-foreground"
                        : "border-border hover:border-foreground/40 bg-background"
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                          {item.category}
                        </span>
                        {isSelected && (
                          <span className="font-mono text-[10px] bg-foreground text-background px-2 py-0.5 uppercase tracking-widest">
                            Included
                          </span>
                        )}
                      </div>
                      <h3 className="font-serif text-xl mb-2 group-hover:text-foreground">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-6 flex items-center justify-end">
                      <div
                        className={cn(
                          "h-5 w-5 flex items-center justify-center transition-colors",
                          isSelected
                            ? "bg-foreground text-background"
                            : "border border-border group-hover:border-foreground/40"
                        )}
                      >
                        {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground block mb-2">
                03 • Launch Window
              </span>
              <h2 className="font-serif text-3xl md:text-5xl tracking-tight leading-[1.1]">
                When do you need this live?
              </h2>
              <p className="mt-3 text-muted-foreground text-base md:text-lg">
                Timeline determines scheduling availability and project velocity.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TIMELINE_OPTIONS.map((item) => {
                const isSelected = timeline === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTimeline(item.id)}
                    className={cn(
                      "text-left p-6 border transition-all relative flex flex-col justify-between group",
                      isSelected
                        ? "border-foreground bg-secondary/30 ring-1 ring-foreground"
                        : "border-border hover:border-foreground/40 bg-background"
                    )}
                  >
                    <div>
                      <span className="font-mono text-xs text-muted-foreground block mb-2">
                        {item.estimate}
                      </span>
                      <h3 className="font-serif text-xl mb-2 group-hover:text-foreground">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-6 flex items-center justify-end">
                      <div
                        className={cn(
                          "h-5 w-5 rounded-full flex items-center justify-center transition-colors",
                          isSelected
                            ? "bg-foreground text-background"
                            : "border border-border group-hover:border-foreground/40"
                        )}
                      >
                        {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground block mb-2">
                04 • Investment Range
              </span>
              <h2 className="font-serif text-3xl md:text-5xl tracking-tight leading-[1.1]">
                Target project budget ({currency})
              </h2>
              <p className="mt-3 text-muted-foreground text-base md:text-lg">
                This helps establish whether your scope aligns with our Foundation, Identity, or
                System tiers.
              </p>
            </div>

            {/* Smart package recommendation badge */}
            <div className="border border-border p-6 bg-secondary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-foreground" />
                  <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    Recommended Scope
                  </span>
                </div>
                <div className="font-serif text-2xl">
                  {recommendation.packageName} Package{" "}
                  <span className="text-muted-foreground text-lg">
                    (from {recommendation.startingPrice})
                  </span>
                </div>
                <p className="text-xs text-muted-foreground max-w-lg">
                  {recommendation.rationale}
                </p>
              </div>

              <div className="shrink-0">
                <span className="font-mono text-xs border border-border px-3 py-1 bg-background">
                  {deliverables.length} Deliverable{deliverables.length === 1 ? "" : "s"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {budgetOptions.map((opt) => {
                const isSelected = budgetBand === opt
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setBudgetBand(opt)}
                    className={cn(
                      "p-4 border text-left transition-all",
                      isSelected
                        ? "border-foreground bg-secondary/30 ring-1 ring-foreground"
                        : "border-border hover:border-foreground/40 bg-background"
                    )}
                  >
                    <span className="font-mono text-sm block font-medium">{opt}</span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground block mb-2">
                05 • Final Step
              </span>
              <h2 className="font-serif text-3xl md:text-5xl tracking-tight leading-[1.1]">
                Let&apos;s connect
              </h2>
              <p className="mt-3 text-muted-foreground text-base md:text-lg">
                Provide your contact details so I can review your brief and send a strategic
                breakdown.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="intake-name" className="font-mono text-xs uppercase tracking-wider text-muted-foreground block">
                    Your Name *
                  </label>
                  <input
                    id="intake-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Maya Lin"
                    className="w-full bg-background border border-input px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="intake-email" className="font-mono text-xs uppercase tracking-wider text-muted-foreground block">
                    Business Email *
                  </label>
                  <input
                    id="intake-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="maya@studio.com"
                    className="w-full bg-background border border-input px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="intake-company" className="font-mono text-xs uppercase tracking-wider text-muted-foreground block">
                    Company / Brand Name
                  </label>
                  <input
                    id="intake-company"
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Acme Audio"
                    className="w-full bg-background border border-input px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="intake-website" className="font-mono text-xs uppercase tracking-wider text-muted-foreground block">
                    Website or Social Link
                  </label>
                  <input
                    id="intake-website"
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://acme.com or @acme"
                    className="w-full bg-background border border-input px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="intake-notes" className="font-mono text-xs uppercase tracking-wider text-muted-foreground block">
                  Project Notes & Vision (Optional)
                </label>
                <textarea
                  id="intake-notes"
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tell me a bit about your target audience, current pain points, or inspirations..."
                  className="w-full bg-background border border-input p-4 text-sm focus:outline-none focus:border-foreground transition-colors resize-y"
                />
              </div>

              {/* Scope Summary Preview */}
              <div className="border border-border p-4 bg-secondary/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  <span>
                    {PROJECT_STAGES.find((s) => s.id === stage)?.title} • {deliverables.length} Deliverables
                  </span>
                </div>
                <div>
                  Est. Tier: <strong className="text-foreground">{recommendation.packageName}</strong> ({currency})
                </div>
              </div>

              {submitError && (
                <div className="p-4 border border-destructive/30 bg-destructive/5 text-destructive text-sm" role="alert">
                  {submitError}
                </div>
              )}

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-foreground text-background text-sm font-medium tracking-wide hover:bg-foreground/90 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    "Registering Brief..."
                  ) : (
                    <>
                      Submit Project Brief
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons for Steps 1–4 */}
      {step < TOTAL_STEPS && (
        <div className="mt-12 pt-8 border-t border-border flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1}
            className={cn(
              "inline-flex items-center gap-2 text-sm transition-colors",
              step === 1
                ? "opacity-0 pointer-events-none"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-2 px-8 py-3 bg-foreground text-background text-sm font-medium tracking-wide hover:bg-foreground/90 transition-colors"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {submitError && step < TOTAL_STEPS && (
        <p className="mt-4 text-xs font-mono text-destructive text-right">{submitError}</p>
      )}
    </div>
  )
}
