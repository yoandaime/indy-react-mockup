import { STATUS_META } from "@/data/ticketingData"
import { cn } from "@/lib/utils"

export default function StatusBadge({ status, variant = "outline", className }) {
  const meta = STATUS_META[status]
  const isOutline = variant === "outline"

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-0.5 text-xs",
        isOutline ? "border font-semibold" : "font-medium",
        isOutline ? meta.outlineClass : meta.badgeClass,
        className
      )}
    >
      <span className={cn("size-1.5 shrink-0 rounded-full", isOutline ? meta.outlineDotClass : meta.dotClass)} />
      {meta.label}
    </span>
  )
}
