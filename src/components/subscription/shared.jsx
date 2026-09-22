import { CirclePlus, CircleMinus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatRelativeTime } from "@/data/subscriptionAdminData"
import { cn } from "@/lib/utils"

export function TagRow({ app, category, schema, granularity }) {
  const parts = [
    app,
    category,
    schema && `Schema: ${schema}`,
    granularity && `Granularity: ${granularity}`,
  ].filter(Boolean)

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-[#525252]">
      {parts.map((part, index) => (
        <span key={part} className="flex items-center gap-2">
          {index > 0 && <span className="size-[5px] shrink-0 rounded-full bg-[#e5e5e5]" />}
          {part}
        </span>
      ))}
    </div>
  )
}

export function ActivityLogEntry({ entry }) {
  const isSubscribe = entry.type === "subscribed"
  const Icon = isSubscribe ? CirclePlus : CircleMinus

  return (
    <div className="border-b pb-2 last:border-b-0">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Icon className={cn("size-4 shrink-0", isSubscribe ? "text-emerald-600" : "text-red-600")} />
          <p className="text-sm leading-tight font-medium text-foreground">
            {isSubscribe ? "Subscribed" : "Unsubscribed"} {entry.tableNames.length} table
            {entry.tableNames.length === 1 ? "" : "s"}
          </p>
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">{formatRelativeTime(entry.minutesAgo)}</span>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-1 pl-[22px]">
        {entry.tableNames.map((name) => (
          <Badge key={name} variant="secondary" className="font-mono text-[11px] font-normal">
            {name}
          </Badge>
        ))}
      </div>
    </div>
  )
}
