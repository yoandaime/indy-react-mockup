import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

// AI summary alert used across Insiden Management (dashboard + ticket detail).
// Colors match Figma node 354:3756 exactly: bg violet-50 (#F5F3FF), border violet-300
// (#C4B5FD), title violet-800 (#5B21B6), description violet-950 (#2E1065).
export default function IndyAssistantAlert({ title = "INDY Assistant", children, className, align = "start" }) {
  return (
    <div
      className={cn(
        "flex max-h-[200px] w-full gap-4 overflow-y-auto rounded-lg border border-violet-300 bg-violet-50 px-4 py-3",
        align === "center" ? "items-center" : "items-start",
        className,
      )}
    >
      <Sparkles className="mt-0.5 size-4 shrink-0 text-violet-600" />
      <div className="min-w-0 flex-1 space-y-1.5 text-sm">
        <p className="font-medium text-violet-800">{title}</p>
        <div className="space-y-2 text-violet-950">{children}</div>
      </div>
    </div>
  )
}
