import { useMemo } from "react"
import { useOutletContext } from "react-router-dom"
import { Ticket, Clock, Archive, AlertTriangle } from "lucide-react"
import AdminStatCard from "@/components/ticketing/AdminStatCard"
import { STATUS } from "@/data/ticketingData"

export default function DashboardSection() {
  const { tickets } = useOutletContext()

  const stats = useMemo(() => {
    const total = tickets.length
    const openInProgress = tickets.filter(
      (t) => t.status === STATUS.open || t.status === STATUS.inProgress
    ).length
    const closed = tickets.filter((t) => t.status === STATUS.closed).length
    const slaBreach = tickets.filter((t) => t.priority === "Critical").length
    return { total, openInProgress, closed, slaBreach }
  }, [tickets])

  const compliance = stats.total > 0 ? Math.round(((stats.total - stats.slaBreach) / stats.total) * 100) : 0

  return (
    <div className="w-full flex-1 space-y-4.5 bg-white p-8">
      <div>
        <h1 className="text-lg font-semibold text-foreground">System Overview</h1>
        <p className="text-sm text-muted-foreground">
          Data quality performance, KPI table completeness & SLA compliance monitoring.{" "}
          <span className="font-medium text-foreground">SLA Compliance: {compliance}%</span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard icon={Ticket} label="Total Tickets" value={stats.total} iconClassName="text-sky-700" />
        <AdminStatCard
          icon={Clock}
          label="Open & In Progress"
          value={stats.openInProgress}
          iconClassName="text-amber-700"
          valueClassName="text-amber-700"
        />
        <AdminStatCard
          icon={Archive}
          label="Closed (Archive)"
          value={stats.closed}
          iconClassName="text-purple-700"
          valueClassName="text-purple-700"
        />
        <AdminStatCard
          icon={AlertTriangle}
          label="SLA Breach"
          value={stats.slaBreach}
          iconClassName="text-red-700"
          valueClassName="text-red-700"
        />
      </div>
    </div>
  )
}
