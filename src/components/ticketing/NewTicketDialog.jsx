import { useEffect, useRef, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import IssueRowsEditor from "@/components/ticketing/IssueRowsEditor"
import FieldLabel from "@/components/ticketing/FieldLabel"
import { Copy, ImageUp, ShieldCheck, X } from "lucide-react"
import {
  APPLICATION_OPTIONS,
  CONCERN_OPTIONS,
  CURRENT_USER,
  DOMAIN_OPTIONS,
  DOMAIN_TABLE_NAMES,
  ISSUE_PRIORITY_OPTIONS,
  PRIORITY_DESCRIPTIONS,
  SCOPE_OPTIONS,
  TICKET_KIND_OPTIONS,
  getTicketIssues,
} from "@/data/ticketingData"
import { DEFAULT_CATEGORIES } from "@/data/picCategoryData"

const CATEGORY_OPTIONS = DEFAULT_CATEGORIES.map((c) => c.name)
const MAX_ISSUES = 5

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function makeEmptyIssue() {
  return {
    id: `issue-${Math.random().toString(36).slice(2, 10)}`,
    ipAddress: "",
    tableName: "",
    granularity: "Daily",
    from: "",
    to: "",
  }
}

const EMPTY_FORM = {
  kind: "",
  application: "",
  category: "",
  domain: "",
  domainCustom: false,
  tableNameOther: "",
  scope: "",
  concern: "",
  priority: "",
  description: "",
  onBehalfEmail: "",
}

function seedFormFromTicket(ticket) {
  return {
    kind: ticket.kind ?? "Kendala",
    application: ticket.category?.application ?? "",
    category: ticket.picCategory ?? "",
    domain: ticket.domain ?? "",
    domainCustom: !DOMAIN_TABLE_NAMES[ticket.domain],
    tableNameOther: "",
    scope: ticket.category?.scope ?? "",
    concern: ticket.category?.concern ?? "",
    priority: ticket.priority ?? "",
    description: ticket.description ?? "",
    onBehalfEmail: "",
  }
}

function seedIssuesFromTicket(ticket) {
  return getTicketIssues(ticket).map((issue) => ({
    ...issue,
    id: `issue-${Math.random().toString(36).slice(2, 10)}`,
  }))
}

function CategorySelect({ id, label, value, onValueChange, options, disabled, placeholder, required = true }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
      <FieldLabel htmlFor={id} required={required} className="text-xs font-medium text-foreground">
        {label}
      </FieldLabel>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger id={id} className="h-9 w-full shadow-xs">
          <SelectValue placeholder={placeholder} className="truncate" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export default function NewTicketDialog({ open, onOpenChange, onCreate, mode = "create", sourceTicket = null }) {
  const isDuplicate = mode === "duplicate"
  const [form, setForm] = useState(EMPTY_FORM)
  const [issues, setIssues] = useState([makeEmptyIssue()])
  const [screenshot, setScreenshot] = useState(null)
  const [error, setError] = useState("")
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (open && isDuplicate && sourceTicket) {
      setForm(seedFormFromTicket(sourceTicket))
      setIssues(seedIssuesFromTicket(sourceTicket))
      setScreenshot(null)
      setError("")
    }
  }, [open, isDuplicate, sourceTicket])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleApplicationChange = (value) => {
    setForm((f) => ({ ...f, application: value, category: "" }))
  }

  const handleScopeChange = (value) => {
    setForm((f) => ({ ...f, scope: value, concern: "" }))
  }

  const handleDomainChange = (value) => {
    if (value === "Other") {
      setForm((f) => ({ ...f, domain: "", domainCustom: true, tableNameOther: "" }))
      return
    }
    setForm((f) => ({
      ...f,
      domain: value,
      domainCustom: !DOMAIN_TABLE_NAMES[value],
      tableNameOther: "",
    }))
  }

  const isCustomDomain = form.domainCustom

  const updateIssue = (id, patch) => {
    setIssues((prev) => prev.map((issue) => (issue.id === id ? { ...issue, ...patch } : issue)))
  }

  const addIssue = () => {
    setIssues((prev) => (prev.length >= MAX_ISSUES ? prev : [...prev, makeEmptyIssue()]))
  }

  const removeIssue = (id) => {
    setIssues((prev) => (prev.length <= 1 ? prev : prev.filter((issue) => issue.id !== id)))
  }

  const setImageFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return
    setScreenshot({ name: file.name || "pasted-image.png", url: URL.createObjectURL(file) })
  }

  const handleDescriptionPaste = (e) => {
    const item = Array.from(e.clipboardData?.items ?? []).find((it) => it.type.startsWith("image/"))
    if (!item) return
    e.preventDefault()
    setImageFile(item.getAsFile())
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setImageFile(e.dataTransfer.files?.[0])
  }

  const handleImagePick = (e) => {
    setImageFile(e.target.files?.[0])
    e.target.value = ""
  }

  const reset = () => {
    setForm(EMPTY_FORM)
    setIssues([makeEmptyIssue()])
    setScreenshot(null)
    setError("")
  }

  const handleOpenChange = (next) => {
    if (!next) reset()
    onOpenChange(next)
  }

  const handleSubmit = () => {
    const domainValue = form.domain.trim()
    const issuesValid = issues.every(
      (issue) => issue.ipAddress.trim() && issue.tableName.trim() && issue.granularity && issue.from && issue.to
    )
    if (
      !form.kind.trim() ||
      !form.application.trim() ||
      !form.category.trim() ||
      !domainValue ||
      !form.scope.trim() ||
      !issuesValid ||
      !form.priority.trim() ||
      !form.description.trim()
    ) {
      setError("All required fields must be filled in before opening the ticket.")
      return
    }

    const primaryIssue = issues[0]
    const onBehalfEmail = form.onBehalfEmail.trim()
    const ticketFor = onBehalfEmail ? "other" : "self"
    const issueOwner = onBehalfEmail || CURRENT_USER

    const description = form.description.trim()

    onCreate({
      kind: form.kind,
      category: {
        application: form.application.trim(),
        scope: form.scope.trim(),
        concern: form.concern.trim(),
      },
      picCategory: form.category.trim(),
      domain: domainValue,
      tableName: primaryIssue.tableName,
      ticketFor,
      issueOwner,
      // The ticket's single heading is the reporter's own description — not
      // an auto-generated "concern — table" slug — so the card and detail
      // page show exactly what was typed in Detailed Data Issue Description.
      title: description,
      ipAddress: primaryIssue.ipAddress,
      description,
      priority: form.priority,
      tags: [form.kind, form.category, domainValue].filter(Boolean).map(slugify),
      issues,
      screenshot: screenshot?.url ?? null,
    })
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="p-6 sm:max-w-3xl">
        <DialogHeader className="gap-px">
          <DialogTitle className="text-xl leading-6 font-semibold">
            {isDuplicate ? "Duplicate Issue Ticket" : "Create New Issue Ticket"}
          </DialogTitle>
          <DialogDescription>
            {isDuplicate
              ? "Everything is copied from the original — change what differs, then submit."
              : "Describe what is wrong with the data, or what you need built."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {isDuplicate && sourceTicket && (
            <div className="flex items-start gap-2.5 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2.5 text-sm text-sky-700">
              <Copy className="mt-0.5 size-4 shrink-0" />
              <p>
                Copied from <span className="font-semibold">{sourceTicket.id}</span>. This creates a separate
                ticket — the original is untouched.
              </p>
            </div>
          )}

          <div className="space-y-2.5">
            <Label className="text-sm font-semibold text-foreground">Issue Category</Label>
            <div className="flex items-start gap-4">
              <CategorySelect
                id="ticket-kind"
                label="Type"
                placeholder="Select"
                value={form.kind}
                onValueChange={(value) => setForm((f) => ({ ...f, kind: value }))}
                options={TICKET_KIND_OPTIONS}
              />
              <CategorySelect
                id="ticket-app"
                label="Application"
                placeholder="Select"
                value={form.application}
                onValueChange={handleApplicationChange}
                options={APPLICATION_OPTIONS}
              />
              <CategorySelect
                id="ticket-category"
                label="Category"
                placeholder="Select"
                value={form.category}
                onValueChange={(value) => setForm((f) => ({ ...f, category: value }))}
                options={CATEGORY_OPTIONS}
                disabled={!form.application}
              />
            </div>

            <div className="flex items-start gap-4">
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <FieldLabel htmlFor="ticket-domain" required className="text-xs font-medium text-foreground">
                  Domain
                </FieldLabel>
                {isCustomDomain ? (
                  <Input
                    id="ticket-domain"
                    placeholder="Type domain name..."
                    value={form.domain}
                    onChange={set("domain")}
                    className="h-9 shadow-xs"
                  />
                ) : (
                  <Select value={form.domain} onValueChange={handleDomainChange}>
                    <SelectTrigger id="ticket-domain" className="h-9 w-full shadow-xs">
                      <SelectValue placeholder="Select" className="truncate" />
                    </SelectTrigger>
                    <SelectContent>
                      {DOMAIN_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {form.kind && (
                  <p className="text-xs text-muted-foreground">Accepting {form.kind}</p>
                )}
              </div>
              <CategorySelect
                id="ticket-scope"
                label="Scope"
                placeholder="Select"
                value={form.scope}
                onValueChange={handleScopeChange}
                options={SCOPE_OPTIONS}
              />
              <CategorySelect
                id="ticket-concern"
                label="Concern"
                placeholder="Select"
                value={form.concern}
                onValueChange={(value) => setForm((f) => ({ ...f, concern: value }))}
                options={CONCERN_OPTIONS}
                disabled={!form.scope}
                required={false}
              />
            </div>
          </div>

          <IssueRowsEditor
            issues={issues}
            onUpdateIssue={updateIssue}
            onAddIssue={addIssue}
            onRemoveIssue={removeIssue}
            max={MAX_ISSUES}
          />

          <div className="space-y-1">
            <FieldLabel htmlFor="ticket-priority" required className="text-sm font-medium text-foreground">
              Priority
            </FieldLabel>
            <Select
              value={form.priority}
              onValueChange={(value) => setForm((f) => ({ ...f, priority: value }))}
            >
              <SelectTrigger id="ticket-priority" className="h-9 w-full shadow-xs">
                <SelectValue placeholder="Select" className="truncate">
                  {(value) => PRIORITY_DESCRIPTIONS[value]}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {ISSUE_PRIORITY_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {PRIORITY_DESCRIPTIONS[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <FieldLabel htmlFor="ticket-description" required className="text-sm font-medium text-foreground">
              Detailed Data Issue Description
            </FieldLabel>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="space-y-2 rounded-lg border border-dashed border-transparent has-[textarea:focus]:border-transparent"
            >
              <Textarea
                id="ticket-description"
                placeholder="What is wrong, which partition or period it affects, and what you already checked. Paste a screenshot to attach it."
                value={form.description}
                onChange={set("description")}
                onPaste={handleDescriptionPaste}
                className="min-h-[73px] shadow-xs"
              />
              <div className="flex flex-wrap items-center gap-2.5">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImagePick}
                  className="hidden"
                />
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <ImageUp className="size-4" />
                  Attach screenshot
                </Button>
                <span className="text-xs text-muted-foreground">
                  Drop files here, or paste a screenshot into the description.
                </span>
              </div>
              {screenshot && (
                <div className="flex w-fit items-center gap-2 rounded-lg border border-neutral-200 py-1 pr-2 pl-1">
                  <img src={screenshot.url} alt={screenshot.name} className="size-8 rounded object-cover" />
                  <span className="max-w-[200px] truncate text-xs text-foreground">{screenshot.name}</span>
                  <button
                    type="button"
                    onClick={() => setScreenshot(null)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2 rounded-lg border border-dashed border-neutral-300 p-3">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">Raise on behalf of</span>
              <span className="text-xs text-muted-foreground">— admin only, optional</span>
            </div>
            <Input
              type="email"
              placeholder="colleague@telkomsel.co.id"
              value={form.onBehalfEmail}
              onChange={set("onBehalfEmail")}
              className="h-9 shadow-xs"
            />
            <p className="text-xs text-muted-foreground">
              You stay the reporter; they are recorded as whose problem it is.
            </p>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="flex items-start justify-end gap-3">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>{isDuplicate ? "Create Duplicate Ticket" : "Open Issue Ticket"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
