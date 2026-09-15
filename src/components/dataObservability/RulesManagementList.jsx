import { CheckCircle2, Clock, ShieldCheck, GitCompare, Fingerprint, Target, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { getStandardRules, getDimensionKeys } from "@/lib/dqComposer/ruleCatalog"

const DIMENSION_ICONS = {
  Completeness: CheckCircle2,
  Timeliness: Clock,
  Validity: ShieldCheck,
  Consistency: GitCompare,
  Uniqueness: Fingerprint,
  Accuracy: Target,
}

export default function RulesManagementList({ customRules, onAddNew, onEdit }) {
  const dimensionKeys = getDimensionKeys()
  const allRules = [...getStandardRules(), ...customRules]

  return (
    <div className="flex w-full flex-1 flex-col gap-6 overflow-y-auto p-8">
      <div className="flex w-full items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Rule Types</h2>
          <p className="text-sm text-muted-foreground">
            Manage the data quality rule types available in Data Observability. Custom rules are marked with a badge.
          </p>
        </div>
        <Button type="button" onClick={onAddNew}>
          <Plus className="size-4" />
          Add New Rule
        </Button>
      </div>

      {dimensionKeys.map((dimensionKey) => {
        const rules = allRules.filter((r) => r.dimension === dimensionKey)
        if (!rules.length) return null
        const DimensionIcon = DIMENSION_ICONS[dimensionKey]

        return (
          <div key={dimensionKey} className="flex w-full flex-col gap-3">
            <div className="flex items-center gap-2">
              <DimensionIcon className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">{dimensionKey}</h3>
              <span className="text-xs text-muted-foreground">
                {rules.length} rule{rules.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white">
              <Accordion className="px-4">
                {rules.map((rule) => (
                  <AccordionItem key={rule.key} value={rule.key} className="not-last:border-b border-neutral-200">
                    <AccordionTrigger className="py-4">
                      <div className="flex w-full items-start justify-between gap-4 pr-2">
                        <div className="flex min-w-0 flex-1 items-start gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-medium text-foreground">{rule.title}</p>
                              {rule.custom && (
                                <Badge variant="outline" className="border-transparent bg-[#fdecee] text-primary">
                                  Custom
                                </Badge>
                              )}
                            </div>
                            <p className="mt-0.5 text-sm text-muted-foreground">{rule.description}</p>
                            {rule.custom && rule.updatedAt && (
                              <p className="mt-1 text-xs text-muted-foreground">Updated on {rule.updatedAt}</p>
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
                      <pre className="max-h-64 overflow-auto rounded-lg border border-neutral-200 bg-neutral-50 p-3 font-mono text-xs whitespace-pre-wrap text-neutral-700">
                        {rule.template}
                      </pre>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        )
      })}
    </div>
  )
}
