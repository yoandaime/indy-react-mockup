import { useNavigate } from "react-router-dom"
import { ThumbsUp, MessageSquare, Eye } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import StatusBadge from "@/components/ticketing/StatusBadge"
import PicAvatarStack from "@/components/ticketing/PicAvatarStack"
import PriorityBadge from "@/components/ticketing/PriorityBadge"
import SlaBadge from "@/components/ticketing/SlaBadge"
import { ticketAuthorEmail, ticketAuthorInitials, ticketAuthorAvatarUrl } from "@/data/ticketingData"
import { cn } from "@/lib/utils"

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

export default function TicketCard({
  ticket,
  draggable,
  onDragStart,
  className,
  hideStatus,
  archive,
  onPicPopoverOpenChange,
}) {
  const navigate = useNavigate()

  return (
    <div
      role="button"
      tabIndex={0}
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={() => navigate(`/ticketing/${ticket.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter") navigate(`/ticketing/${ticket.id}`)
      }}
      className={cn(
        "flex h-full cursor-pointer flex-col gap-3.5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs transition-colors hover:border-ring/50",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <Avatar>
            {ticketAuthorAvatarUrl(ticket.author) && (
              <AvatarImage src={ticketAuthorAvatarUrl(ticket.author)} alt={ticket.author} />
            )}
            <AvatarFallback className="font-semibold">{ticketAuthorInitials(ticket.author)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{ticket.author}</p>
            <p className="truncate text-xs text-neutral-600">{ticketAuthorEmail(ticket.author)}</p>
          </div>
        </div>
        <span className="shrink-0 text-xs text-neutral-600">{formatDate(ticket.createdAt)}</span>
      </div>

      <p className="line-clamp-2 text-base leading-[24px] font-medium text-foreground">{ticket.title}</p>

      <div className="mt-auto flex w-full flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {!hideStatus && <StatusBadge status={ticket.status} archive={archive} />}
          <SlaBadge ticket={ticket} />
          <PriorityBadge priority={ticket.priority} />
        </div>

        <span className="text-xs font-normal text-neutral-600">{ticket.id}</span>

        <div className="flex flex-wrap gap-2 text-xs text-sky-600">
          {ticket.tags.map((tag) => (
            <span key={tag}>#{tag}</span>
          ))}
        </div>

        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-neutral-600">
            <span className="flex items-center gap-1">
              <ThumbsUp className="size-4" />
              {ticket.upvotes}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="size-4" />
              {ticket.replies.length} replies
            </span>
            <span className="flex items-center gap-1">
              <Eye className="size-4" />
              {ticket.views} {ticket.views === 1 ? "view" : "views"}
            </span>
          </div>
          <PicAvatarStack pic={ticket.pic} onPopoverOpenChange={onPicPopoverOpenChange} />
        </div>
      </div>
    </div>
  )
}
