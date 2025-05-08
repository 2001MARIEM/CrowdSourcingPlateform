import { Container, Row, Col, Card, CardHeader, CardBody } from "reactstrap";
import Header from "components/Headers/Header.js";

const DashboardAdmin = () => {
  return (
    <>
      <Header />
      {/* Page content */}
      <Container className="mt--7" fluid>
        {/* Section bienvenue */}
        <Row>
          <Col xl="12">
            <Card className="shadow mb-4">
              <CardHeader className="bg-transparent">
                <Row className="align-items-center">
                  <div className="col">
                    <h2 className="mb-0">Bienvenue Admin</h2>
                  </div>
                </Row>
              </CardHeader>
              <CardBody>
                <div className="text-center">
                  <p>
                    Utilisez les raccourcis ci-dessous pour gérer les
                    utilisateurs, visualiser les évaluations et accéder à la
                    carte d’analyse.
                  </p>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Cartes d'accès rapide avec icônes */}
        <Row>
          <Col md="4">
            <Card className="shadow text-center">
              <CardBody>
                <div className="icon icon-shape bg-gradient-danger text-white rounded-circle mb-3">
                  <i className="fas fa-users-cog fa-2x" />
                </div>
                <h5 className="card-title">Gérer les utilisateurs</h5>
                <p className="card-text">
                  Activer/désactiver les comptes utilisateurs.
                </p>
                <a href="/admin/users" className="btn btn-primary">
                  Accéder
                </a>
              </CardBody>
            </Card>
          </Col>

          <Col md="4">
            <Card className="shadow text-center">
              <CardBody>
                <div className="icon icon-shape bg-gradient-warning text-white rounded-circle mb-3">
                  <i className="fas fa-star-half-alt fa-2x" />
                </div>
                <h5 className="card-title">Voir les évaluations</h5>
                <p className="card-text">
                  Consulter toutes les évaluations soumises.
                </p>
                <a href="/admin/evaluations" className="btn btn-primary">
                  Accéder
                </a>
              </CardBody>
            </Card>
          </Col>

          <Col md="4">
            <Card className="shadow text-center">
              <CardBody>
                <div className="icon icon-shape bg-gradient-info text-white rounded-circle mb-3">
                  <i className="fas fa-map-marked-alt fa-2x" />
                </div>
                <h5 className="card-title">Carte d’évaluation</h5>
                <p className="card-text">
                  Visualiser la répartition des évaluations sur la carte.
                </p>
                <a href="/admin/map" className="btn btn-primary">
                  Accéder
                </a>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Section future : aperçu dynamique */}
        <Row className="mt-5">
          <Col xl="12">
            <Card className="shadow">
              <CardHeader>
                <h3 className="mb-0">Statistiques dynamiques (à venir)</h3>
              </CardHeader>
              <CardBody>
                <p>
                  Graphiques, dernières évaluations, logs récents... à intégrer
                  ici plus tard.
                </p>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default DashboardAdmin;
