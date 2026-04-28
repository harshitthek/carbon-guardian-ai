import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import Dashboard from "./pages/Dashboard";
import Footprint from "./pages/Footprint";
import Recommender from "./pages/Recommender";
import LiveImpact from "./pages/LiveImpact";
import Rewards from "./pages/Rewards";
import Community from "./pages/Community";
import Marketplace from "./pages/Marketplace";
import Simulation from "./pages/Simulation";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="footprint" element={<Footprint />} />
          <Route path="recommender" element={<Recommender />} />
          <Route path="live-impact" element={<LiveImpact />} />
          <Route path="rewards" element={<Rewards />} />
          <Route path="community" element={<Community />} />
          <Route path="marketplace" element={<Marketplace />} />
          <Route path="simulation" element={<Simulation />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
