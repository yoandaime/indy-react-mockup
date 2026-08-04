import { useMemo, useRef, useState } from "react"
import { Link, useOutletContext, useParams } from "react-router-dom"
import { notifySuccess } from "@/lib/toast"
import {
  ArrowLeft,
  CircleAlert,
  ThumbsUp,
  Eye,
  MessageSquare,
  MessageSquareX,
  ImageUp,
  X,
  ChevronRight,
  Copy,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import StatusBadge from "@/components/ticketing/StatusBadge"
import CloseArchiveDialog from "@/components/ticketing/CloseArchiveDialog"
import { STATUS, ticketAuthorEmail, ticketAuthorInitials } from "@/data/ticketingData"
import { cn } from "@/lib/utils"

function formatDateTime(iso) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function Dot({ className }) {
  return <span className={cn("size-1.5 shrink-0 rounded-full bg-neutral-300", className)} />
}

function CopyTicketIdBadge({ id }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(id)
    } catch {
      // ignore clipboard errors
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <span className="flex items-center gap-1 rounded-lg bg-neutral-100 px-2 py-0.5 text-xs text-neutral-900">
      Ticket ID: {id}
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              onClick={handleCopy}
              className="flex shrink-0 items-center text-neutral-500 hover:text-neutral-700"
              aria-label="Copy ticket ID"
            />
          }
        >
          {copied ? (
            <Check className="size-3 text-emerald-600" />
          ) : (
            <Copy className="size-3" />
          )}
        </TooltipTrigger>
        <TooltipContent>Copy ticket ID</TooltipContent>
      </Tooltip>
      {copied && <span className="text-emerald-600">Copied</span>}
    </span>
  )
}

function Breadcrumb({ items }) {
  return (
    <div className="flex items-center gap-1">
      {items.map((item, i) => (
        <span key={item} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="size-3.5 shrink-0 text-neutral-400" />}
          <span className="text-sm text-neutral-900">{item}</span>
        </span>
      ))}
    </div>
  )
}

