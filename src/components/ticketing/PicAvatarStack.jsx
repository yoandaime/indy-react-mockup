import { Avatar, AvatarImage, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { ticketAuthorInitials, ticketAuthorAvatarUrl } from "@/data/ticketingData"
import { cn } from "@/lib/utils"

const MAX_VISIBLE = 2

export default function PicAvatarStack({ pic = [], size = "sm", className }) {
  if (pic.length === 0) return null

  const visible = pic.slice(0, MAX_VISIBLE)
  const overflowCount = pic.length - visible.length

  return (
    <Tooltip>
      <TooltipTrigger
        render={<div className={cn("cursor-default", className)} />}
      >
        <AvatarGroup>
          {visible.map((name) => (
            <Avatar key={name} size={size}>
              {ticketAuthorAvatarUrl(name) && <AvatarImage src={ticketAuthorAvatarUrl(name)} alt={name} />}
              <AvatarFallback className="font-semibold">{ticketAuthorInitials(name)}</AvatarFallback>
            </Avatar>
          ))}
          {overflowCount > 0 && <AvatarGroupCount>+{overflowCount}</AvatarGroupCount>}
        </AvatarGroup>
      </TooltipTrigger>
      <TooltipContent>{pic.join(", ")}</TooltipContent>
    </Tooltip>
  )
}
