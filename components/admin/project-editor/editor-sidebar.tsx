"use client"

import { useState, useId } from "react"
import {
  Settings,
  Search,
  BarChart3,
  FolderOpen,
  Plus,
  X,
  ExternalLink,
  Upload,
  Globe,
  Share2,
  Trash2,
  Check,
  Eye,
  Heart,
  Bookmark,
  MessageSquare,
  Sparkles,
} from "lucide-react"
import type {
  ProjectData,
  ProjectAsset,
  ProjectTeamMember,
  ProjectStatus,
  ProjectBlock,
} from "@/lib/project-editor-types"
import { makeSlug } from "@/lib/utils"
import { uploadToBlob } from "@/lib/upload-client"

interface EditorSidebarProps {
  project: ProjectData
  onUpdate: (updatedProject: ProjectData) => void
  onAddBlockFromAsset?: (block: ProjectBlock) => void
}

type SidebarTab = "details" | "seo" | "analytics" | "assets"

const CREATIVE_FIELD_PRESETS = [
  "Art Direction",
  "Brand Identity",
  "UI/UX Design",
  "Typography",
  "Motion Design",
  "Editorial",
  "Packaging",
  "3D Visualization",
  "Digital Strategy",
  "Creative Coding",
]

const INDUSTRY_PRESETS = [
  "Hospitality & Travel",
  "Fashion & Luxury",
  "Technology & AI",
  "Architecture & Interior",
  "Culture & Arts",
  "Wellness & Health",
  "Finance & Fintech",
  "Editorial & Publishing",
]

const TOOL_PRESETS = [
  "Figma",
  "Adobe Illustrator",
  "Adobe After Effects",
  "Adobe Photoshop",
  "Blender",
  "Cinema 4D",
  "Next.js",
  "React",
  "Tailwind CSS",
  "Glyphs",
]

const LICENSE_PRESETS = [
  "All Rights Reserved (Standard)",
  "Creative Commons Attribution (CC BY)",
  "Creative Commons Non-Commercial (CC BY-NC)",
  "Public Domain (CC0)",
]

