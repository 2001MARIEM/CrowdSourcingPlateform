import {
  Container,
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  Button,
  CardTitle,
  CardText,
} from "reactstrap";
import Header from "components/Headers/EvaluatorHeader.js";
import { useNavigate } from "react-router-dom";

const DashboardEvaluator = () => {
  const navigate = useNavigate();

  const handleSelectMode = (mode) => {
    console.log("Mode choisi :", mode);
    if (mode === "image") {
      navigate("/evaluator/evaluate-image");
    } else if (mode === "video") {
      navigate("/evaluator/evaluate-video");
    }
  };

  return (
    <>
      <Header />
      <Container className="mt--7" fluid>
        <Row>
          <Col xl="12">
            <Card className="shadow">
              <CardHeader className="bg-transparent">
                <h2 className="mb-0">Bienvenue Chère  Évaluateur choisissez votre mode d'évaluation </h2>
              </CardHeader>
              <CardBody>
                <Row className="text-center">
                  <Col md="6" className="mb-4">
                    <Card className="shadow">
                      <CardBody>
                        <div style={{ fontSize: "2rem" }}>📷</div>
                        <CardTitle tag="h5" className="mt-2">
                          Évaluer des Images
                        </CardTitle>
                        <CardText>
                          Lancez une session d'évaluation avec des images.
                        </CardText>
                        <Button
                          color="primary"
                          onClick={() => handleSelectMode("image")}
                        >
                          Commencer
                        </Button>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col md="6" className="mb-4">
                    <Card className="shadow">
                      <CardBody>
                        <div style={{ fontSize: "2rem" }}>🎥</div>
                        <CardTitle tag="h5" className="mt-2">
                          Évaluer des Vidéos
                        </CardTitle>
                        <CardText>
                          Lancez une session d'évaluation avec des vidéos.
                        </CardText>
                        <Button
                          color="primary"
                          onClick={() => handleSelectMode("video")}
                        >
                          Commencer
                        </Button>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default DashboardEvaluator;
