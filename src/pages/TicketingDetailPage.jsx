import { useMemo, useRef, useState } from "react"
import { Link, useLocation, useOutletContext, useParams } from "react-router-dom"
import { notifySuccess } from "@/lib/toast"
import {
  ArrowLeft,
  Bookmark,
  Share2,
  Pencil,
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
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MultiSelect } from "@/components/ui/multi-select"
import StatusBadge from "@/components/ticketing/StatusBadge"
import CloseArchiveDialog from "@/components/ticketing/CloseArchiveDialog"
import PicChipList from "@/components/ticketing/PicChipList"
import PriorityBadge from "@/components/ticketing/PriorityBadge"
import {
  STATUS,
  PRIORITY_META,
  DOMAIN_OPTIONS,
  PIC_OPTIONS,
  ticketAuthorEmail,
  ticketAuthorInitials,
  ticketAuthorAvatarUrl,
} from "@/data/ticketingData"
import { cn } from "@/lib/utils"

const EDITABLE_STATUSES = [STATUS.pending, STATUS.open, STATUS.inProgress, STATUS.solved]
const PRIORITY_OPTIONS = Object.keys(PRIORITY_META)

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

function DetailRow({ label, children }) {
  return (
    <div className="flex w-full items-center gap-5">
      <span className="w-[90px] shrink-0 text-xs text-neutral-600">{label}</span>
      {children}
    </div>
  )
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
      {id}
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
          <span className="text-xs text-neutral-900">{item}</span>
        </span>
      ))}
    </div>
  )
}

