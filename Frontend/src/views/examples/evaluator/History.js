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
import {
  Container,
  Row,
  Col,
  Button,
  ButtonGroup,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import EvaluatorHeader from "components/Headers/EvaluatorHeader";
import { getUserEvaluationHistory, updateEvaluation } from "services/api";

// Liste des critères d'évaluation
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

  // État pour l'alert dialog
  const [alertDialog, setAlertDialog] = useState({
    isOpen: false,
    type: "success", // 'success', 'error', 'warning'
    title: "",
    message: "",
    onConfirm: null,
  });

  // Fonction pour afficher l'alert dialog
  const showAlertDialog = (type, title, message, onConfirm = null) => {
    setAlertDialog({
      isOpen: true,
      type: type,
      title: title,
      message: message,
      onConfirm: onConfirm,
    });
  };

  // Fermer l'alert dialog
  const closeAlertDialog = () => {
    if (alertDialog.onConfirm) {
      alertDialog.onConfirm();
    }
    setAlertDialog({
      isOpen: false,
      type: "success",
      title: "",
      message: "",
      onConfirm: null,
    });
  };

  // Icônes et couleurs selon le type d'alerte
  const getAlertIcon = (type) => {
    switch (type) {
      case "success":
        return <i className="fas fa-check-circle fa-3x text-success mb-3"></i>;
      case "error":
        return <i className="fas fa-times-circle fa-3x text-danger mb-3"></i>;
      case "warning":
        return (
          <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
        );
      default:
        return <i className="fas fa-info-circle fa-3x text-info mb-3"></i>;
    }
  };

  const getButtonColor = (type) => {
    switch (type) {
      case "success":
        return "success";
      case "error":
        return "danger";
      case "warning":
        return "warning";
      default:
        return "primary";
    }
  };

  useEffect(() => {
    const loadHistory = async () => {
      const result = await getUserEvaluationHistory();
      if (!result.error) {
        setEvaluations(result.data);
      } else {
        showAlertDialog(
          "error",
          "Erreur de chargement",
          "Une erreur s'est produite lors du chargement de l'historique : " +
            result.message.message
        );
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

  const handleCancelEdit = () => {
    setActiveEditId(null);
    setRatings({});
    setComment("");
  };

  const handleStarClick = (key, value) => {
    setRatings({ ...ratings, [key]: value });
  };

  const handleSubmitUpdate = async (evaluationId) => {
    const result = await updateEvaluation(evaluationId, ratings, comment);
    if (!result.error) {
      showAlertDialog(
        "success",
        "Modification réussie !",
        "Votre évaluation a été modifiée avec succès.",
        () => {
          setActiveEditId(null);
          setReload(!reload);
        }
      );
    } else {
      const errorMessage =
        result.status === 403
          ? "Modification non autorisée. Les évaluations ne peuvent être modifiées que dans les 24h suivant leur création."
          : "Une erreur s'est produite lors de la modification : " +
            result.message.message;

      showAlertDialog("error", "Erreur de modification", errorMessage);
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
                        <>
                          <Button
                            color="success"
                            onClick={() => handleSubmitUpdate(evalItem.id)}
                            className="me-2"
                          >
                            <i className="fas fa-check mr-2"></i>
                            Sauvegarder
                          </Button>
                          <Button color="secondary" onClick={handleCancelEdit}>
                            <i className="fas fa-times mr-2"></i>
                            Annuler
                          </Button>
                        </>
                      ) : (
                        new Date() - new Date(evalItem.created_at) <
                          24 * 60 * 60 * 1000 && (
                          <Button
                            color="primary"
                            onClick={() => handleEditClick(evalItem)}
                          >
                            <i className="fas fa-edit mr-2"></i>
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

      {/* Alert Dialog Modal */}
      <Modal
        isOpen={alertDialog.isOpen}
        centered
        backdrop="static"
        keyboard={false}
        size="sm"
      >
        <ModalHeader className="border-0 pb-0">
          <div className="text-center w-100">
            {getAlertIcon(alertDialog.type)}
          </div>
        </ModalHeader>
        <ModalBody className="text-center pt-0">
          <h5 className="mb-3">{alertDialog.title}</h5>
          <p className="text-muted mb-0">{alertDialog.message}</p>
        </ModalBody>
        <ModalFooter className="border-0 justify-content-center">
          <Button
            color={getButtonColor(alertDialog.type)}
            onClick={closeAlertDialog}
            className="px-4"
          >
            OK
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default History;
