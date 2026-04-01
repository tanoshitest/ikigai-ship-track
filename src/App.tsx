import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/components/AppLayout";
import DashboardPage from "@/pages/DashboardPage";
import LeadManagementPage from "@/pages/LeadManagementPage";
import CustomersPage from "@/pages/CustomersPage";
import CarriersPage from "@/pages/CarriersPage";
import EmployeesPage from "@/pages/EmployeesPage";
import ReportsPage from "@/pages/ReportsPage";
import ParcelManagementPage from "@/pages/ParcelManagementPage";
import SettingsPage from "@/pages/SettingsPage";
import ExpensesPage from "@/pages/ExpensesPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/leads" replace />} />
          <Route path="/leads" element={<AppLayout><LeadManagementPage /></AppLayout>} />
          <Route path="/parcels" element={<AppLayout><ParcelManagementPage /></AppLayout>} />
          <Route path="/customers" element={<AppLayout><CustomersPage /></AppLayout>} />
          <Route path="/carriers" element={<AppLayout><CarriersPage /></AppLayout>} />
          <Route path="/employees" element={<AppLayout><EmployeesPage /></AppLayout>} />
          <Route path="/reports" element={<AppLayout><ReportsPage /></AppLayout>} />
          <Route path="/settings" element={<AppLayout><SettingsPage /></AppLayout>} />
          <Route path="/expenses" element={<AppLayout><ExpensesPage /></AppLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