export default function TicketingDetailPage() {
  const { id } = useParams()
  const { pathname } = useLocation()
  const { tickets, setTickets } = useOutletContext()
  const ticket = useMemo(() => tickets.find((t) => t.id === id), [tickets, id])
  const backTo = pathname.startsWith("/ticketing/admin/content-moderation")
    ? "/ticketing/admin/content-moderation"
    : "/ticketing"

  const [closeOpen, setCloseOpen] = useState(false)
  const [showAudit, setShowAudit] = useState(true)
  const [replyText, setReplyText] = useState("")
  const [replyImage, setReplyImage] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [draft, setDraft] = useState(null)
  const fileInputRef = useRef(null)

  if (!ticket) {
    return (
      <div className="min-w-0 flex-1 space-y-4 bg-neutral-100 p-6">
        <Button variant="ghost" size="sm" nativeButton={false} render={<Link to={backTo} />}>
          <ArrowLeft className="size-4" />
          Back
        </Button>
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          No ticket found for ID "{id}".
        </div>
      </div>
    )
  }

  const isOpen = ticket.status !== STATUS.closed

  const updateTicket = (updater) => {
    setTickets((prev) => prev.map((t) => (t.id === id ? updater(t) : t)))
  }

  const handleUpvote = () => {
    updateTicket((t) => ({ ...t, upvotes: t.upvotes + 1 }))
  }

  const startEdit = () => {
    setDraft({ status: ticket.status, domain: ticket.domain, priority: ticket.priority, pic: ticket.pic })
    setEditMode(true)
  }

  const cancelEdit = () => {
    setEditMode(false)
    setDraft(null)
  }

  const isDraftDirty =
    !!draft &&
    (draft.status !== ticket.status ||
      draft.domain !== ticket.domain ||
      draft.priority !== ticket.priority ||
      draft.pic.length !== ticket.pic.length ||
      draft.pic.some((name) => !ticket.pic.includes(name)))

  const saveEdit = () => {
    if (!draft || !isDraftDirty) return
    updateTicket((t) => ({ ...t, ...draft }))
    notifySuccess("Ticket updated", `Ticket ${ticket.id} information has been updated.`)
    setEditMode(false)
    setDraft(null)
  }

  const handleImagePick = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setReplyImage({ name: file.name, url: URL.createObjectURL(file) })
    e.target.value = ""
  }

  const handleReplyPaste = (e) => {
    const items = e.clipboardData?.items
    if (!items) return
    const imageItem = Array.from(items).find((item) => item.type.startsWith("image/"))
    if (!imageItem) return
    const file = imageItem.getAsFile()
    if (!file) return
    e.preventDefault()
    setReplyImage({ name: file.name || "pasted-image.png", url: URL.createObjectURL(file) })
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
    updateTicket((t) => ({ ...t, status: STATUS.closed, resolution }))
    notifySuccess("Ticket closed & archived", `Ticket ${ticket.id} has been closed and archived.`)
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-neutral-100">
      <div className="flex shrink-0 flex-col items-start gap-4 border-b border-neutral-200 bg-white px-36 py-6 shadow-xs">
        <div className="flex w-full items-start justify-between">
          <Button variant="ghost" size="sm" className="w-fit" nativeButton={false} render={<Link to={backTo} />}>
            <ArrowLeft className="size-4" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" aria-label="Bookmark">
              <Bookmark className="size-4" />
            </Button>
            <Button variant="outline" size="icon" aria-label="Share">
              <Share2 className="size-4" />
            </Button>
            {isOpen && (
              editMode ? (
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={cancelEdit}>
                    Cancel
                  </Button>
                  <Button onClick={saveEdit} disabled={!isDraftDirty}>
                    Save
                  </Button>
                </div>
              ) : (
                <Button variant="outline" onClick={startEdit}>
                  <Pencil className="size-4" />
                  Edit
                </Button>
              )
            )}
            {isOpen && (
              <Button onClick={() => setCloseOpen(true)}>Submit Close & Archive</Button>
            )}
          </div>
        </div>

        <div className="flex w-full flex-col gap-4.5">
          <div className="flex w-full flex-col rounded-tl-[14px] rounded-tr-[14px] rounded-bl-[22px] rounded-br-[22px] border border-neutral-200 bg-neutral-100 p-[5px]">
            <div className="flex w-full flex-col gap-4 overflow-hidden rounded-tl-[14px] rounded-tr-[14px] rounded-bl-[22px] rounded-br-[22px] border border-neutral-200 bg-white p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2.5">
                  <Avatar>
                    {ticketAuthorAvatarUrl(ticket.author) && (
                      <AvatarImage src={ticketAuthorAvatarUrl(ticket.author)} alt={ticket.author} />
                    )}
                    <AvatarFallback className="font-semibold">{ticketAuthorInitials(ticket.author)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{ticket.author}</p>
                    <p className="text-xs text-neutral-600">{ticketAuthorEmail(ticket.author)}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <h1 className="text-3xl leading-[30px] font-semibold tracking-[-1px] text-foreground">
                    {ticket.title}
                  </h1>
                  <p className="text-base leading-6 text-foreground">{ticket.description}</p>
                </div>

                <div className="flex flex-wrap gap-2 text-xs text-sky-600">
                  {ticket.tags.map((tag) => (
                    <span key={tag}>#{tag}</span>
                  ))}
                </div>
              </div>

              <div className="h-px w-full bg-neutral-200" />

              <div className="flex flex-col gap-2.5">
                <DetailRow label="Status">
                  {editMode ? (
                    <Select value={draft.status} onValueChange={(status) => setDraft((d) => ({ ...d, status }))}>
                      <SelectTrigger size="sm" className="h-7">
                        <SelectValue>{(status) => <StatusBadge status={status} />}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {EDITABLE_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            <StatusBadge status={status} />
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <StatusBadge status={ticket.status} />
                  )}
                </DetailRow>
                <DetailRow label="SLA">
                  <span className="rounded-lg bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700">
                    SLA {ticket.sla}
                  </span>
                </DetailRow>
                <DetailRow label="Ticket ID">
                  <CopyTicketIdBadge id={ticket.id} />
                </DetailRow>
                <DetailRow label="Issue Category">
                  <Breadcrumb
                    items={[
                      ticket.kind ?? "Kendala",
                      ticket.category.application,
                      ticket.category.scope,
                      ticket.category.concern,
                    ]}
                  />
                </DetailRow>
                <DetailRow label="Domain">
                  {editMode ? (
                    <Select value={draft.domain} onValueChange={(domain) => setDraft((d) => ({ ...d, domain }))}>
                      <SelectTrigger size="sm" className="h-7">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DOMAIN_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="text-xs text-neutral-900">{ticket.domain || "—"}</span>
                  )}
                </DetailRow>
                <DetailRow label="Table Name">
                  <span className="text-xs text-neutral-900">{ticket.tableName || "—"}</span>
                </DetailRow>
                <DetailRow label="IP Address">
                  <span className="text-xs text-neutral-900">{ticket.ipAddress || "—"}</span>
                </DetailRow>
                <DetailRow label="Priority">
                  {editMode ? (
                    <Select value={draft.priority} onValueChange={(priority) => setDraft((d) => ({ ...d, priority }))}>
                      <SelectTrigger size="sm" className="h-7">
                        <SelectValue>{(priority) => <PriorityBadge priority={priority} />}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITY_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            <PriorityBadge priority={option} />
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <PriorityBadge priority={ticket.priority} />
                  )}
                </DetailRow>
                <DetailRow label="PIC">
                  {editMode ? (
                    <MultiSelect
                      value={draft.pic}
                      onValueChange={(pic) => setDraft((d) => ({ ...d, pic }))}
                      options={PIC_OPTIONS}
                      placeholder="Select PIC(s)"
                      className="max-w-sm"
                    />
                  ) : (
                    <PicChipList pic={ticket.pic} />
                  )}
                </DetailRow>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5">
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
                      <button
                        type="button"
                        onClick={() => setPreviewImage({ url: reply.image, name: "Attachment" })}
                        className="mt-2 block shrink-0"
                        aria-label="Preview attached image"
                      >
                        <img
                          src={reply.image}
                          alt="attachment"
                          className="max-h-40 rounded-md border object-cover"
                        />
                      </button>
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
              <div className="flex min-h-[76px] w-full flex-col gap-4 rounded-lg border border-input bg-transparent px-2.5 py-2 shadow-xs focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
                {replyImage && (
                  <div className="flex w-fit items-center gap-2 rounded-lg border bg-neutral-50 py-1 pr-2 pl-1">
                    <button
                      type="button"
                      onClick={() => setPreviewImage({ url: replyImage.url, name: replyImage.name })}
                      className="shrink-0"
                      aria-label="Preview attached image"
                    >
                      <img src={replyImage.url} alt={replyImage.name} className="size-10 rounded object-cover" />
                    </button>
                    <span className="max-w-40 truncate text-xs text-neutral-600">{replyImage.name}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setReplyImage(null)
                      }}
                      aria-label="Remove attached image"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                )}
                <Textarea
                  placeholder="Type your message here."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onPaste={handleReplyPaste}
                  className="min-h-0 flex-1 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
                />
              </div>
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

      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogTitle>{previewImage?.name}</DialogTitle>
          {previewImage && (
            <img
              src={previewImage.url}
              alt={previewImage.name}
              className="max-h-[70vh] w-full rounded-lg object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
