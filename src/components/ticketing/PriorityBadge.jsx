import SeverityIcon from "@/components/ticketing/SeverityIcon"
import { PRIORITY_META } from "@/data/ticketingData"
import { cn } from "@/lib/utils"

export default function PriorityBadge({ priority, className }) {
  const meta = PRIORITY_META[priority]
  if (!meta) return null

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <SeverityIcon priority={priority} className="size-3.5" />
      <span className={cn("text-xs font-medium whitespace-nowrap", meta.labelClass)}>{meta.label}</span>
    </span>
  )
}
