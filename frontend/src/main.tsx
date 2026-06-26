import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { AppShell } from "./components/AppShell";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { NetworksPage } from "./pages/NetworksPage";
import { NetworkDetailPage } from "./pages/NetworkDetailPage";
import { SitesPage } from "./pages/SitesPage";
import { SiteDetailPage } from "./pages/SiteDetailPage";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AppShell />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/networks" element={<NetworksPage />} />
            <Route path="/networks/:id" element={<NetworkDetailPage />} />
            <Route path="/sites" element={<SitesPage />} />
            <Route path="/sites/:id" element={<SiteDetailPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  </StrictMode>
);
