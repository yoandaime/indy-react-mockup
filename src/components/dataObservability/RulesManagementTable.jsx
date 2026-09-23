import { useMemo, useState } from "react"
import { toast } from "sonner"
import { Pencil, Check, X, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MultiSelect } from "@/components/ui/multi-select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getStandardRules } from "@/lib/dqComposer/ruleCatalog"

function ruleTitlesForDimension(dimension) {
  return getStandardRules()
    .filter((r) => r.dimension === dimension)
    .map((r) => r.title)
}

function sameRules(a, b) {
  if (a.length !== b.length) return false
  const sa = [...a].sort()
  const sb = [...b].sort()
  return sa.every((v, i) => v === sb[i])
}

// Soft, varied Tailwind palette for rule chips — stable per rule name so the
// same rule always renders the same color across rows.
const RULE_BADGE_COLORS = [
  "bg-blue-50 text-blue-700",
  "bg-emerald-50 text-emerald-700",
  "bg-amber-50 text-amber-700",
  "bg-violet-50 text-violet-700",
  "bg-pink-50 text-pink-700",
  "bg-cyan-50 text-cyan-700",
  "bg-orange-50 text-orange-700",
  "bg-indigo-50 text-indigo-700",
  "bg-teal-50 text-teal-700",
  "bg-fuchsia-50 text-fuchsia-700",
]

function ruleBadgeColor(rule) {
  let hash = 0
  for (let i = 0; i < rule.length; i += 1) hash = (hash * 31 + rule.charCodeAt(i)) | 0
  return RULE_BADGE_COLORS[Math.abs(hash) % RULE_BADGE_COLORS.length]
}

export default function RulesManagementTable({ rows, onUpdateRow }) {
  const [search, setSearch] = useState("")
  const [editingId, setEditingId] = useState(null)
  const [draftRules, setDraftRules] = useState([])

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(
      (r) =>
        r.table.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.dimension.toLowerCase().includes(q) ||
        r.rules.some((rule) => rule.toLowerCase().includes(q))
    )
  }, [rows, search])

  function startEdit(row) {
    setEditingId(row.id)
    setDraftRules(row.rules)
  }

  function cancelEdit() {
    setEditingId(null)
    setDraftRules([])
  }

  function saveEdit(row) {
    onUpdateRow(row.id, { rules: draftRules })
    setEditingId(null)
    setDraftRules([])
    toast.success(`Rules updated for ${row.table}`)
  }

  return (
    <div className="flex w-full flex-1 flex-col gap-6 overflow-y-auto px-8 pt-[18px] pb-8">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Rules Management</h2>
        <p className="text-sm text-muted-foreground">Assign rules from the Rules Catalog to each registered table.</p>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search table, category, dimension, or rule..."
          className="h-8 pl-8 text-sm"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Conn ID</TableHead>
              <TableHead>Nama Table</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Dimension</TableHead>
              <TableHead className="min-w-[320px]">Rules</TableHead>
              <TableHead className="w-44">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.map((row, i) => {
              const isEditing = editingId === row.id
              const ruleOptions = ruleTitlesForDimension(row.dimension)
              const hasChanges = isEditing && !sameRules(draftRules, row.rules)

              return (
                <TableRow key={row.id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell className="font-medium">{row.table}</TableCell>
                  <TableCell>{row.category}</TableCell>
                  <TableCell>{row.dimension}</TableCell>
                  <TableCell>
                    {isEditing ? (
                      <MultiSelect
                        value={draftRules}
                        onValueChange={setDraftRules}
                        options={ruleOptions}
                        placeholder="Add rules..."
                        chipClassName={ruleBadgeColor}
                      />
                    ) : row.rules.length ? (
                      <div className="flex flex-wrap gap-1.5">
                        {row.rules.map((rule) => (
                          <Badge key={rule} variant="outline" className={`border-transparent font-medium ${ruleBadgeColor(rule)}`}>
                            {rule}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">No rules assigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Button type="button" size="sm" disabled={!hasChanges} onClick={() => saveEdit(row)}>
                          <Check className="size-3.5" />
                          Save
                        </Button>
                        <Button type="button" size="sm" variant="outline" onClick={cancelEdit}>
                          <X className="size-3.5" />
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button type="button" size="sm" variant="outline" onClick={() => startEdit(row)}>
                        <Pencil className="size-3.5" />
                        Edit
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}

            {filteredRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                  No tables match your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
