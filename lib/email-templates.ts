import "server-only"

import { BOOKING_URL, SITE_URL } from "@/lib/site"

// Branded HTML emails in the Prajesh Shakya system: ground #F5F5F3, ink #1B1A16,
// Instrument Serif headings and Instrument Sans text (with Georgia / Helvetica
// fallbacks, since most inboxes don't load web fonts), square corners, hairlines.
// Every email also gets a plain-text version.

const C = { ground: "#F5F5F3", ink: "#1B1A16", soft: "#45443D", kicker: "#6F6D63", muted: "#8B897F", hair: "#D9D7CD" }
const SERIF = "'Instrument Serif', Georgia, 'Times New Roman', serif"
const SANS = "'Instrument Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"
const SITE_LABEL = SITE_URL.replace(/^https?:\/\/(www\.)?/, "")
const INSTAGRAM = "https://www.instagram.com/madebyprajesh/"

export type EmailContent = { subject: string; html: string; text: string }

export function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;")
}

const textStyle = `margin:0 0 16px;font-family:${SANS};font-size:16px;line-height:1.6;color:${C.soft};`
const smallStyle = `margin:0 0 12px;font-family:${SANS};font-size:14px;line-height:1.6;color:${C.kicker};`
const kickerStyle = `margin:0 0 14px;font-family:${SANS};font-size:11px;line-height:1.4;font-weight:600;letter-spacing:0.24em;text-transform:uppercase;color:${C.kicker};`

// Plain text → paragraphs (a blank line starts a new one; single line breaks are kept).
export function textToHtml(text: string, style = textStyle) {
  return text
    .trim()
    .split(/\n{2,}/)
    .map((paragraph) => `<p style="${style}">${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("")
}

function button(label: string, url: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 28px;"><tr><td style="background:${C.ink};"><a href="${escapeHtml(url)}" style="display:inline-block;padding:14px 24px;font-family:${SANS};font-size:14px;font-weight:600;letter-spacing:0.02em;color:${C.ground};text-decoration:none;">${escapeHtml(label)} &rarr;</a></td></tr></table>`
}

// A quoted block under the main text, e.g. the visitor's original message.
export function quoteBlock(label: string, text: string) {
  return `<div style="margin:28px 0 0;padding:20px 0 0;border-top:1px solid ${C.hair};"><p style="${kickerStyle}">${escapeHtml(label)}</p>${textToHtml(text, smallStyle)}</div>`
}

// Label / value rows, e.g. enquiry details.
export function detailsBlock(rows: [string, string][]) {
  const cells = rows
    .map(([label, valueHtml]) => `<tr><td style="padding:10px 16px 10px 0;border-bottom:1px solid ${C.hair};font-family:${SANS};font-size:11px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:${C.kicker};white-space:nowrap;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:10px 0;border-bottom:1px solid ${C.hair};font-family:${SANS};font-size:15px;line-height:1.5;color:${C.ink};">${valueHtml}</td></tr>`)
    .join("")
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;border-top:1px solid ${C.hair};">${cells}</table>`
}

type Layout = { preheader: string; kicker?: string; heading?: string; bodyHtml: string; cta?: { label: string; url: string }; afterHtml?: string }

export function renderEmail({ preheader, kicker, heading, bodyHtml, cta, afterHtml = "" }: Layout) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light">
<title>${escapeHtml(heading ?? preheader)}</title>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;600&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:${C.ground};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.ground};">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
<tr><td style="padding:0 0 24px;border-bottom:1px solid ${C.hair};">
<a href="${SITE_URL}" style="text-decoration:none;color:${C.ink};"><img src="${SITE_URL}/email/mark.png" width="32" height="32" alt="PS" style="display:inline-block;vertical-align:middle;border:0;outline:none;"><span style="display:inline-block;vertical-align:middle;margin-left:12px;font-family:${SANS};font-size:11px;font-weight:600;letter-spacing:0.3em;text-transform:uppercase;color:${C.ink};">Prajesh Shakya</span></a>
</td></tr>
<tr><td style="padding:36px 0 12px;">
${kicker ? `<p style="${kickerStyle}">${escapeHtml(kicker)}</p>` : ""}
${heading ? `<h1 style="margin:0 0 24px;font-family:${SERIF};font-size:36px;line-height:1.1;font-weight:400;color:${C.ink};">${escapeHtml(heading)}</h1>` : ""}
${bodyHtml}
${cta ? button(cta.label, cta.url) : ""}
${afterHtml}
</td></tr>
<tr><td style="padding:28px 0 0;border-top:1px solid ${C.hair};">
<p style="margin:0 0 8px;font-family:${SERIF};font-size:19px;line-height:1.3;font-style:italic;color:${C.ink};">Designed with intention.</p>
<p style="margin:0;font-family:${SANS};font-size:12px;line-height:1.7;color:${C.muted};">Prajesh Shakya &middot; Brand Identity Designer<br><a href="${SITE_URL}" style="color:${C.muted};">${SITE_LABEL}</a> &middot; <a href="${INSTAGRAM}" style="color:${C.muted};">@madebyprajesh</a></p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
}

