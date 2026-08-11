import { Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import Topbar from "@/components/Topbar"
import PortalPage from "@/pages/PortalPage"
import AdminPage from "@/pages/AdminPage"
import AdminDetailPage from "@/pages/AdminDetailPage"
import SubscriptionPage from "@/pages/SubscriptionPage"
import RegisterDataPage from "@/pages/RegisterDataPage"
import TicketingPage from "@/pages/TicketingPage"
import TicketingDetailPage from "@/pages/TicketingDetailPage"
import TicketingLayout from "@/components/ticketing/TicketingLayout"
import AdminControlCenterLayout from "@/pages/ticketing-admin/AdminControlCenterLayout"
import DashboardSection from "@/pages/ticketing-admin/DashboardSection"
import ExecutiveSummarySection from "@/pages/ticketing-admin/ExecutiveSummarySection"
import AuditLogSection from "@/pages/ticketing-admin/AuditLogSection"
import ManageUsersSection from "@/pages/ticketing-admin/ManageUsersSection"
import ContentModerationSection from "@/pages/ticketing-admin/ContentModerationSection"
import ManageCategoriesSection from "@/pages/ticketing-admin/ManageCategoriesSection"

function App() {
  return (
    <>
      <Topbar />
      <Routes>
        <Route path="/" element={<PortalPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/:id" element={<AdminDetailPage />} />
        <Route path="/subscription" element={<SubscriptionPage />} />
        <Route path="/enrich-data/register" element={<RegisterDataPage />} />
        <Route path="/ticketing" element={<TicketingLayout />}>
          <Route index element={<TicketingPage />} />
          <Route path=":id" element={<TicketingDetailPage />} />
        </Route>
        <Route path="/ticketing/admin" element={<AdminControlCenterLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardSection />} />
          <Route path="executive-summary" element={<ExecutiveSummarySection />} />
          <Route path="audit-log" element={<AuditLogSection />} />
          <Route path="manage-users" element={<ManageUsersSection />} />
          <Route path="content-moderation" element={<ContentModerationSection />} />
          <Route path="content-moderation/:id" element={<TicketingDetailPage />} />
          <Route path="manage-categories" element={<ManageCategoriesSection />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  )
}

export default App
