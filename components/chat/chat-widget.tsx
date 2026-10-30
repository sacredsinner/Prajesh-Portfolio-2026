"use client"

import { useState, useRef, useEffect, Fragment } from "react"
import { usePathname } from "next/navigation"
import { useChat } from "@ai-sdk/react"
import { AnimatePresence, motion } from "framer-motion"
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  Calendar,
  ArrowUpRight,
  AlertCircle,
} from "lucide-react"
import { BOOKING_URL } from "@/lib/site"
import { PrajAvatar } from "@/components/chat/praj-avatar"

const INITIAL_MESSAGES: Array<{
  id: string
  role: "user" | "assistant" | "system"
  content: string
  parts: Array<{ type: "text"; text: string }>
}> = [
  {
    id: "praj-welcome",
    role: "assistant",
    content: `Hi, I'm Praj — the AI Brand Strategist for Prajesh Shakya.

I can help you:

• Explore branding projects
• Find relevant portfolio work
• Recommend the right design services
• Review your brand or website
• Build a creative brief
• Answer branding and design questions

What are you building today?`,
    parts: [
      {
        type: "text",
        text: `Hi, I'm Praj — the AI Brand Strategist for Prajesh Shakya.

I can help you:

• Explore branding projects
• Find relevant portfolio work
• Recommend the right design services
• Review your brand or website
• Build a creative brief
• Answer branding and design questions

What are you building today?`,
      },
    ],
  },
]

const QUICK_PROMPTS = [
  "I need brand identity for my startup",
  "Tell me about the Aurora Wellness case study",
  "What design packages do you offer?",
  "How do I book a discovery call?",
]

function getMessageText(message: {
  content?: string
  parts?: Array<{ type?: string; text?: string }>
}): string {
  if (typeof message.content === "string" && message.content.length > 0) {
    return message.content
  }
  if (Array.isArray(message.parts)) {
    return message.parts
      .filter((p) => !p.type || p.type === "text")
      .map((p) => p.text || "")
      .join("")
  }
  return ""
}

function FormattedText({ text }: { text: string }) {
  const lines = text.split("\n")
  const hasBookingMention =
    text.includes("cal.com") ||
    text.toLowerCase().includes("discovery call") ||
    text.toLowerCase().includes("book a call")

  return (
    <div className="space-y-2 text-[13.5px] leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim()
        if (!trimmed) {
          return <div key={idx} className="h-1" />
        }

        const isBullet =
          trimmed.startsWith("•") ||
          trimmed.startsWith("- ") ||
          trimmed.startsWith("* ") ||
          trimmed.startsWith("✓ ") ||
          trimmed.startsWith("✗ ")

        const cleanLine = isBullet ? trimmed.replace(/^[•\-\*✓✗]\s*/, "") : trimmed
        const bulletSymbol = trimmed.startsWith("✓")
          ? "✓"
          : trimmed.startsWith("✗")
          ? "✗"
          : "•"

        return (
          <div key={idx} className={isBullet ? "flex items-start gap-2 pl-1" : ""}>
            {isBullet && (
              <span className="select-none text-muted-foreground font-mono text-xs mt-0.5">
                {bulletSymbol}
              </span>
            )}
            <div className="flex-1">
              <InlineContent content={cleanLine} />
            </div>
          </div>
        )
      })}

      {hasBookingMention && (
        <div className="pt-2">
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-foreground px-3.5 py-1.5 text-xs font-medium text-background transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Book 30-min Discovery Call</span>
            <ArrowUpRight className="h-3 w-3 opacity-70" />
          </a>
        </div>
      )}
    </div>
  )
}

