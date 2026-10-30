"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { authClient } from "@/lib/auth-client"
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Mail,
  Users,
  Quote,
  Video,
  Receipt,
  Palette,
  Package,
  Send,
  PlusCircle,
  Sparkles,
  ExternalLink,
  LogOut,
} from "lucide-react"
import { toast } from "sonner"
import { seedDemoProjects } from "@/app/actions/cms"

interface CommandPaletteProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CommandPalette({ open: controlledOpen, onOpenChange: controlledOnOpenChange }: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = React.useCallback(
    (value: boolean) => {
      if (isControlled && controlledOnOpenChange) {
        controlledOnOpenChange(value)
      } else {
        setInternalOpen(value)
      }
    },
    [isControlled, controlledOnOpenChange]
  )

  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(!open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [open, setOpen])

  const runCommand = React.useCallback(
    (command: () => void) => {
      setOpen(false)
      command()
    },
    [setOpen]
  )

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or jump to section…" />
      <CommandList className="max-h-[350px]">
        <CommandEmpty>No matching studio commands found.</CommandEmpty>

        <CommandGroup heading="Studio Navigation">
          <CommandItem
            onSelect={() => runCommand(() => router.push("/admin?tab=overview"))}
            className="flex items-center gap-2 cursor-pointer"
          >
            <LayoutDashboard className="size-4" />
            <span>Overview & Dashboard</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/admin?tab=projects"))}
            className="flex items-center gap-2 cursor-pointer"
          >
            <FolderKanban className="size-4" />
            <span>Projects Studio</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/admin?tab=posts"))}
            className="flex items-center gap-2 cursor-pointer"
          >
            <FileText className="size-4" />
            <span>Notes & Blog</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/admin?tab=contacts"))}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Mail className="size-4" />
            <span>Client Enquiries</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/admin/clients"))}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Users className="size-4" />
            <span>Clients & Partnerships</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/admin/invoices"))}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Receipt className="size-4" />
            <span>Invoices & Quotes</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/admin/moodboards"))}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Palette className="size-4" />
            <span>Moodboards</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/admin/packages"))}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Package className="size-4" />
            <span>Packages & Pricing</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/admin/newsletter"))}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Send className="size-4" />
            <span>Newsletter & Issues</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/admin?tab=testimonials"))}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Quote className="size-4" />
            <span>Testimonials</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/admin?tab=showcase"))}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Video className="size-4" />
            <span>Showcase Videos</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Quick Actions">
          <CommandItem
            onSelect={() =>
              runCommand(async () => {
                const toastId = toast.loading("Seeding 4 demo projects…")
                try {
                  const res = await seedDemoProjects()
                  if (res.ok) {
                    toast.success(`Successfully seeded ${res.count} demo projects!`, { id: toastId })
                    router.push("/admin?tab=projects")
                    router.refresh()
                  } else {
                    toast.error(res.error, { id: toastId })
                  }
                } catch {
                  toast.error("Could not seed projects. Check database connection.", { id: toastId })
                }
              })
            }
            className="flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="size-4" />
            <span>Seed 4 Demo Projects</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/admin/projects/new"))}
            className="flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="size-4" />
            <span>Create New Project (Builder)</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/admin?tab=posts&new=1"))}
            className="flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="size-4" />
            <span>Write New Note</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/admin/invoices?action=new-quote"))}
            className="flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="size-4" />
            <span>Draft Quote / Invoice</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Public Links">
          <CommandItem
            onSelect={() => runCommand(() => window.open("/", "_blank"))}
            className="flex items-center gap-2 cursor-pointer"
          >
            <ExternalLink className="size-4" />
            <span>View Live Portfolio</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => window.open("/blog", "_blank"))}
            className="flex items-center gap-2 cursor-pointer"
          >
            <ExternalLink className="size-4" />
            <span>View Live Notes</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => window.open("/clients", "_blank"))}
            className="flex items-center gap-2 cursor-pointer"
          >
            <ExternalLink className="size-4" />
            <span>View Client Portal</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => window.open("/design-system", "_blank"))}
            className="flex items-center gap-2 cursor-pointer"
          >
            <ExternalLink className="size-4" />
            <span>View Design System</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Account">
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                void authClient.signOut().then(() => {
                  window.location.href = "/admin"
                })
              })
            }
            className="flex items-center gap-2 text-destructive cursor-pointer"
          >
            <LogOut className="size-4" />
            <span>Sign Out</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