export function EditorSidebar({ project, onUpdate, onAddBlockFromAsset }: EditorSidebarProps) {
  const [tab, setTab] = useState<SidebarTab>("details")
  const [tagInput, setTagInput] = useState("")
  const [toolInput, setToolInput] = useState("")
  const [assetSearch, setAssetSearch] = useState("")
  const [assetFilter, setAssetFilter] = useState<"all" | "image" | "video" | "pdf">("all")
  const [uploadingAsset, setUploadingAsset] = useState(false)

  // Tag helper
  const addTag = () => {
    const val = tagInput.trim()
    if (!val || (project.tags ?? []).includes(val)) return
    onUpdate({ ...project, tags: [...(project.tags ?? []), val] })
    setTagInput("")
  }

  const removeTag = (t: string) => {
    onUpdate({ ...project, tags: (project.tags ?? []).filter((x) => x !== t) })
  }

  // Creative field toggle
  const toggleField = (field: string) => {
    const current = project.creativeFields ?? []
    const next = current.includes(field) ? current.filter((x) => x !== field) : [...current, field]
    onUpdate({ ...project, creativeFields: next })
  }

  // Tool toggle
  const toggleTool = (tool: string) => {
    const current = project.toolsUsed ?? []
    const next = current.includes(tool) ? current.filter((x) => x !== tool) : [...current, tool]
    onUpdate({ ...project, toolsUsed: next })
  }

  // Team member helpers
  const addTeamMember = () => {
    const newMember: ProjectTeamMember = { name: "Collaborator", role: "Design Contributor" }
    onUpdate({ ...project, team: [...(project.team ?? []), newMember] })
  }

  const updateTeamMember = (index: number, updated: Partial<ProjectTeamMember>) => {
    const next = [...(project.team ?? [])]
    next[index] = { ...next[index], ...updated }
    onUpdate({ ...project, team: next })
  }

  const removeTeamMember = (index: number) => {
    onUpdate({ ...project, team: (project.team ?? []).filter((_, i) => i !== index) })
  }

  // Asset upload handler
  const handleAssetUpload = async (file: File) => {
    setUploadingAsset(true)
    try {
      const res = await uploadToBlob(file, "portfolio")
      const newAsset: ProjectAsset = {
        id: `asset-${Date.now()}`,
        url: res.url,
        filename: file.name,
        sizeBytes: file.size,
        contentType: file.type,
        createdAt: new Date().toISOString(),
      }
      onUpdate({ ...project, assets: [newAsset, ...(project.assets ?? [])] })
    } catch (err) {
      console.error("Asset upload failed", err)
    } finally {
      setUploadingAsset(false)
    }
  }

  const filteredAssets = (project.assets ?? []).filter((a) => {
    const matchesQuery = a.filename.toLowerCase().includes(assetSearch.toLowerCase())
    if (!matchesQuery) return false
    if (assetFilter === "image") return a.contentType.startsWith("image/")
    if (assetFilter === "video") return a.contentType.startsWith("video/")
    if (assetFilter === "pdf") return a.contentType.includes("pdf")
    return true
  })

  return (
    <aside className="sticky top-20 flex h-[calc(100vh-5.5rem)] w-full flex-col rounded-2xl border border-border bg-background shadow-sm">
      {/* Tab Navigation */}
      <nav className="flex border-b border-border p-1.5">
        <button
          onClick={() => setTab("details")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-colors ${
            tab === "details" ? "bg-secondary text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Settings className="size-3.5" /> Details
        </button>
        <button
          onClick={() => setTab("seo")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-colors ${
            tab === "seo" ? "bg-secondary text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Globe className="size-3.5" /> SEO
        </button>
        <button
          onClick={() => setTab("analytics")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-colors ${
            tab === "analytics" ? "bg-secondary text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <BarChart3 className="size-3.5" /> Stats
        </button>
        <button
          onClick={() => setTab("assets")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-colors ${
            tab === "assets" ? "bg-secondary text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FolderOpen className="size-3.5" /> Assets
        </button>
      </nav>

      {/* Tab Content Panels */}
      <div className="flex-1 overflow-y-auto p-5 text-xs">
        {/* DETAILS TAB */}
        {tab === "details" && (
          <div className="space-y-6">
            {/* Visibility / Status */}
            <div>
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Visibility Status
              </label>
              <select
                value={project.status}
                onChange={(e) => onUpdate({ ...project, status: e.target.value as ProjectStatus })}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium capitalize outline-none focus:border-foreground"
              >
                <option value="draft">Draft (Private)</option>
                <option value="published">Published (Public)</option>
                <option value="scheduled">Scheduled for Release</option>
                <option value="unlisted">Unlisted (Direct Link Only)</option>
              </select>
            </div>

            {/* Discipline & Year */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Category
                </label>
                <input
                  value={project.category}
                  onChange={(e) => onUpdate({ ...project, category: e.target.value })}
                  placeholder="Brand Identity"
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-foreground"
                />
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Year
                </label>
                <input
                  value={project.year}
                  onChange={(e) => onUpdate({ ...project, year: e.target.value })}
                  placeholder="2026"
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-foreground"
                />
              </div>
            </div>

            {/* Client & Role */}
            <div className="space-y-3">
              <div>
                <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Client / Organisation
                </label>
                <input
                  value={project.client ?? ""}
                  onChange={(e) => onUpdate({ ...project, client: e.target.value })}
                  placeholder="e.g. Acme Studio Co."
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-foreground"
                />
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Your Role
                </label>
                <input
                  value={project.role ?? ""}
                  onChange={(e) => onUpdate({ ...project, role: e.target.value })}
                  placeholder="e.g. Lead Brand Designer"
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-foreground"
                />
              </div>
            </div>

            {/* Creative Fields */}
            <div>
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Creative Fields
              </label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {CREATIVE_FIELD_PRESETS.map((field) => {
                  const active = (project.creativeFields ?? []).includes(field)
                  return (
                    <button
                      key={field}
                      type="button"
                      onClick={() => toggleField(field)}
                      className={`rounded-full px-2.5 py-1 text-[11px] transition-colors ${
                        active
                          ? "bg-foreground font-medium text-background"
                          : "border border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {field}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Tools Used */}
            <div>
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Tools & Software
              </label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {TOOL_PRESETS.map((tool) => {
                  const active = (project.toolsUsed ?? []).includes(tool)
                  return (
                    <button
                      key={tool}
                      type="button"
                      onClick={() => toggleTool(tool)}
                      className={`rounded-full px-2.5 py-1 text-[11px] transition-colors ${
                        active
                          ? "bg-foreground font-medium text-background"
                          : "border border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tool}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Tags
              </label>
              <div className="mt-1.5 flex gap-2">
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                  placeholder="Add a tag..."
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-foreground"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="rounded-lg border border-border px-3 py-1.5 hover:bg-secondary"
                >
                  Add
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(project.tags ?? []).map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 rounded-md bg-secondary/80 px-2 py-0.5 text-[11px]"
                  >
                    {t}
                    <button onClick={() => removeTag(t)} className="text-muted-foreground hover:text-foreground">
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Team Members */}
            <div>
              <div className="flex items-center justify-between">
                <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Team & Credits
                </label>
                <button
                  type="button"
                  onClick={addTeamMember}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
                >
                  <Plus className="size-3" /> Add Member
                </button>
              </div>
              <div className="mt-2 space-y-2">
                {(project.team ?? []).map((member, i) => (
                  <div key={i} className="rounded-lg border border-border p-2 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <input
                        value={member.name}
                        onChange={(e) => updateTeamMember(i, { name: e.target.value })}
                        placeholder="Member Name"
                        className="font-medium text-xs outline-none w-full"
                      />
                      <button
                        type="button"
                        onClick={() => removeTeamMember(i)}
                        className="text-destructive hover:opacity-80"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                    <input
                      value={member.role}
                      onChange={(e) => updateTeamMember(i, { role: e.target.value })}
                      placeholder="Role (e.g. 3D Animator)"
                      className="text-[11px] text-muted-foreground outline-none w-full"
                    />
                    <input
                      value={member.url ?? ""}
                      onChange={(e) => updateTeamMember(i, { url: e.target.value })}
                      placeholder="Portfolio / LinkedIn URL"
                      className="text-[11px] text-muted-foreground outline-none w-full"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Copyright & License */}
            <div>
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Copyright & Licensing
              </label>
              <select
                value={project.license ?? LICENSE_PRESETS[0]}
                onChange={(e) => onUpdate({ ...project, license: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-foreground"
              >
                {LICENSE_PRESETS.map((lic) => (
                  <option key={lic} value={lic}>
                    {lic}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* SEO & SOCIAL TAB */}
        {tab === "seo" && (
          <div className="space-y-6">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                URL Slug
              </label>
              <div className="mt-1.5 flex items-center rounded-lg border border-border bg-background px-3 py-2">
                <span className="text-muted-foreground">/projects/</span>
                <input
                  value={project.slug}
                  onChange={(e) => onUpdate({ ...project, slug: makeSlug(e.target.value) })}
                  className="flex-1 bg-transparent text-xs font-mono outline-none"
                />
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Lowercase alphanumeric with hyphens.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Meta Title
                </label>
                <span
                  className={`text-[10px] font-mono ${
                    (project.seoTitle?.length ?? 0) > 60 ? "text-amber-500" : "text-muted-foreground"
                  }`}
                >
                  {project.seoTitle?.length ?? 0}/60
                </span>
              </div>
              <input
                value={project.seoTitle ?? ""}
                onChange={(e) => onUpdate({ ...project, seoTitle: e.target.value })}
                placeholder={project.title || "Project title"}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-foreground"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Meta Description
                </label>
                <span
                  className={`text-[10px] font-mono ${
                    (project.seoDescription?.length ?? 0) > 160 ? "text-amber-500" : "text-muted-foreground"
                  }`}
                >
                  {project.seoDescription?.length ?? 0}/160
                </span>
              </div>
              <textarea
                rows={4}
                value={project.seoDescription ?? ""}
                onChange={(e) => onUpdate({ ...project, seoDescription: e.target.value })}
                placeholder={project.overview || "Compelling project summary for search engines"}
                className="mt-1.5 w-full resize-y rounded-lg border border-border bg-background p-3 text-xs outline-none focus:border-foreground"
              />
            </div>

            {/* Google Search Snippet Preview */}
            <div className="rounded-xl border border-border bg-secondary/30 p-3.5 space-y-1">
              <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                Google Search Result Preview
              </p>
              <p className="truncate text-[13px] font-medium text-blue-600 hover:underline">
                {project.seoTitle || project.title || "Project Title"} — Prajesh Shakya
              </p>
              <p className="text-[11px] text-emerald-700">
                https://shakyaprajesh.com.np/projects/{project.slug || "slug"}
              </p>
              <p className="line-clamp-2 text-[11px] text-muted-foreground">
                {project.seoDescription || project.overview || "Project overview will appear here."}
              </p>
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {tab === "analytics" && (
          <div className="space-y-6">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Performance & Reach
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-secondary/30 p-3">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Eye className="size-3.5" /> Views
                </div>
                <p className="mt-2 font-serif text-2xl font-bold">{project.analytics?.views ?? 0}</p>
              </div>
              <div className="rounded-xl border border-border bg-secondary/30 p-3">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Heart className="size-3.5" /> Appreciations
                </div>
                <p className="mt-2 font-serif text-2xl font-bold">
                  {project.analytics?.appreciations ?? 0}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-secondary/30 p-3">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Bookmark className="size-3.5" /> Saves
                </div>
                <p className="mt-2 font-serif text-2xl font-bold">{project.analytics?.saves ?? 0}</p>
              </div>
              <div className="rounded-xl border border-border bg-secondary/30 p-3">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MessageSquare className="size-3.5" /> Comments
                </div>
                <p className="mt-2 font-serif text-2xl font-bold">{project.analytics?.comments ?? 0}</p>
              </div>
            </div>

            {/* Traffic Sources */}
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Discovery Channels
              </p>
              <div className="mt-3 space-y-2">
                {[
                  { name: "Direct & Portfolio", percent: 45 },
                  { name: "Search & Google", percent: 30 },
                  { name: "Social & LinkedIn", percent: 15 },
                  { name: "Design Portals", percent: 10 },
                ].map((s) => (
                  <div key={s.name} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span>{s.name}</span>
                      <span className="font-mono text-muted-foreground">{s.percent}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-foreground" style={{ width: `${s.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ASSET MANAGER TAB */}
        {tab === "assets" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Project Library ({project.assets?.length ?? 0})
              </span>
              <label className="cursor-pointer rounded-lg border border-border px-2.5 py-1 text-[11px] font-medium hover:bg-secondary">
                <Upload className="mr-1 inline size-3" />
                {uploadingAsset ? "Uploading…" : "Upload"}
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) void handleAssetUpload(file)
                  }}
                />
              </label>
            </div>

            {/* Filter buttons */}
            <div className="flex gap-1 border-b border-border/50 pb-2">
              {(["all", "image", "video", "pdf"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setAssetFilter(filter)}
                  className={`rounded px-2 py-0.5 text-[10px] uppercase font-mono ${
                    assetFilter === filter ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {filteredAssets.length === 0 ? (
              <div className="flex min-h-36 flex-col items-center justify-center rounded-xl border border-dashed border-border p-4 text-center">
                <p className="text-muted-foreground">No media assets in this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {filteredAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-secondary/30"
                  >
                    {asset.contentType.startsWith("image/") ? (
                      <img src={asset.url} alt={asset.filename} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center p-2 text-center text-[10px] text-muted-foreground">
                        {asset.filename}
                      </div>
                    )}

                    {/* Hover quick action overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                      {onAddBlockFromAsset && (
                        <button
                          type="button"
                          onClick={() => {
                            if (asset.contentType.startsWith("image/")) {
                              onAddBlockFromAsset({
                                id: `image-${Date.now()}`,
                                type: "image",
                                url: asset.url,
                                width: "boxed",
                                caption: asset.filename,
                              })
                            } else if (asset.contentType.includes("pdf")) {
                              onAddBlockFromAsset({
                                id: `pdf-${Date.now()}`,
                                type: "pdf",
                                url: asset.url,
                                filename: asset.filename,
                                width: "boxed",
                              })
                            }
                          }}
                          className="rounded bg-white px-2 py-1 text-[10px] font-medium text-black hover:bg-neutral-200"
                        >
                          Insert
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          onUpdate({
                            ...project,
                            assets: (project.assets ?? []).filter((a) => a.id !== asset.id),
                          })
                        }
                        className="rounded p-1 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}
