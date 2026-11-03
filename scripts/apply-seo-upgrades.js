const fs = require('fs');
const path = require('path');

// 1. Update components/home/interactive-hero-title.tsx
const titlePath = path.join(__dirname, '../components/home/interactive-hero-title.tsx');
let titleContent = fs.readFileSync(titlePath, 'utf8');

titleContent = titleContent.replace(
  /words:\s*\["Crafting",\s*"Authentic",\s*"Brand",\s*"Identities",\s*"That",\s*"Resonate"\]/,
  'words: ["Turning", "Ambitious", "Businesses", "Into", "Unmistakable", "Brands"]'
);

titleContent = titleContent.replace(
  /aria-label="Crafting Authentic Brand Identities That Resonate"/g,
  'aria-label="Turning Ambitious Businesses Into Unmistakable Brands"'
);

const sentenceBlockOld = `  // Hover on "Crafting" (Slot 0)
  0: {
    anchorSlot: 0,
    anchorWord: "Crafting",
    words: ["Crafting", "Timeless", "Visual", "Worlds", "With", "Precision"],
  },
  // Hover on "Authentic" (Slot 1)
  1: {
    anchorSlot: 1,
    anchorWord: "Authentic",
    words: ["Uncovering", "Authentic", "Truth", "Behind", "Every", "Founder"],
  },
  // Hover on "Brand" (Slot 2)
  2: {
    anchorSlot: 2,
    anchorWord: "Brand",
    words: ["Defining", "Strategic", "Brand", "Systems", "Built", "To Endure"],
  },
  // Hover on "Identities" (Slot 3)
  3: {
    anchorSlot: 3,
    anchorWord: "Identities",
    words: ["Designing", "Timeless", "Brand", "Identities", "That", "Endure"],
  },
  // Hover on "Resonate" (Slot 5)
  5: {
    anchorSlot: 5,
    anchorWord: "Resonate",
    words: ["Creating", "Human", "Brand", "Identities", "That", "Resonate"],
  },`;

const sentenceBlockNew = `  // Hover on "Turning" (Slot 0)
  0: {
    anchorSlot: 0,
    anchorWord: "Turning",
    words: ["Turning", "Bold", "Visions", "Into", "Market", "Leaders"],
  },
  // Hover on "Ambitious" (Slot 1)
  1: {
    anchorSlot: 1,
    anchorWord: "Ambitious",
    words: ["Elevating", "Ambitious", "Founders", "Into", "Industry", "Icons"],
  },
  // Hover on "Businesses" (Slot 2)
  2: {
    anchorSlot: 2,
    anchorWord: "Businesses",
    words: ["Transforming", "Growing", "Businesses", "With", "Enduring", "Craft"],
  },
  // Hover on "Unmistakable" (Slot 4)
  4: {
    anchorSlot: 4,
    anchorWord: "Unmistakable",
    words: ["Designing", "Singular", "Identities", "Into", "Unmistakable", "Brands"],
  },
  // Hover on "Brands" (Slot 5)
  5: {
    anchorSlot: 5,
    anchorWord: "Brands",
    words: ["Building", "Enduring", "Identities", "Into", "Iconic", "Brands"],
  },`;

// Normalize CRLF to LF for replacement, then replace
titleContent = titleContent.replace(/\r\n/g, '\n');
if (titleContent.includes(sentenceBlockOld)) {
  titleContent = titleContent.replace(sentenceBlockOld, sentenceBlockNew);
} else {
  console.log('Sentence block old not matched directly, checking normalized text');
}
fs.writeFileSync(titlePath, titleContent, 'utf8');
console.log('1. Updated interactive-hero-title.tsx');

// 2. Update components/home/process-section.tsx
const processPath = path.join(__dirname, '../components/home/process-section.tsx');
let processContent = fs.readFileSync(processPath, 'utf8');
processContent = processContent.replace(
  'description="A proven methodology that transforms insight into identity."',
  'description="Six deliberate steps from raw business insight to a living visual system."'
);
fs.writeFileSync(processPath, processContent, 'utf8');
console.log('2. Updated process-section.tsx');

// 3. Update components/json-ld.tsx
const jsonLdPath = path.join(__dirname, '../components/json-ld.tsx');
let jsonLdContent = fs.readFileSync(jsonLdPath, 'utf8');
jsonLdContent = jsonLdContent.replace(
  'knowsAbout: ["Brand strategy", "Brand identity design", "Logo design", "Visual identity systems"],',
  'knowsAbout: ["Brand Strategy", "Visual Identity Systems", "Typography", "Packaging Design", "Design Systems"],'
);
jsonLdContent = jsonLdContent.replace(
  'areaServed: ["Nepal", "Australia", "Worldwide"],',
  'areaServed: ["NP", "AU", "US"],\n      priceRange: "$$$",'
);
fs.writeFileSync(jsonLdPath, jsonLdContent, 'utf8');
console.log('3. Updated json-ld.tsx');