function InlineContent({ content }: { content: string }) {
  const parts = content.split(/(\*\*[^*]+\*\*|https?:\/\/[^\s)]+)/g)

  return (
    <>
      {parts.map((part, index) => {
        if (!part) return null

        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={index} className="font-semibold text-foreground">
              {part.slice(2, -2)}
            </strong>
          )
        }

        if (part.startsWith("http://") || part.startsWith("https://")) {
          const isBooking = part.includes("cal.com")
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className={`underline underline-offset-2 ${
                isBooking ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isBooking ? "Book Discovery Call" : part}
            </a>
          )
        }

        return <Fragment key={index}>{part}</Fragment>
      })}
    </>
  )
}

export function ChatWidget() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    messages,
    sendMessage,
    status,
    stop,
    setMessages,
    error,
  } = useChat({
    messages: INITIAL_MESSAGES,
  })

  const isStreaming = status === "submitted" || status === "streaming"

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isOpen, isStreaming])

  // Hide the chat agent in admin CMS views, overview micro frontend, and studio tools
  if (
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/overview") ||
    pathname?.startsWith("/mobile") ||
    pathname?.startsWith("/moodboard-designer")
  ) {
    return null
  }

  const handleSend = async (textToSend?: string) => {
    const raw = textToSend ?? input
    const trimmed = raw.trim()
    if (!trimmed || isStreaming) return

    setInput("")
    try {
      await sendMessage({ text: trimmed })
    } catch (err) {
      console.error("[praj-chat] Failed to send message:", err)
    }
  }

  const handleReset = () => {
    stop()
    setMessages(INITIAL_MESSAGES)
    setInput("")
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Floating launcher trigger with Praj's animated avatar */}
      {!isOpen && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ duration: 0.2 }}
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-3 rounded-full border border-border/80 bg-foreground/95 backdrop-blur-md pl-1.5 pr-4 py-1.5 text-background shadow-xl transition-all hover:scale-[1.03] active:scale-[0.98]"
          aria-label="Open AI Brand Strategist chat"
        >
          <PrajAvatar size="sm" isSpeaking={false} showStatus={true} />
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1 text-xs font-medium tracking-wide">
              <span>Ask Praj</span>
              <Sparkles className="h-3 w-3 text-amber-300 transition-transform group-hover:rotate-12" />
            </div>
            <span className="text-[10px] uppercase opacity-75 font-mono tracking-wider">
              AI Brand Strategist
            </span>
          </div>
        </motion.button>
      )}

      {/* Chat window panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex h-[620px] max-h-[calc(100vh-5rem)] w-[calc(100vw-2.5rem)] sm:w-[420px] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/70 px-4 py-3 bg-muted/30">
              <div className="flex items-center gap-3">
                <PrajAvatar size="md" isSpeaking={isStreaming} showStatus={true} />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-serif text-sm font-semibold tracking-tight text-foreground">
                      Praj
                    </h3>
                    <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                      • Strategist
                    </span>
                  </div>

                  {isStreaming ? (
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                      <span className="flex items-end gap-0.5 h-3">
                        <motion.span
                          className="w-0.5 bg-emerald-500 rounded-full"
                          animate={{ height: ["3px", "11px", "3px"] }}
                          transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut" }}
                        />
                        <motion.span
                          className="w-0.5 bg-emerald-500 rounded-full"
                          animate={{ height: ["9px", "3px", "9px"] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: 0.2, ease: "easeInOut" }}
                        />
                        <motion.span
                          className="w-0.5 bg-emerald-500 rounded-full"
                          animate={{ height: ["5px", "13px", "5px"] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: 0.4, ease: "easeInOut" }}
                        />
                      </span>
                      <span>Praj is speaking...</span>
                    </div>
                  ) : (
                    <p className="text-[11px] text-muted-foreground font-sans tracking-wide">
                      AI Brand Strategist for Prajesh Shakya
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleReset}
                  title="Reset conversation"
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Close chat"
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Conversation Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.map((message) => {
                const isUser = message.role === "user"
                const content = getMessageText(message)

                if (!content && isStreaming && !isUser) {
                  return null
                }

                return (
                  <div
                    key={message.id}
                    className={`flex items-start gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    {!isUser && (
                      <PrajAvatar size="xs" isSpeaking={isStreaming} className="mt-1" />
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                        isUser
                          ? "bg-foreground text-background font-sans text-[13.5px]"
                          : "border border-border/70 bg-card/60 text-foreground"
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
                      ) : (
                        <FormattedText text={content} />
                      )}
                    </div>
                  </div>
                )
              })}

              {/* Streaming loading indicator */}
              {isStreaming && (
                <div className="flex items-start gap-2.5 justify-start">
                  <PrajAvatar size="xs" isSpeaking={true} className="mt-1" />
                  <div className="flex items-center gap-1.5 rounded-2xl border border-border/70 bg-card/60 px-3.5 py-2.5 text-xs text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-foreground/70 animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-foreground/70 animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-foreground/70 animate-bounce" />
                    <span className="ml-1 text-[11px] font-mono tracking-wider uppercase">
                      Praj is thinking
                    </span>
                  </div>
                </div>
              )}

              {/* Error banner */}
              {error && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-medium">Connection Notice</p>
                      <p className="text-[11px] opacity-90">
                        {error.message && error.message !== "An error occurred."
                          ? error.message
                          : "Connection interrupted. If you just added the API key, please restart your dev server (Ctrl+C then pnpm dev) and refresh."}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="shrink-0 rounded-md border border-destructive/40 px-2 py-1 text-[10px] font-medium hover:bg-destructive/20 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              )}

              {/* Starter Prompt Chips (only shown when conversation is at the start) */}
              {messages.length <= 1 && (
                <div className="pt-2">
                  <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
                    Suggested topics
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {QUICK_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => handleSend(prompt)}
                        className="rounded-xl border border-border/70 bg-card/40 px-3 py-2 text-left text-xs text-foreground transition-all hover:bg-muted/60 hover:border-border active:scale-[0.99]"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="border-t border-border/70 p-3 bg-muted/20">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend()
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about branding, projects, packages..."
                  disabled={isStreaming}
                  className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/40 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isStreaming}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-foreground text-background transition-opacity disabled:opacity-30 hover:opacity-90"
                  aria-label="Send message"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
              <p className="mt-2 text-center text-[10px] text-muted-foreground">
                Praj provides strategic guidance. For custom proposals, book an intro call.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