const textFooter = `\n\n—\nPrajesh Shakya · Brand Identity Designer\n${SITE_LABEL} · @madebyprajesh`

const firstName = (name: string) => name.trim().split(/\s+/)[0] || name

// To Prajesh when someone uses the contact form.
export function enquiryNotificationEmail(data: { name: string; email: string; company?: string; message: string; packageInterest?: string; budget?: string; timeline?: string }): EmailContent {
  const subject = `New enquiry from ${data.name}${data.company ? ` (${data.company})` : ""}`
  const rows: [string, string][] = [
    ["Name", escapeHtml(data.name)],
    ["Email", `<a href="mailto:${escapeHtml(data.email)}" style="color:${C.ink};">${escapeHtml(data.email)}</a>`],
    ...(data.company ? [["Company", escapeHtml(data.company)] as [string, string]] : []),
    ...(data.packageInterest ? [["Interested in", escapeHtml(data.packageInterest)] as [string, string]] : []),
    ...(data.budget ? [["Budget", escapeHtml(data.budget)] as [string, string]] : []),
    ...(data.timeline ? [["Timeline", escapeHtml(data.timeline)] as [string, string]] : []),
  ]
  const html = renderEmail({
    preheader: data.message.slice(0, 120),
    kicker: "New enquiry",
    heading: data.company ? `${data.name}, ${data.company}` : data.name,
    bodyHtml: detailsBlock(rows) + textToHtml(data.message),
    cta: { label: "Open the content studio", url: `${SITE_URL}/admin` },
    afterHtml: `<p style="${smallStyle}">Reply to this email to answer ${escapeHtml(firstName(data.name))} directly, or use Reply on the enquiry in the content studio.</p>`,
  })
  const text = [`New enquiry from ${data.name}`, `Email: ${data.email}`, data.company ? `Company: ${data.company}` : null, data.packageInterest ? `Interested in: ${data.packageInterest}` : null, data.budget ? `Budget: ${data.budget}` : null, data.timeline ? `Timeline: ${data.timeline}` : null, "", data.message, "", `Reply to this email to answer them, or open ${SITE_URL}/admin.`].filter((line) => line !== null).join("\n")
  return { subject, html, text }
}

// To the visitor, straight after they use the contact form.
export function enquiryAutoReplyEmail(data: { name: string; message: string }): EmailContent {
  const name = firstName(data.name)
  const intro = `I've got your message and I'll reply within one working day, usually sooner.\n\nIf you'd like to add anything in the meantime, just reply to this email.`
  return {
    subject: "Thanks for getting in touch",
    html: renderEmail({
      preheader: "I've got your message and I'll reply within one working day.",
      kicker: "Message received",
      heading: `Thanks, ${name}.`,
      bodyHtml: textToHtml(intro) + `<p style="${textStyle}">Prajesh</p>` + `<p style="${smallStyle}">Rather talk it through? Pick a time for a free 30-minute call:</p>`,
      cta: { label: "Book a 30-minute call", url: BOOKING_URL },
      afterHtml: quoteBlock("Your message", data.message),
    }),
    text: `Hi ${name},\n\n${intro}\n\nPrajesh\n\nRather talk it through? Book a free 30-minute call: ${BOOKING_URL}\n\n— Your message —\n${data.message}${textFooter}`,
  }
}

// A personal email written in the content studio (Email tab or Reply on an enquiry).
export function adminMessageEmail(input: { subject: string; text: string; quote?: { label: string; text: string } }): EmailContent {
  return {
    subject: input.subject,
    html: renderEmail({
      preheader: input.text.replace(/\s+/g, " ").slice(0, 120),
      bodyHtml: textToHtml(input.text),
      afterHtml: input.quote ? quoteBlock(input.quote.label, input.quote.text) : "",
    }),
    text: `${input.text}${input.quote ? `\n\n— ${input.quote.label} —\n${input.quote.text}` : ""}${textFooter}`,
  }
}

