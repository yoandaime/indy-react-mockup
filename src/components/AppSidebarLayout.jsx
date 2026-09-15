import { Outlet, useLocation } from "react-router-dom"
import AppSidebar from "@/components/AppSidebar"
import ViewModeBar from "@/components/ViewModeBar"

export default function AppSidebarLayout() {
  const { pathname } = useLocation()
  const showViewModeBar = pathname.startsWith("/enrich-data/admin")

  return (
    <div className="flex h-screen w-full items-start bg-white">
      <AppSidebar />
      <div className="flex h-full min-w-0 flex-1 flex-col items-start">
        <div className="flex min-w-0 w-full flex-1 items-start overflow-hidden">
          <Outlet />
        </div>
        {showViewModeBar && <ViewModeBar />}
      </div>
    </div>
  )
}
