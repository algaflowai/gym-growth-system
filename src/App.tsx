import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";
import AuthLogin from "./pages/AuthLogin";
import AuthSignup from "./pages/AuthSignup";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import RootErrorBoundary from "./components/RootErrorBoundary";
import NotFound from "./pages/NotFound";
import { LoadingSpinner } from "./components/shared/LoadingSpinner";

// Lazy load route components for better performance
const DashboardRoute = lazy(() => import("./components/RouteComponents").then(m => ({ default: m.DashboardRoute })));
const NewEnrollmentRoute = lazy(() => import("./components/RouteComponents").then(m => ({ default: m.NewEnrollmentRoute })));
const EnrollmentManagementRoute = lazy(() => import("./components/RouteComponents").then(m => ({ default: m.EnrollmentManagementRoute })));
const StudentsManagementRoute = lazy(() => import("./components/RouteComponents").then(m => ({ default: m.StudentsManagementRoute })));
const PlansManagementRoute = lazy(() => import("./components/RouteComponents").then(m => ({ default: m.PlansManagementRoute })));
const AITrainerRoute = lazy(() => import("./components/RouteComponents").then(m => ({ default: m.AITrainerRoute })));
const FinancialSectionRoute = lazy(() => import("./components/RouteComponents").then(m => ({ default: m.FinancialSectionRoute })));
const SettingsSectionRoute = lazy(() => import("./components/RouteComponents").then(m => ({ default: m.SettingsSectionRoute })));
const PaymentManagementRoute = lazy(() => import("./components/RouteComponents").then(m => ({ default: m.PaymentManagementRoute })));

// Configure React Query with optimized defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1,
    },
  },
});

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" text="Carregando..." />
  </div>
);

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
              <Route index element={
                <Suspense fallback={<PageLoader />}>
                  <DashboardRoute />
                </Suspense>
              } />
              <Route path="dashboard" element={
                <Suspense fallback={<PageLoader />}>
                  <DashboardRoute />
                </Suspense>
              } />
              <Route path="nova-matricula" element={
                <Suspense fallback={<PageLoader />}>
                  <NewEnrollmentRoute />
                </Suspense>
              } />
              <Route path="gestao-matriculas" element={
                <Suspense fallback={<PageLoader />}>
                  <EnrollmentManagementRoute />
                </Suspense>
              } />
              <Route path="alunos" element={
                <Suspense fallback={<PageLoader />}>
                  <StudentsManagementRoute />
                </Suspense>
              } />
              <Route path="planos" element={
                <Suspense fallback={<PageLoader />}>
                  <PlansManagementRoute />
                </Suspense>
              } />
              <Route path="ai-trainer" element={
                <Suspense fallback={<PageLoader />}>
                  <AITrainerRoute />
                </Suspense>
              } />
              <Route path="financeiro" element={
                <Suspense fallback={<PageLoader />}>
                  <FinancialSectionRoute />
                </Suspense>
              } />
              <Route path="pagamentos" element={
                <Suspense fallback={<PageLoader />}>
                  <PaymentManagementRoute />
                </Suspense>
              } />
              <Route path="configuracoes" element={
                <Suspense fallback={<PageLoader />}>
                  <SettingsSectionRoute />
                </Suspense>
              } />
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
