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
import FieldLabel from "@/components/ticketing/FieldLabel"

const TICKET_KIND_OPTIONS = ["Kendala", "Request"]
const APPLICATION_OPTIONS = ["NDM", "ICAM", "OSS", "BSS"]
const CATEGORY_OPTIONS = ["Data Quality", "Data Ingestion"]
const SUB_CATEGORY_OPTIONS = ["Completeness", "Uniqueness", "Validity"]

const EMPTY_FORM = {
  kind: "",
  application: "",
  type: "",
  dimension: "",
  title: "",
  ipAddress: "",
  description: "",
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

  const handleKindChange = (value) => {
    setForm((f) => ({ ...f, kind: value, application: "", type: "", dimension: "" }))
  }

  const handleApplicationChange = (value) => {
    setForm((f) => ({ ...f, application: value, type: "", dimension: "" }))
  }

  const handleCategoryChange = (value) => {
    setForm((f) => ({ ...f, type: value, dimension: "" }))
  }

  const handleSubCategoryChange = (value) => {
    setForm((f) => ({ ...f, dimension: value }))
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
    if (
      !form.kind.trim() ||
      !form.application.trim() ||
      !form.type.trim() ||
      !form.dimension.trim() ||
      !form.title.trim() ||
      !form.ipAddress.trim() ||
      !form.description.trim()
    ) {
      setError("Semua field wajib diisi, kecuali Issue Tags.")
      return
    }
    onCreate({
      kind: form.kind,
      category: {
        application: form.application.trim(),
        type: form.type.trim(),
        dimension: form.dimension.trim(),
      },
      title: form.title.trim(),
      ipAddress: form.ipAddress.trim(),
      description: form.description.trim(),
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
                id="ticket-type"
                label="Category"
                placeholder="Select"
                value={form.type}
                onValueChange={handleCategoryChange}
                options={CATEGORY_OPTIONS}
                disabled={!form.application}
              />
              <CategorySelect
                id="ticket-dimension"
                label="Sub Category"
                placeholder="Select"
                value={form.dimension}
                onValueChange={handleSubCategoryChange}
                options={SUB_CATEGORY_OPTIONS}
                disabled={!form.type}
              />
            </div>
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
