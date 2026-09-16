import { PanelLeft } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ApplicationsSidebar({ apps, activeKey, onSelect, onCollapse }) {
  return (
    <aside className="flex h-full w-[240px] shrink-0 flex-col gap-4 border-r border-neutral-200 bg-white p-4">
      <div className="flex w-full items-center justify-between">
        <p className="px-1 text-sm font-semibold text-foreground">Applications</p>
        <button
          type="button"
          aria-label="Collapse sidebar"
          onClick={onCollapse}
          className="flex size-7 shrink-0 items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-100 hover:text-foreground"
        >
          <PanelLeft className="size-3.5" />
        </button>
      </div>

      <div className="flex w-full flex-col items-start gap-0.5">
        {apps.map((app) => {
          const isActive = app.key === activeKey
          return (
            <button
              key={app.key}
              type="button"
              onClick={() => onSelect(app.key)}
              className={cn(
                "flex h-9 w-full items-center gap-2.5 rounded-md px-3 py-1 text-left text-sm text-neutral-600 hover:bg-neutral-100",
                isActive && "bg-[#fdecee] font-medium text-primary hover:bg-[#fdecee]"
              )}
            >
              <span className="min-w-0 flex-1 truncate">{app.title}</span>
            </button>
          )
        })}
      </div>
    </aside>
  )
}
