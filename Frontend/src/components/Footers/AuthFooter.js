import React from "react";
import { Container, Row, Col } from "reactstrap";

const AdminFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer pt-0">
      <Container fluid>
        <Row className="align-items-center justify-content-lg-between">
          <Col lg="6" className="text-center text-lg-left text-muted">
            © {currentYear}{" "}
            <a
              className="font-weight-bold ml-1"
              href="#"
              target="_blank"
              rel="noopener noreferrer"
            >
              Chaima Filali | Mariem Ltifi | Projet PFA | CrouwdSourcing
            </a>
          </Col>
          <Col lg="6">
            <nav className="nav nav-footer justify-content-center justify-content-lg-end">
              <a
                href="https://github.com/2001MARIEM/CrowdSourcingPlateform"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link"
              >
                GitHub
              </a>
              <a href="/contact" className="nav-link">
                Contact
              </a>
            </nav>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default AdminFooter;
