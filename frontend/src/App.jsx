import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Recommender from "./pages/Recommender";
import LiveImpact from "./pages/LiveImpact";
import Rewards from "./pages/Rewards";
import Community from "./pages/Community";
import Marketplace from "./pages/Marketplace";
import Simulation from "./pages/Simulation";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="recommender" element={<Recommender />} />
          <Route path="live-impact" element={<LiveImpact />} />
          <Route path="rewards" element={<Rewards />} />
          <Route path="community" element={<Community />} />
              <Route path="marketplace" element={<Marketplace />} />
              <Route path="simulation" element={<Simulation />} />

              <Route element={<ProtectedRoute requiredRole="admin" />}>
                <Route path="admin" element={<AdminDashboard />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
