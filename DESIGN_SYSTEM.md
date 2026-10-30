# Prajesh Shakya — Design System (2026 Edition)

> **A living design system defined by quiet editorial confidence, typographic precision, and purposeful digital craft.**

---

## 1. Design Philosophy

The Prajesh Shakya brand identity and content studio system is grounded in four timeless principles:

1. **Quiet Editorial Confidence**: No loud synthetic accent colors or decorative clutter. The tactile parchment Ground (`#F5F5F3`) and deep carbon Ink (`#1B1A16`) establish a serene, gallery-grade atmosphere where visual identity work commands complete attention.
2. **Typographic Truth**: High-contrast editorial dialogue between **Instrument Serif** (historical elegance and display impact), **Instrument Sans** (modernist utility, clarity, and form structure), and **Geist Mono** (technical and operational precision).
3. **Hairlines over Shadows**: Avoid synthetic dropped shadows. Form and hierarchy are delineated through crisp 1px hairline rules (`#D9D7CD`), generous margins, and deliberate proportion.
4. **Honest Physics**: Animations exist solely to orient the viewer and indicate state change. Transitions employ editorial cubic-bezier easing curves, with instant cuts when `prefers-reduced-motion` is enabled.

---

## 2. Brand Identity & The PS Monogram

The core brand mark is an interlocking **PS Monogram** set upon a strict 45° isometric grid:

- **Construction**: A continuous stroke of uniform thickness where the upper loop of the 'P' establishes a grounded apex, gracefully flowing diagonally into the spine and counter of the 'S'.
- **Clear Space**: A minimum boundary equal to 1x stroke width on all four sides. No typography, container edges, or imagery may infringe upon this clearance zone.
- **Minimum Digital Size**: `18px × 18px` (ensuring crisp rendering down to retina favicons).
- **Minimum Print Size**: `6mm × 6mm`.
- **Boards**:
  - *Standard Ground Board*: Ink (`#1B1A16`) monogram on Ground (`#F5F5F3`).
  - *Inverted Obsidian Board*: Ground (`#F5F5F3`) monogram on Ink (`#1B1A16`).

---

## 3. Color Tokens & Contrast Matrix

All color tokens are calibrated to satisfy or exceed **WCAG 2.1 AA/AAA** standards for accessibility.

| Token | CSS Variable | Light Hex | Dark Hex | Role | Contrast vs Ground | WCAG Rating |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Ground** | `--background` | `#F5F5F3` | `#1B1A16` | Main canvas, surface ground | 1.0:1 | Canvas |
| **Ink** | `--foreground` | `#1B1A16` | `#F5F5F3` | Primary text, brandmark, active lines | 14.2:1 | **AAA** |
| **Ink Soft** | `--accent` | `#45443D` | `#C7C5BA` | Secondary body paragraphs, subtitles | 8.6:1 | **AAA** |
| **Kicker** | `--muted-foreground` | `#6F6D63` | `#A3A196` | Micro-labels, metadata, kickers | 4.8:1 | **AA** |
| **Neutral Ground** | `--secondary` | `#ECEBE5` | `#2C2B25` | Pill backgrounds, tags, subtle chips | 1.1:1 | Surface |
| **Hairline** | `--border` | `#D9D7CD` | `#3A3932` | 1px dividers, table borders, card rules | 1.4:1 | Structural |
| **Input Stroke** | `--input` | `#8B897F` | `#8B897F` | Form outlines, underline borders | 3.2:1 | **AA (1.4.11)** |
| **Destructive** | `--destructive` | `#B42318` | `#E05252` | Error feedback, critical warnings | 5.1:1 | **AA** |
| **Playground Accent**| `--playground-accent`| `#2447FF` | `#4E6BFF` | Prototype accents, interactive tags | 5.8:1 | **AA** |

---

## 4. Typographic Scale

Type sizes are set on a modular scale designed to accommodate both fluid editorial headlines and compact operational tables:

