import { useEffect, useState } from "react";
import { Card, CardBody, CardTitle, Container, Row, Col } from "reactstrap";
import { getStats } from "services/api"; 

const Header = () => {
   const [stats, setStats] = useState({
    total_users: 0,
    active_users: 0,
    total_evaluations: 0,
    chercheurs_count: 0,
  });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadStats = async () => {
      const result = await getStats();
      console.log("📊 Résultat complet:", result);
      if (!result.error) {
        console.log("✅ Données reçues:", result.data);
        console.log("🔍 Type de result.data:", typeof result.data);
        console.log("🔍 Clés disponibles:", Object.keys(result.data));
        setStats(result.data);
        console.log("💾 Stats après setStats:", result.data);
      }
      setLoading(false);
    };

    loadStats();
  }, []);
  
  return (
    <div className="header bg-gradient-success pb-8 pt-5 pt-md-8">
      <Container fluid>
        <div className="header-body">
          <Row>
            <Col lg="6" xl="3">
              <Card className="card-stats mb-4 mb-xl-0">
                <CardBody>
                  <Row>
                    <div className="col">
                      <CardTitle
                        tag="h5"
                        className="text-uppercase text-muted mb-0"
                      >
                        Utilisateurs inscrits
                      </CardTitle>
                      <span className="h2 font-weight-bold mb-0">
                        {loading ? "..." : stats.total_users}
                      </span>
                    </div>
                    <Col className="col-auto">
                      <div className="icon icon-shape bg-danger text-white rounded-circle shadow">
                        <i className="fas fa-users" />
                      </div>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>

            <Col lg="6" xl="3">
              <Card className="card-stats mb-4 mb-xl-0">
                <CardBody>
                  <Row>
                    <div className="col">
                      <CardTitle
                        tag="h5"
                        className="text-uppercase text-muted mb-0"
                      >
                        Utilisateurs actifs
                      </CardTitle>
                      <span className="h2 font-weight-bold mb-0">
                        {loading ? "..." : stats.active_users}
                      </span>
                    </div>
                    <Col className="col-auto">
                      <div className="icon icon-shape bg-success text-white rounded-circle shadow">
                        <i className="fas fa-user-check" />
                      </div>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>

            <Col lg="6" xl="3">
              <Card className="card-stats mb-4 mb-xl-0">
                <CardBody>
                  <Row>
                    <div className="col">
                      <CardTitle
                        tag="h5"
                        className="text-uppercase text-muted mb-0"
                      >
                        Évaluations totales
                      </CardTitle>
                      <span className="h2 font-weight-bold mb-0">
                        {loading ? "..." : stats.total_evaluations}
                      </span>
                    </div>
                    <Col className="col-auto">
                      <div className="icon icon-shape bg-warning text-white rounded-circle shadow">
                        <i className="fas fa-clipboard-check" />
                      </div>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>

            <Col lg="6" xl="3">
              <Card className="card-stats mb-4 mb-xl-0">
                <CardBody>
                  <Row>
                    <div className="col">
                      <CardTitle
                        tag="h5"
                        className="text-uppercase text-muted mb-0"
                      >
                        Nombre de chercheurs
                      </CardTitle>
                      <span className="h2 font-weight-bold mb-0">
                        {loading ? "..." : stats.chercheurs_count}
                      </span>
                    </div>
                    <Col className="col-auto">
                      <div className="icon icon-shape bg-info text-white rounded-circle shadow">
                        <i className="fas fa-user-graduate" />{" "}
                      </div>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </Container>
    </div>
  );
};

export default Header;
