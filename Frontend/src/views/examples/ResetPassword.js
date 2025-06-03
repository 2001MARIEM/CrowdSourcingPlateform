import React from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
// reactstrap components
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";

// core components
import AuthNavbar from "components/Navbars/AuthNavbar.js";
import ResetNavbar from "components/Navbars/ResetNavbar";
import AuthFooter from "components/Footers/AuthFooter.js";
import { resetPassword } from "services/api";

const ResetPasswordPage = () => {
  const mainContent = React.useRef(null);
  const location = useLocation();
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Alert Dialog State
  const [alertDialog, setAlertDialog] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
    callback: null,
  });

  React.useEffect(() => {
    document.body.classList.add("bg-dark");
    return () => {
      document.body.classList.remove("bg-dark");
    };
  }, []);

  React.useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    mainContent.current.scrollTop = 0;
  }, [location]);

  const showAlertDialog = (type, title, message, callback = null) => {
    setAlertDialog({
      show: true,
      type,
      title,
      message,
      callback,
    });
  };

  const closeAlertDialog = () => {
    if (alertDialog.callback) {
      alertDialog.callback();
    }
    setAlertDialog({
      show: false,
      type: "",
      title: "",
      message: "",
      callback: null,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation côté client
    if (!password || !confirmPassword) {
      showAlertDialog(
        "warning",
        "Champs requis",
        "Veuillez remplir tous les champs."
      );
      return;
    }

    if (password !== confirmPassword) {
      showAlertDialog(
        "warning",
        "Mots de passe différents",
        "Les mots de passe ne correspondent pas."
      );
      return;
    }

    if (password.length < 6) {
      showAlertDialog(
        "warning",
        "Mot de passe trop court",
        "Le mot de passe doit contenir au moins 6 caractères."
      );
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword(token, password);

      if (result.error) {
        showAlertDialog("error", "Erreur", result.message);
      } else {
        showAlertDialog(
          "success",
          "Mot de passe mis à jour !",
          "Votre mot de passe a été mis à jour avec succès. Vous allez être redirigé vers la page de connexion.",
          () => {
            navigate("/auth/login");
          }
        );
      }
    } catch (error) {
      showAlertDialog(
        "error",
        "Erreur",
        "Une erreur s'est produite lors de la réinitialisation."
      );
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = () => {
    switch (alertDialog.type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      default:
        return "ℹ️";
    }
  };

  const getAlertColor = () => {
    switch (alertDialog.type) {
      case "success":
        return "success";
      case "error":
        return "danger";
      case "warning":
        return "warning";
      default:
        return "info";
    }
  };

  return (
    <>
      <div className="main-content" ref={mainContent}>
        <ResetNavbar />
        <div className="header bg-dark py-7 py-lg-8">
          <Container>
            <div className="header-body text-center mb-7">
              <Row className="justify-content-center">
                <Col lg="6" md="8">
                  <h1 className="text-white">
                    <i className="fas fa-key mr-3 text-primary"></i>
                    Réinitialisation du mot de passe
                  </h1>
                  <p className="text-lead text-light">
                    Choisissez un nouveau mot de passe sécurisé pour votre
                    compte. Assurez-vous qu'il respecte tous les critères de
                    sécurité.
                  </p>
                </Col>
              </Row>
            </div>
          </Container>
        </div>

        {/* Page content */}
        <Container className="mt--8 pb-5">
          <Row className="justify-content-center">
            <Col lg="5" md="7">
              <Card className="bg-secondary shadow border-0">
                <CardHeader className="bg-transparent pb-3">
                  <div className="text-muted text-center mt-2 mb-2">
                    <h3>
                      <i className="fas fa-shield-alt mr-2 text-success"></i>
                      Nouveau mot de passe
                    </h3>
                  </div>
                </CardHeader>
                <CardBody className="px-lg-5 py-lg-5">
                  <div className="text-center text-muted mb-4">
                    <small>
                      Votre nouveau mot de passe doit être fort et sécurisé
                    </small>
                  </div>

                  <Form role="form" onSubmit={handleSubmit}>
                    
                   
                    <FormGroup className="mb-3">
                      <InputGroup className="input-group-alternative">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="ni ni-lock-circle-open" />
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input
                          placeholder="Nouveau mot de passe"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          autoComplete="new-password"
                        />
                        <InputGroupAddon addonType="append">
                          <InputGroupText
                            style={{ cursor: "pointer" }}
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            <i
                              className={
                                showPassword ? "fas fa-eye-slash" : "fas fa-eye"
                              }
                            />
                          </InputGroupText>
                        </InputGroupAddon>
                      </InputGroup>
                    </FormGroup>
                    
                    <FormGroup>
                      <InputGroup className="input-group-alternative">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="ni ni-check-bold" />
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input
                          placeholder="Confirmer le mot de passe"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          autoComplete="new-password"
                        />
                        <InputGroupAddon addonType="append">
                          <InputGroupText
                            style={{ cursor: "pointer" }}
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                          >
                            <i
                              className={
                                showConfirmPassword
                                  ? "fas fa-eye-slash"
                                  : "fas fa-eye"
                              }
                            />
                          </InputGroupText>
                        </InputGroupAddon>
                      </InputGroup>
                    </FormGroup>
                    {/* Critères de sécurité */}
                    <div className="alert alert-info mt-3 mb-4">
                      <small>
                        <strong>
                          <i className="fas fa-info-circle mr-1"></i> Exigences
                          :
                        </strong>
                        <br />
                        • 6 caractères minimum
                        <br />
                        • 1 majuscule, 1 minuscule
                        <br />• 1 chiffre, 1 caractère spécial (@$!%*?&#)
                      </small>
                    </div>
                    <div className="text-center">
                      <Button
                        className="my-4"
                        color="primary"
                        type="submit"
                        disabled={loading}
                        size="lg"
                      >
                        <i
                          className={
                            loading
                              ? "fas fa-spinner fa-spin mr-2"
                              : "fas fa-save mr-2"
                          }
                        ></i>
                        {loading
                          ? "Mise à jour en cours..."
                          : "Mettre à jour le mot de passe"}
                      </Button>
                    </div>
                  </Form>

                  <div className="text-center">
                    <Button
                      color="link"
                      size="sm"
                      onClick={() => navigate("/auth/login")}
                      className="text-muted"
                    >
                      <i className="fas fa-arrow-left mr-2"></i>
                      Retour à la connexion
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Alert Dialog */}
      {alertDialog.show && (
        <Modal isOpen={true} backdrop="static" centered size="sm">
          <ModalHeader className="border-0 pb-0">
            <div className="d-flex align-items-center">
              <span className="fs-4 me-2">{getAlertIcon()}</span>
              <span className="fw-bold">{alertDialog.title}</span>
            </div>
          </ModalHeader>

          <ModalBody className="pt-0">
            <p className="mb-0" style={{ whiteSpace: "pre-line" }}>
              {alertDialog.message}
            </p>
          </ModalBody>

          <ModalFooter className="border-0 pt-0">
            <Button
              color={getAlertColor()}
              onClick={closeAlertDialog}
              size="sm"
            >
              <i className="fas fa-check mr-2"></i>
              OK
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </>
  );
};

export default ResetPasswordPage;