| Tier | Typeface | Size (px / rem) | Leading | Tracking | Role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display 2XL** | Instrument Serif | `96px` / `6.0rem` | `0.95` | `-0.03em` | Hero statements, homepage manifesto |
| **Display XL** | Instrument Serif | `72px` / `4.5rem` | `1.0` | `-0.025em` | Case study hero titles, editorial openers |
| **Display LG** | Instrument Serif | `48px` / `3.0rem` | `1.1` | `-0.02em` | Section headers, quote headlines |
| **Heading 1** | Instrument Serif | `36px` / `2.25rem` | `1.2` | `-0.015em` | Article headers, service titles |
| **Heading 2** | Instrument Sans | `24px` / `1.5rem` | `1.3` | `-0.01em` | Sub-headings, admin section cards |
| **Heading 3** | Instrument Sans | `20px` / `1.25rem` | `1.4` | `normal` | Accordion headers, modal titles |
| **Body Large** | Instrument Sans | `19px` / `1.1875rem`| `1.65` | `normal` | Lead story paragraphs, about summary |
| **Body Base** | Instrument Sans | `16px` / `1.0rem` | `1.6` | `normal` | Standard body copy, form fields |
| **Body Small** | Instrument Sans | `14px` / `0.875rem`| `1.5` | `normal` | Captions, secondary copy, deliverables |
| **Kicker / Eyebrow** | Instrument Sans | `12px` / `0.75rem` | `1.0` | `+0.25em` | Category uppercase kickers, status |
| **Monospace Spec** | Geist Mono | `12px` / `0.75rem` | `1.5` | `+0.05em` | Code tokens, invoice IDs, tech specs |

---

## 5. Spacing & The 8pt Baseline Grid

All spatial intervals adhere to an 8pt baseline rhythm:

- `4px` (`--spacing-1`): Micro offsets, icon alignment
- `8px` (`--spacing-2`): Button inner padding, pill gaps
- `12px` (`--spacing-3`): Compact badge padding
- `16px` (`--spacing-4`): Default stack spacing, standard padding
- `24px` (`--spacing-6`): Card body padding, mobile page margins
- `32px` (`--spacing-8`): Desktop container margins (`.page-container`), column gaps
- `48px` (`--spacing-12`): Major content module separations
- `64px` (`--spacing-16`): Section padding (mobile)
- `96px` (`--spacing-24`): Standard section padding (desktop)
- `128px` (`--spacing-32`): Hero top spacing, major breathing room

### Content Width Tiers:
- **Boxed**: `max-w-3xl` (~768px) for long-form reading comfort.
- **Wide**: `max-w-5xl` (~1024px) for 2-column grids and galleries.
- **Page Container**: `page-container` (`padding-inline: 1.5rem` mobile / `2rem` desktop).
- **Full-Bleed**: `w-full` for immersive photography and Behance content blocks.

---

## 6. Radii & Surface Elevation

1. **Radii Tokens**:
   - `rounded-none` (`0px`): Editorial photography, bleed hero cards, divider splits.
   - `rounded-xs` (`2px`): Code tags, micro chips.
   - `rounded-sm` (`4px` / `0.25rem`): Standard buttons, input controls, cards, dropdowns.
   - `rounded-md` (`6px`): Modals, dialogs, popovers.
   - `rounded-xl` (`12px`): Admin drawers, elevated sheets.
   - `rounded-full` (`9999px`): Category pills, status indicators, circular monograms.

2. **Elevation**:
   - Depth is expressed via **1px hairline borders** (`border border-border`) rather than diffuse drop shadows.
   - For floating dropdowns and command palettes, micro-elevation (`shadow-xs` / `shadow-sm`) is combined with hairline borders.

---

## 7. Motion & Physics Tokens

| Preset | Duration | Easing | Usage |
| :--- | :--- | :--- | :--- |
| **Editorial Fade-Up** | `0.6s` | `cubic-bezier(0.16, 1, 0.3, 1)` | Section reveals, hero entrances |
| **Micro Hover** | `0.2s` | `ease-out` | Button and link pointer feedback |
| **Sheet Spring** | `0.4s` | `cubic-bezier(0.32, 0.72, 0, 1)` | Mobile menu, command palette, toasts |
| **Stagger Offset** | `0.08s - 0.1s` | `easeOut` | Sequential lists, pill grids |
| **Reduced Motion** | `0.0s` | `instant` | When `prefers-reduced-motion: reduce` is detected |

---

## 8. Developer Usage & Imports

Tokens and helper methods are exported from `@/lib/design-system`:

```typescript
import {
  COLOR_TOKENS,
  TYPOGRAPHY_SCALE,
  SPACING_SCALE,
  RADIUS_TOKENS,
  MOTION_TOKENS,
  BRAND_MARK_RULES,
  calculateContrast,
  exportDesignTokensCss,
  exportDesignSystemJson,
} from "@/lib/design-system"

// Example: Calculate contrast between any two colors
const ratio = calculateContrast("#F5F5F3", "#1B1A16") // 14.2
```

### Live Hub & Interactive Explorer

Visit **`/design-system`** on the live website to test type specimens, copy hex codes and CSS variables, inspect the PS monogram geometry, test interactive UI primitives, and download JSON token exports.
