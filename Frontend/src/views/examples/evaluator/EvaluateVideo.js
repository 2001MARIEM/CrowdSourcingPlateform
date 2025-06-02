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
import { fetchRandomVideo, submitEvaluation } from "services/api";

// Critères d'évaluation
const evaluationCriteria = [
  { label: "Beauté", key: "beauty" },
  { label: "Ennui", key: "boring" },
  { label: "Dépression", key: "depressing" },
  { label: "Vivacité", key: "lively" },
  { label: "Richesse", key: "wealthy" },
  { label: "Sécurité", key: "safe" },
];

// Convertit une URL Vimeo classique en URL iframe embarquée
const convertToVimeoEmbed = (url) => {
  const match = url.match(/vimeo\.com\/(\d+)/);
  if (match && match[1]) {
    return `https://player.vimeo.com/video/${match[1]}`;
  }
  return null;
};

const EvaluateVideo = () => {
  const [currentVideo, setCurrentVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noMoreVideos, setNoMoreVideos] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [ratings, setRatings] = useState({});
  const [comment, setComment] = useState("");

  const fetchNextVideo = async () => {
    setLoading(true);
    setShowForm(false);
    setRatings({});
    setComment("");

    const result = await fetchRandomVideo();

    if (result.error) {
      if (result.status === 404) {
        setNoMoreVideos(true);
        setCurrentVideo(null);
      } else {
        console.error("Erreur lors du chargement de la vidéo.");
      }
    } else {
      setCurrentVideo(result.data);
      setNoMoreVideos(false);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchNextVideo();
  }, []);

  const handleStarClick = (key, value) => {
    setRatings({ ...ratings, [key]: value });
  };

  const handleEvaluateClick = () => {
    setShowForm(true);
  };

  const handleSubmit = async () => {
    const mediaId = currentVideo.id;
    const result = await submitEvaluation(mediaId, ratings, comment);

    if (!result.error) {
      alert(result.message);
      fetchNextVideo();
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
                  <p className="text-center">Chargement de la vidéo...</p>
                ) : noMoreVideos ? (
                  <p className="text-center text-danger">
                    🎉 Plus de vidéos à évaluer !
                  </p>
                ) : currentVideo ? (
                  <MDBCarousel showControls={false}>
                    <MDBCarouselItem itemId="1">
                      <div className="ratio ratio-16x9">
                        <iframe
                          src={convertToVimeoEmbed(currentVideo.url)}
                          title="Vidéo à évaluer"
                          allowFullScreen
                          style={{
                            border: "none",
                            width: "100%",
                            height: "500px",
                          }}
                        />
                      </div>
                      {currentVideo.caption && (
                        <div className="text-center mt-2 text-muted">
                          <em>{currentVideo.caption}</em>
                        </div>
                      )}
                    </MDBCarouselItem>
                  </MDBCarousel>
                ) : null}
              </MDBCardBody>
              <MDBCardFooter className="text-center">
                {!showForm && !noMoreVideos && (
                  <>
                    <Button color="primary" onClick={handleEvaluateClick}>
                      Évaluer
                    </Button>
                    <Button
                      color="secondary"
                      onClick={fetchNextVideo}
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

                  <p className="mt-4 mb-2">
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

export default EvaluateVideo;
