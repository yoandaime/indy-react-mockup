import { useState } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import CategoryNav from "@/components/ticketing/CategoryNav"
import RequestCategoryDialog from "@/components/ticketing/RequestCategoryDialog"
import { DEFAULT_CATEGORY_TREE, TICKETS } from "@/data/ticketingData"

export default function TicketingLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedCategoryPath, setSelectedCategoryPath] = useState(null)
  const [requestCategoryOpen, setRequestCategoryOpen] = useState(false)
  const [tickets, setTickets] = useState(TICKETS)

  const handleSelectPath = (path) => {
    setSelectedCategoryPath(path)
    if (location.pathname !== "/ticketing") {
      navigate("/ticketing")
    }
  }

  return (
    <div className="flex h-[calc(100vh-56px)] bg-neutral-50">
      <CategoryNav
        tree={DEFAULT_CATEGORY_TREE}
        selectedPath={selectedCategoryPath}
        onSelectPath={handleSelectPath}
        onRequestCategory={() => setRequestCategoryOpen(true)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
        <Outlet context={{ selectedCategoryPath, tickets, setTickets }} />
      </div>

      <RequestCategoryDialog open={requestCategoryOpen} onOpenChange={setRequestCategoryOpen} />
    </div>
  )
}
