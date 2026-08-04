import { useState } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import CategoryNav from "@/components/ticketing/CategoryNav"
import RequestCategoryDialog from "@/components/ticketing/RequestCategoryDialog"
import { DEFAULT_CATEGORY_TREE, TICKETS } from "@/data/ticketingData"

export default function TicketingLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [categoryTree, setCategoryTree] = useState(DEFAULT_CATEGORY_TREE)
  const [selectedCategoryPath, setSelectedCategoryPath] = useState(null)
  const [requestCategoryOpen, setRequestCategoryOpen] = useState(false)
  const [tickets, setTickets] = useState(TICKETS)

  const handleSelectPath = (path) => {
    setSelectedCategoryPath(path)
    if (location.pathname !== "/ticketing") {
      navigate("/ticketing")
    }
  }

  const handleRequestCategory = ([application, type, dimension]) => {
    setCategoryTree((prev) => {
      const next = prev.map((node) => ({ ...node, children: node.children ? [...node.children] : node.children }))
      let appNode = next.find((n) => n.name === application)
      if (!appNode) {
        appNode = { name: application, children: [] }
        next.push(appNode)
      } else if (!appNode.children) {
        appNode.children = []
      }
      let typeNode = appNode.children.find((n) => n.name === type)
      if (!typeNode) {
        typeNode = { name: type, children: [] }
        appNode.children.push(typeNode)
      } else if (!typeNode.children) {
        typeNode.children = []
      }
      if (!typeNode.children.find((n) => n.name === dimension)) {
        typeNode.children.push({ name: dimension })
      }
      return next
    })
  }

  return (
    <div className="flex h-[calc(100vh-56px)] bg-neutral-50">
      <CategoryNav
        tree={categoryTree}
        selectedPath={selectedCategoryPath}
        onSelectPath={handleSelectPath}
        onRequestCategory={() => setRequestCategoryOpen(true)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
        <Outlet context={{ selectedCategoryPath, tickets, setTickets }} />
      </div>

      <RequestCategoryDialog
        open={requestCategoryOpen}
        onOpenChange={setRequestCategoryOpen}
        onSubmit={handleRequestCategory}
      />
    </div>
  )
}
