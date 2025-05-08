import React, { useEffect, useState } from "react";
import {
  MDBCard,
  MDBCardBody,
  MDBCardImage,
  MDBCardTitle,
  MDBCardText,
  MDBIcon,
  MDBCardFooter,
  MDBTextArea,
} from "mdb-react-ui-kit";
import { Container, Row, Col, Button, ButtonGroup } from "reactstrap";
import EvaluatorHeader from "components/Headers/EvaluatorHeader";
import { getUserEvaluationHistory, updateEvaluation } from "services/api";

// Liste des critères d’évaluation
const evaluationCriteria = [
  { label: "Beauté", key: "beauty" },
  { label: "Ennui", key: "boring" },
  { label: "Dépression", key: "depressing" },
  { label: "Vivacité", key: "lively" },
  { label: "Richesse", key: "wealthy" },
  { label: "Sécurité", key: "safe" },
];

// Convertit une URL Vimeo en URL embarquée
const convertToVimeoEmbed = (url) => {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? `https://player.vimeo.com/video/${match[1]}` : url;
};

const History = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [activeEditId, setActiveEditId] = useState(null);
  const [ratings, setRatings] = useState({});
  const [comment, setComment] = useState("");
  const [reload, setReload] = useState(false);
  const [filter, setFilter] = useState("all"); // "all", "image", "video"

  useEffect(() => {
    const loadHistory = async () => {
      const result = await getUserEvaluationHistory();
      if (!result.error) {
        setEvaluations(result.data);
      } else {
        alert("Erreur : " + result.message.message);
      }
    };
    loadHistory();
  }, [reload]);

  const handleEditClick = (evalItem) => {
    setActiveEditId(evalItem.id);
    setRatings({
      beauty: evalItem.beauty,
      boring: evalItem.boring,
      depressing: evalItem.depressing,
      lively: evalItem.lively,
      wealthy: evalItem.wealthy,
      safe: evalItem.safe,
    });
    setComment(evalItem.comment || "");
  };

  const handleStarClick = (key, value) => {
    setRatings({ ...ratings, [key]: value });
  };

  const handleSubmitUpdate = async (evaluationId) => {
    const result = await updateEvaluation(evaluationId, ratings, comment);
    if (!result.error) {
      alert("Évaluation modifiée !");
      setActiveEditId(null);
      setReload(!reload);
    } else {
      alert(
        result.status === 403
          ? "Modification non autorisée (évaluation trop ancienne)."
          : "Erreur : " + result.message.message
      );
    }
  };

  // Filtrage selon le type
  const filteredEvaluations = evaluations.filter((evalItem) => {
    if (filter === "all") return true;
    const isVideo = evalItem.media.url.includes("vimeo.com");
    return filter === "video" ? isVideo : !isVideo;
  });

  return (
    <>
      <EvaluatorHeader />
      <Container className="mt--7" fluid>
        <Row>
          <Col md="10" className="mx-auto">
            <h2 className="mb-4">Historique des évaluations</h2>

            <div className="mb-4 text-center">
              <ButtonGroup>
                <Button
                  color={filter === "all" ? "primary" : "secondary"}
                  onClick={() => setFilter("all")}
                >
                  Tous
                </Button>
                <Button
                  color={filter === "image" ? "primary" : "secondary"}
                  onClick={() => setFilter("image")}
                >
                  Images
                </Button>
                <Button
                  color={filter === "video" ? "primary" : "secondary"}
                  onClick={() => setFilter("video")}
                >
                  Vidéos
                </Button>
              </ButtonGroup>
            </div>

            {filteredEvaluations.length === 0 ? (
              <p>Aucune évaluation trouvée.</p>
            ) : (
              filteredEvaluations.map((evalItem) => {
                const isVideo = evalItem.media.url.includes("vimeo.com");
                return (
                  <MDBCard className="mb-4" key={evalItem.id}>
                    {isVideo ? (
                      <div className="ratio ratio-16x9">
                        <iframe
                          src={convertToVimeoEmbed(evalItem.media.url)}
                          title="Vidéo évaluée"
                          allowFullScreen
                          style={{ border: "none" }}
                        />
                      </div>
                    ) : (
                      <MDBCardImage
                        src={evalItem.media.url}
                        position="top"
                        alt="Image évaluée"
                        style={{ maxHeight: "400px", objectFit: "cover" }}
                      />
                    )}

                    <MDBCardBody>
                      <MDBCardTitle>
                        Évalué le :{" "}
                        {new Date(evalItem.created_at).toLocaleString()}
                      </MDBCardTitle>

                      {evaluationCriteria.map(({ label, key }) => (
                        <div
                          key={key}
                          className="d-flex align-items-center mb-2"
                        >
                          <strong className="me-3" style={{ width: "120px" }}>
                            {label} :
                          </strong>
                          <div>
                            {[1, 2, 3, 4, 5].map((value) => (
                              <MDBIcon
                                key={value}
                                icon="star"
                                fas
                                className={`me-1 ${
                                  (activeEditId === evalItem.id
                                    ? ratings[key]
                                    : evalItem[key]) >= value
                                    ? "text-warning"
                                    : "text-muted"
                                }`}
                                style={{
                                  cursor:
                                    activeEditId === evalItem.id
                                      ? "pointer"
                                      : "default",
                                }}
                                onClick={() =>
                                  activeEditId === evalItem.id &&
                                  handleStarClick(key, value)
                                }
                              />
                            ))}
                          </div>
                        </div>
                      ))}

                      <div className="mt-3">
                        <strong>Commentaire :</strong>
                        {activeEditId === evalItem.id ? (
                          <>
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
                          </>
                        ) : (
                          <MDBCardText className="mt-2">
                            {evalItem.comment || "—"}
                          </MDBCardText>
                        )}
                      </div>
                    </MDBCardBody>

                    <MDBCardFooter className="text-end">
                      {activeEditId === evalItem.id ? (
                        <Button
                          color="success"
                          onClick={() => handleSubmitUpdate(evalItem.id)}
                        >
                          Sauvegarder
                        </Button>
                      ) : (
                        new Date() - new Date(evalItem.created_at) <
                          24 * 60 * 60 * 1000 && (
                          <Button
                            color="primary"
                            onClick={() => handleEditClick(evalItem)}
                          >
                            Modifier
                          </Button>
                        )
                      )}
                    </MDBCardFooter>
                  </MDBCard>
                );
              })
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default History;
