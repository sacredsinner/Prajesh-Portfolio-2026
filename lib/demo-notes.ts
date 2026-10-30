export interface DemoNote {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  featuredImage: string
  author: string
  tags: string[]
  published: boolean
  publishedAt: Date
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string
  featured: boolean
  notionPageId?: string | null
  createdAt: Date
  updatedAt: Date
}

export const DEMO_NOTES: DemoNote[] = [
  {
    id: "note-1",
    slug: "your-logo-is-not-your-brand",
    title: "Your Logo Is Not Your Brand",
    excerpt: "A logo is an identifier, not a reputation. If your offer is generic and your positioning is timid, slapping a sleek monogram on it won't save you. Here is what actually builds enduring brand equity.",
    category: "Brand Strategy",
    featuredImage: "/images/notes/your-logo-is-not-your-brand.png",
    author: "Prajesh Shakya",
    tags: ["Brand Strategy", "Identity Design", "Positioning"],
    published: true,
    publishedAt: new Date("2026-09-24T10:00:00Z"),
    featured: true,
    seoTitle: "Your Logo Is Not Your Brand — Prajesh Shakya",
    seoDescription: "A logo is an identifier, not a reputation. Why visual decoration without strategic positioning fails.",
    seoKeywords: "brand strategy, logo design, brand equity, positioning",
    createdAt: new Date("2026-09-24T10:00:00Z"),
    updatedAt: new Date("2026-09-24T10:00:00Z"),
    content: `
### The Myth: "A New Logo Will Reinvigorate Our Business"

Every year, founders spend five- to six-figure sums redesigning their visual identities hoping it will spark a sudden surge in demand, solve churn, or allow them to double their prices.

Six months later, nothing has changed except their business cards.

Why? Because a logo is merely a flag planted in the ground. If the territory underneath that flag is undifferentiated, barren, or confusing, the flag doesn't make people want to settle there.

---

### The Reality: What a Brand Actually Is

Your brand is not what you tell people it is. It is the gut feeling, the visceral intuition, and the collective memory that lives in your customer's mind when you are not in the room.

A brand consists of three distinct layers:

1. **Strategic Position**: What single, undeniable problem do you solve better than anyone else, and who are you intentionally willing to turn away?
2. **Behavioral Consistency**: Does every touchpoint—from your customer support emails to your pricing contracts—deliver on that exact promise?
3. **Visual & Verbal Identity**: The sensory cues (typography, mark, color, cadence) that help memory recall that reputation in a microsecond.

When you invest in identity design without clarifying your strategy, you are decorating a house with no foundation.

---

### Three Tests Before You Touch the Pixels

1. **The Sacrifice Test**: If your positioning claims you are "fast, affordable, and high-quality," you have made zero strategic choices. Real strategy is deciding what you will deliberately NOT be.
2. **The Category Test**: Can your customer describe your unique value in one sentence without using the words "innovative," "passionate," or "seamless"?
3. **The Distinctiveness Test**: If you took your logo off your website, would your typography, tone of voice, and point of view still identify you?

Stop looking for salvation in a vector mark. Build a point of view first. Then give it a face.
    `.trim(),
  },
  {
    id: "note-2",
    slug: "people-buy-the-brand-first",
    title: "People Buy The Brand First",
    excerpt: "Before a client evaluates your scope, deliverables, or hourly rate, they have already decided what category of professional you belong to. Here is how brand perception dictates fee thresholds.",
    category: "Pricing & Psychology",
    featuredImage: "/images/notes/people-buy-the-brand-first.png",
    author: "Prajesh Shakya",
    tags: ["Pricing & Psychology", "Brand Strategy", "Value"],
    published: true,
    publishedAt: new Date("2026-09-04T10:00:00Z"),
    featured: true,
    seoTitle: "People Buy The Brand First — Prajesh Shakya",
    seoDescription: "How brand perception dictates fee thresholds and why clients decide your value before the proposal.",
    seoKeywords: "pricing psychology, value pricing, brand perception, client advisory",
    createdAt: new Date("2026-09-04T10:00:00Z"),
    updatedAt: new Date("2026-09-04T10:00:00Z"),
    content: `
### What Makes Someone Spend $17,000 on a Bag?

A leather tote from a luxury fashion house costs approximately $180 to manufacture. The leather, the stitching, and the brass hardware are undeniably high grade. 

Yet someone happily hands over $17,000 for it.

Are they paying for the leather? No. They are paying for what the brand signals to the world—and more importantly, how holding that bag makes them feel about themselves.

In professional services, the exact same psychological mechanism is at play.

---

### The Two Tables: Vendor vs. Strategic Authority

When a prospect books a call with you, they have already seated you at one of two mental tables:

* **The Vendor Table**: "We need a redesign. Send us your hourly rate and portfolio. We are comparing five agencies."
* **The Strategic Authority Table**: "We have a critical commercial hurdle. We need your perspective to guide us through this decision."

At the Vendor Table, every dollar is contested. Every deliverable is itemized. Every milestone is micromanaged.

At the Strategic Authority Table, fees are paid upfront because the risk of hiring anyone else is unacceptably high.

---

### How to Shift Your Perception

1. **Diagnose Before You Prescribe**: Never accept a client's self-diagnosis at face value. If they say "we need a website," ask "what commercial reality broke that made you think a new website is the cure?"
2. **Eliminate Commodity Language**: Stop talking about deliverables (wireframes, style guides, Figma files). Talk about business outcomes (conversion clarity, category differentiation, pricing leverage).
3. **Control the Frame**: Your digital presence, your proposals, and your correspondence must look, feel, and sound like an established institution—not an anxious freelancer desperate for work.
    `.trim(),
  },
  {
    id: "note-3",
    slug: "stop-decorating-start-deciding",
    title: "Stop Decorating, Start Deciding",
    excerpt: "Most identity projects fail because founders treat branding as visual decoration rather than strategic decision-making. If your brand doesn't sacrifice an audience, it doesn't stand for anything.",
    category: "Positioning",
    featuredImage: "/images/notes/stop-decorating-start-deciding.png",
    author: "Prajesh Shakya",
    tags: ["Positioning", "Brand Strategy", "Editorial"],
    published: true,
    publishedAt: new Date("2026-08-28T10:00:00Z"),
    featured: false,
    seoTitle: "Stop Decorating, Start Deciding — Prajesh Shakya",
    seoDescription: "Why branding is decision-making, not aesthetic ornamentation.",
    seoKeywords: "positioning, brand decision, strategy, sacrifice",
    createdAt: new Date("2026-08-28T10:00:00Z"),
    updatedAt: new Date("2026-08-28T10:00:00Z"),
    content: `
### The Fear of Being Specific

The single greatest enemy of memorable branding is the terror of missing out.

Founders look at their TAM (Total Addressable Market) and whisper to their design team:
*"We don't want to pigeonhole ourselves. Let's make sure enterprise clients, early-stage startups, and solo creators all feel comfortable here."*

The result? A brand that sounds like vanilla pudding. Pleasant, completely digestible, and instantly forgotten.

---

### Strategy Is the Art of Exclusion

Michael Porter famously noted that the essence of strategy is deciding what NOT to do.

When Apple released the original iPhone, they deliberately excluded physical keyboards, removable batteries, and flash memory. That was not a limitation; it was a defiant declaration of what computing was going to become.

When you define your brand identity:
- If you don't alienate the wrong customers, you will never magnetize the right ones.
- If your tone of voice tries to be simultaneously humorous, deeply serious, technical, and casual, you have no tone at all.

---

### The Rule of Friction

Memorable brands have friction. They take strong stands on controversial questions in their industry. They have a philosophy on how work should be done.

Decorating is picking colors that look pretty on Dribbble.

Deciding is choosing an aesthetic and a point of view that your competitors would find uncomfortable to copy.
    `.trim(),
  },
  {
    id: "note-4",
    slug: "two-typefaces-one-colour-more-space",
    title: "Two Typefaces, One Colour, More Space",
    excerpt: "Amateur identity design adds elements to look sophisticated. Masters subtract until nothing superfluous remains. A deep dive into the discipline of typographic restraint.",
    category: "Visual Identity",
    featuredImage: "/images/notes/two-typefaces-one-colour-more-space.png",
    author: "Prajesh Shakya",
    tags: ["Visual Identity", "Typography", "Design Systems"],
    published: true,
    publishedAt: new Date("2026-08-20T10:00:00Z"),
    featured: false,
    seoTitle: "Two Typefaces, One Colour, More Space — Prajesh Shakya",
    seoDescription: "The discipline of typographic restraint and why subtraction is the highest form of visual craft.",
    seoKeywords: "typography, design systems, visual hierarchy, minimal design",
    createdAt: new Date("2026-08-20T10:00:00Z"),
    updatedAt: new Date("2026-08-20T10:00:00Z"),
    content: `
### The Seduction of Complexity

When insecure designers begin an identity project, they reach for five font weights, gradient meshes, synthetic neon drop shadows, and complex decorative shapes.

Why? Because complexity feels like effort. Complexity creates the illusion of value.

Yet if you examine the most iconic publications and heritage identities in history—from Swiss modernism to classic editorial mastheads—the recipe is almost invariably the opposite:

1. **One Display Voice**: A serif with personality and historic authority.
2. **One Structural Voice**: A modernist grotesk or sans that provides neutral legibility.
3. **One Deep Neutral Palette**: Carbon ink and tactile parchment ground.
4. **Ruthless White Space**: Letting the typography breathe so each sentence carries gravity.

---

### Why Restraint Commands Premium Authority

Luxury is not having more things; luxury is having so much confidence that you don't need to shout.

When a brand fills every square pixel with banners, floating widgets, and colored badges, it broadcasts anxiety. It screams: *"Please don't leave! Look at this! And this! And this!"*

Restraint communicates power. When you give an idea room to exist on an uncluttered canvas, you signal to the reader that what you have to say is worth their undivided attention.
    `.trim(),
  },
  {
    id: "note-5",
    slug: "consistency-compounds",
    title: "Consistency Compounds",
    excerpt: "The best brands are not necessarily the ones with the flashiest launches; they are the ones that never break character over ten consecutive years. Why brand stamina beats viral novelty.",
    category: "Brand Strategy",
    featuredImage: "/images/notes/consistency-compounds.png",
    author: "Prajesh Shakya",
    tags: ["Brand Strategy", "Long-term Value", "Identity"],
    published: true,
    publishedAt: new Date("2026-08-13T10:00:00Z"),
    featured: true,
    seoTitle: "Consistency Compounds — Prajesh Shakya",
    seoDescription: "Why brand stamina beats viral novelty and how consistency creates compounding equity.",
    seoKeywords: "brand consistency, compounding value, brand stamina, brand management",
    createdAt: new Date("2026-08-13T10:00:00Z"),
    updatedAt: new Date("2026-08-13T10:00:00Z"),
    content: `
### The Boredom Trap

Here is what happens inside almost every marketing team after 18 months:

The founders and the marketing team get thoroughly bored of their brand colors, their slogan, and their core message. They see it every day. To them, it feels stale.

So they commission a rebrand, change their tone of voice, launch a new sub-brand, and pivot their visual language.

Meanwhile, in the real world?

Their prospective customers were *just starting to notice them*.

---

### The Compounding Equation of Trust

Trust is not built in an explosion. Trust is built in the mundane, relentless repetition of the same promises kept thousands of times:

- The same typographic discipline on every PDF invoice.
- The same thoughtful, unhurried cadence in customer onboarding.
- The same uncompromising standard of aesthetic execution across digital and print.

Every time you change your visual system or brand voice prematurely, you reset the compounding clock to zero.

The most enduring institutions don't invent new identities; they deepen the one they have.
    `.trim(),
  },
  {
    id: "note-6",
    slug: "brand-strategy-is-therapy",
    title: "Brand Strategy Is Therapy (With Commercial Stakes)",
    excerpt: "Clients don't hire strategists to tell them what color to paint their buttons. They hire someone to diagnose the fundamental crisis of confidence and identity holding their organization back.",
    category: "Storytelling",
    featuredImage: "/images/projects/aurora-thumb.jpg",
    author: "Prajesh Shakya",
    tags: ["Storytelling", "Client Advisory", "Strategy"],
    published: true,
    publishedAt: new Date("2026-08-05T10:00:00Z"),
    featured: false,
    seoTitle: "Brand Strategy Is Therapy — Prajesh Shakya",
    seoDescription: "Diagnosing the internal misalignment before prescribing external visual identities.",
    seoKeywords: "brand strategy, client advisory, storytelling, leadership alignment",
    createdAt: new Date("2026-08-05T10:00:00Z"),
    updatedAt: new Date("2026-08-05T10:00:00Z"),
    content: `
### The Discovery Call Breakdown

In 80% of our discovery workshops, within the first 45 minutes, two co-founders will look at each other with quiet realization.

Founder A thought their core customer was high-growth venture-backed tech executives.
Founder B thought their core customer was bootstrapped lifestyle operators.

They have been running the company together for three years without ever resolving this divergence. And they wondered why their marketing felt scattered and inconsistent.

---

### Listening Between the Sentences

A brand strategist's true instrument is not Figma or Illustrator. It is the ability to listen for emotional hesitation:

- Where do the founders lack confidence?
- What truth about the product is everyone tiptoeing around?
- What are they terrified of admitting to their board or their market?

Until you unearth those underlying tensions, any graphic design you produce will only be camouflage. When you bring that hidden truth into the open and align the team around it, visual design becomes effortless.
    `.trim(),
  },
]
