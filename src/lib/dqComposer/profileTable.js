// Mock "Profile Table" engine — computes the same daily-health shape as the
// reference backend's core/profiling.py (profile_table), directly over the
// in-memory mock rows instead of a real DuckDB query. Deliberately skips the
// reference's `_fetch_pipeline_activity` (randomized insert/select query
// counters) — this is static, representative mock data, not a live pipeline.

const CRITICAL_NULL_PCT_THRESHOLD = 50

function round2(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return null
  return Math.round(value * 100) / 100
}

function dateKey(rawValue) {
  const date = new Date(rawValue)
  if (Number.isNaN(date.getTime())) return String(rawValue)
  const y = date.getFullYear()
  const mo = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${mo}-${d}`
}

function isBlank(value, columnType) {
  if (value === null || value === undefined) return true
  if (columnType && columnType.toLowerCase().includes("string")) return String(value) === ""
  return false
}

function groupByDay(rows, partitionColumn) {
  const groups = new Map()
  for (const row of rows) {
    const key = dateKey(row[partitionColumn])
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(row)
  }
  return groups
}

function filterByLookback(rows, partitionColumn, lookbackDays) {
  const times = rows.map((r) => new Date(r[partitionColumn]).getTime()).filter((t) => !Number.isNaN(t))
  if (!times.length) return rows
  const maxTime = Math.max(...times)
  const cutoff = maxTime - Number(lookbackDays) * 24 * 3600 * 1000
  return rows.filter((r) => {
    const t = new Date(r[partitionColumn]).getTime()
    return !Number.isNaN(t) && t >= cutoff
  })
}

// table: display name string. rows: mock row objects. columns: [{column, type, is_period}]
export function profileTable({
  table,
  rows,
  columns,
  partitionColumn,
  insertTimeColumn = "",
  uniqKeyColumns = [],
  lookbackDays,
}) {
  const filtered = filterByLookback(rows, partitionColumn, lookbackDays)
  const dayGroups = groupByDay(filtered, partitionColumn)
  const keyCheckColumns = uniqKeyColumns.filter((c) => c !== partitionColumn)

  const daily = [...dayGroups.entries()]
    .map(([date, groupRows]) => {
      const profile = {}
      for (const col of columns) {
        const nullCount = groupRows.filter((r) => isBlank(r[col.column], col.type)).length
        profile[col.column] = { n: nullCount, nn: groupRows.length - nullCount }
      }

      const keyProfile = {}
      for (const col of keyCheckColumns) {
        keyProfile[col] = new Set(groupRows.map((r) => r[col])).size
      }

      const insertTimes = insertTimeColumn
        ? groupRows.map((r) => new Date(r[insertTimeColumn]).getTime()).filter((t) => !Number.isNaN(t))
        : []

      return {
        date,
        first_insert: insertTimes.length ? new Date(Math.min(...insertTimes)).toISOString().replace("T", " ").slice(0, 19) : "N/A",
        last_insert: insertTimes.length ? new Date(Math.max(...insertTimes)).toISOString().replace("T", " ").slice(0, 19) : "N/A",
        rows: groupRows.length,
        profile,
        key_profile: keyProfile,
      }
    })
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))

  const dataDays = daily.filter((d) => d.rows > 0)
  const gapDays = daily.filter((d) => d.rows === 0).map((d) => d.date)

  const dailySummary = daily.map((d) => ({
    date: d.date,
    first_insert: d.rows === 0 ? "N/A" : d.first_insert,
    last_insert: d.rows === 0 ? "N/A" : d.last_insert,
    rows: d.rows,
    is_gap: d.rows === 0,
  }))

  let keyUniqCompare = []
  if (keyCheckColumns.length) {
    const chronological = [...daily].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
    const prevUniq = {}
    const entries = chronological.map((d) => {
      const entry = { date: d.date }
      for (const col of keyCheckColumns) {
        if (d.rows === 0) {
          entry[col] = null
          continue
        }
        const uniq = d.key_profile[col] ?? 0
        const compare = col in prevUniq ? uniq - prevUniq[col] : 0
        entry[col] = { uniq, isConsistent: compare === 0 }
        prevUniq[col] = uniq
      }
      return entry
    })
    keyUniqCompare = entries.reverse()
  }

  const allCols = dataDays.length ? Object.keys(dataDays[0].profile) : []
  const consistentNull = allCols.map((col) => {
    const dailyPct = []
    let daysNull = 0
    for (const d of dataDays) {
      const v = d.profile[col] || { n: 0, nn: 0 }
      const rowTotal = v.n + v.nn
      const pct = rowTotal ? (100 * v.n) / rowTotal : 0
      dailyPct.push(pct)
      if (v.n > 0) daysNull += 1
    }

    const avgNullPct = dailyPct.length ? round2(dailyPct.reduce((a, b) => a + b, 0) / dailyPct.length) : 0
    const isAlwaysNull = dailyPct.length > 0 && dailyPct.every((pct) => pct === 100)

    let severity
    if (avgNullPct <= 0) severity = "CLEAN"
    else if (isAlwaysNull) severity = "ALWAYS_NULL"
    else if (avgNullPct >= CRITICAL_NULL_PCT_THRESHOLD) severity = "CRITICAL"
    else severity = "WATCH"

    return { column: col, avg_null_pct: avgNullPct, severity, days_null: daysNull, days_total: daily.length }
  })

  const severityOrder = { ALWAYS_NULL: 0, CRITICAL: 1, WATCH: 2, CLEAN: 3 }
  consistentNull.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity] || b.avg_null_pct - a.avg_null_pct)

  const nullDays = daily.filter((d) => Object.values(d.profile).some((v) => v.n > 0)).length

  return {
    table,
    daily: dailySummary,
    keyUniqCompare,
    keyCheckColumns,
    consistentNull,
    summary: {
      total_rows: daily.reduce((sum, d) => sum + d.rows, 0),
      days_with_data: daily.length - gapDays.length,
      days_total: daily.length,
      gap_days: gapDays.length,
      null_days: nullDays,
    },
  }
}