// 4. Update app/packages/page.tsx
const packagesPagePath = path.join(__dirname, '../app/packages/page.tsx');
let packagesContent = fs.readFileSync(packagesPagePath, 'utf8');
packagesContent = packagesContent.replace(
  `export const metadata: Metadata = {
  title: "Packages & Pricing — Prajesh Shakya",
  description: "Brand identity packages from Prajesh Shakya: Foundation, Identity and System, with starting prices in NPR, AUD and USD, plus add-ons and day rates.",
  alternates: { canonical: "/packages" },
}`,
  `export const metadata: Metadata = {
  title: "Brand Identity Packages & Pricing (USD, AUD, NPR) — Prajesh Shakya",
  description:
    "Transparent multi-currency brand identity pricing: Foundation ($2,500+ / AUD $3,500+ / NPR 50,000+), Identity ($6,000+ / AUD $8,500+ / NPR 120,000+), and System ($11,000+ / AUD $16,000+ / NPR 250,000+).",
  alternates: { canonical: "/packages" },
  openGraph: {
    title: "Brand Identity Packages & Pricing (USD, AUD, NPR) — Prajesh Shakya",
    description:
      "Transparent multi-currency brand identity pricing: Foundation ($2,500+), Identity ($6,000+), and System ($11,000+). No hidden agency markups.",
    url: \`\${SITE_URL}/packages\`,
  },
}`
);
fs.writeFileSync(packagesPagePath, packagesContent, 'utf8');
console.log('4. Updated packages/page.tsx');

// 5. Update app/projects/page.tsx
const projectsPagePath = path.join(__dirname, '../app/projects/page.tsx');
let projectsContent = fs.readFileSync(projectsPagePath, 'utf8');
projectsContent = projectsContent.replace(
  `export const metadata: Metadata = {
  title: "Brand Identity Projects — Prajesh Shakya",
  description:
    "Explore my selected brand identity projects and case studies, from strategy and logo design to complete visual systems.",
  alternates: { canonical: "/projects" },
}`,
  `export const metadata: Metadata = {
  title: "Brand Strategy, Visual Identity & Packaging Case Studies — Prajesh Shakya",
  description:
    "Explore commercial case studies in brand strategy, logo architecture, packaging design, and visual systems for ambitious businesses across Nepal, Australia, and the US.",
  alternates: { canonical: "/projects" },
  openGraph: {
    title: "Brand Strategy, Visual Identity & Packaging Case Studies — Prajesh Shakya",
    description:
      "Selected commercial case studies in brand strategy, logo systems, and packaging architecture.",
    url: "https://www.shakyaprajesh.com.np/projects",
  },
}`
);
fs.writeFileSync(projectsPagePath, projectsContent, 'utf8');
console.log('5. Updated projects/page.tsx');

// 6. Update app/contact/page.tsx
const contactPagePath = path.join(__dirname, '../app/contact/page.tsx');
let contactContent = fs.readFileSync(contactPagePath, 'utf8');
contactContent = contactContent.replace(
  `export const metadata: Metadata = {
  title: "Contact Prajesh Shakya — Start a Brand Project",
  description:
    "Tell me about your business, brand, or next idea. I create distinctive identities through strategy and design.",
  alternates: { canonical: "/contact" },
}`,
  `export const metadata: Metadata = {
  title: "Start a Brand Project — Free 30-Min Discovery Call | Prajesh Shakya",
  description:
    "Book a free 30-minute discovery call with Prajesh Shakya. Receive a tailored scope and fixed-price proposal within 48 hours for your brand identity or design system.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Start a Brand Project — Free 30-Min Discovery Call | Prajesh Shakya",
    description:
      "Book a free 30-minute discovery call with Prajesh Shakya. Receive a tailored scope and proposal within 48 hours.",
    url: "https://www.shakyaprajesh.com.np/contact",
  },
}`
);
fs.writeFileSync(contactPagePath, contactContent, 'utf8');
console.log('6. Updated contact/page.tsx');

// 7. Update app/design-system/page.tsx
const designSystemPagePath = path.join(__dirname, '../app/design-system/page.tsx');
let dsContent = fs.readFileSync(designSystemPagePath, 'utf8');
dsContent = dsContent.replace(
  `export const metadata: Metadata = {
  title: "Design System — Prajesh Shakya",
  description:
    "The living design system powering the portfolio and content studio of Prajesh Shakya. Minimal mono palette, editorial typography, and purposeful motion.",`,
  `export const metadata: Metadata = {
  title: "Brand & UI Design Systems Architecture — Prajesh Shakya",
  description:
    "Explore the Brand & UI Design Systems Architecture of Prajesh Shakya: editorial typography, WCAG 2.1 AA accessible UI components, and tactile motion guidelines.",`
);
fs.writeFileSync(designSystemPagePath, dsContent, 'utf8');
console.log('7. Updated design-system/page.tsx');