export default function TicketingDetailPage() {
  const { id } = useParams()
  const { tickets, setTickets } = useOutletContext()
  const ticket = useMemo(() => tickets.find((t) => t.id === id), [tickets, id])

  const [closeOpen, setCloseOpen] = useState(false)
  const [showAudit, setShowAudit] = useState(true)
  const [replyText, setReplyText] = useState("")
  const [replyImage, setReplyImage] = useState(null)
  const fileInputRef = useRef(null)

  if (!ticket) {
    return (
      <div className="min-w-0 flex-1 space-y-4 bg-neutral-100 p-6">
        <Button variant="ghost" size="sm" nativeButton={false} render={<Link to="/ticketing" />}>
          <ArrowLeft className="size-4" />
          Back
        </Button>
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          No ticket found for ID "{id}".
        </div>
      </div>
    )
  }

  const isOpen = ticket.status !== STATUS.done

  const updateTicket = (updater) => {
    setTickets((prev) => prev.map((t) => (t.id === id ? updater(t) : t)))
  }

  const handleUpvote = () => {
    updateTicket((t) => ({ ...t, upvotes: t.upvotes + 1 }))
  }

  const handleImagePick = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setReplyImage({ name: file.name, url: URL.createObjectURL(file) })
    e.target.value = ""
  }

  const handleReplySubmit = () => {
    if (!replyText.trim() && !replyImage) return
    const reply = {
      id: `r${ticket.replies.length + 1}-${Date.now()}`,
      author: "Antonio Nusa",
      createdAt: new Date().toISOString(),
      text: replyText.trim(),
      image: replyImage?.url ?? null,
    }
    updateTicket((t) => ({ ...t, replies: [...t.replies, reply] }))
    setReplyText("")
    setReplyImage(null)
  }

  const handleCloseArchive = (resolution) => {
    updateTicket((t) => ({ ...t, status: STATUS.done, resolution }))
    notifySuccess("Ticket closed & archived", `Ticket ${ticket.id} has been closed and archived.`)
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-neutral-100">
      <div className="flex shrink-0 flex-col items-start gap-4 border-b border-neutral-200 bg-white px-36 py-6 shadow-xs">
        <div className="flex w-full items-start justify-between">
          <Button variant="ghost" size="sm" className="w-fit" nativeButton={false} render={<Link to="/ticketing" />}>
            <ArrowLeft className="size-4" />
            Back
          </Button>
          {isOpen && (
            <Button onClick={() => setCloseOpen(true)}>Submit Close & Archive</Button>
          )}
        </div>

        <div className="flex w-full flex-col gap-4.5">
          <div className="flex w-full flex-col gap-4 rounded-xl border border-neutral-200 p-6 shadow-xs">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <StatusBadge status={ticket.status} />
                <span className="rounded-lg bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700">
                  SLA {ticket.sla}
                </span>
                <CopyTicketIdBadge id={ticket.id} />
                <Dot />
                <span className="text-sm text-neutral-900">IP Address: {ticket.ipAddress || "—"}</span>
                <Dot />
                <Breadcrumb
                  items={[
                    ticket.kind ?? "Kendala",
                    ticket.category.application,
                    ticket.category.type,
                    ticket.category.dimension,
                  ]}
                />
              </div>
              <div className="h-px w-full bg-neutral-200" />
            </div>

            <div className="flex items-center gap-2.5">
              <Avatar>
                <AvatarFallback className="font-semibold">{ticketAuthorInitials(ticket.author)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{ticket.author}</p>
                <p className="text-xs text-neutral-600">{ticketAuthorEmail(ticket.author)}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h1 className="text-3xl leading-[30px] font-semibold tracking-[-1px] text-foreground">
                {ticket.title}
              </h1>
              <p className="text-base leading-6 text-foreground">{ticket.description}</p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2 text-xs text-sky-600">
                {ticket.tags.map((tag) => (
                  <span key={tag}>#{tag}</span>
                ))}
              </div>
              <div className="h-px w-full bg-neutral-200" />
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={handleUpvote}>
                  <ThumbsUp className="size-4" />
                  {ticket.upvotes} {ticket.upvotes === 1 ? "Upvote" : "Upvotes"}
                </Button>
                <span className="flex items-center gap-1 text-sm text-neutral-600">
                  <MessageSquare className="size-4.5" />
                  {ticket.replies.length} replies
                </span>
                <span className="flex items-center gap-1 text-sm text-neutral-600">
                  <Eye className="size-4.5" />
                  {ticket.views} {ticket.views === 1 ? "view" : "views"}
                </span>
              </div>
            </div>
          </div>

          {ticket.resolution && (
            <div className="w-full space-y-2 rounded-xl border border-neutral-200 p-4">
              <h2 className="text-base font-semibold text-foreground">Resolution</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-neutral-500">Root Cause Analysis</p>
                  <p className="text-sm text-foreground">{ticket.resolution.rootCause}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Suspect System / Pipeline</p>
                  <p className="text-sm text-foreground">{ticket.resolution.suspectSystem}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Resolution Notes</p>
                  <p className="text-sm text-foreground">{ticket.resolution.resolutionNotes}</p>
                </div>
              </div>
            </div>
          )}

          {showAudit && (
            <div className="flex w-full items-start gap-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
              <div className="flex flex-1 items-start gap-3 text-sm text-amber-700">
                <CircleAlert className="mt-0.5 size-4 shrink-0" />
                <div className="flex-1 space-y-0.5">
                  <p className="font-semibold">Audit Trail Policy</p>
                  <p>
                    Tickets cannot be arbitrarily deleted to maintain SLA compliance. If the issue has been
                    resolved, click Submit Close &amp; Archive to ensure proper resolution reason.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAudit(false)}
                className="text-amber-700 hover:text-amber-900"
                aria-label="Dismiss audit trail policy notice"
              >
                <X className="size-4" />
              </button>
            </div>
          )}

          <div className="flex w-full flex-col gap-4.5 bg-white">
            <p className="text-base leading-6 font-medium text-foreground">
              Discussion & Replies ({ticket.replies.length})
            </p>

            <div className="flex h-[312px] w-full flex-col items-start gap-4 overflow-y-auto rounded-xl border border-neutral-200 bg-neutral-50 p-3">
              {ticket.replies.map((reply) => (
                <div
                  key={reply.id}
                  className="flex w-fit max-w-full shrink-0 items-start gap-3.5 rounded-[10px] border border-neutral-200 bg-white p-3"
                >
                  <Avatar size="sm" className="shrink-0">
                    <AvatarFallback>{ticketAuthorInitials(reply.author)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2 text-neutral-600">
                      <span className="text-sm font-semibold text-foreground">{reply.author}</span>
                      <span className="text-xs">{formatDateTime(reply.createdAt)}</span>
                    </div>
                    {reply.text && <p className="text-base leading-6 text-foreground">{reply.text}</p>}
                    {reply.image && (
                      <img
                        src={reply.image}
                        alt="attachment"
                        className="mt-2 max-h-40 rounded-md border object-cover"
                      />
                    )}
                  </div>
                </div>
              ))}
              {ticket.replies.length === 0 && (
                <div className="flex shrink-0 items-center gap-2 p-5">
                  <MessageSquareX className="size-5 shrink-0 text-neutral-500" />
                  <p className="text-sm text-neutral-500">No replies yet. Be the first to respond.</p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <Textarea
                placeholder="Type your message here."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="min-h-[76px] shadow-xs"
              />
              {replyImage && (
                <div className="flex w-fit items-center gap-2 rounded-lg border bg-neutral-50 py-1 pr-2 pl-1">
                  <img src={replyImage.url} alt={replyImage.name} className="size-10 rounded object-cover" />
                  <span className="max-w-40 truncate text-xs text-neutral-600">{replyImage.name}</span>
                  <button
                    type="button"
                    onClick={() => setReplyImage(null)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              )}
              <div className="flex items-center justify-between">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImagePick}
                />
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <ImageUp className="size-4" />
                  Attach image
                </Button>
                <Button size="sm" onClick={handleReplySubmit} disabled={!replyText.trim() && !replyImage}>
                  Post Reply
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CloseArchiveDialog open={closeOpen} onOpenChange={setCloseOpen} onSubmit={handleCloseArchive} />
    </div>
  )
}
