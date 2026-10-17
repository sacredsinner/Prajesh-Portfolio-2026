import { NextResponse, type NextRequest } from "next/server"
import { sendEmail } from "@/lib/email"
import { newSubscriberEmail } from "@/lib/email-templates"
import { verifyConfirmation } from "@/lib/newsletter"
import { addSubscriber } from "@/lib/resend-contacts"
import { CONTACT_EMAIL, SITE_URL } from "@/lib/site"

// Step 2 of double opt-in: the link in the confirmation email lands here.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const email = (params.get("email") ?? "").trim().toLowerCase()
  if (!verifyConfirmation(email, params.get("t") ?? "", params.get("sig") ?? "")) {
    return NextResponse.redirect(new URL("/newsletter?status=invalid", SITE_URL), 303)
  }

  const added = await addSubscriber(email)
  if (!added.ok) console.error("[newsletter] Could not add subscriber to Resend:", added.error)

  // Tell Prajesh about new subscribers, and about any that need adding by hand.
  if (!added.ok || added.isNew) {
    await sendEmail({ to: process.env.CONTACT_NOTIFICATION_EMAIL || CONTACT_EMAIL, ...newSubscriberEmail(email, added.ok ? undefined : added.error) }).catch((error) =>
      console.error("[newsletter] Subscriber alert failed", error),
    )
  }
  return NextResponse.redirect(new URL("/newsletter?status=confirmed", SITE_URL), 303)
}
