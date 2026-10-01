import { SquareActivity } from "lucide-react"

export default function RootCauseAnalysisSection() {
  return (
    <div className="flex h-full min-w-0 flex-1 flex-col items-center justify-center gap-2 bg-neutral-50 px-6 text-center">
      <SquareActivity className="size-8 text-neutral-400" />
      <p className="text-base font-medium text-foreground">Root Cause Analysis</p>
      <p className="text-sm font-medium text-neutral-400">Under development</p>
    </div>
  )
}
