import { useEffect, useMemo, useRef, useState } from "react"
import {
  Search,
  Terminal,
  Copy,
  Check,
  Pencil,
  KeyRound,
  Trash2,
  Info,
  X,
  Loader2,
} from "lucide-react"
import {
  APPLICATIONS,
  CATEGORIES,
  SUBSCRIPTION_TABLES,
  INITIAL_SUBSCRIBED_IDS,
  DQ_DIMENSIONS,
  getTableDimensionMetric,
} from "@/data/subscriptionTables"
import indyLogo from "@/assets/indy-logo.svg"
import extensionButtonLogo from "@/assets/Icon + Text Logo.png"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"

const EMBED_BASE_URL =
  "https://indy.telkomsel.co.id/content-mangement/embed/dashboard/tables"

const EMBED_KEY_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

function generateEmbedKey() {
  let key = ""
  for (let i = 0; i < 24; i++) {
    key += EMBED_KEY_CHARS[Math.floor(Math.random() * EMBED_KEY_CHARS.length)]
  }
  return key
}

// Representative dimension used for the per-table integration payloads below
// (API/Kafka sections show one current score per table, not all 5 dimensions).
const INTEGRATION_DIMENSION_INDEX = 0

function statusForTier(tier) {
  if (tier === "poor") return "critical"
  if (tier === "average") return "warning"
  return "healthy"
}

function buildTablePayload(table, { withTopic = false } = {}) {
  const metric = getTableDimensionMetric(table, INTEGRATION_DIMENSION_INDEX)
  const base = {
    table: table.name,
    dimension: DQ_DIMENSIONS[INTEGRATION_DIMENSION_INDEX].toLowerCase(),
    score: metric.score,
    status: statusForTier(metric.tier),
    message: metric.insight,
  }
  return withTopic ? { topic: `dq-change-event.${table.name}`, ...base } : base
}

function SearchField({ value, onChange, placeholder = "Search..." }) {
  return (
    <div className="flex h-8 min-h-8 w-full items-center gap-1.5 rounded-[8px] border bg-white px-2 py-[5.5px] shadow-xs has-[input:focus-visible]:border-ring has-[input:focus-visible]:ring-3 has-[input:focus-visible]:ring-ring/50">
      <Input
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="h-auto min-h-0 min-w-0 flex-1 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:border-0 focus-visible:ring-0"
      />
      <Search className="size-3.5 shrink-0 text-muted-foreground" />
    </div>
  )
}

function TagRow({ app, category }) {
  return (
    <div className="flex items-center gap-2 text-xs text-[#525252]">
      <span>{app}</span>
      <span className="size-[5px] shrink-0 rounded-full bg-[#e5e5e5]" />
      <span>{category}</span>
    </div>
  )
}

function SubscribedTableRow({ table, justSaved }) {
  // Freshly-saved rows arrive with a highlighted background that fades back
  // to transparent, layered on top of the entrance animation below — a
  // "moved into this list" cue rather than an instant, silent appearance.
  const [highlighted, setHighlighted] = useState(justSaved)

  useEffect(() => {
    if (!justSaved) return
    const timeout = setTimeout(() => setHighlighted(false), 500)
    return () => clearTimeout(timeout)
  }, [justSaved])

  return (
    <div
      className={cn(
        "-mx-1.5 flex w-full items-center rounded-md border-b px-1.5 pb-2.5 transition-colors duration-700",
        justSaved && "animate-in fade-in slide-in-from-top-2 duration-500",
        highlighted ? "bg-primary/10" : "bg-transparent"
      )}
    >
      <div className="flex flex-col items-start">
        <p className="text-base font-medium text-foreground">{table.name}</p>
        <TagRow app={table.app} category={table.category} />
      </div>
    </div>
  )
}

function SubscribedBadge() {
  return (
    <span className="flex shrink-0 animate-in items-center gap-1 rounded-[8px] bg-[#eff6ff] px-2 py-0.5 zoom-in-90 fade-in duration-300">
      <Check className="size-3 shrink-0 text-[#1d4ed8]" />
      <span className="text-xs leading-4 font-semibold text-[#1d4ed8]">
        Subscribed
      </span>
    </span>
  )
}

