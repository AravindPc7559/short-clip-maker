import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Upload from "./pages/dashboard/Upload";
import Status from "./pages/dashboard/Status";
import Results from "./pages/dashboard/Results";
import Settings from "./pages/dashboard/Settings";
import NotFound from "./pages/NotFound";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute, PublicRoute, RouteGuard } from "./components/auth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Root redirect */}
            <Route path="/" element={<Navigate to="/dashboard/upload" replace />} />
            
            {/* Public Routes (redirect to dashboard if authenticated) */}
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/signup" element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            } />
            
            <Route path="/dashboard/upload" element={
              <ProtectedRoute>
                <RouteGuard>
                  <DashboardLayout>
                    <Upload />
                  </DashboardLayout>
                </RouteGuard>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/status" element={
              <ProtectedRoute>
                <RouteGuard>
                  <DashboardLayout>
                    <Status />
                  </DashboardLayout>
                </RouteGuard>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/results" element={
              <ProtectedRoute>
                <RouteGuard>
                  <DashboardLayout>
                    <Results />
                  </DashboardLayout>
                </RouteGuard>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/settings" element={
              <ProtectedRoute>
                <RouteGuard>
                  <DashboardLayout>
                    <Settings />
                  </DashboardLayout>
                </RouteGuard>
              </ProtectedRoute>
            } />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
