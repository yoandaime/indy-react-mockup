import { useState } from "react"
import { NavLink, Outlet } from "react-router-dom"
import {
  LayoutDashboard,
  TrendingUp,
  ClipboardList,
  Users,
  ShieldAlert,
  FolderTree,
} from "lucide-react"
import { TICKETS } from "@/data/ticketingData"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { to: "/ticketing/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/ticketing/admin/executive-summary", label: "Executive Summary", icon: TrendingUp },
  { to: "/ticketing/admin/audit-log", label: "Audit Log", icon: ClipboardList },
  { to: "/ticketing/admin/manage-users", label: "Manage Users", icon: Users },
  { to: "/ticketing/admin/content-moderation", label: "Content Moderation", icon: ShieldAlert },
  { to: "/ticketing/admin/manage-categories", label: "Manage Categories", icon: FolderTree },
]

export default function AdminControlCenterLayout() {
  const [tickets, setTickets] = useState(TICKETS)
  const [pinnedIds, setPinnedIds] = useState([])

  return (
    <div className="flex h-[calc(100vh-56px)] bg-neutral-50">
      <aside className="flex h-full w-[240px] shrink-0 flex-col gap-1 overflow-y-auto border-r bg-neutral-50 p-4">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-foreground",
                isActive && "bg-[#fdecee] text-primary hover:bg-[#fdecee] hover:text-primary"
              )
            }
          >
            <Icon className="size-4" />
            {label}
          </NavLink>
        ))}
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
        <Outlet context={{ tickets, setTickets, pinnedIds, setPinnedIds }} />
      </div>
    </div>
  )
}