function CellSelection({ checked, indeterminate, onCheckedChange, isEditMode }) {
  if (!isEditMode) return null

  return (
    <div className="flex h-[22px] w-4 shrink-0 items-center justify-center">
      <Checkbox
        checked={checked}
        indeterminate={indeterminate}
        onCheckedChange={onCheckedChange}
        className="size-4"
      />
    </div>
  )
}

function SelectAllRow({
  checked,
  indeterminate,
  onChange,
  canBulkSubscribe,
  canBulkUnsubscribe,
  onBulkSubscribe,
  onBulkUnsubscribe,
}) {
  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-3 border-b border-[#e5e5e5] pb-2.5">
      <div className="flex min-w-0 items-center gap-3">
        <CellSelection checked={checked} indeterminate={indeterminate} onCheckedChange={onChange} isEditMode />
        <p className="text-sm font-medium text-foreground">Select all</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={!canBulkUnsubscribe}
          onClick={onBulkUnsubscribe}
        >
          Unsubscribe
        </Button>
        <Button
          variant="default"
          size="sm"
          disabled={!canBulkSubscribe}
          onClick={onBulkSubscribe}
        >
          Subscribe
        </Button>
      </div>
    </div>
  )
}

function SubscriptionRow({ table, isSubscribed, isEditMode, isChecked, onToggleChecked }) {
  return (
    <div className="flex w-full flex-row items-center justify-between gap-4 border-b border-[#e5e5e5] pb-2.5">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <CellSelection
          checked={isChecked}
          onCheckedChange={() => onToggleChecked(table.id)}
          isEditMode={isEditMode}
        />
        <div className="flex min-w-0 flex-1 flex-col items-start">
          <p
            className="w-full truncate text-base leading-6 font-medium text-[#0a0a0a]"
            title={table.name}
          >
            {table.name}
          </p>
          <TagRow app={table.app} category={table.category} />
        </div>
      </div>
      {isSubscribed && <SubscribedBadge />}
    </div>
  )
}

