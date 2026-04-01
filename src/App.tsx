import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/components/AppLayout";
import LoginPage from "@/pages/LoginPage";
import LeadManagementPage from "@/pages/LeadManagementPage";
import CustomersPage from "@/pages/CustomersPage";
import CarriersPage from "@/pages/CarriersPage";
import EmployeesPage from "@/pages/EmployeesPage";
import ReportsPage from "@/pages/ReportsPage";
import ParcelManagementPage from "@/pages/ParcelManagementPage";
import SettingsPage from "@/pages/SettingsPage";
import ExpensesPage from "@/pages/ExpensesPage";
import NotFound from "@/pages/NotFound";
import { useAuthStore } from "@/store/authStore";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/leads" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/" element={<Navigate to="/leads" replace />} />
          
          <Route path="/leads" element={<ProtectedRoute><AppLayout><LeadManagementPage /></AppLayout></ProtectedRoute>} />
          <Route path="/parcels" element={<ProtectedRoute><AppLayout><ParcelManagementPage /></AppLayout></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute><AppLayout><CustomersPage /></AppLayout></ProtectedRoute>} />
          <Route path="/carriers" element={<ProtectedRoute><AppLayout><CarriersPage /></AppLayout></ProtectedRoute>} />
          <Route path="/employees" element={<ProtectedRoute><AppLayout><EmployeesPage /></AppLayout></ProtectedRoute>} />
          <Route path="/expenses" element={<ProtectedRoute><AppLayout><ExpensesPage /></AppLayout></ProtectedRoute>} />
          
          {/* Admin only routes */}
          <Route path="/reports" element={<ProtectedRoute allowedRoles={['admin']}><AppLayout><ReportsPage /></AppLayout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute allowedRoles={['admin']}><AppLayout><SettingsPage /></AppLayout></ProtectedRoute>} />
          
          <Route path="*" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
