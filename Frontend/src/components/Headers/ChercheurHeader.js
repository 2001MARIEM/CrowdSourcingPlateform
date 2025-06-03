import { useEffect, useState } from "react";
import { Card, CardBody, CardTitle, Container, Row, Col } from "reactstrap";
import { getAdminEvaluations } from "services/api";

const ChercheurHeader = () => {
  const [stats, setStats] = useState({
    totalEvaluations: 0,
    totalImages: 0,
    totalVideos: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const result = await getAdminEvaluations(); // Même API que l'admin
        if (!result.error) {
          const evaluations = result.data;

          // Calculer les statistiques
          const totalEvaluations = evaluations.length;
          const totalImages = evaluations.filter(
            (e) => e.media_info?.type === "image"
          ).length;
          const totalVideos = evaluations.filter(
            (e) => e.media_info?.type === "video"
          ).length;

          setStats({
            totalEvaluations,
            totalImages,
            totalVideos,
          });
        }
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <div className="header bg-gradient-success pb-8 pt-5 pt-md-8">
      <Container fluid>
        <div className="header-body">
          <Row>
            <Col lg="6" xl="4">
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
                        {loading ? "..." : stats.totalEvaluations}
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

            <Col lg="6" xl="4">
              <Card className="card-stats mb-4 mb-xl-0">
                <CardBody>
                  <Row>
                    <div className="col">
                      <CardTitle
                        tag="h5"
                        className="text-uppercase text-muted mb-0"
                      >
                        Images évaluées
                      </CardTitle>
                      <span className="h2 font-weight-bold mb-0">
                        {loading ? "..." : stats.totalImages}
                      </span>
                    </div>
                    <Col className="col-auto">
                      <div className="icon icon-shape bg-primary text-white rounded-circle shadow">
                        <i className="fas fa-image" />
                      </div>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>

            <Col lg="6" xl="4">
              <Card className="card-stats mb-4 mb-xl-0">
                <CardBody>
                  <Row>
                    <div className="col">
                      <CardTitle
                        tag="h5"
                        className="text-uppercase text-muted mb-0"
                      >
                        Vidéos évaluées
                      </CardTitle>
                      <span className="h2 font-weight-bold mb-0">
                        {loading ? "..." : stats.totalVideos}
                      </span>
                    </div>
                    <Col className="col-auto">
                      <div className="icon icon-shape bg-info text-white rounded-circle shadow">
                        <i className="fas fa-video" />
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

export default ChercheurHeader;