export function passwordResetEmail(url: string): EmailContent {
  return {
    subject: "Reset your password",
    html: renderEmail({
      preheader: "A link to choose a new password for your content studio.",
      kicker: "Content studio",
      heading: "Reset your password",
      bodyHtml: textToHtml("Someone, hopefully you, asked to reset the password for your content studio. The link expires in an hour."),
      cta: { label: "Choose a new password", url },
      afterHtml: `<p style="${smallStyle}">If you didn't ask for this, you can ignore this email. Your password won't change.</p>`,
    }),
    text: `Reset your password\n\nSomeone, hopefully you, asked to reset the password for your content studio. Open this link to choose a new one (it expires in an hour):\n\n${url}\n\nIf you didn't ask for this, you can ignore this email.${textFooter}`,
  }
}

export function newsletterConfirmEmail(url: string): EmailContent {
  return {
    subject: "Confirm your subscription",
    html: renderEmail({
      preheader: "One click to start getting my notes on brand strategy and identity.",
      kicker: "Notes from Prajesh Shakya",
      heading: "One click to confirm.",
      bodyHtml: textToHtml("Thanks for signing up for my notes on brand strategy and identity. Confirm your email and new notes will come straight to your inbox."),
      cta: { label: "Confirm subscription", url },
      afterHtml: `<p style="${smallStyle}">The link works for seven days. If you didn't sign up, ignore this email and you won't hear from me.</p>`,
    }),
    text: `One click to confirm.\n\nThanks for signing up for my notes on brand strategy and identity. Confirm your email here and new notes will come straight to your inbox:\n\n${url}\n\nThe link works for seven days. If you didn't sign up, ignore this email and you won't hear from me.${textFooter}`,
  }
}

// To Prajesh when someone confirms their subscription.
export function newSubscriberEmail(email: string, problem?: string): EmailContent {
  const note = problem
    ? `They couldn't be added to Resend automatically (${problem}). Add them by hand in Resend under Audience → Contacts.`
    : `They've been added to the "Website newsletter" segment in Resend, ready for your next broadcast.`
  return {
    subject: `New newsletter subscriber: ${email}`,
    html: renderEmail({
      preheader: `${email} confirmed their subscription.`,
      kicker: "Newsletter",
      heading: "New subscriber",
      bodyHtml: detailsBlock([["Email", escapeHtml(email)]]) + textToHtml(note),
    }),
    text: `New newsletter subscriber: ${email}\n\n${note}`,
  }
}

// ── Moodboards ───────────────────────────────────────────────────────────────

// To the client: the private link to their moodboard.
export function moodboardLinkEmail(input: { clientName?: string | null; title: string; url: string; message?: string }): EmailContent {
  const hello = input.clientName ? `Hi ${firstName(input.clientName)},` : "Hi,"
  const body = input.message?.trim() || "Here's the moodboard for your project. Have a look through it, leave comments on anything that stands out, and approve the direction when it feels right."
  return {
    subject: `Moodboard: ${input.title}`,
    html: renderEmail({
      preheader: "Your moodboard is ready to review.",
      kicker: "Moodboard",
      heading: input.title,
      bodyHtml: textToHtml(`${hello}\n\n${body}`) + `<p style="${textStyle}">Prajesh</p>`,
      cta: { label: "Open the moodboard", url: input.url },
      afterHtml: `<p style="${smallStyle}">This link is private to you. Comments and approvals come straight to me.</p>`,
    }),
    text: `${hello}\n\n${body}\n\nOpen the moodboard: ${input.url}\n\nPrajesh${textFooter}`,
  }
}

const FEEDBACK_KICKER = { comment: "New comment", approval: "Direction approved", changes: "Changes requested" } as const

// To Prajesh: a client commented, approved or asked for changes.
export function moodboardFeedbackEmail(input: { title: string; author: string; body: string; kind: keyof typeof FEEDBACK_KICKER; adminUrl: string }): EmailContent {
  const heading = input.kind === "approval" ? `${input.author} approved the direction` : input.kind === "changes" ? `${input.author} asked for changes` : `${input.author} left a comment`
  return {
    subject: `${FEEDBACK_KICKER[input.kind]}: ${input.title}`,
    html: renderEmail({
      preheader: input.body.slice(0, 120) || heading,
      kicker: `${FEEDBACK_KICKER[input.kind]} · ${input.title}`,
      heading,
      bodyHtml: input.body ? textToHtml(input.body) : "",
      cta: { label: "Open in the content studio", url: input.adminUrl },
    }),
    text: `${heading} on "${input.title}".\n\n${input.body}\n\n${input.adminUrl}`,
  }
}

