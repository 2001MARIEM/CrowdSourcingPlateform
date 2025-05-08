import React from "react";
import { Container, Row, Col, Nav, NavItem, NavLink } from "reactstrap";

const Footer = () => {
  return (
    <footer className="footer">
      <Container fluid>
        <Row className="align-items-center justify-content-xl-between">
          <Col xl="6">
            <div className="copyright text-center text-xl-left text-muted">
              © {new Date().getFullYear()}{" "}
              <a
                className="font-weight-bold ml-1"
                href="#"
                rel="noopener noreferrer"
              >
                Chaima Filali | Mariem Ltifi
              </a>{" "}
              - Projet PFA 
            </div>
          </Col>

          <Col xl="6">
            <Nav className="nav-footer justify-content-center justify-content-xl-end">
              <NavItem>
                <NavLink
                  href="https://github.com/2001MARIEM/CrowdSourcingPlateform"
                  target="_blank"
                >
                  GitHub
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="/contact">Contact</NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="/mentions-legales">Mentions légales</NavLink>
              </NavItem>
            </Nav>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
