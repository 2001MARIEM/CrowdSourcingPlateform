import { useState } from "react";
import { NavLink as NavLinkRRD, Link } from "react-router-dom";
import { PropTypes } from "prop-types";
import {
  NavbarBrand,
  Navbar,
  NavItem,
  NavLink,
  Nav,
  Container,
  Collapse,
  Button,
} from "reactstrap"; // ❌ supprimé Row et Col

const EvaluatorSidebar = (props) => {
  const [collapseOpen, setCollapseOpen] = useState();

  const toggleCollapse = () => {
    setCollapseOpen((data) => !data);
  };

  const closeCollapse = () => {
    setCollapseOpen(false);
  };

  const createLinks = (routes) => {
    return routes.map((prop, key) => {
      if (prop.layout === "/evaluator") {
        return (
          <NavItem key={key}>
            <NavLink
              to={prop.layout + prop.path}
              tag={NavLinkRRD}
              onClick={closeCollapse}
            >
              <i className={prop.icon} />
              {prop.name}
            </NavLink>
          </NavItem>
        );
      }
      return null;
    });
  };

  const { routes, logo } = props;
  let navbarBrandProps;
  if (logo && logo.innerLink) {
    navbarBrandProps = {
      to: logo.innerLink,
      tag: Link,
    };
  } else if (logo && logo.outterLink) {
    navbarBrandProps = {
      href: logo.outterLink,
      target: "_blank",
    };
  }

  return (
    <Navbar
      className="navbar-vertical fixed-left navbar-light bg-white"
      expand="md"
      id="sidenav-main"
    >
      <Container fluid>
        <Button
          className="navbar-toggler"
          type="button"
          onClick={toggleCollapse}
        >
          <span className="navbar-toggler-icon" />
        </Button>
        {logo ? (
          <NavbarBrand className="pt-0" {...navbarBrandProps}>
            <img
              alt={logo.imgAlt}
              className="navbar-brand-img"
              src={logo.imgSrc}
            />
          </NavbarBrand>
        ) : null}
        <Collapse navbar isOpen={collapseOpen}>
          <Nav navbar>{createLinks(routes)}</Nav>
        </Collapse>
      </Container>
    </Navbar>
  );
};

EvaluatorSidebar.defaultProps = {
  routes: [{}],
};

EvaluatorSidebar.propTypes = {
  routes: PropTypes.arrayOf(PropTypes.object),
  logo: PropTypes.shape({
    innerLink: PropTypes.string,
    outterLink: PropTypes.string,
    imgSrc: PropTypes.string.isRequired,
    imgAlt: PropTypes.string.isRequired,
  }),
};

export default EvaluatorSidebar;
