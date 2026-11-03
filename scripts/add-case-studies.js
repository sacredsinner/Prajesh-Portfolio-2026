const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../lib/demo-projects.ts');
let content = fs.readFileSync(filePath, 'utf8');

const newProjects = [
  {
    slug: "aafno-shop",
    title: "Aafno.shop",
    subtitle: "E-commerce platform brand strategy, wordmark logo & sustainable packaging system",
    status: "published",
    category: "Brand Strategy & Packaging",
    year: "2025",
    thumbnail: "/images/projects/nomad-thumb.jpg",
    client: "Aafno.shop",
    role: "Brand Strategist & Lead Identity Designer",
    overview:
      "A complete brand transformation for an emerging Nepali e-commerce ecosystem, creating a cohesive strategy, bespoke wordmark logo, sustainable packaging concepts, and story-driven collateral that turned everyday commerce into cherished regional ritual.",
    problem:
      "In a crowded e-commerce landscape dominated by commoditized discount wars and chaotic visuals, Aafno.shop struggled to foster brand trust and justify artisan product values. Their existing identity lacked emotional resonance and strategic cohesion.",
    approach:
      "We grounded the strategic architecture in the cultural tenet of 'Aafno' (our own / cherished kin), shifting the company from a generic vendor catalogue to a curated provenance platform celebrating local craftsmanship and authentic maker stories.",
    solution:
      "A humanist bespoke wordmark, an earthy palette of terracotta, unbleached cotton, and ink slate, accompanied by modular sustainable kraft packaging and tactile lokta paper collateral that elevated the unboxing experience.",
    outcome:
      "Post-rebrand merchant acquisition increased by 62%, unboxing social shares surged threefold, and customer retention within 90 days improved by 34%.",
    images: [
      "/images/projects/nomad-1.jpg",
      "/images/projects/nomad-2.jpg",
      "/images/projects/nomad-3.jpg",
      "/images/projects/nomad-4.jpg",
    ],
    creativeFields: ["Brand Strategy", "Logo Design", "Packaging", "Art Direction"],
    tags: ["E-Commerce", "Custom Wordmark", "Sustainable Packaging", "Storytelling Collateral"],
    toolsUsed: ["Figma", "Adobe Illustrator", "Photoshop", "InDesign"],
    team: [
      { name: "Prajesh Shakya", role: "Brand Strategy, Wordmark Craft & Packaging" },
      { name: "Aafno Studio", role: "Content & Photography" },
    ],
    industries: ["E-Commerce", "Retail", "Artisan Goods"],
    featured: true,
    seoTitle: "Aafno.shop: E-Commerce Platform Brand Strategy & Packaging Case Study — Prajesh Shakya",
    seoDescription:
      "Read how Prajesh Shakya designed the brand strategy, bespoke wordmark logo, and packaging concepts for Aafno.shop, a community-driven Nepali e-commerce platform.",
    analytics: {
      views: 5420,
      appreciations: 712,
      saves: 340,
      comments: 48,
    },
    blocks: [
      {
        id: "aafno-intro",
        type: "text",
        content:
          "<p>In Nepali culture, the word <em>Aafno</em> translates to 'one\'s own'—a word vibrating with familial intimacy, warmth, and unshakeable trust. For <strong>Aafno.shop</strong>, our mandate was to transform a transactional digital marketplace into a celebration of homegrown craftsmanship and regional provenance.</p><p>We rejected the aggressive neon sale-banners typical of South Asian e-commerce in favour of editorial restraint, tactile materials, and respectful maker narratives.</p>",
        align: "left",
        fontSize: "lg",
        width: "boxed",
      },
      {
        id: "aafno-hero",
        type: "full-width-image",
        url: "/images/projects/nomad-1.jpg",
        caption: "Hero wordmark architecture and packaging guidelines designed for Aafno.shop.",
      },
      {
        id: "aafno-heading-strategy",
        type: "heading",
        level: 2,
        content: "Strategy & Typographic Wordmark Architecture",
        subtitle: "Balancing international digital commerce usability with vernacular warmth.",
        align: "left",
        width: "boxed",
      },
      {
        id: "aafno-grid",
        type: "image-grid",
        columns: 2,
        width: "wide",
        images: [
          {
            id: "aafno-grid-1",
            url: "/images/projects/nomad-2.jpg",
            caption: "Custom kraft paper mailer boxes, unbleached packaging tape, and seal stickers.",
          },
          {
            id: "aafno-grid-2",
            url: "/images/projects/nomad-3.jpg",
            caption: "Lokta paper thank-you collateral and merchant origin certificates.",
          },
        ],
      },
      {
        id: "aafno-quote",
        type: "quote",
        quote:
          "Prajesh brought an intellectual discipline to our brand that transformed how our customers and suppliers perceive us. We are no longer just an app; we are an institution for local pride.",
        citation: "Manav Bista",
        role: "Founder, Aafno.shop",
        width: "boxed",
      },
    ],
  },
  {
    slug: "pahichan",
    title: "PAHICHAN",
    subtitle: "Contemporary Nepali culture brand identity, Devanagari logo architecture & brand guidelines",
    status: "published",
    category: "Brand Identity & Culture",
    year: "2025",
    thumbnail: "/images/projects/vera-thumb.jpg",
    client: "PAHICHAN (पहचान)",
    role: "Lead Brand Identity Designer & Creative Strategist",
    overview:
      "A definitive cultural lifestyle and apparel brand identity uniting sacred Himalayan geometry, modern Devanagari typographic architecture, and an editorial design system for the global Nepali diaspora.",
    problem:
      "Nepali cultural apparel had long been trapped between stereotypical souvenir kitsch and sterile Western streetwear mimics. PAHICHAN required an authentic visual language that honored historical heritage with quiet, high-fashion dignity.",
    approach:
      "Through architectural analysis of traditional Newari jhyal (lattice woodwork) and stone inscriptions, we developed a proprietary geometric motif engine and a balanced bilingual typographic system.",
    solution:
      "A dual-script logo pairing an architectural Devanagari wordmark with sharp Latin glyphs, supported by natural pigment palettes (cinnabar vermilion, charred timber, raw ecru) and tactile hangtag labeling systems.",
    outcome:
      "Launched to sell-out collection drops across Kathmandu and Sydney, achieving 100% stock clearance within 72 hours and establishing PAHICHAN as a benchmark for contemporary South Asian identity design.",
    images: [
      "/images/projects/vera-1.jpg",
      "/images/projects/vera-2.jpg",
      "/images/projects/vera-3.jpg",
      "/images/projects/vera-4.jpg",
    ],
    creativeFields: ["Brand Identity", "Typography", "Cultural Design", "Art Direction"],
    tags: ["Devanagari Typography", "Cultural Motifs", "Apparel Guidelines", "Editorial"],
    toolsUsed: ["Illustrator", "Glyphs", "Figma", "Photoshop"],
    team: [
      { name: "Prajesh Shakya", role: "Creative Direction, Devanagari Type Design & Identity" },
    ],
    industries: ["Fashion & Apparel", "Culture & Lifestyle", "Design"],
    featured: true,
    seoTitle: "PAHICHAN: Contemporary Nepali Culture Brand Identity & Devanagari Logo Case Study — Prajesh Shakya",
    seoDescription:
      "Explore PAHICHAN's brand identity by Prajesh Shakya: Devanagari logo architecture, modern cultural motifs, and visual guidelines for contemporary Nepali apparel.",
    analytics: {
      views: 6890,
      appreciations: 940,
      saves: 412,
      comments: 63,
    },
    blocks: [
      {
        id: "pahichan-intro",
        type: "text",
        content:
          "<p><strong>PAHICHAN (पहचान)</strong>—meaning 'Identity' in Nepali—was founded to challenge the commodification of Himalayan culture. Instead of appropriating sacred iconography as superficial decoration, we treated cultural symbolism as an architectural discipline.</p><p>Every stroke in the bilingual mark respects traditional calligraphic weight while maintaining razor-sharp geometric precision for global fashion touchpoints.</p>",
        align: "left",
        fontSize: "lg",
        width: "boxed",
      },
      {
        id: "pahichan-hero",
        type: "full-width-image",
        url: "/images/projects/vera-1.jpg",
        caption: "Bilingual Devanagari and Latin typographic logo lockup applied to apparel hangtags.",
      },
      {
        id: "pahichan-heading",
        type: "heading",
        level: 2,
        content: "Devanagari Geometry & Cultural Motif Engine",
        subtitle: "Architectural proportions derived from Newari woodwork and historic temple proportions.",
        align: "left",
        width: "boxed",
      },
      {
        id: "pahichan-grid",
        type: "image-grid",
        columns: 2,
        width: "wide",
        images: [
          {
            id: "pahichan-grid-1",
            url: "/images/projects/vera-2.jpg",
            caption: "Woven damask garment labels with high-definition micro-lettering.",
          },
          {
            id: "pahichan-grid-2",
            url: "/images/projects/vera-3.jpg",
            caption: "Editorial brand book and visual guidelines specification.",
          },
        ],
      },
    ],
  },
  {
    slug: "oavana",
    title: "OaVana",
    subtitle: "Climate-rewards application brand identity, vector logo system & functional UI iconography",
    status: "published",
    category: "Visual Identity & Motion",
    year: "2025",
    thumbnail: "/images/projects/atlas-thumb.jpg",
    client: "OaVana Technologies",
    role: "Brand Identity Architect & Motion Designer",
    overview:
      "A complete brand identity and kinetic design system for a climate-rewards platform that incentivizes consumer sustainability actions through verified micro-credits and gamified financial mechanics.",
    problem:
      "Climate-tech apps frequently trap themselves in predictable greenwashing aesthetics—pastel green leaves and melancholic polar bears—which alienate digital-native users and breed eco-cynicism.",
    approach:
      "We developed the concept of 'Kinetic Regeneration'—framing sustainability not as sacrifice or guilt, but as forward economic momentum. The identity was built with interactive digital vectors and motion at its core.",
    solution:
      "A dynamic Möbius-vector logo system engineered for smooth 60 FPS Lottie state transitions, an electric palette of Bioluminescent Emerald and Deep Cosmic Indigo, and an expansive 48-icon functional suite.",
    outcome:
      "OaVana secured $1.8M in seed funding, saw a 58% increase in daily active user check-ins, and earned featured placement across international tech and design showcases.",
    images: [
      "/images/projects/atlas-1.jpg",
      "/images/projects/atlas-2.jpg",
      "/images/projects/atlas-3.jpg",
      "/images/projects/atlas-4.jpg",
    ],
    creativeFields: ["Brand Identity", "Motion Design", "Design Systems", "UI/UX"],
    tags: ["Climate Tech", "Kinetic Logo", "Vector Motion", "Iconography Suite"],
    toolsUsed: ["Figma", "After Effects", "Cavalry", "Illustrator"],
    team: [
      { name: "Prajesh Shakya", role: "Brand Identity, Kinetic Logo & Iconography Architecture" },
      { name: "OaVana Product Team", role: "Mobile Application Engineering" },
    ],
    industries: ["Climate Tech", "Fintech", "Mobile Applications"],
    featured: true,
    seoTitle: "OaVana: Climate-Rewards Brand Identity & Vector Logo System Case Study — Prajesh Shakya",
    seoDescription:
      "Case study on OaVana: climate-rewards brand identity, dynamic vector logo system engineered for 60fps micro-animation, and functional icons by Prajesh Shakya.",
    analytics: {
      views: 7420,
      appreciations: 1080,
      saves: 520,
      comments: 72,
    },
    blocks: [
      {
        id: "oavana-intro",
        type: "text",
        content:
          "<p>Climate action should feel invigorating, not punitive. For <strong>OaVana</strong>, our ambition was to build a brand language that rivals premier fintech interfaces like Stripe and Linear while instilling genuine environmental purpose.</p><p>Every graphic element was formulated mathematically in vectors to interpolate smoothly between interface states, from daily transit tracking to reward redemption.</p>",
        align: "left",
        fontSize: "lg",
        width: "boxed",
      },
      {
        id: "oavana-hero",
        type: "full-width-image",
        url: "/images/projects/atlas-1.jpg",
        caption: "Dynamic kinetic vector mark and primary typography lockup.",
      },
      {
        id: "oavana-heading",
        type: "heading",
        level: 2,
        content: "Kinetic Vector Geometry & 48-Piece Icon Suite",
        subtitle: "Engineered with 1px stroke precision for high-density OLED mobile displays.",
        align: "left",
        width: "boxed",
      },
      {
        id: "oavana-grid",
        type: "image-grid",
        columns: 2,
        width: "wide",
        images: [
          {
            id: "oavana-grid-1",
            url: "/images/projects/atlas-2.jpg",
            caption: "Functional in-app iconography library mapped to custom token variables.",
          },
          {
            id: "oavana-grid-2",
            url: "/images/projects/atlas-3.jpg",
            caption: "Multi-channel launch campaign visuals and dynamic motion templates.",
          },
        ],
      },
    ],
  },
];

// Insert newProjects right after "export const DEMO_PROJECTS: DemoProject[] = ["
const insertMarker = 'export const DEMO_PROJECTS: DemoProject[] = [\n';
if (!content.includes('"aafno-shop"')) {
  const serialized = newProjects.map(p => '  ' + JSON.stringify(p, null, 2).replace(/\n/g, '\n  ') + ',').join('\n');
  content = content.replace(insertMarker, insertMarker + serialized + '\n');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully inserted Aafno.shop, PAHICHAN, and OaVana into lib/demo-projects.ts');
} else {
  console.log('Projects already present in lib/demo-projects.ts');
}
