"use client"

import { BehanceProjectEditor } from "@/components/admin/project-editor"
import type { ProjectData } from "@/lib/project-editor-types"

export function ProjectUploadEditor({ initialProject }: { initialProject?: Partial<ProjectData> | null }) {
  return <BehanceProjectEditor initialProject={initialProject} />
}
