import { useNavigate } from "react-router-dom"
import { Database, Eye, FilePlus2, Rss, Ticket } from "lucide-react"

const MENUS = [
  {
    title: "Enrich Data Admin",
    description: "Manage registered data source connections and their control tables.",
    icon: Database,
    path: "/enrich-data/admin",
  },
  {
    title: "Data Observability",
    description: "Try a data quality rule against a table without registering it.",
    icon: Eye,
    path: "/data-observability",
  },
  {
    title: "Enrich Data - Register New Data",
    description: "Register a new data source connection to the platform.",
    icon: FilePlus2,
    path: "/enrich-data/register",
  },
  {
    title: "Subscription",
    description: "Browse and manage your data source table subscriptions.",
    icon: Rss,
    path: "/subscription",
  },
  {
    title: "Insiden Management",
    description: "Track and manage support tickets and issue requests.",
    icon: Ticket,
    path: "/ticketing",
  },
]

export default function PortalPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-[calc(100vh-56px)] bg-neutral-50 pt-10 px-10 pb-10">
      <div className="mx-auto grid w-full max-w-[775px] grid-cols-1 gap-4 sm:grid-cols-2">
        {MENUS.map((menu) => (
          <button
            key={menu.path}
            type="button"
            onClick={() => navigate(menu.path)}
            className="group flex items-start gap-4 rounded-xl border bg-white p-5 text-left shadow-sm transition-all hover:border-neutral-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <menu.icon className="size-5" />
            </div>
            <div className="space-y-1">
              <p className="text-base leading-6 font-semibold text-foreground">
                {menu.title}
              </p>
              <p className="text-sm leading-5 text-muted-foreground">
                {menu.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
