import "server-only"

// Small helper around the Anthropic Messages API for the moodboard's keyword and
// caption suggestions. Needs ANTHROPIC_API_KEY in Vercel; everything else works without it.

export const AI_ENABLED = Boolean(process.env.ANTHROPIC_API_KEY)
const MODEL = process.env.ANTHROPIC_MODEL || "claude-haiku-5-5"

export type ImageInsight = { keywords: string[]; caption: string; category: "Mood" | "Colour" | "Type" | "References" | "Other"; mood: string }

export async function describeImage(url: string, context?: string): Promise<ImageInsight> {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) throw new Error("Add ANTHROPIC_API_KEY in Vercel to turn on keyword suggestions.")
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "url", url } },
            {
              type: "text",
              text: `You are helping a brand identity designer organise a client moodboard${context ? ` titled "${context}"` : ""}. Describe this image for the board. Reply with JSON only, no prose: {"keywords": [5 to 8 short lowercase keywords about mood, style, materials, colours, typography or subject], "caption": "one sentence, under 15 words, in a designer's voice, no quotes", "category": one of "Mood" | "Colour" | "Type" | "References" (Type only if the image is mainly lettering or typography; Colour only if it is mainly a colour study or swatches; References for other designs, packaging, logos or interfaces; Mood for photography, textures, places and atmosphere), "mood": "two or three words for the feeling"}`,
            },
          ],
        },
      ],
    }),
  })
  if (!response.ok) {
    const text = await response.text().catch(() => "")
    throw new Error(response.status === 401 ? "The Anthropic API key was rejected. Check ANTHROPIC_API_KEY in Vercel." : `The AI request failed (${response.status}). ${text.slice(0, 200)}`)
  }
  const data = (await response.json()) as { content?: { type: string; text?: string }[] }
  const text = data.content?.find((part) => part.type === "text")?.text ?? ""
  const json = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1)
  const parsed = JSON.parse(json) as Partial<ImageInsight>
  const category = (["Mood", "Colour", "Type", "References"] as const).find((c) => c === parsed.category) ?? "Other"
  return {
    keywords: (Array.isArray(parsed.keywords) ? parsed.keywords : []).map((k) => String(k).trim().toLowerCase()).filter(Boolean).slice(0, 8),
    caption: String(parsed.caption ?? "").trim().slice(0, 160),
    category,
    mood: String(parsed.mood ?? "").trim().slice(0, 60),
  }
}
