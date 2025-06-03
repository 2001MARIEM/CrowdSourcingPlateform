import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import ChercheurHeader from "components/Headers/ChercheurHeader";
import ChercheurNavbar from "components/Navbars/ChercheurNavbar";

const ChercheurLayout = () => {
  const location = useLocation();

  // Afficher navbar et header seulement si ce n'est pas la page profil
  const isProfilePage = location.pathname.includes("/profile");

  return (
    <>
      <div className="main-content">
        {!isProfilePage && <ChercheurNavbar />}
        {!isProfilePage && <ChercheurHeader />}
        <div
          className={
            isProfilePage ? "container-fluid" : "container-fluid mt--7"
          }
        >
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default ChercheurLayout;
