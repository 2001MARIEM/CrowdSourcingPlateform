import { useEffect, useState } from "react";
import { Card, CardBody, CardTitle, Container, Row, Col } from "reactstrap";
import axios from "axios";

const Header = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalEvaluations: 0,
    averagePerUser: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await axios.get("http://localhost:8000/api/admin/stats/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = res.data;

        setStats({
          totalUsers: data.total_users,
          activeUsers: data.active_users,
          totalEvaluations: data.total_evaluations,
          averagePerUser:
            data.active_users > 0
              ? (data.total_evaluations / data.active_users).toFixed(1)
              : 0,
        });
      } catch (error) {
        console.error("Erreur récupération stats admin :", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="header bg-gradient-info pb-8 pt-5 pt-md-8">
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
                        {stats.totalUsers}
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
                        {stats.activeUsers}
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
                        {stats.totalEvaluations}
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
                        Moyenne par utilisateur
                      </CardTitle>
                      <span className="h2 font-weight-bold mb-0">
                        {stats.averagePerUser}
                      </span>
                    </div>
                    <Col className="col-auto">
                      <div className="icon icon-shape bg-info text-white rounded-circle shadow">
                        <i className="fas fa-chart-line" />
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
