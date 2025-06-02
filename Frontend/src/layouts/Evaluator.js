import React from "react";
import { useLocation, Route, Routes, Navigate } from "react-router-dom";
// reactstrap components
import { Container } from "reactstrap";
// core components
import EvaluatorNavbar from "components/Navbars/EvaluatorNavbar.js";
import EvaluatorSidebar from "components/Sidebar/EvaluatorSidebar.js";
import AdminFooter from "components/Footers/AdminFooter";

import routes from "routes.js";
import EvaluateImage from "views/examples/evaluator/EvaluateImage";
import EvaluateVideo from "views/examples/evaluator/EvaluateVideo";

const Evaluator = (props) => {
  const mainContent = React.useRef(null);
  const location = useLocation();

  React.useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    mainContent.current.scrollTop = 0;
  }, [location]);

  const getRoutes = (routes) => {
    console.log("Routes disponibles:", routes);
    return routes.map((prop, key) => {
      if (prop.layout === "/evaluator") {
        return (
          <Route path={prop.path} element={prop.component} key={key} exact />
        );
      } else {
        return null;
      }
    });
  };

  const getBrandText = (path) => {
    for (let i = 0; i < routes.length; i++) {
      if (
        props?.location?.pathname.indexOf(routes[i].layout + routes[i].path) !==
        -1
      ) {
        return routes[i].name;
      }
    }
    return "Evaluator";
  };
   

  return (
    <>
      <EvaluatorSidebar
        {...props}
        routes={routes}
        // logo={{
        //   innerLink: "/evaluator/dashboard",
        //   imgSrc: require("../assets/img/brand/argon-react.png"),
        //   imgAlt: "...",
        // }}
      />
      <div className="main-content" ref={mainContent}>
        <EvaluatorNavbar
          {...props}
          brandText={getBrandText(props?.location?.pathname)}
        />
        <Routes>
          {getRoutes(routes)}
          <Route path="evaluate-image" element={<EvaluateImage />} />
          <Route path="evaluate-video" element={<EvaluateVideo />} />
          <Route
            path="*"
            element={<Navigate to="/evaluator/dashboard" replace />}
          />
        </Routes>
        <Container fluid>
          <AdminFooter />
        </Container>
      </div>
    </>
  );
};

export default Evaluator;
