import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button } from "reactstrap";
import EvaluatorHeader from "components/Headers/EvaluatorHeader";
import {
  MDBCarousel,
  MDBCarouselItem,
  MDBCard,
  MDBCardBody,
  MDBCardFooter,
  MDBTextArea,
  MDBIcon,
} from "mdb-react-ui-kit";
import { fetchRandomImage, submitEvaluation } from "services/api";

// Les critères avec labels (fr) et clés backend (en)
const evaluationCriteria = [
  { label: "Beauté", key: "beauty" },
  { label: "Ennui", key: "boring" },
  { label: "Dépression", key: "depressing" },
  { label: "Vivacité", key: "lively" },
  { label: "Richesse", key: "wealthy" },
  { label: "Sécurité", key: "safe" },
];

const EvaluateImage = () => {
  const [currentImage, setCurrentImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noMoreImages, setNoMoreImages] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [ratings, setRatings] = useState({});
  const [comment, setComment] = useState("");

  const fetchNextImage = async () => {
    setLoading(true);
    setShowForm(false);
    setRatings({});
    setComment("");

    const result = await fetchRandomImage();

    if (result.error) {
      if (result.status === 404) {
        setNoMoreImages(true);
        setCurrentImage(null);
      } else {
        console.error("Erreur lors du chargement de l'image.");
      }
    } else {
      setCurrentImage(result.data);
      setNoMoreImages(false);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchNextImage();
  }, []);

  const handleStarClick = (key, value) => {
    setRatings({ ...ratings, [key]: value });
  };

  const handleEvaluateClick = () => {
    setShowForm(true);
  };

  const handleSubmit = async () => {
    const mediaId = currentImage.id;
    console.log("Données à envoyer : ", ratings, comment);

    const result = await submitEvaluation(mediaId, ratings, comment);
    if (!result.error) {
      alert(result.message);
      setShowForm(false);
      setRatings({});
      setComment("");
      fetchNextImage();
    } else {
      alert("Erreur lors de la soumission : " + result.message);
    }
  };

  return (
    <>
      <EvaluatorHeader />
      <Container className="mt--7" fluid>
        <Row>
          <Col md="8" className="mx-auto">
            <MDBCard>
              <MDBCardBody>
                {loading ? (
                  <p className="text-center">Chargement de l’image...</p>
                ) : noMoreImages ? (
                  <p className="text-center text-danger">
                    🎉 Plus de médias à évaluer !
                  </p>
                ) : currentImage ? (
                  <MDBCarousel showControls={false}>
                    <MDBCarouselItem itemId="1">
                      <img
                        src={currentImage.url}
                        className="d-block mx-auto"
                        style={{
                          maxHeight: "500px",
                          width: "auto",
                          objectFit: "contain",
                        }}
                        alt={currentImage.caption || "Image à évaluer"}
                      />
                      {currentImage.caption && (
                        <div className="text-center mt-2 text-muted">
                          <em>{currentImage.caption}</em>
                        </div>
                      )}
                    </MDBCarouselItem>
                  </MDBCarousel>
                ) : null}
              </MDBCardBody>
              <MDBCardFooter className="text-center">
                {!showForm && !noMoreImages && (
                  <>
                    <Button color="primary" onClick={handleEvaluateClick}>
                      Évaluer
                    </Button>
                    <Button
                      color="secondary"
                      onClick={fetchNextImage}
                      className="ms-2"
                    >
                      Passer
                    </Button>
                  </>
                )}
              </MDBCardFooter>
            </MDBCard>

            {showForm && (
              <MDBCard className="mt-4">
                <MDBCardBody>
                  <p className="text-center mb-4">
                    <strong>Évaluez selon les critères suivants :</strong>
                  </p>

                  {evaluationCriteria.map(({ label, key }) => (
                    <div
                      key={key}
                      className="d-flex justify-content-center align-items-center mb-3"
                      style={{ gap: "3rem" }}
                    >
                      <span className="fw-bold">{label}</span>
                      <div className="d-flex">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <MDBIcon
                            key={value}
                            icon="star"
                            far={ratings[key] < value}
                            fas={ratings[key] >= value}
                            className={`mx-1 ${
                              ratings[key] >= value
                                ? "text-warning"
                                : "text-muted"
                            }`}
                            onClick={() => handleStarClick(key, value)}
                            style={{
                              cursor: "pointer",
                              color:
                                ratings[key] < value ? "#6c757d" : "#ffca28",
                              textShadow:
                                ratings[key] < value
                                  ? "0px 0px 3px rgba(0, 0, 0, 0.3)"
                                  : "none",
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}

                  <p className="mt-4 mb-2" maxLength={280}>
                    <strong>Commentaires  </strong>
                  </p>
                  <MDBTextArea
                      rows={3}
                      value={comment}
                      maxLength={280}
                      onChange={(e) => setComment(e.target.value)}
                      className="mt-2"
                    />
                    <small className="text-muted">
                      {comment.length}/280 caractères
                    </small>
                </MDBCardBody>

                <MDBCardFooter className="text-end">
                  <Button color="success" onClick={handleSubmit}>
                    Soumettre
                  </Button>
                </MDBCardFooter>
              </MDBCard>
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default EvaluateImage;
