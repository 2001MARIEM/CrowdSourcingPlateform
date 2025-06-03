import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
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
        showAlertDialog(
          "error",
          "Erreur de chargement",
          "Une erreur s'est produite lors du chargement de l'image. Veuillez réessayer."
        );
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
    // Vérifier que tous les critères sont notés
    const allCriteriaRated = evaluationCriteria.every(
      (criteria) => ratings[criteria.key]
    );

    if (!allCriteriaRated) {
      showAlertDialog(
        "warning",
        "Évaluation incomplète",
        "Veuillez évaluer tous les critères avant de soumettre votre évaluation."
      );
      return;
    }

    const mediaId = currentImage.id;
    console.log("Données à envoyer : ", ratings, comment);

    const result = await submitEvaluation(mediaId, ratings, comment);
    if (!result.error) {
      showAlertDialog(
        "success",
        "Évaluation réussie !",
        result.message ||
          "Votre évaluation a été soumise avec succès. Merci pour votre contribution !",
        () => {
          setShowForm(false);
          setRatings({});
          setComment("");
          fetchNextImage();
        }
      );
    } else {
      showAlertDialog(
        "error",
        "Erreur de soumission",
        "Une erreur s'est produite lors de la soumission : " + result.message
      );
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setRatings({});
    setComment("");
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

  return (
    <>
      <EvaluatorHeader />
      <Container className="mt--7" fluid>
        <Row>
          <Col md="8" className="mx-auto">
            <MDBCard>
              <MDBCardBody>
                {loading ? (
                  <p className="text-center">Chargement de l'image...</p>
                ) : noMoreImages ? (
                  <div className="text-center">
                    <div className="mb-3">
                      <i className="fas fa-trophy fa-3x text-warning"></i>
                    </div>
                    <h4 className="text-success">🎉 Félicitations !</h4>
                    <p className="text-muted">
                      Plus de médias à évaluer pour le moment.
                    </p>
                  </div>
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
                      <i className="fas fa-star mr-2"></i>
                      Évaluer
                    </Button>
                    <Button
                      color="secondary"
                      onClick={fetchNextImage}
                      className="ms-2"
                    >
                      <i className="fas fa-forward mr-2"></i>
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
                      <span className="fw-bold" style={{ minWidth: "100px" }}>
                        {label}
                      </span>
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
                              fontSize: "1.2rem",
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

                  <div className="mt-4">
                    <p className="mb-2">
                      <strong>Commentaires </strong>
                    </p>
                    <MDBTextArea
                      rows={3}
                      value={comment}
                      maxLength={280}
                      onChange={(e) => setComment(e.target.value)}
                      className="mt-2"
                      placeholder="Ajoutez vos observations ici..."
                    />
                    <small className="text-muted">
                      {comment.length}/280 caractères
                    </small>
                  </div>
                </MDBCardBody>

                <MDBCardFooter className="text-end">
                  <Button color="success" onClick={handleSubmit}>
                    <i className="fas fa-check mr-2"></i>
                    Soumettre
                  </Button>
                  <Button
                    color="secondary"
                    onClick={handleCancel}
                    className="ms-2"
                  >
                    <i className="fas fa-times mr-2"></i>
                    Annuler
                  </Button>
                </MDBCardFooter>
              </MDBCard>
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

export default EvaluateImage;
