export type BlockWidth = "boxed" | "wide" | "full"

export type ImageBlock = {
  id: string
  type: "image"
  url: string
  caption?: string
  alt?: string
  focalPoint?: { x: number; y: number }
  width: BlockWidth
  aspectRatio?: "auto" | "16/9" | "4/3" | "1/1"
}

export type ImageGridBlock = {
  id: string
  type: "image-grid"
  images: { id: string; url: string; caption?: string; alt?: string }[]
  columns: 2 | 3 | 4
  gap?: "sm" | "md" | "lg"
  width: BlockWidth
}

export type CarouselBlock = {
  id: string
  type: "carousel"
  slides: { id: string; url: string; title?: string; caption?: string }[]
  autoplay?: boolean
  showIndicators?: boolean
  width: BlockWidth
}

export type FullWidthImageBlock = {
  id: string
  type: "full-width-image"
  url: string
  caption?: string
  alt?: string
  parallax?: boolean
}

export type VideoBlock = {
  id: string
  type: "video"
  source: "upload" | "youtube" | "vimeo" | "loom"
  url: string
  caption?: string
  autoplay?: boolean
  loop?: boolean
  muted?: boolean
  controls?: boolean
  width: BlockWidth
}

export type TextBlock = {
  id: string
  type: "text"
  content: string // HTML or formatted markdown
  align?: "left" | "center" | "right" | "justify"
  fontSize?: "sm" | "base" | "lg" | "xl"
  width?: "boxed" | "wide"
}

export type HeadingBlock = {
  id: string
  type: "heading"
  level: 1 | 2 | 3 | 4
  content: string
  subtitle?: string
  align?: "left" | "center" | "right"
  width?: "boxed" | "wide"
}

export type QuoteBlock = {
  id: string
  type: "quote"
  quote: string
  citation?: string
  role?: string
  avatarUrl?: string
  width?: "boxed" | "wide"
}

export type DividerBlock = {
  id: string
  type: "divider"
  style: "line" | "dash" | "dots" | "blank"
  spacing: "sm" | "md" | "lg" | "xl"
}

export type EmbedBlock = {
  id: string
  type: "embed"
  url: string
  html?: string
  title?: string
  aspectRatio?: "16/9" | "4/3" | "custom"
  width: BlockWidth
}

export type BeforeAfterBlock = {
  id: string
  type: "before-after"
  beforeUrl: string
  beforeLabel?: string
  afterUrl: string
  afterLabel?: string
  initialPosition?: number // percentage 0 - 100
  width: BlockWidth
}

export type GifBlock = {
  id: string
  type: "gif"
  url: string
  caption?: string
  alt?: string
  width: BlockWidth
}

export type PdfBlock = {
  id: string
  type: "pdf"
  url: string
  filename: string
  fileSize?: string
  description?: string
  previewImage?: string
  width: "boxed" | "wide"
}

export type FigmaBlock = {
  id: string
  type: "figma"
  embedUrl: string
  prototypeTitle?: string
  allowFullscreen?: boolean
  width: BlockWidth
}

export type CustomHtmlBlock = {
  id: string
  type: "custom-html"
  code: string
  caption?: string
  width: BlockWidth
}

export type ProjectBlock =
  | ImageBlock
  | ImageGridBlock
  | CarouselBlock
  | FullWidthImageBlock
  | VideoBlock
  | TextBlock
  | HeadingBlock
  | QuoteBlock
  | DividerBlock
  | EmbedBlock
  | BeforeAfterBlock
  | GifBlock
  | PdfBlock
  | FigmaBlock
  | CustomHtmlBlock

export type ProjectTeamMember = {
  name: string
  role: string
  url?: string
}

export type ProjectAsset = {
  id: string
  url: string
  filename: string
  sizeBytes: number
  contentType: string
  createdAt: string
  width?: number
  height?: number
  alt?: string
  caption?: string
}

export type ProjectAnalytics = {
  views: number
  appreciations: number
  saves: number
  comments: number
  sources?: { name: string; count: number; percentage: number }[]
}

export type ProjectCoverCrop = {
  zoom: number
  x: number // percentage 0 - 100
  y: number // percentage 0 - 100
  aspectRatio?: string
}

export type ProjectStatus = "draft" | "published" | "scheduled" | "unlisted"

export type ProjectData = {
  id?: string
  slug: string
  title: string
  subtitle?: string
  status: ProjectStatus
  scheduledAt?: string | null
  category: string
  year: string
  thumbnail: string
  coverCrop?: ProjectCoverCrop | null
  client?: string | null
  role?: string | null
  overview?: string | null
  problem?: string | null
  approach?: string | null
  solution?: string | null
  outcome?: string | null
  images: string[]
  creativeFields: string[]
  tags: string[]
  toolsUsed: string[]
  team: ProjectTeamMember[]
  industries: string[]
  license?: string | null
  copyright?: string | null
  blocks: ProjectBlock[]
  assets: ProjectAsset[]
  analytics?: ProjectAnalytics
  featured: boolean
  seoTitle?: string | null
  seoDescription?: string | null
  ogImage?: string | null
  createdAt?: string | Date
  updatedAt?: string | Date
}
