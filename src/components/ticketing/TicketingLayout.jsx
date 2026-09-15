import { useState } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import TicketingSidebar from "@/components/ticketing/TicketingSidebar"
import RequestCategoryDialog from "@/components/ticketing/RequestCategoryDialog"
import { DEFAULT_CATEGORY_TREE, TICKETS } from "@/data/ticketingData"
import { DEFAULT_CATEGORIES } from "@/data/picCategoryData"

export default function TicketingLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedCategoryPath, setSelectedCategoryPath] = useState(null)
  const [requestCategoryOpen, setRequestCategoryOpen] = useState(false)
  const [tickets, setTickets] = useState(TICKETS)
  const [pinnedIds, setPinnedIds] = useState([])
  const [picCategories, setPicCategories] = useState(DEFAULT_CATEGORIES)
  const [taskFilter, setTaskFilter] = useState("all")

  const handleSelectPath = (path) => {
    setSelectedCategoryPath(path)
    if (location.pathname !== "/ticketing") {
      navigate("/ticketing")
    }
  }

  const handleTaskFilterChange = (next) => {
    setTaskFilter(next)
    if (location.pathname !== "/ticketing") {
      navigate("/ticketing")
    }
  }

  return (
    <div className="flex h-full min-w-0 flex-1 bg-neutral-50">
      <TicketingSidebar
        tree={DEFAULT_CATEGORY_TREE}
        selectedPath={selectedCategoryPath}
        onSelectPath={handleSelectPath}
        onRequestCategory={() => setRequestCategoryOpen(true)}
        taskFilter={taskFilter}
        onTaskFilterChange={handleTaskFilterChange}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
        <Outlet
          context={{
            selectedCategoryPath,
            tickets,
            setTickets,
            pinnedIds,
            setPinnedIds,
            picCategories,
            setPicCategories,
            taskFilter,
          }}
        />
      </div>

      <RequestCategoryDialog open={requestCategoryOpen} onOpenChange={setRequestCategoryOpen} />
    </div>
  )
}