// To the client: Prajesh replied on the moodboard.
export function moodboardReplyEmail(input: { clientName?: string | null; title: string; body: string; url: string }): EmailContent {
  const hello = input.clientName ? `Hi ${firstName(input.clientName)},` : "Hi,"
  return {
    subject: `Re: ${input.title}`,
    html: renderEmail({
      preheader: input.body.slice(0, 120),
      kicker: `Moodboard · ${input.title}`,
      bodyHtml: textToHtml(`${hello}\n\n${input.body}`) + `<p style="${textStyle}">Prajesh</p>`,
      cta: { label: "Open the moodboard", url: input.url },
    }),
    text: `${hello}\n\n${input.body}\n\nPrajesh\n\n${input.url}${textFooter}`,
  }
}

// ── Quotes and invoices ──────────────────────────────────────────────────────

// To the client: a quote or invoice, with a link to view it online (the PDF is attached).
export function documentEmail(input: { kind: "quote" | "invoice"; number: string; clientName: string; amount: string; dateLabel: string; url: string; message?: string; businessName: string }): EmailContent {
  const label = input.kind === "quote" ? "Quote" : "Invoice"
  const hello = `Hi ${firstName(input.clientName)},`
  const body =
    input.message?.trim() ||
    (input.kind === "quote"
      ? `Here's the quote we talked about. You can view it online, download a PDF and accept it with one click.`
      : `Here's your invoice. You can view it online or download the PDF, and the payment details are on it.`)
  return {
    subject: `${label} ${input.number} from ${input.businessName}`,
    html: renderEmail({
      preheader: `${label} ${input.number}: ${input.amount}, ${input.dateLabel}.`,
      kicker: `${label} ${input.number}`,
      heading: input.amount,
      bodyHtml: detailsBlock([[label, escapeHtml(input.number)], [input.kind === "quote" ? "Valid until" : "Due", escapeHtml(input.dateLabel)]]) + textToHtml(`${hello}\n\n${body}`) + `<p style="${textStyle}">Prajesh</p>`,
      cta: { label: input.kind === "quote" ? "View and accept the quote" : "View the invoice", url: input.url },
      afterHtml: `<p style="${smallStyle}">The PDF is attached. Questions? Just reply to this email.</p>`,
    }),
    text: `${hello}\n\n${body}\n\n${label} ${input.number}: ${input.amount}\n${input.kind === "quote" ? "Valid until" : "Due"}: ${input.dateLabel}\n\n${input.url}\n\nPrajesh${textFooter}`,
  }
}

// To the client: a friendly nudge once an invoice is past due.
export function invoiceReminderEmail(input: { number: string; clientName: string; amount: string; dueDate: string; url: string; businessName: string }): EmailContent {
  const hello = `Hi ${firstName(input.clientName)},`
  const body = `A quick reminder that invoice ${input.number} for ${input.amount} was due on ${input.dueDate}. If you've already paid, thank you, and please ignore this email. If anything's unclear, just reply and I'll help.`
  return {
    subject: `Reminder: invoice ${input.number} from ${input.businessName}`,
    html: renderEmail({
      preheader: `Invoice ${input.number} for ${input.amount} was due on ${input.dueDate}.`,
      kicker: `Invoice ${input.number}`,
      heading: "A quick reminder",
      bodyHtml: textToHtml(`${hello}\n\n${body}`) + `<p style="${textStyle}">Prajesh</p>`,
      cta: { label: "View the invoice", url: input.url },
    }),
    text: `${hello}\n\n${body}\n\n${input.url}\n\nPrajesh${textFooter}`,
  }
}

// To Prajesh: a client accepted a quote.
export function quoteAcceptedEmail(input: { number: string; clientName: string; acceptedBy: string; amount: string; adminUrl: string }): EmailContent {
  return {
    subject: `Quote ${input.number} accepted by ${input.clientName}`,
    html: renderEmail({
      preheader: `${input.acceptedBy} accepted quote ${input.number} (${input.amount}).`,
      kicker: `Quote ${input.number}`,
      heading: "Quote accepted",
      bodyHtml: detailsBlock([["Client", escapeHtml(input.clientName)], ["Accepted by", escapeHtml(input.acceptedBy)], ["Amount", escapeHtml(input.amount)]]) + textToHtml("Turn it into an invoice from the content studio when you're ready to bill."),
      cta: { label: "Open Invoices", url: input.adminUrl },
    }),
    text: `${input.acceptedBy} accepted quote ${input.number} for ${input.clientName} (${input.amount}).\n\n${input.adminUrl}`,
  }
}
