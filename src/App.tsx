import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AuthLogin from "./pages/AuthLogin";
import AuthSignup from "./pages/AuthSignup";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import RootErrorBoundary from "./components/RootErrorBoundary";
import {
  DashboardRoute,
  NewEnrollmentRoute,
  EnrollmentManagementRoute,
  StudentsManagementRoute,
  PlansManagementRoute,
  AITrainerRoute,
  FinancialSectionRoute,
  SettingsSectionRoute,
  PaymentManagementRoute
} from "./components/RouteComponents";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <RootErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<AuthLogin />} />
            <Route path="/signup" element={<AuthSignup />} />
            
            {/* Protected routes with layout */}
            <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route index element={<DashboardRoute />} />
              <Route path="dashboard" element={<DashboardRoute />} />
              <Route path="nova-matricula" element={<NewEnrollmentRoute />} />
              <Route path="gestao-matriculas" element={<EnrollmentManagementRoute />} />
              <Route path="alunos" element={<StudentsManagementRoute />} />
              <Route path="planos" element={<PlansManagementRoute />} />
              <Route path="ai-trainer" element={<AITrainerRoute />} />
              <Route path="financeiro" element={<FinancialSectionRoute />} />
              <Route path="pagamentos" element={<PaymentManagementRoute />} />
              <Route path="configuracoes" element={<SettingsSectionRoute />} />
            </Route>
            
            {/* Fallback for unauthenticated users */}
            <Route path="/apresentacao" element={<Index />} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </RootErrorBoundary>
);

export default App;
