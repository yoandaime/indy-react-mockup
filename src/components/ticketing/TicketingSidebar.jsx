import { NavLink } from "react-router-dom"
import {
  Inbox,
  LayoutDashboard,
  ListChecks,
  Timer,
  Tag,
  ClipboardList,
  Users,
  ShieldAlert,
  FolderTree,
} from "lucide-react"
import CategoryNav from "@/components/ticketing/CategoryNav"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

const TASK_FILTER_NAV_ITEMS = [
  { value: "mine", label: "My Ticket", icon: Inbox },
  { value: "all", label: "All Ticket", icon: ListChecks },
]

const ADMIN_NAV_ITEMS = [
  { to: "/ticketing/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/ticketing/admin/sla", label: "SLA Management", icon: Timer },
  { to: "/ticketing/admin/pic-category", label: "PIC Category", icon: Tag },
  { to: "/ticketing/admin/audit-log", label: "Audit Log", icon: ClipboardList },
  { to: "/ticketing/admin/manage-users", label: "Manage Users", icon: Users },
  { to: "/ticketing/admin/content-moderation", label: "Content Moderation", icon: ShieldAlert },
  { to: "/ticketing/admin/manage-categories", label: "Manage Categories", icon: FolderTree },
]

function SectionLabel({ children }) {
  return <p className="px-2 text-xs font-semibold tracking-wide text-neutral-400 uppercase">{children}</p>
}

export default function TicketingSidebar({
  tree,
  selectedPath,
  onSelectPath,
  onRequestCategory,
  taskFilter,
  onTaskFilterChange,
}) {
  return (
    <aside className="flex h-full w-[240px] shrink-0 flex-col gap-4 overflow-y-auto border-r bg-[#FCFCFC] p-4 pt-6">
      <div className="flex flex-col gap-0.5">
        {TASK_FILTER_NAV_ITEMS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => onTaskFilterChange(value)}
            className={cn(
              "flex h-8 items-center gap-2 rounded-md px-2 text-sm text-neutral-700 hover:bg-muted",
              taskFilter === value && "bg-[#fdecee] text-primary hover:bg-[#fdecee]"
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span className="truncate">{label}</span>
          </button>
        ))}
      </div>

      <Separator />

      <div className="flex flex-col gap-2">
        <SectionLabel>NDQ Forum</SectionLabel>
        <CategoryNav
          tree={tree}
          selectedPath={selectedPath}
          onSelectPath={onSelectPath}
          onRequestCategory={onRequestCategory}
        />
      </div>

      <Separator />

      <div className="flex flex-col gap-2">
        <SectionLabel>Admin Control Center</SectionLabel>
        <div className="flex flex-col gap-0.5">
          {ADMIN_NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex h-8 items-center gap-2 rounded-md px-2 text-sm text-neutral-700 hover:bg-muted",
                  isActive && "bg-[#fdecee] text-primary hover:bg-[#fdecee]"
                )
              }
            >
              <Icon className="size-4 shrink-0" />
              <span className="truncate">{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </aside>
  )
}
