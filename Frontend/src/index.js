
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import "assets/plugins/nucleo/css/nucleo.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "assets/scss/argon-dashboard-react.scss";

import AdminLayout from "layouts/Admin.js";
import AuthLayout from "layouts/Auth.js";
import EvaluatorLayout from "layouts/Evaluator.js"; // ✅ IMPORT DU LAYOUT ÉVALUATEUR
import { AuthProvider } from "./context/AuthContext"; // ✅ import correct
import EvaluatorProfile from "views/examples/evaluator/EvaluatorProfile";
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <AuthProvider>
      {/* ✅ Ajout ici */}
      <Routes>
        <Route path="/admin/*" element={<AdminLayout />} />
        <Route path="/evaluator/*" element={<EvaluatorLayout />} />{" "}
        <Route path="/evaluator/profile" element={<EvaluatorProfile />} />
        {/* ✅ AJOUT */}
        <Route path="/auth/*" element={<AuthLayout />} />
        <Route path="*" element={<Navigate to="/admin/index" replace />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);
