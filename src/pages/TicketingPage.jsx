import { useEffect, useMemo, useState } from "react"
import { useOutletContext } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import { notifySuccess } from "@/lib/toast"
import {
  Search,
  Plus,
  Presentation,
  Archive,
  LayoutGrid,
  List as ListIcon,
  Kanban as KanbanIcon,
  ListFilter,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import TicketCard from "@/components/ticketing/TicketCard"
import StatusBadge from "@/components/ticketing/StatusBadge"
import PriorityBadge from "@/components/ticketing/PriorityBadge"
import NewTicketDialog from "@/components/ticketing/NewTicketDialog"
import CloseArchiveDialog from "@/components/ticketing/CloseArchiveDialog"
import {
  STATUS,
  CURRENT_USER,
  DOMAIN_PIC_MAP,
  ticketAuthorEmail,
  ticketAuthorInitials,
  ticketAuthorAvatarUrl,
} from "@/data/ticketingData"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 10

const TASK_FILTER_OPTIONS = [
  { value: "all", label: "All Ticket" },
  { value: "mine", label: "My Task" },
]

const TASK_FILTER_LABELS = Object.fromEntries(
  TASK_FILTER_OPTIONS.map((option) => [option.value, option.label])
)

const KANBAN_COLUMNS = [
  { status: STATUS.pending, bgClass: "bg-gray-50", countClass: "text-gray-700" },
  { status: STATUS.open, bgClass: "bg-sky-50", countClass: "text-sky-700" },
  { status: STATUS.inProgress, bgClass: "bg-amber-50", countClass: "text-amber-700" },
  { status: STATUS.solved, bgClass: "bg-emerald-50", countClass: "text-emerald-700" },
]

const BOARD_STATUSES = [STATUS.pending, STATUS.open, STATUS.inProgress, STATUS.solved]

function formatDateTime(iso) {
  const date = new Date(iso)
  const datePart = date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
  const timePart = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
  return `${datePart}, ${timePart}`
}

function isMyTask(ticket) {
  return (
    ticket.author === CURRENT_USER ||
    ticket.issueOwner === CURRENT_USER ||
    ticket.pic.includes(CURRENT_USER)
  )
}

export default function TicketingPage() {
  const { selectedCategoryPath, tickets, setTickets } = useOutletContext()
  const [boardTab, setBoardTab] = useState("board")
  const [viewMode, setViewMode] = useState("grid")
  const [search, setSearch] = useState("")
  const [taskFilter, setTaskFilter] = useState("all")
  const [page, setPage] = useState(1)

  const handleBoardTabChange = (next) => {
    setBoardTab(next)
    if (next === "archive" && viewMode === "kanban") setViewMode("grid")
  }
  const [newTicketOpen, setNewTicketOpen] = useState(false)
  const [closeArchiveOpen, setCloseArchiveOpen] = useState(false)
  const [pendingCloseId, setPendingCloseId] = useState(null)
  const [picPopoverOpen, setPicPopoverOpen] = useState(false)

  const categoryPathOf = (t) => `${t.category.application}/${t.category.scope}/${t.category.concern}`

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return tickets.filter((t) => {
      if (viewMode !== "kanban") {
        const inBoard = BOARD_STATUSES.includes(t.status)
        const matchesTab = boardTab === "archive" ? t.status === STATUS.closed : inBoard
        if (!matchesTab) return false
      }

      if (taskFilter === "mine" && !isMyTask(t)) return false

      if (selectedCategoryPath) {
        const path = categoryPathOf(t)
        if (path !== selectedCategoryPath && !path.startsWith(selectedCategoryPath + "/")) return false
      }

      if (!q) return true
      return (
        t.id.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.author.toLowerCase().includes(q) ||
        t.tableName.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
      )
    })
  }, [tickets, boardTab, viewMode, taskFilter, selectedCategoryPath, search])

  useEffect(() => {
    setPage(1)
  }, [search, boardTab, taskFilter, selectedCategoryPath, viewMode])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleCreateTicket = (draft) => {
    const now = new Date()
    const datePrefix = `NDQR${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
      now.getDate()
    ).padStart(2, "0")}`
    const sameDayCount = tickets.filter((t) => t.id.startsWith(datePrefix)).length
    const newTicket = {
      id: `${datePrefix}${String(sameDayCount + 1).padStart(3, "0")}`,
      author: CURRENT_USER,
      createdAt: now.toISOString(),
      status: STATUS.open,
      sla: "<12h",
      upvotes: 0,
      views: 0,
      replies: [],
      resolution: null,
      ...draft,
      pic: DOMAIN_PIC_MAP[draft.domain] ?? [],
    }
    setTickets((prev) => [newTicket, ...prev])
    notifySuccess("Ticket created", `Ticket ${newTicket.id} has been created.`)
  }

  const handleDrop = (status) => (e) => {
    e.preventDefault()
    const id = e.dataTransfer.getData("text/plain")
    if (!id) return
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)))
  }

  const handleCloseArchiveOpenChange = (next) => {
    setCloseArchiveOpen(next)
    if (!next) setPendingCloseId(null)
  }

  const handleCloseArchiveSubmit = (resolution) => {
    if (!pendingCloseId) return
    setTickets((prev) =>
      prev.map((t) => (t.id === pendingCloseId ? { ...t, status: STATUS.closed, resolution } : t))
    )
    notifySuccess("Ticket closed & archived", `Ticket ${pendingCloseId} has been closed and archived.`)
    setPendingCloseId(null)
  }

  return (
    <>
      {picPopoverOpen && (
        <div className="fixed inset-0 z-40" onClick={(e) => e.stopPropagation()} />
      )}
      <div className="w-full flex-1 space-y-4.5 bg-white p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6">
            <Tabs value={boardTab} onValueChange={handleBoardTabChange}>
              <TabsList variant="line">
                <TabsTrigger value="board">
                  <Presentation />
                  Board
                </TabsTrigger>
                <TabsTrigger value="archive">
                  <Archive />
                  Archive
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-2.5">
              <Select value={taskFilter} onValueChange={setTaskFilter}>
                <SelectTrigger size="sm" className="w-fit rounded-full shadow-xs">
                  <ListFilter className="size-4 text-muted-foreground" />
                  <SelectValue>{(value) => TASK_FILTER_LABELS[value]}</SelectValue>
                </SelectTrigger>
                <SelectContent align="start">
                  {TASK_FILTER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative w-[320px] shrink-0">
                <Input
                  placeholder="Search tickets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-7 pr-8 font-normal shadow-xs"
                />
                <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
          </div>

          <Button className="shrink-0" onClick={() => setNewTicketOpen(true)}>
            <Plus className="size-4" />
            New Ticket
          </Button>
        </div>

        <Tabs value={viewMode} onValueChange={setViewMode}>
          <TabsList>
            <TabsTrigger value="grid">
              <LayoutGrid />
              Grid
            </TabsTrigger>
            <TabsTrigger value="list">
              <ListIcon />
              List
            </TabsTrigger>
            {boardTab === "board" && (
              <TabsTrigger value="kanban">
                <KanbanIcon />
                Kanban
              </TabsTrigger>
            )}
          </TabsList>
        </Tabs>

        {viewMode === "grid" && (
          <GridView
            tickets={paginated}
            isEmpty={filtered.length === 0}
            archive={boardTab === "archive"}
            onPicPopoverOpenChange={setPicPopoverOpen}
          />
        )}

        {viewMode === "list" && (
          <ListView tickets={paginated} isEmpty={filtered.length === 0} archive={boardTab === "archive"} />
        )}

        {viewMode === "kanban" && (
          <div className="-mr-8">
            <KanbanView tickets={filtered} onDrop={handleDrop} onPicPopoverOpenChange={setPicPopoverOpen} />
          </div>
        )}

        {viewMode !== "kanban" && totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    setPage((p) => Math.max(1, p - 1))
                  }}
                  aria-disabled={page === 1}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <PaginationItem key={p}>
                  <PaginationLink
                    href="#"
                    isActive={p === page}
                    onClick={(e) => {
                      e.preventDefault()
                      setPage(p)
                    }}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    setPage((p) => Math.min(totalPages, p + 1))
                  }}
                  aria-disabled={page === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>

      <NewTicketDialog
        open={newTicketOpen}
        onOpenChange={setNewTicketOpen}
        onCreate={handleCreateTicket}
      />
      <CloseArchiveDialog
        open={closeArchiveOpen}
        onOpenChange={handleCloseArchiveOpenChange}
        onSubmit={handleCloseArchiveSubmit}
      />
    </>
  )
}

