import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ticketAuthorInitials, ticketAuthorAvatarUrl } from "@/data/ticketingData"
import { cn } from "@/lib/utils"

export default function PicChipList({ pic = [], className }) {
  if (pic.length === 0) return null

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {pic.map((name) => (
        <div key={name} className="flex items-center gap-1 rounded-lg bg-neutral-100 p-1">
          <Avatar className="size-5">
            {ticketAuthorAvatarUrl(name) && <AvatarImage src={ticketAuthorAvatarUrl(name)} alt={name} />}
            <AvatarFallback className="text-[8px] font-semibold">{ticketAuthorInitials(name)}</AvatarFallback>
          </Avatar>
          <span className="text-xs whitespace-nowrap text-foreground">{name}</span>
        </div>
      ))}
    </div>
  )
}
