import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function RequestCategoryDialog({ open, onOpenChange, onSubmit }) {
  const [value, setValue] = useState("")
  const [error, setError] = useState("")

  const reset = () => {
    setValue("")
    setError("")
  }

  const handleOpenChange = (next) => {
    if (!next) reset()
    onOpenChange(next)
  }

  const handleSubmit = () => {
    const parts = value.split("/").map((p) => p.trim()).filter(Boolean)
    if (parts.length !== 3) {
      setError("Format harus title/title/title, contoh: NDM/Data Quality/Completeness")
      return
    }
    onSubmit(parts)
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Kategori</DialogTitle>
          <DialogDescription>
            Ajukan kategori filter baru dengan format application/type/dimension.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor="request-category-input">Kategori baru</Label>
          <Input
            id="request-category-input"
            placeholder="NDM/Data Quality/Completeness"
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              setError("")
            }}
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Submit Request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
