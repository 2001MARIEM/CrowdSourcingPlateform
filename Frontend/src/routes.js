import DashboardAdmin from "views/examples/admin/DashboardAdmin.js";
import UserManagement from "views/examples/admin/UserManagement.js";
import MediaManagement from "views/examples/admin/MediaManagement.js";
import MapPage from "views/examples/admin/MapPage.js";

import DashboardEvaluator from "views/examples/evaluator/DashboardEvaluator.js";
import Evaluation from "views/examples/evaluator/Evaluation.js";
import History from "views/examples/evaluator/History.js";

import Login from "views/examples/auth/Login.js";
import Register from "views/examples/auth/Register.js";
import EvaluateImage from "views/examples/evaluator/EvaluateImage";
import EvaluateVideo from "views/examples/evaluator/EvaluateVideo";

var routes = [
  // Admin Routes
  {
    path: "/dashboard",
    name: "Dashboard Admin",
    icon: "ni ni-tv-2 text-primary",
    component: <DashboardAdmin />,
    layout: "/admin",
  },
  {
    path: "/user-management",
    name: "Gestion des utilisateurs",
    icon: "ni ni-single-02 text-blue",
    component: <UserManagement />,
    layout: "/admin",
  },
   
  {
    path: "/map",
    name: "Carte des évaluations",
    icon: "ni ni-map-big text-green",
    component: <MapPage />,
    layout: "/admin",
  },

  // Evaluator Routes
  {
    path: "/dashboard",
    name: "Dashboard Évaluateur",
    icon: "ni ni-tv-2 text-success",
    component: <DashboardEvaluator />,
    layout: "/evaluator",
  },
   

   
  {
    path: "/history",
    name: "Historique",
    icon: "ni ni-archive-2 text-warning",
    component: <History />,
    layout: "/evaluator",
  },

  // Auth Routes (pas dans Sidebar)
  {
    path: "/login",
    name: "Connexion",
    component: <Login />,
    layout: "/auth",
  },
  {
    path: "/register",
    name: "Inscription",
    component: <Register />,
    layout: "/auth",
  },
];

export default routes;
