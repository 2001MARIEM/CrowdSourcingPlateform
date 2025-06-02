import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import "assets/plugins/nucleo/css/nucleo.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "assets/scss/argon-dashboard-react.scss";

import AdminLayout from "layouts/Admin.js";
import AuthLayout from "layouts/Auth.js";
import EvaluatorLayout from "layouts/Evaluator.js";
import { AuthProvider } from "./context/AuthContext";
import EvaluatorProfile from "views/examples/evaluator/EvaluatorProfile";
import MapPage from "views/examples/admin/MapPage";
import UserManagement from "views/examples/admin/UserManagement";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        {/* Admin routes - avec les routes imbriquées */}
        <Route path="/admin" element={<AdminLayout />}>
          {/* Toutes les pages admin seront ici comme routes imbriquées */}
          <Route path="map" element={<MapPage />} />
          <Route path="user-evaluation" element={<UserManagement/>} />

          {/* Autres routes admin */}
          <Route path="*" element={<Navigate to="/admin/index" replace />} />
        </Route>

        {/* Evaluator routes */}
        <Route path="/evaluator/*" element={<EvaluatorLayout />} />
        <Route path="/evaluator/profile" element={<EvaluatorProfile />} />

        {/* Auth routes */}
        <Route path="/auth/*" element={<AuthLayout />} />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/auth/*" replace />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);