function GridView({ tickets, isEmpty, archive, onPicPopoverOpenChange }) {
  if (isEmpty) {
    return (
      <div className="rounded-xl border bg-white p-10 text-center text-sm text-muted-foreground">
        No tickets match your filters.
      </div>
    )
  }
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {tickets.map((t) => (
        <TicketCard key={t.id} ticket={t} archive={archive} onPicPopoverOpenChange={onPicPopoverOpenChange} />
      ))}
    </div>
  )
}

function ListView({ tickets, isEmpty, archive }) {
  const navigate = useNavigate()
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow className="h-9 border-neutral-200 bg-neutral-100 hover:bg-neutral-100">
            <TableHead className="text-sm font-medium text-neutral-600">No</TableHead>
            <TableHead className="text-sm font-medium text-neutral-600">Author</TableHead>
            <TableHead className="text-sm font-medium text-neutral-600">ID</TableHead>
            <TableHead className="text-sm font-medium text-neutral-600">Title</TableHead>
            <TableHead className="text-sm font-medium text-neutral-600">Tags</TableHead>
            <TableHead className="text-sm font-medium text-neutral-600">Status</TableHead>
            <TableHead className="text-sm font-medium text-neutral-600">Priority</TableHead>
            <TableHead className="text-sm font-medium text-neutral-600">SLA</TableHead>
            <TableHead className="text-center text-sm font-medium text-neutral-600">Upvotes</TableHead>
            <TableHead className="text-center text-sm font-medium text-neutral-600">Replies</TableHead>
            <TableHead className="text-center text-sm font-medium text-neutral-600">Views</TableHead>
            <TableHead className="text-sm font-medium text-neutral-600">Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((t, i) => (
            <TableRow
              key={t.id}
              className="cursor-pointer border-neutral-200"
              onClick={() => navigate(`/ticketing/${t.id}`)}
            >
              <TableCell className="text-sm text-foreground">{i + 1}.</TableCell>
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <Avatar size="sm">
                    {ticketAuthorAvatarUrl(t.author) && (
                      <AvatarImage src={ticketAuthorAvatarUrl(t.author)} alt={t.author} />
                    )}
                    <AvatarFallback className="font-semibold">{ticketAuthorInitials(t.author)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm text-foreground">{t.author}</span>
                    <span className="text-xs text-muted-foreground">{ticketAuthorEmail(t.author)}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-sm text-foreground">{t.id}</TableCell>
              <TableCell className="max-w-[280px] truncate text-sm text-foreground">
                {t.title}
              </TableCell>
              <TableCell className="max-w-[242px] truncate text-sm text-sky-700">
                {t.tags.map((tag) => `#${tag}`).join(" ")}
              </TableCell>
              <TableCell>
                <StatusBadge status={t.status} archive={archive} />
              </TableCell>
              <TableCell>
                <PriorityBadge priority={t.priority} />
              </TableCell>
              <TableCell>
                <span className="rounded-lg bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700">
                  SLA {t.sla}
                </span>
              </TableCell>
              <TableCell className="text-center text-sm text-foreground">{t.upvotes}</TableCell>
              <TableCell className="text-center text-sm text-foreground">{t.replies.length}</TableCell>
              <TableCell className="text-center text-sm text-foreground">{t.views}</TableCell>
              <TableCell className="text-sm text-foreground">{formatDateTime(t.createdAt)}</TableCell>
            </TableRow>
          ))}
          {isEmpty && (
            <TableRow>
              <TableCell colSpan={12} className="text-center text-muted-foreground">
                No tickets match your filters.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function KanbanView({ tickets, onDrop, onPicPopoverOpenChange }) {
  return (
    <div className="flex gap-4 overflow-x-auto pr-8 pb-2">
      {KANBAN_COLUMNS.map((col) => {
        const colTickets = tickets.filter((t) => t.status === col.status)
        return (
          <div
            key={col.status}
            className={cn("flex shrink-0 flex-col gap-4.5 rounded-2xl p-4", col.bgClass)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop(col.status)}
          >
            <div className="flex items-center justify-between">
              <StatusBadge status={col.status} variant="solid" />
              <span className={cn("text-sm font-semibold", col.countClass)}>{colTickets.length}</span>
            </div>
            <div className="flex min-h-16 flex-col gap-4.5">
              {colTickets.map((t) => (
                <TicketCard
                  key={t.id}
                  ticket={t}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", t.id)}
                  hideStatus
                  className="w-[345px] cursor-grab active:cursor-grabbing"
                  onPicPopoverOpenChange={onPicPopoverOpenChange}
                />
              ))}
              {colTickets.length === 0 && (
                <div className="rounded-lg border border-dashed border-neutral-300 p-4 text-center text-xs text-muted-foreground">
                  No tickets
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
