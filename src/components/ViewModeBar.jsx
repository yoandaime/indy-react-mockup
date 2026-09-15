import { useViewMode } from "@/context/ViewModeContext"
import { Switch } from "@/components/ui/switch"

export default function ViewModeBar() {
  const { viewMode, setViewMode } = useViewMode()
  const isUserView = viewMode === "user"

  return (
    <div className="flex h-16 w-full shrink-0 items-center justify-between gap-4 border-t border-neutral-100 bg-neutral-50 px-6">
      <div className="flex items-center gap-3">
        <span
          className={`text-sm ${!isUserView ? "font-semibold text-foreground" : "text-muted-foreground"}`}
        >
          Admin View
        </span>
        <Switch
          checked={isUserView}
          onCheckedChange={(checked) => setViewMode(checked ? "user" : "admin")}
        />
        <span
          className={`text-sm ${isUserView ? "font-semibold text-foreground" : "text-muted-foreground"}`}
        >
          User View
        </span>
      </div>
      <span className="text-xs italic text-muted-foreground">*prototype necessary</span>
    </div>
  )
}
