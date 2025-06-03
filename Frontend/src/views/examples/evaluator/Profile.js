import { useState, useEffect } from "react";
import { useAuth } from "context/AuthContext";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Form,
  Input,
  Container,
  Row,
  Col,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import UserHeader from "components/Headers/UserHeader.js";
import { updateUserProfile } from "services/api";

const Profile = () => {
  const { user, logout } = useAuth();
  const [editable, setEditable] = useState(false);
  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    email: "",
    age: "",
    secteur_activite: "",
  });
  const [loading, setLoading] = useState(false);

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
    if (user) {
      setFormData({
        prenom: user?.prenom || "",
        nom: user?.nom || "",
        email: user?.email || "",
        age: user?.age || "",
        secteur_activite: user?.secteur_activite || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const accessToken = localStorage.getItem("access_token");
      const response = await updateUserProfile(accessToken, formData);
      console.log("Profil mis à jour :", response);

      showAlertDialog(
        "success",
        "Profil mis à jour !",
        "Vos informations ont été mises à jour avec succès.",
        () => {
          setEditable(false);
        }
      );
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil :", error);

      let errorMessage =
        "Une erreur s'est produite lors de la mise à jour du profil.";

      // Extraire le message d'erreur spécifique
      if (error.response?.data) {
        const errorData = error.response.data;

        if (
          errorData.non_field_errors &&
          Array.isArray(errorData.non_field_errors)
        ) {
          errorMessage = errorData.non_field_errors[0];
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      showAlertDialog("error", "Erreur de mise à jour", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    // Réinitialiser le formulaire avec les données originales
    if (user) {
      setFormData({
        prenom: user?.prenom || "",
        nom: user?.nom || "",
        email: user?.email || "",
        age: user?.age || "",
        secteur_activite: user?.secteur_activite || "",
      });
    }
    setEditable(false);
  };

  return (
    <>
      <UserHeader />
      <Container className="mt--7" fluid>
        <Row
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "100vh" }}
        >
          <Col className="order-xl-1" xl="8">
            <Card className="bg-secondary shadow">
              <CardHeader className="bg-white border-0">
                <Row className="align-items-center">
                  <Col xs="8">
                    <h3 className="mb-0">Mon profil</h3>
                  </Col>
                  <Col className="text-right" xs="4">
                    <Button
                      color="primary"
                      onClick={() => setEditable(!editable)}
                      size="sm"
                    >
                      <i
                        className={`fas ${
                          editable ? "fa-times" : "fa-edit"
                        } mr-2`}
                      ></i>
                      {editable ? "Annuler" : "Modifier"}
                    </Button>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                <Form onSubmit={handleSubmit}>
                  <h6 className="heading-small text-muted mb-4">
                    Informations personnelles
                  </h6>
                  <div className="pl-lg-4">
                    <Row>
                      <Col lg="6">
                        <FormGroup>
                          <label htmlFor="email" className="form-control-label">
                            Email
                          </label>
                          <Input
                            className="form-control-alternative"
                            id="email"
                            value={formData.email}
                            type="email"
                            disabled={!editable}
                            onChange={handleChange}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg="6">
                        <FormGroup>
                          <label
                            htmlFor="prenom"
                            className="form-control-label"
                          >
                            Prénom
                          </label>
                          <Input
                            className="form-control-alternative"
                            id="prenom"
                            value={formData.prenom}
                            placeholder="Prénom"
                            type="text"
                            disabled={!editable}
                            onChange={handleChange}
                          />
                        </FormGroup>
                      </Col>
                      <Col lg="6">
                        <FormGroup>
                          <label htmlFor="nom" className="form-control-label">
                            Nom
                          </label>
                          <Input
                            className="form-control-alternative"
                            id="nom"
                            value={formData.nom}
                            placeholder="Nom"
                            type="text"
                            disabled={!editable}
                            onChange={handleChange}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg="6">
                        <FormGroup>
                          <label htmlFor="age" className="form-control-label">
                            Âge
                          </label>
                          <Input
                            className="form-control-alternative"
                            id="age"
                            value={formData.age}
                            placeholder="Âge"
                            type="number"
                            disabled={!editable}
                            onChange={handleChange}
                          />
                        </FormGroup>
                      </Col>
                      <Col lg="6">
                        <FormGroup>
                          <label
                            htmlFor="secteur_activite"
                            className="form-control-label"
                          >
                            Secteur d'activité
                          </label>
                          <Input
                            className="form-control-alternative"
                            id="secteur_activite"
                            value={formData.secteur_activite}
                            placeholder="Secteur d'activité"
                            type="text"
                            disabled={!editable}
                            onChange={handleChange}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    {editable && (
                      <Row>
                        <Col>
                          <Button
                            color="primary"
                            type="submit"
                            disabled={loading}
                            className="mr-2"
                          >
                            {loading ? (
                              <>
                                <i className="fas fa-spinner fa-spin mr-2"></i>
                                Sauvegarde...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-save mr-2"></i>
                                Sauvegarder les modifications
                              </>
                            )}
                          </Button>
                          <Button
                            color="secondary"
                            type="button"
                            onClick={handleCancelEdit}
                            disabled={loading}
                          >
                            <i className="fas fa-times mr-2"></i>
                            Annuler
                          </Button>
                        </Col>
                      </Row>
                    )}
                  </div>
                </Form>
              </CardBody>
            </Card>
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
          <p className="text-muted mb-0" style={{ whiteSpace: "pre-line" }}>
            {alertDialog.message}
          </p>
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

export default Profile;
