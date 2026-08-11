import { useMemo } from "react"
import { useOutletContext } from "react-router-dom"
import { CircleDot, CheckCircle2, Gauge, Timer } from "lucide-react"
import AdminStatCard from "@/components/ticketing/AdminStatCard"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { STATUS } from "@/data/ticketingData"
import { cn } from "@/lib/utils"

const DAILY_ACTIVITY = [
  { offset: 6, opened: 1, closed: 0 },
  { offset: 5, opened: 0, closed: 1 },
  { offset: 4, opened: 2, closed: 0 },
  { offset: 3, opened: 1, closed: 2 },
  { offset: 2, opened: 0, closed: 1 },
  { offset: 1, opened: 3, closed: 0 },
  { offset: 0, opened: 0, closed: 0 },
]

function formatDate(offsetDays) {
  const d = new Date()
  d.setDate(d.getDate() - offsetDays)
  return d.toISOString().slice(5, 10)
}

function TrendBar({ opened, closed }) {
  const max = 3
  const openedWidth = Math.min(100, (opened / max) * 100)
  const closedWidth = Math.min(100, (closed / max) * 100)
  if (opened === 0 && closed === 0) {
    return <div className="h-1.5 w-24 rounded-full bg-neutral-100" />
  }
  return (
    <div className="flex h-1.5 w-24 overflow-hidden rounded-full bg-neutral-100">
      <div className="h-full bg-sky-500" style={{ width: `${openedWidth}%` }} />
      <div className="h-full bg-purple-500" style={{ width: `${closedWidth}%` }} />
    </div>
  )
}

export default function ExecutiveSummarySection() {
  const { tickets } = useOutletContext()

  const stats = useMemo(() => {
    const total = tickets.length
    const open = tickets.filter((t) => t.status === STATUS.open).length
    const closed = tickets.filter((t) => t.status === STATUS.closed).length
    const breach = tickets.filter((t) => t.priority === "Critical").length
    const slaMeetRate = total > 0 ? Math.round(((total - breach) / total) * 100) : 0

    const openTickets = tickets.filter((t) => t.status === STATUS.open)
    const avgAgingHours =
      openTickets.length > 0
        ? openTickets.reduce((sum, t) => sum + (Date.now() - new Date(t.createdAt).getTime()) / 3_600_000, 0) /
          openTickets.length
        : null
    const avgAgingLabel =
      avgAgingHours == null
        ? "NaNh"
        : avgAgingHours >= 24
        ? `${Math.floor(avgAgingHours / 24)}d ${Math.round(avgAgingHours % 24)}h`
        : `${Math.round(avgAgingHours)}h`

    return { open, closed, slaMeetRate, avgAgingLabel }
  }, [tickets])

  const todayOpened = DAILY_ACTIVITY[DAILY_ACTIVITY.length - 1].opened
  const todayClosed = DAILY_ACTIVITY[DAILY_ACTIVITY.length - 1].closed

  return (
    <div className="w-full flex-1 space-y-4.5 bg-white p-8">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Executive Summary</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard icon={CircleDot} label="Open Tickets" value={stats.open} iconClassName="text-sky-700" />
        <AdminStatCard
          icon={CheckCircle2}
          label="Closed Tickets"
          value={stats.closed}
          iconClassName="text-purple-700"
        />
        <AdminStatCard
          icon={Gauge}
          label="SLA Meet Rate"
          value={`${stats.slaMeetRate}%`}
          iconClassName="text-emerald-700"
          valueClassName="text-emerald-700"
        />
        <AdminStatCard icon={Timer} label="Avg Aging (Open)" value={stats.avgAgingLabel} iconClassName="text-amber-700" />
      </div>

      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Daily Activity — Last 7 Days</h2>
          <div className="overflow-hidden rounded-lg border border-neutral-200">
            <Table>
              <TableHeader>
                <TableRow className="h-9 border-neutral-200 bg-neutral-100 hover:bg-neutral-100">
                  <TableHead className="text-sm font-medium text-neutral-600">Date</TableHead>
                  <TableHead className="text-sm font-medium text-neutral-600">Opened</TableHead>
                  <TableHead className="text-sm font-medium text-neutral-600">Closed</TableHead>
                  <TableHead className="text-sm font-medium text-neutral-600">Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {DAILY_ACTIVITY.map((row) => (
                  <TableRow key={row.offset} className="border-neutral-200">
                    <TableCell className="text-sm text-foreground">{formatDate(row.offset)}</TableCell>
                    <TableCell className="text-sm text-foreground">{row.opened}</TableCell>
                    <TableCell className="text-sm text-foreground">{row.closed}</TableCell>
                    <TableCell>
                      <TrendBar opened={row.opened} closed={row.closed} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className={cn("size-2 rounded-full bg-sky-500")} />
              Opened
            </span>
            <span className="flex items-center gap-1.5">
              <span className={cn("size-2 rounded-full bg-purple-500")} />
              Closed
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="text-sm font-semibold text-foreground">Today's Activity</h2>
          <p className="text-sm text-muted-foreground">
            {todayOpened} ticket(s) opened · {todayClosed} ticket(s) closed today
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
