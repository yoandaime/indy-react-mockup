import { useNavigate } from "react-router-dom"
import { Pin, PinOff, BadgeCheck, Circle, Trash2, ThumbsUp, MessageSquare, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import StatusBadge from "@/components/ticketing/StatusBadge"
import PriorityBadge from "@/components/ticketing/PriorityBadge"
import PicAvatarStack from "@/components/ticketing/PicAvatarStack"

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

function Dot() {
  return <span className="size-1 shrink-0 rounded-full bg-neutral-300" />
}

export default function ContentModerationTicketCard({ ticket, isPinned, isSolved, onTogglePin, onToggleSolved, onDelete }) {
  const navigate = useNavigate()

  const stop = (fn) => (e) => {
    e.stopPropagation()
    fn()
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/ticketing/admin/content-moderation/${ticket.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter") navigate(`/ticketing/admin/content-moderation/${ticket.id}`)
      }}
      className="relative flex cursor-pointer items-start gap-[54px] rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs transition-colors hover:border-ring/50"
    >
      {isPinned && (
        <span className="absolute -top-2.5 left-4 inline-flex items-center gap-1 rounded-lg border border-amber-700 bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 shadow-xs">
          <Pin className="size-3" />
          Pinned
        </span>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-3.5">
        <div className="flex flex-col gap-1">
          <p className="text-lg leading-[27px] font-medium text-foreground">{ticket.title}</p>
          <p className="text-base leading-6 text-foreground">{ticket.description}</p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={ticket.status} />
            <span className="rounded-lg bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700">
              SLA {ticket.sla}
            </span>
            <PriorityBadge priority={ticket.priority} />
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-sky-600">
            {ticket.tags.map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600">
          <span>
            {"Author: "}
            <span className="font-medium text-foreground">{ticket.author}</span>
          </span>
          <Dot />
          <span>{formatDate(ticket.createdAt)}</span>
          <Dot />
          <span className="flex items-center gap-1">
            <ThumbsUp className="size-4" />
            {ticket.upvotes}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="size-4" />
            {ticket.replies.length}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="size-4" />
            {ticket.views}
          </span>
          {ticket.pic.length > 0 && (
            <>
              <Dot />
              <PicAvatarStack pic={ticket.pic} />
            </>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <Button variant="secondary" size="sm" onClick={stop(onTogglePin)}>
          {isPinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
          {isPinned ? "Unpin" : "Pin"}
        </Button>
        <Button variant="outline" size="sm" onClick={stop(onToggleSolved)}>
          {isSolved ? <Circle className="size-4" /> : <BadgeCheck className="size-4" />}
          {isSolved ? "Unmark Solved" : "Mark Solved"}
        </Button>
        <Button variant="destructive" size="sm" onClick={stop(onDelete)}>
          <Trash2 className="size-4" />
          Delete
        </Button>
      </div>
    </div>
  )
}
