import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

const SEVERITY_STYLES = {
  CLEAN: "bg-emerald-100 text-emerald-700",
  WATCH: "bg-amber-100 text-amber-700",
  CRITICAL: "bg-red-100 text-red-700",
  ALWAYS_NULL: "bg-rose-200 text-rose-900",
}

function SeverityBadge({ severity }) {
  return (
    <Badge variant="outline" className={cn("border-transparent font-semibold", SEVERITY_STYLES[severity])}>
      {severity}
    </Badge>
  )
}

function GapBadge({ isGap }) {
  return isGap ? (
    <Badge variant="outline" className="border-transparent bg-red-100 font-semibold text-red-700">
      Gap
    </Badge>
  ) : (
    <Badge variant="outline" className="border-transparent bg-emerald-100 font-semibold text-emerald-700">
      OK
    </Badge>
  )
}

function StatTile({ label, value }) {
  return (
    <div className="flex-1 rounded-lg border border-neutral-200 bg-white p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  )
}

export default function ProfilingResults({ profile }) {
  if (!profile) {
    return (
      <div className="flex h-[450px] w-full items-center justify-center rounded-lg border border-dashed border-neutral-200 text-sm text-muted-foreground">
        Configure the profile on the left, then click Profile Table.
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Total Rows" value={profile.summary.total_rows} />
        <StatTile label="Days w/ Data" value={`${profile.summary.days_with_data} / ${profile.summary.days_total}`} />
        <StatTile label="Days w/ Gap" value={profile.summary.gap_days} />
        <StatTile label="Days w/ Null" value={profile.summary.null_days} />
      </div>

      <div className="flex w-full flex-col gap-2">
        <p className="text-sm font-medium text-foreground">Daily Table</p>
        <div className="overflow-x-auto rounded-lg border border-neutral-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>First Insert</TableHead>
                <TableHead>Last Insert</TableHead>
                <TableHead>Row Count</TableHead>
                <TableHead>Gap</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profile.daily.map((d) => (
                <TableRow key={d.date}>
                  <TableCell>{d.date}</TableCell>
                  <TableCell>{d.first_insert}</TableCell>
                  <TableCell>{d.last_insert}</TableCell>
                  <TableCell>{d.rows}</TableCell>
                  <TableCell>
                    <GapBadge isGap={d.is_gap} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {profile.keyCheckColumns.length > 0 && (
        <div className="flex w-full flex-col gap-2">
          <p className="text-sm font-medium text-foreground">Key Column Check</p>
          <div className="overflow-x-auto rounded-lg border border-neutral-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  {profile.keyCheckColumns.map((col) => (
                    <TableHead key={col}>{col}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {profile.keyUniqCompare.map((entry) => (
                  <TableRow key={entry.date}>
                    <TableCell>{entry.date}</TableCell>
                    {profile.keyCheckColumns.map((col) => (
                      <TableCell key={col}>
                        {entry[col] === null ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          <span className="flex items-center gap-2">
                            {entry[col].uniq}
                            <Badge
                              variant="outline"
                              className={cn(
                                "border-transparent font-semibold",
                                entry[col].isConsistent ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                              )}
                            >
                              {entry[col].isConsistent ? "consistent" : "changed"}
                            </Badge>
                          </span>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <div className="flex w-full flex-col gap-2">
        <p className="text-sm font-medium text-foreground">Column null/empty profile ({profile.consistentNull.length} columns)</p>
        <div className="overflow-x-auto rounded-lg border border-neutral-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Column</TableHead>
                <TableHead>Avg Null %</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Days Null</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profile.consistentNull.map((c) => (
                <TableRow key={c.column}>
                  <TableCell>{c.column}</TableCell>
                  <TableCell>{c.avg_null_pct}%</TableCell>
                  <TableCell>
                    <SeverityBadge severity={c.severity} />
                  </TableCell>
                  <TableCell>
                    {c.days_null} / {c.days_total}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  )
}
