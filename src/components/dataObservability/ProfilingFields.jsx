import { Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MultiSelect } from "@/components/ui/multi-select"
import FieldSelect from "@/components/dataObservability/FieldSelect"

// Schema/Table/Describe/Period live in the shared DQ Composer aside — this
// only renders the fields specific to the Profiling sub-tab.
export default function ProfilingFields({
  describedTable,
  insertTimeColumn,
  onInsertTimeColumnChange,
  uniqKeyColumns,
  onUniqKeyColumnsChange,
  lookbackDays,
  onLookbackDaysChange,
  onProfileTable,
}) {
  const allColumnNames = describedTable ? describedTable.columns.map((c) => c.column) : []

  return (
    <>
      <FieldSelect
        id="profile-insert-time"
        label="Insert Time Column (optional)"
        value={insertTimeColumn}
        onValueChange={onInsertTimeColumnChange}
        options={allColumnNames}
        placeholder="Select..."
      />

      <div className="space-y-1.5">
        <Label htmlFor="profile-uniq-keys">Uniq Key Columns — {uniqKeyColumns.length} dipilih</Label>
        <MultiSelect
          id="profile-uniq-keys"
          value={uniqKeyColumns}
          onValueChange={onUniqKeyColumnsChange}
          options={allColumnNames}
          placeholder="Cari kolom..."
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="profile-lookback">Lookback Days</Label>
        <Input id="profile-lookback" type="number" value={lookbackDays} onChange={(e) => onLookbackDaysChange(e.target.value)} />
      </div>

      <Button type="button" className="w-full" onClick={onProfileTable}>
        <Activity className="size-4" />
        Profile Table
      </Button>
    </>
  )
}
