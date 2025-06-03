import { useState } from "react";
import { useAuth } from "context/AuthContext";
import {
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
  Col,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import { forgotPassword } from "services/api";
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading } = useAuth();
  const [forgotPasswordModal, setForgotPasswordModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation basique
    if (!email || !password) {
      showAlertDialog(
        "warning",
        "Champs requis",
        "Veuillez saisir votre email et mot de passe."
      );
      return;
    }

    try {
      await login(email, password);
      // Si on arrive ici, la connexion a réussi
      // La redirection se fait dans AuthContext
    } catch (error) {
      // Gestion des erreurs de connexion
      let errorMessage = "Email ou mot de passe incorrect.";

      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      showAlertDialog("error", "Erreur de connexion", errorMessage);
    }
  };
  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!forgotEmail) {
      showAlertDialog(
        "warning",
        "Email requis",
        "Veuillez saisir votre adresse email."
      );
      return;
    }

    setForgotLoading(true);

    try {
      const result = await forgotPassword(forgotEmail);

      if (result.error) {
        showAlertDialog("error", "Erreur", result.message);
      } else {
        showAlertDialog(
          "success",
          "Email envoyé !",
          "Un lien de réinitialisation a été envoyé à votre adresse email.",
          () => {
            setForgotPasswordModal(false);
            setForgotEmail("");
          }
        );
      }
    } catch (error) {
      showAlertDialog("error", "Erreur", "Une erreur s'est produite.");
    } finally {
      setForgotLoading(false);
    }
  };
  return (
    <>
      <Col lg="5" md="7">
        <Card className="bg-secondary shadow border-0">
          <CardHeader className="bg-transparent pb-3">
            <div className="text-muted text-center mt-2 mb-2">
              <h2>Connexion</h2>
            </div>
          </CardHeader>
          <CardBody className="px-lg-5 py-lg-5">
            <Form role="form" onSubmit={handleSubmit}>
              <FormGroup className="mb-3">
                <InputGroup className="input-group-alternative">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-email-83" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    placeholder="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </InputGroup>
              </FormGroup>
              <FormGroup>
                <InputGroup className="input-group-alternative">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-lock-circle-open" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    placeholder="Mot de passe"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </InputGroup>
              </FormGroup>
              <div className="text-center">
                <Button
                  className="my-4"
                  color="primary"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Connexion...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sign-in-alt mr-2"></i>
                      Se connecter
                    </>
                  )}
                </Button>
              </div>
              {/* Ajoutez ce lien */}
              <div className="text-center">
                <Button
                  color="link"
                  size="sm"
                  onClick={() => setForgotPasswordModal(true)}
                  className="text-muted"
                >
                  Mot de passe oublié ?
                </Button>
              </div>
            </Form>
          </CardBody>
        </Card>
      </Col>
      {/* Modal Mot de passe oublié */}
      <Modal
        isOpen={forgotPasswordModal}
        toggle={() => setForgotPasswordModal(false)}
        centered
        backdrop="static"
      >
        <ModalHeader toggle={() => setForgotPasswordModal(false)}>
          <i className="fas fa-key mr-2 text-primary"></i>
          Mot de passe oublié
        </ModalHeader>

        <Form onSubmit={handleForgotPassword}>
          <ModalBody>
            <p className="text-muted">
              Saisissez votre adresse email pour recevoir un lien de
              réinitialisation.
            </p>

            <FormGroup>
              <InputGroup className="input-group-alternative">
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>
                    <i className="ni ni-email-83" />
                  </InputGroupText>
                </InputGroupAddon>
                <Input
                  placeholder="Votre adresse email"
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />
              </InputGroup>
            </FormGroup>
          </ModalBody>

          <ModalFooter>
            <Button
              color="secondary"
              onClick={() => {
                setForgotPasswordModal(false);
                setForgotEmail("");
              }}
              disabled={forgotLoading}
            >
              <i className="fas fa-times mr-2"></i>
              Annuler
            </Button>
            <Button color="primary" type="submit" disabled={forgotLoading}>
              <i
                className={
                  forgotLoading
                    ? "fas fa-spinner fa-spin mr-2"
                    : "fas fa-paper-plane mr-2"
                }
              ></i>
              {forgotLoading ? "Envoi..." : "Envoyer"}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

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

export default Login;
