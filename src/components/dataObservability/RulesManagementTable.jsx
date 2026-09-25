import { useMemo, useState } from "react"
import { toast } from "sonner"
import { Search, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { getStandardRules } from "@/lib/dqComposer/ruleCatalog"
import { fullRulesManagementTableName, countRulesForRow } from "@/data/rulesManagementData"
import { cn } from "@/lib/utils"

// Display order for dimension columns/accordion sections — cosmetic only,
// independent of the dimension -> rule-type grouping in constants.js.
const DIMENSION_ORDER = ["Completeness", "Timeliness", "Validity", "Accuracy", "Uniqueness", "Consistency"]

// All dimension chips share one green nuance — count is what differentiates
// rows, not chip color.
const DIMENSION_CHIP_CLASS = "bg-emerald-50 text-emerald-700"

const CONFIGURATION_VIEWS = [
  { value: "all", label: "All configurations" },
  { value: "configured", label: "Configured only" },
  { value: "unconfigured", label: "Unconfigured only" },
]

const PAGE_SIZE = 25

function rulesForDimension(dimension) {
  return getStandardRules().filter((r) => r.dimension === dimension)
}

function sameRules(a, b) {
  if (a.length !== b.length) return false
  const sa = [...a].sort()
  const sb = [...b].sort()
  return sa.every((v, i) => v === sb[i])
}

function sameRulesByDimension(a, b) {
  return DIMENSION_ORDER.every((dim) => sameRules(a[dim] || [], b[dim] || []))
}

function DimensionCell({ count }) {
  if (!count) return <span className="text-sm text-muted-foreground">—</span>
  return (
    <Badge variant="outline" className={cn("border-transparent font-medium", DIMENSION_CHIP_CLASS)}>
      {count} {count === 1 ? "rule" : "rules"}
    </Badge>
  )
}

function FilterSelect({ value, onValueChange, options, placeholder }) {
  const labelsByValue = Object.fromEntries(options.map((o) => [o.value, o.label]))
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="h-9 shadow-xs">
        <SelectValue placeholder={placeholder}>{(v) => labelsByValue[v] ?? placeholder}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function ManageRulesDrawer({ row, open, onOpenChange, onSave }) {
  const [draft, setDraft] = useState(() => row?.rulesByDimension || {})

  // Re-seed the draft whenever a different row is opened.
  const [openRowId, setOpenRowId] = useState(row?.id)
  if (row && row.id !== openRowId) {
    setOpenRowId(row.id)
    setDraft(row.rulesByDimension)
  }

  if (!row) return null

  const hasChanges = !sameRulesByDimension(draft, row.rulesByDimension)

  function toggleRule(dimension, ruleTitle, checked) {
    setDraft((prev) => {
      const current = prev[dimension] || []
      const next = checked ? [...current, ruleTitle] : current.filter((r) => r !== ruleTitle)
      return { ...prev, [dimension]: next }
    })
  }

  function handleSave() {
    onSave(row.id, draft)
    toast.success(`Rules updated for ${fullRulesManagementTableName(row)}`)
    onOpenChange(false)
  }

  const totalSelected = DIMENSION_ORDER.reduce((sum, dim) => sum + (draft[dim]?.length || 0), 0)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-[450px] data-[side=right]:sm:max-w-[450px]">
        <SheetHeader className="border-b border-neutral-200">
          <SheetTitle className="pr-8">{fullRulesManagementTableName(row)}</SheetTitle>
          <SheetDescription>
            {row.connection} · {row.category} · {row.granularity} · {totalSelected} rules applied
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <Accordion multiple className="flex flex-col gap-3">
            {DIMENSION_ORDER.map((dimension) => {
              const options = rulesForDimension(dimension)
              const selected = draft[dimension] || []

              return (
                <AccordionItem
                  key={dimension}
                  value={dimension}
                  className="rounded-lg border border-neutral-200 bg-white"
                >
                  <AccordionTrigger className="rounded-lg px-3 hover:bg-muted/60 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{dimension}</span>
                      <Badge variant="outline" className={cn("border-transparent font-medium", DIMENSION_CHIP_CLASS)}>
                        {selected.length}/{options.length}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3">
                    {options.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No rules available for this dimension yet.</p>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {options.map((rule) => (
                          <label key={rule.key} className="group flex items-start gap-2.5">
                            <Checkbox
                              className="mt-0.5"
                              checked={selected.includes(rule.title)}
                              onCheckedChange={(checked) => toggleRule(dimension, rule.title, Boolean(checked))}
                            />
                            <span className="min-w-0">
                              <span className="block text-sm font-medium text-foreground">{rule.title}</span>
                              <span className="block text-sm text-muted-foreground">{rule.description}</span>
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </div>

        <SheetFooter className="flex-row justify-end border-t border-neutral-200">
          <SheetClose render={<Button type="button" variant="outline" />}>Cancel</SheetClose>
          <Button type="button" disabled={!hasChanges} onClick={handleSave}>
            Save Changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default function RulesManagementTable({ rows, onUpdateRow }) {
  const [search, setSearch] = useState("")
  const [connectionFilter, setConnectionFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [configFilter, setConfigFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [manageRowId, setManageRowId] = useState(null)

  const connectionOptions = useMemo(
    () => [
      { value: "all", label: "All connections" },
      ...[...new Set(rows.map((r) => r.connection))].map((c) => ({ value: c, label: c })),
    ],
    [rows]
  )

  const categoryOptions = useMemo(
    () => [
      { value: "all", label: "All categories" },
      ...[...new Set(rows.map((r) => r.category))].map((c) => ({ value: c, label: c })),
    ],
    [rows]
  )

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((row) => {
      if (connectionFilter !== "all" && row.connection !== connectionFilter) return false
      if (categoryFilter !== "all" && row.category !== categoryFilter) return false

      const total = countRulesForRow(row)
      if (configFilter === "configured" && total === 0) return false
      if (configFilter === "unconfigured" && total > 0) return false

      if (!q) return true
      const fullName = fullRulesManagementTableName(row).toLowerCase()
      const ruleMatch = DIMENSION_ORDER.some((dim) =>
        (row.rulesByDimension[dim] || []).some((rule) => rule.toLowerCase().includes(q))
      )
      return (
        fullName.includes(q) ||
        row.category.toLowerCase().includes(q) ||
        row.connection.toLowerCase().includes(q) ||
        ruleMatch
      )
    })
  }, [rows, search, connectionFilter, categoryFilter, configFilter])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageRows = filteredRows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function updateFilter(setter) {
    return (value) => {
      setter(value)
      setPage(1)
    }
  }

  const manageRow = rows.find((r) => r.id === manageRowId) || null

  return (
    <div className="flex w-full flex-1 flex-col gap-6 overflow-y-auto px-8 pt-[18px] pb-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Rules Management</h2>
          <p className="text-sm text-muted-foreground">
            One row per registered table. Select a dimension count or Manage to edit its assigned rules.
          </p>
        </div>
        <Badge variant="outline" className="shrink-0 border-transparent bg-muted font-medium text-muted-foreground">
          {rows.length} registered tables
        </Badge>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-64 shrink-0">
          <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search schema or table..."
            className="h-9 pl-8 text-sm"
          />
        </div>
        <FilterSelect
          value={connectionFilter}
          onValueChange={updateFilter(setConnectionFilter)}
          options={connectionOptions}
          placeholder="All connections"
        />
        <FilterSelect
          value={categoryFilter}
          onValueChange={updateFilter(setCategoryFilter)}
          options={categoryOptions}
          placeholder="All categories"
        />
        <FilterSelect
          value={configFilter}
          onValueChange={updateFilter(setConfigFilter)}
          options={CONFIGURATION_VIEWS}
          placeholder="All configurations"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Registered Table</TableHead>
              {DIMENSION_ORDER.map((dimension) => (
                <TableHead key={dimension}>{dimension}</TableHead>
              ))}
              <TableHead>Total</TableHead>
              <TableHead className="w-28">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.map((row) => {
              const total = countRulesForRow(row)
              return (
                <TableRow key={row.id}>
                  <TableCell>
                    <p className="font-medium text-foreground">{fullRulesManagementTableName(row)}</p>
                    <p className="text-sm text-muted-foreground">
                      {row.connection} · {row.category} · {row.granularity}
                    </p>
                  </TableCell>
                  {DIMENSION_ORDER.map((dimension) => (
                    <TableCell key={dimension}>
                      <DimensionCell count={row.rulesByDimension[dimension]?.length || 0} />
                    </TableCell>
                  ))}
                  <TableCell className="font-medium text-foreground">{total}</TableCell>
                  <TableCell>
                    <Button type="button" size="sm" variant="outline" onClick={() => setManageRowId(row.id)}>
                      <SlidersHorizontal className="size-3.5" />
                      Manage
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}

            {pageRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={DIMENSION_ORDER.length + 3} className="text-center text-sm text-muted-foreground">
                  No tables match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {filteredRows.length > 0 && (
        <Pagination className="justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredRows.length)} of{" "}
            {filteredRows.length} tables
          </p>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                aria-disabled={currentPage === 1}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined}
                onClick={(e) => {
                  e.preventDefault()
                  setPage((p) => Math.max(1, p - 1))
                }}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <PaginationItem key={p}>
                <PaginationLink
                  href="#"
                  isActive={p === currentPage}
                  onClick={(e) => {
                    e.preventDefault()
                    setPage(p)
                  }}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                aria-disabled={currentPage === totalPages}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : undefined}
                onClick={(e) => {
                  e.preventDefault()
                  setPage((p) => Math.min(totalPages, p + 1))
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <ManageRulesDrawer
        row={manageRow}
        open={Boolean(manageRow)}
        onOpenChange={(open) => !open && setManageRowId(null)}
        onSave={(id, rulesByDimension) => onUpdateRow(id, { rulesByDimension })}
      />
    </div>
  )
}
