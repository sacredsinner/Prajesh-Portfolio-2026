"use server"

import { z } from "zod"
import { submitContact } from "@/app/actions/cms"
import { DELIVERABLE_ITEMS, PROJECT_STAGES, TIMELINE_OPTIONS } from "@/lib/funnel"
import { isCurrency } from "@/lib/money"

const funnelSubmissionSchema = z.object({
  stage: z.string().min(1, "Please select a project stage."),
  deliverables: z.array(z.string()).min(1, "Please select at least one deliverable."),
  timeline: z.string().min(1, "Please select a timeline."),
  currency: z.string().refine(isCurrency, "Invalid currency specified."),
  budgetBand: z.string().min(1, "Please choose an estimated budget."),
  name: z.string().trim().min(2, "Please enter your name.").max(120),
  email: z.string().trim().email("Please enter a valid email address.").max(200),
  company: z.string().trim().max(160).optional(),
  website: z.string().trim().max(200).optional(),
  notes: z.string().trim().max(5000).optional(),
  recommendedPackage: z.string().optional(),
})

export type FunnelSubmissionInput = z.infer<typeof funnelSubmissionSchema>

export async function submitFunnelIntake(input: FunnelSubmissionInput) {
  const result = funnelSubmissionSchema.safeParse(input)
  if (!result.success) {
    return { ok: false, error: result.error.issues[0]?.message ?? "Please check the form and try again." }
  }

  const data = result.data

  const stageObj = PROJECT_STAGES.find((s) => s.id === data.stage)
  const stageTitle = stageObj?.title ?? data.stage

  const timelineObj = TIMELINE_OPTIONS.find((t) => t.id === data.timeline)
  const timelineTitle = timelineObj ? `${timelineObj.title} (${timelineObj.estimate})` : data.timeline

  const deliverableTitles = data.deliverables
    .map((id) => DELIVERABLE_ITEMS.find((d) => d.id === id)?.title ?? id)
    .join(", ")

  // Construct structured editorial summary message for CRM and notifications
  const summaryMessage = [
    `[PROJECT INTAKE WIZARD SUBMISSION]`,
    `Stage: ${stageTitle}`,
    `Deliverables: ${deliverableTitles}`,
    `Target Timeline: ${timelineTitle}`,
    `Budget Band: ${data.budgetBand} (${data.currency})`,
    data.recommendedPackage ? `Recommended Package: ${data.recommendedPackage}` : null,
    data.website ? `Website / Social: ${data.website}` : null,
    ``,
    `Project Notes & Context:`,
    data.notes?.trim() || "No additional notes provided.",
  ]
    .filter((line) => line !== null)
    .join("\n")

  return submitContact({
    name: data.name,
    email: data.email,
    company: data.company,
    message: summaryMessage,
    packageInterest: data.recommendedPackage || "Project Intake Wizard",
    budget: `${data.budgetBand} (${data.currency})`,
    timeline: timelineTitle,
    website: "", // Empty to pass honeypot check in submitContact
  })
}
