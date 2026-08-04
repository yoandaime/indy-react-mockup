import { Routes, Route } from "react-router-dom"
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
      </Routes>
      <Toaster />
    </>
  )
}

export default App