function DimensionTabs({ activeIndex, onChange }) {
  return (
    <div className="flex shrink-0 items-center gap-4 overflow-x-auto border-b px-3">
      {DQ_DIMENSIONS.map((dimension, index) => (
        <button
          key={dimension}
          type="button"
          onClick={() => onChange(index)}
          className={`shrink-0 border-b-2 pt-2.5 pb-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
            index === activeIndex
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          {dimension}
        </button>
      ))}
    </div>
  )
}

function DimensionMetricRow({ table, dimensionIndex }) {
  const { score, label, dot, text, bg, icon: TierIcon, insight } = getTableDimensionMetric(
    table,
    dimensionIndex
  )

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <p className="text-xs font-semibold text-foreground">{table.name}</p>
        <span className="flex items-center gap-1">
          <span className={`size-1.5 rounded-full ${dot}`} />
          <span className={`text-xs ${text}`} title={label}>
            {score}%
          </span>
        </span>
      </div>
      <div className={`flex items-start gap-1.5 rounded-lg p-1.5 ${bg}`}>
        <TierIcon className={`mt-0.5 size-3 shrink-0 ${text}`} />
        <p className={`text-xs ${text}`}>{insight}</p>
      </div>
    </div>
  )
}

function EmbedWidgetPreview({ tables }) {
  const [isOpen, setIsOpen] = useState(true)
  const [activeDimension, setActiveDimension] = useState(0)

  return (
    <div className="flex w-full flex-col items-end gap-4">
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="flex size-[52px] shrink-0 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-black/10"
      >
        <img src={extensionButtonLogo} alt="INDY" className="size-8 object-contain" />
        <span className="sr-only">Toggle widget preview</span>
      </button>

      {isOpen && (
        <div className="flex h-[500px] w-full max-w-[400px] flex-col overflow-hidden rounded-xl border bg-white shadow-lg">
          <div className="flex shrink-0 items-center justify-between border-b p-3">
            <img src={indyLogo} alt="INDY" className="h-5 w-auto" />
            <X className="size-4 text-muted-foreground" />
          </div>

          <DimensionTabs activeIndex={activeDimension} onChange={setActiveDimension} />

          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3">
            {tables.length === 0 ? (
              <p className="py-4 text-center text-xs text-muted-foreground">
                No subscribed tables yet.
              </p>
            ) : (
              tables.map((table) => (
                <DimensionMetricRow
                  key={table.id}
                  table={table}
                  dimensionIndex={activeDimension}
                />
              ))
            )}
          </div>

          <div className="flex shrink-0 items-center justify-between gap-2 border-t bg-neutral-50 px-3 py-1.5">
            <div className="flex items-center gap-1.5">
              <Avatar size="sm">
                <AvatarFallback>AN</AvatarFallback>
              </Avatar>
              <span className="text-xs text-foreground">Antonio Nusa</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-neutral-600">
              <span className="flex items-center gap-1">
                <Info className="size-3" />
                Last update: 30 Jul 2026
              </span>
              <span className="h-2.5 w-px bg-neutral-400" />
              <span className="underline">Go to INDY</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function JsonField({ label, value, type = "string", isLast = false }) {
  return (
    <div className="pl-4">
      <span className="text-blue-700">"{label}"</span>
      <span className="text-neutral-500">: </span>
      {type === "number" ? (
        <span className="text-amber-700">{value}</span>
      ) : (
        <span className="text-emerald-700">"{value}"</span>
      )}
      {!isLast && <span className="text-neutral-500">,</span>}
    </div>
  )
}

function EmbedAttribute({ name, value }) {
  return (
    <div className="pl-4">
      <span className="text-blue-700">{name}</span>
      <span className="text-neutral-500">=</span>
      <span className="text-emerald-700">"{value}"</span>
    </div>
  )
}

function EmbedSnippetPreview({ embedUrl }) {
  return (
    <div>
      <span className="text-neutral-500">{"<"}</span>
      <span className="text-neutral-700">iframe</span>
      <EmbedAttribute name="src" value={embedUrl} />
      <EmbedAttribute name="width" value="100%" />
      <EmbedAttribute name="height" value="480" />
      <EmbedAttribute name="frameborder" value="0" />
      <div>
        <span className="text-neutral-500">{"></"}</span>
        <span className="text-neutral-700">iframe</span>
        <span className="text-neutral-500">{">"}</span>
      </div>
    </div>
  )
}

function TablePayloadBlock({ table, withTopic }) {
  const payload = buildTablePayload(table, { withTopic })

  return (
    <div>
      <div className="text-neutral-500">{`// ${table.name}`}</div>
      <div className="text-neutral-600">{"{"}</div>
      {withTopic && <JsonField label="topic" value={payload.topic} />}
      <JsonField label="table" value={payload.table} />
      <JsonField label="dimension" value={payload.dimension} />
      <JsonField label="score" value={payload.score} type="number" />
      <JsonField label="status" value={payload.status} />
      <JsonField label="message" value={payload.message} isLast />
      <div className="text-neutral-600">{"}"}</div>
    </div>
  )
}

function IntegrationSection({ description, tables, withTopic }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const payload = tables.map((table) => buildTablePayload(table, { withTopic }))
    await navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">{description}</p>

      <div className="relative min-w-0">
        <div className="max-h-[220px] min-w-0 overflow-auto rounded-lg border bg-muted p-3 pr-28 font-mono text-xs leading-5 text-foreground">
          {tables.length === 0 ? (
            <span className="text-neutral-500">No subscribed tables yet.</span>
          ) : (
            tables.map((table, i) => (
              <div key={table.id} className={i > 0 ? "mt-4" : undefined}>
                <TablePayloadBlock table={table} withTopic={withTopic} />
              </div>
            ))
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="absolute top-2 right-2 gap-1"
          disabled={tables.length === 0}
          onClick={handleCopy}
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          Copy as JSON
        </Button>
      </div>
    </div>
  )
}

function GetEmbedCodeDialog({ subscribedTables }) {
  const [embedKey, setEmbedKey] = useState(null)
  const [copied, setCopied] = useState(false)
  const [pendingAction, setPendingAction] = useState(null) // null | "generate" | "revoke"

  const embedUrl = embedKey ? `${EMBED_BASE_URL}?embedKey=${embedKey}` : null
  const embedSnippet = embedUrl
    ? `<iframe\n  src="${embedUrl}"\n  width="100%"\n  height="480"\n  frameborder="0"\n></iframe>`
    : null

  // Stands in for the round-trip to the backend that will own key issuance/revocation.
  const simulateRequest = () => new Promise((resolve) => setTimeout(resolve, 800))

  const handleGenerate = async () => {
    setPendingAction("generate")
    await simulateRequest()
    // Only one embed key per user — generating a new one replaces the old one.
    setEmbedKey(generateEmbedKey())
    setCopied(false)
    setPendingAction(null)
  }

  const handleRevoke = async () => {
    setPendingAction("revoke")
    await simulateRequest()
    setEmbedKey(null)
    setCopied(false)
    setPendingAction(null)
  }

  const handleCopy = async () => {
    if (!embedSnippet) return
    await navigator.clipboard.writeText(embedSnippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            className="h-8 min-h-8 w-auto gap-1.5 rounded-[8px] border-neutral-300 bg-white/10 px-3 py-1.5 text-sm font-medium text-[#0a0a0a] shadow-xs"
          >
            <Terminal className="size-3.5 text-[#0a0a0a]" />
            Get embed code
          </Button>
        }
      />
      <DialogContent
        showCloseButton={false}
        className="max-h-[85vh] w-fit max-w-[calc(100%-2rem)] overflow-hidden rounded-xl border border-border bg-white p-0 shadow-sm ring-0 sm:max-w-[1100px]"
      >
        <div className="flex max-h-[85vh] items-stretch">
          <div className="flex w-[560px] shrink-0 flex-col gap-4 overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle>Get embed code</DialogTitle>
              <DialogDescription>
                Generate an embed link to share your subscribed tables. Only
                one embed key can be active per user — generating a new one
                revokes the previous one.
              </DialogDescription>
            </DialogHeader>

            {embedSnippet ? (
              <>
                <div className="relative min-w-0">
                  <pre className="max-h-64 min-w-0 overflow-auto rounded-lg border bg-muted p-3 pr-10 font-mono text-xs leading-5 text-foreground">
                    <EmbedSnippetPreview embedUrl={embedUrl} />
                  </pre>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="absolute top-2 right-2"
                    onClick={handleCopy}
                  >
                    {copied ? <Check /> : <Copy />}
                    <span className="sr-only">Copy embed link</span>
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pendingAction !== null}
                    onClick={handleGenerate}
                  >
                    {pendingAction === "generate" ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <KeyRound className="size-3.5" />
                    )}
                    {pendingAction === "generate" ? "Regenerating..." : "Regenerate key"}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={pendingAction !== null}
                    onClick={handleRevoke}
                  >
                    {pendingAction === "revoke" ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}
                    {pendingAction === "revoke" ? "Revoking..." : "Revoke key"}
                  </Button>
                </div>

                <Accordion multiple className="gap-2 rounded-lg border px-3">
                  <AccordionItem value="active">
                    <AccordionTrigger>Active — API / function</AccordionTrigger>
                    <AccordionContent>
                      <IntegrationSection
                        description="Widget calls INDY on demand and gets back the current score for each subscribed table."
                        tables={subscribedTables}
                        withTopic={false}
                      />
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="passive">
                    <AccordionTrigger>Passive — Kafka topic</AccordionTrigger>
                    <AccordionContent>
                      <IntegrationSection
                        description="INDY publishes an event automatically whenever a subscribed table's quality score changes."
                        tables={subscribedTables}
                        withTopic
                      />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  No embed key generated yet.
                </p>
                <Button
                  variant="default"
                  size="sm"
                  disabled={pendingAction !== null}
                  onClick={handleGenerate}
                >
                  {pendingAction === "generate" ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <KeyRound className="size-3.5" />
                  )}
                  {pendingAction === "generate" ? "Generating..." : "Generate embed key"}
                </Button>
              </div>
            )}
          </div>

          <div className="flex w-[520px] shrink-0 flex-col border-l bg-neutral-50">
            <div className="flex shrink-0 items-start justify-between gap-4 p-6 pb-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  Widget preview
                </p>
                <p className="text-xs text-muted-foreground">
                  This is how the embedded widget will look on the page you
                  paste it into.
                </p>
              </div>
              <DialogClose
                render={<Button variant="ghost" size="icon-sm" className="shrink-0" />}
              >
                <X className="size-4" />
                <span className="sr-only">Close</span>
              </DialogClose>
            </div>
            <div className="flex flex-1 flex-col overflow-y-auto px-6 pb-6">
              <EmbedWidgetPreview tables={subscribedTables} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function SubscriptionPage() {
  const [appFilter, setAppFilter] = useState("ALL")
  const [categoryFilter, setCategoryFilter] = useState("ALL")
  const [search, setSearch] = useState("")
  const [subscribedSearch, setSubscribedSearch] = useState("")
  const [subscribedIds, setSubscribedIds] = useState(
    () => new Set(INITIAL_SUBSCRIBED_IDS)
  )
  // Staged subscribe/unsubscribe changes while editing — only committed to
  // subscribedIds (and reflected in "Subscribed table names") on Save.
  const [draftSubscribedIds, setDraftSubscribedIds] = useState(
    () => new Set(INITIAL_SUBSCRIBED_IDS)
  )
  const [isEditMode, setIsEditMode] = useState(false)
  const [checkedIds, setCheckedIds] = useState(() => new Set())
  // Ids that just moved into "Subscribed table names" on the last Save —
  // drives the arrival highlight, then clears itself so it never replays.
  const [justSavedIds, setJustSavedIds] = useState(() => new Set())
  const justSavedTimeoutRef = useRef(null)

  useEffect(() => {
    return () => clearTimeout(justSavedTimeoutRef.current)
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return SUBSCRIPTION_TABLES.filter((t) => {
      if (appFilter !== "ALL" && t.app !== appFilter) return false
      if (categoryFilter !== "ALL" && t.category !== categoryFilter) return false
      if (q && !t.name.toLowerCase().includes(q)) return false
      return true
    })
  }, [appFilter, categoryFilter, search])

  const subscribedTables = useMemo(
    () => SUBSCRIPTION_TABLES.filter((t) => subscribedIds.has(t.id)),
    [subscribedIds]
  )

  const filteredSubscribedTables = useMemo(() => {
    const q = subscribedSearch.trim().toLowerCase()
    if (!q) return subscribedTables
    return subscribedTables.filter((t) => t.name.toLowerCase().includes(q))
  }, [subscribedTables, subscribedSearch])

  const toggleChecked = (id) => {
    setCheckedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const allFilteredChecked =
    filtered.length > 0 && filtered.every((t) => checkedIds.has(t.id))
  const someFilteredChecked = filtered.some((t) => checkedIds.has(t.id))

  const handleSelectAllChange = () => {
    setCheckedIds((prev) => {
      const next = new Set(prev)
      if (allFilteredChecked) {
        filtered.forEach((t) => next.delete(t.id))
      } else {
        filtered.forEach((t) => next.add(t.id))
      }
      return next
    })
  }

  const checkedTables = useMemo(
    () => SUBSCRIPTION_TABLES.filter((t) => checkedIds.has(t.id)),
    [checkedIds]
  )
  const allCheckedSubscribed =
    checkedTables.length > 0 &&
    checkedTables.every((t) => draftSubscribedIds.has(t.id))
  const allCheckedUnsubscribed =
    checkedTables.length > 0 &&
    checkedTables.every((t) => !draftSubscribedIds.has(t.id))
  const canBulkSubscribe = checkedIds.size > 0 && allCheckedUnsubscribed
  const canBulkUnsubscribe = checkedIds.size > 0 && allCheckedSubscribed

  const hasDraftChanges =
    draftSubscribedIds.size !== subscribedIds.size ||
    [...draftSubscribedIds].some((id) => !subscribedIds.has(id))

  const bulkSubscribe = () => {
    setDraftSubscribedIds((prev) => {
      const next = new Set(prev)
      checkedIds.forEach((id) => next.add(id))
      return next
    })
  }

  const bulkUnsubscribe = () => {
    setDraftSubscribedIds((prev) => {
      const next = new Set(prev)
      checkedIds.forEach((id) => next.delete(id))
      return next
    })
  }

  const enterEditMode = () => {
    setDraftSubscribedIds(new Set(subscribedIds))
    setCheckedIds(new Set())
    setIsEditMode(true)
  }

  const handleCancel = () => {
    setDraftSubscribedIds(new Set(subscribedIds))
    setCheckedIds(new Set())
    setIsEditMode(false)
  }

  const handleSave = () => {
    // Subscribe/unsubscribe changes only take effect — and move between
    // lists — once Save is pressed; Cancel discards the draft entirely.
    const newlySubscribed = [...draftSubscribedIds].filter((id) => !subscribedIds.has(id))
    setSubscribedIds(new Set(draftSubscribedIds))
    setCheckedIds(new Set())
    setIsEditMode(false)

    setJustSavedIds(new Set(newlySubscribed))
    clearTimeout(justSavedTimeoutRef.current)
    justSavedTimeoutRef.current = setTimeout(() => setJustSavedIds(new Set()), 1500)
  }

  return (
    <div className="h-full min-w-0 flex-1 overflow-y-auto bg-neutral-50 pt-10 px-10 pb-10">
      <div className="mx-auto flex h-[822px] max-h-[calc(100vh-80px)] w-[925px] flex-col overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="flex shrink-0 items-start justify-between border-b px-6 py-[18px]">
          <div className="space-y-0.5">
            <h2 className="text-xl leading-6 font-semibold text-foreground">
              Subscription
            </h2>
            <p className="text-xs leading-4 text-neutral-600">
              All your data source subscriptions
            </p>
          </div>
          <GetEmbedCodeDialog subscribedTables={subscribedTables} />
        </div>

        <div className="flex min-h-0 flex-1 items-stretch">
          <div className="flex min-h-0 w-[560px] shrink-0 flex-col gap-4 px-6 pt-5 pb-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-4">
                <Select value={appFilter} onValueChange={setAppFilter}>
                  <SelectTrigger className="h-9 w-fit gap-2">
                    <span className="text-muted-foreground">Application:</span>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {APPLICATIONS.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-9 w-fit gap-2">
                    <span className="text-muted-foreground">Category Data:</span>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {isEditMode ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 min-h-8 rounded-[8px] border-neutral-300 bg-white/10 py-2 pr-2 pl-2.5 text-sm shadow-xs"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="h-8 min-h-8 rounded-[8px] py-2 pr-2 pl-2.5 text-sm shadow-xs"
                      disabled={!hasDraftChanges}
                      onClick={handleSave}
                    >
                      Save
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 min-h-8 gap-1.5 rounded-[8px] border-neutral-300 bg-white/10 py-2 pr-2 pl-2.5 text-sm shadow-xs"
                    onClick={enterEditMode}
                  >
                    <Pencil className="size-3.5" />
                    Edit subscription
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <SearchField value={search} onChange={(e) => setSearch(e.target.value)} />
              <p className="text-xs font-medium text-neutral-600">
                Showing {filtered.length} tables
              </p>
            </div>

            {isEditMode && (
              <SelectAllRow
                checked={allFilteredChecked}
                indeterminate={someFilteredChecked && !allFilteredChecked}
                onChange={handleSelectAllChange}
                canBulkSubscribe={canBulkSubscribe}
                canBulkUnsubscribe={canBulkUnsubscribe}
                onBulkSubscribe={bulkSubscribe}
                onBulkUnsubscribe={bulkUnsubscribe}
              />
            )}

            <div className="flex min-h-0 w-full flex-1 flex-col gap-3 overflow-y-auto">
              {filtered.map((t) => (
                <SubscriptionRow
                  key={t.id}
                  table={t}
                  isSubscribed={(isEditMode ? draftSubscribedIds : subscribedIds).has(t.id)}
                  isEditMode={isEditMode}
                  isChecked={checkedIds.has(t.id)}
                  onToggleChecked={toggleChecked}
                />
              ))}
              {filtered.length === 0 && (
                <p className="w-full py-4 text-center text-sm text-muted-foreground">
                  No tables match your filters.
                </p>
              )}
            </div>
          </div>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 border-l px-6 pt-5 pb-6">
            <div className="shrink-0 space-y-0.5">
              <p className="text-lg font-medium text-foreground">
                Subscribed table names
              </p>
              <p className="text-xs text-neutral-600">
                Total: {subscribedTables.length} subscriptions
              </p>
            </div>

            <div className="flex min-h-0 w-full flex-1 flex-col gap-3 overflow-y-auto">
              <div className="p-1">
                <SearchField
                  value={subscribedSearch}
                  onChange={(e) => setSubscribedSearch(e.target.value)}
                />
              </div>
              {filteredSubscribedTables.map((t) => (
                <SubscribedTableRow key={t.id} table={t} justSaved={justSavedIds.has(t.id)} />
              ))}
              {filteredSubscribedTables.length === 0 && (
                <p className="w-full py-4 text-sm text-muted-foreground">
                  {subscribedTables.length === 0
                    ? "No subscriptions yet — subscribe to a table on the left."
                    : "No subscribed tables match your search."}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
