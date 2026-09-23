import { useMemo, useState } from "react"
import { toast } from "sonner"
import { Plus, RefreshCw, Search, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { getStandardRules, getDimensionKeys } from "@/lib/dqComposer/ruleCatalog"
import { cn } from "@/lib/utils"
import SqlCodeBlock from "@/components/dataObservability/SqlCodeBlock"

function FieldStat({ label, value }) {
  return (
    <div className="min-w-0 px-3 py-2.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 truncate font-mono text-xs text-foreground">{value}</p>
    </div>
  )
}

export default function RulesManagementList({ customRules, onAddNew, onEdit }) {
  const dimensionKeys = getDimensionKeys()
  const allRules = useMemo(() => [...getStandardRules(), ...customRules], [customRules])

  const [activeDimension, setActiveDimension] = useState("all")
  const [search, setSearch] = useState("")

  const countsByDimension = useMemo(() => {
    const counts = {}
    for (const key of dimensionKeys) counts[key] = allRules.filter((r) => r.dimension === key).length
    return counts
  }, [allRules, dimensionKeys])

  const filteredRules = useMemo(() => {
    const q = search.trim().toLowerCase()
    return allRules.filter((r) => {
      const matchesDimension = activeDimension === "all" || r.dimension === activeDimension
      const matchesSearch = !q || r.title.toLowerCase().includes(q) || r.key.toLowerCase().includes(q)
      return matchesDimension && matchesSearch
    })
  }, [allRules, activeDimension, search])

  function handleRefresh() {
    setSearch("")
    setActiveDimension("all")
    toast.success("Rules refreshed")
  }

  function handleCopy(template) {
    navigator.clipboard?.writeText(template)
    toast.success("Query template copied")
  }

  return (
    <div className="flex h-full w-full flex-1 overflow-hidden">
      <aside className="flex h-full w-56 shrink-0 flex-col gap-1 overflow-y-auto border-r border-neutral-200 bg-white p-4">
        <button
          type="button"
          onClick={() => setActiveDimension("all")}
          className={cn(
            "flex h-8 items-center justify-between gap-2 rounded-md px-2 text-sm text-neutral-700 hover:bg-muted",
            activeDimension === "all" && "bg-[#fdecee] text-primary hover:bg-[#fdecee]"
          )}
        >
          <span className="truncate">All rules</span>
          <span className={cn("text-xs", activeDimension === "all" ? "text-primary" : "text-muted-foreground")}>
            {allRules.length}
          </span>
        </button>

        {dimensionKeys.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveDimension(key)}
            className={cn(
              "flex h-8 items-center justify-between gap-2 rounded-md px-2 text-sm text-neutral-700 hover:bg-muted",
              activeDimension === key && "bg-[#fdecee] text-primary hover:bg-[#fdecee]"
            )}
          >
            <span className="truncate">{key}</span>
            <span className={cn("text-xs", activeDimension === key ? "text-primary" : "text-muted-foreground")}>
              {countsByDimension[key] || 0}
            </span>
          </button>
        ))}
      </aside>

      <div className="flex h-full flex-1 flex-col gap-4 overflow-y-auto px-8 pt-[18px] pb-8">
        <div className="flex w-full items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Rule Types</h2>
            <p className="text-sm text-muted-foreground">
              Manage the data quality rule types available in Data Observability. Custom rules are marked with a badge.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button type="button" variant="outline" onClick={handleRefresh}>
              <RefreshCw className="size-4" />
              Refresh
            </Button>
            <Button type="button" onClick={onAddNew}>
              <Plus className="size-4" />
              Add New Rule
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rule name or code..."
            className="h-10 pl-9"
          />
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
          <Accordion className="px-4">
            {filteredRules.map((rule) => {
              const numerator = rule.numerator ?? rule.num
              const denominator = rule.denominator ?? rule.denom
              const createdBy = rule.createdBy ?? (rule.custom ? "You" : "Indy")

              return (
                <AccordionItem key={rule.key} value={rule.key} className="not-last:border-b border-neutral-200">
                  <AccordionTrigger className="rounded-lg px-2 py-4 hover:bg-muted/60 hover:no-underline">
                    <div className="flex w-full items-start justify-between gap-4 pr-2">
                      <div className="flex min-w-0 flex-1 items-start gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-medium text-foreground">{rule.title}</p>
                            <Badge variant="outline" className="border-transparent bg-muted font-medium text-muted-foreground">
                              {rule.dimension}
                            </Badge>
                            {rule.custom && (
                              <Badge variant="outline" className="border-transparent bg-[#fdecee] text-primary">
                                Custom
                              </Badge>
                            )}
                          </div>
                          <p className="mt-0.5 text-sm font-normal text-muted-foreground">{rule.description}</p>
                          {rule.custom && rule.updatedAt && (
                            <p className="mt-1 text-xs font-normal text-muted-foreground">Updated on {rule.updatedAt}</p>
                          )}
                        </div>
                      </div>
                      {rule.custom && (
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation()
                            onEdit(rule)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.stopPropagation()
                              onEdit(rule)
                            }
                          }}
                          className="shrink-0 text-sm font-medium text-primary hover:underline"
                        >
                          Edit
                        </span>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="mb-4 grid grid-cols-4 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm [&>*]:border-r [&>*]:border-neutral-200 [&>*:last-child]:border-r-0">
                      <FieldStat label="Numerator" value={numerator} />
                      <FieldStat label="Denominator" value={denominator} />
                      <FieldStat label="Rate" value={rule.rate} />
                      <FieldStat label="Created by" value={createdBy} />
                    </div>

                    <div className="flex items-center justify-end">
                      <Button type="button" variant="outline" size="sm" onClick={() => handleCopy(rule.template)}>
                        <Copy className="size-3.5" />
                        Copy
                      </Button>
                    </div>
                    <pre className="mt-2 max-h-64 overflow-auto rounded-lg border border-neutral-200 bg-neutral-50 p-3 font-mono text-xs whitespace-pre text-neutral-700">
                      <SqlCodeBlock code={rule.template} />
                    </pre>
                  </AccordionContent>
                </AccordionItem>
              )
            })}

            {filteredRules.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">No rules match your search.</p>
            )}
          </Accordion>
        </div>
      </div>
    </div>
  )
}
