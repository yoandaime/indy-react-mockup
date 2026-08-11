import { useState } from "react"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { MultiSelect } from "@/components/ui/multi-select"
import FieldLabel from "@/components/ticketing/FieldLabel"
import {
  CURRENT_USER,
  DOMAIN_OPTIONS,
  TABLE_NAME_OPTIONS,
  PIC_OPTIONS,
  PRIORITY_META,
} from "@/data/ticketingData"

const TICKET_KIND_OPTIONS = ["Kendala", "Request"]
const APPLICATION_OPTIONS = ["NDM", "ICAM", "OSS", "BSS"]
const SCOPE_OPTIONS = ["Data Quality", "Data Ingestion"]
const CONCERN_OPTIONS = ["Completeness", "Uniqueness", "Validity"]
const OTHER_USER_OPTIONS = PIC_OPTIONS
const PRIORITY_OPTIONS = Object.keys(PRIORITY_META)

const EMPTY_FORM = {
  ticketFor: "self",
  issueOwner: "",
  kind: "",
  application: "",
  scope: "",
  concern: "",
  domain: "",
  tableName: "",
  title: "",
  ipAddress: "",
  description: "",
  pic: [],
  priority: "",
  tags: "",
}

function CategorySelect({ id, label, value, onValueChange, options, disabled, placeholder }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
      <FieldLabel htmlFor={id} required className="text-xs font-medium text-foreground">
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

export default function NewTicketDialog({ open, onOpenChange, onCreate }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState("")

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleTicketForChange = (value) => {
    setForm((f) => ({
      ...f,
      ticketFor: value,
      issueOwner: value === "self" ? "" : f.issueOwner,
    }))
  }

  const handleKindChange = (value) => {
    setForm((f) => ({ ...f, kind: value, application: "", scope: "", concern: "" }))
  }

  const handleApplicationChange = (value) => {
    setForm((f) => ({ ...f, application: value, scope: "", concern: "" }))
  }

  const handleScopeChange = (value) => {
    setForm((f) => ({ ...f, scope: value, concern: "" }))
  }

  const handleConcernChange = (value) => {
    setForm((f) => ({ ...f, concern: value }))
  }

  const reset = () => {
    setForm(EMPTY_FORM)
    setError("")
  }

  const handleOpenChange = (next) => {
    if (!next) reset()
    onOpenChange(next)
  }

  const handleSubmit = () => {
    const issueOwner = form.ticketFor === "self" ? CURRENT_USER : form.issueOwner.trim()
    if (
      !form.kind.trim() ||
      !form.application.trim() ||
      !form.scope.trim() ||
      !form.concern.trim() ||
      !form.domain.trim() ||
      !form.tableName.trim() ||
      !form.title.trim() ||
      !form.ipAddress.trim() ||
      !form.description.trim() ||
      !form.priority.trim() ||
      (form.ticketFor === "other" && !issueOwner)
    ) {
      setError("Semua field wajib diisi, kecuali Issue Tags.")
      return
    }
    onCreate({
      kind: form.kind,
      category: {
        application: form.application.trim(),
        scope: form.scope.trim(),
        concern: form.concern.trim(),
      },
      domain: form.domain,
      tableName: form.tableName.trim(),
      ticketFor: form.ticketFor,
      issueOwner,
      title: form.title.trim(),
      ipAddress: form.ipAddress.trim(),
      description: form.description.trim(),
      pic: form.pic,
      priority: form.priority,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    })
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="p-6 sm:max-w-3xl">
        <DialogHeader className="gap-px">
          <DialogTitle className="text-xl leading-6 font-semibold">
            Create New Issue Ticket
          </DialogTitle>
          <DialogDescription>Isi form data issue untuk membuat tiket baru</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2.5">
            <Label className="text-sm font-semibold text-foreground">
              On Whose Behalf Is This Ticket?
            </Label>
            <RadioGroup
              value={form.ticketFor}
              onValueChange={handleTicketForChange}
              className="flex flex-row items-center gap-6"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem id="ticket-for-self" value="self" />
                <Label htmlFor="ticket-for-self" className="text-sm font-medium text-foreground">
                  By Myself
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem id="ticket-for-other" value="other" />
                <Label htmlFor="ticket-for-other" className="text-sm font-medium text-foreground">
                  On Behalf of Someone Else
                </Label>
              </div>
            </RadioGroup>

            {form.ticketFor === "other" && (
              <CategorySelect
                id="ticket-issue-owner"
                label="Who owns this ticket?"
                placeholder="Select an item"
                value={form.issueOwner}
                onValueChange={(value) => setForm((f) => ({ ...f, issueOwner: value }))}
                options={OTHER_USER_OPTIONS}
              />
            )}
          </div>

          <div className="space-y-2.5">
            <Label className="text-sm font-semibold text-foreground">Issue Category</Label>
            <div className="flex items-start gap-4">
              <CategorySelect
                id="ticket-kind"
                label="Type"
                placeholder="Select"
                value={form.kind}
                onValueChange={handleKindChange}
                options={TICKET_KIND_OPTIONS}
              />
              <CategorySelect
                id="ticket-app"
                label="Application"
                placeholder="Select"
                value={form.application}
                onValueChange={handleApplicationChange}
                options={APPLICATION_OPTIONS}
                disabled={!form.kind}
              />
              <CategorySelect
                id="ticket-scope"
                label="Scope"
                placeholder="Select"
                value={form.scope}
                onValueChange={handleScopeChange}
                options={SCOPE_OPTIONS}
                disabled={!form.application}
              />
              <CategorySelect
                id="ticket-concern"
                label="Concern"
                placeholder="Select"
                value={form.concern}
                onValueChange={handleConcernChange}
                options={CONCERN_OPTIONS}
                disabled={!form.scope}
              />
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <FieldLabel htmlFor="ticket-domain" required className="text-sm font-medium text-foreground">
                Domain
              </FieldLabel>
              <Select
                value={form.domain}
                onValueChange={(value) => setForm((f) => ({ ...f, domain: value }))}
              >
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
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <FieldLabel htmlFor="ticket-table-name" required className="text-sm font-medium text-foreground">
                Table Name
              </FieldLabel>
              <Select
                value={form.tableName}
                onValueChange={(value) => setForm((f) => ({ ...f, tableName: value }))}
              >
                <SelectTrigger id="ticket-table-name" className="h-9 w-full shadow-xs">
                  <SelectValue placeholder="Select" className="truncate" />
                </SelectTrigger>
                <SelectContent>
                  {TABLE_NAME_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <FieldLabel htmlFor="ticket-pic" className="text-sm font-medium text-foreground">
                PIC
              </FieldLabel>
              <MultiSelect
                id="ticket-pic"
                placeholder="Select PIC(s)"
                value={form.pic}
                onValueChange={(value) => setForm((f) => ({ ...f, pic: value }))}
                options={PIC_OPTIONS}
              />
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <FieldLabel htmlFor="ticket-priority" required className="text-sm font-medium text-foreground">
                Priority
              </FieldLabel>
              <Select
                value={form.priority}
                onValueChange={(value) => setForm((f) => ({ ...f, priority: value }))}
              >
                <SelectTrigger id="ticket-priority" className="h-9 w-full shadow-xs">
                  <SelectValue placeholder="Select" className="truncate" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <FieldLabel htmlFor="ticket-ip" required className="text-sm font-medium text-foreground">
              IP address
            </FieldLabel>
            <Input
              id="ticket-ip"
              placeholder="e.g.10.62.70.123"
              value={form.ipAddress}
              onChange={set("ipAddress")}
              className="h-9 shadow-xs"
            />
          </div>

          <div className="space-y-1">
            <FieldLabel htmlFor="ticket-title" required className="text-sm font-medium text-foreground">
              Issue / Ticket Title
            </FieldLabel>
            <Input
              id="ticket-title"
              placeholder="e.g. Incompleteness issue in table hr/count.split_error_counter_int..."
              value={form.title}
              onChange={set("title")}
              className="h-9 shadow-xs"
            />
          </div>

          <div className="space-y-1">
            <FieldLabel htmlFor="ticket-description" required className="text-sm font-medium text-foreground">
              Detailed Data Issue Description
            </FieldLabel>
            <Textarea
              id="ticket-description"
              placeholder="Type your message here."
              value={form.description}
              onChange={set("description")}
              className="min-h-[73px] shadow-xs"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="ticket-tags" className="text-sm font-medium text-foreground">
              Issue Tags (comma separated)
            </Label>
            <Input
              id="ticket-tags"
              placeholder="e.g. RDM, Sales/Layer, NMS, Incompleteness"
              value={form.tags}
              onChange={set("tags")}
              className="h-9 shadow-xs"
            />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="flex items-start justify-end gap-3">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Open Issue Ticket</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
