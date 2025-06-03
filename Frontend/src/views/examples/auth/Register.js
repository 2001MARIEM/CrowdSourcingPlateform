import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { registerUser } from "services/api";

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    prenom: "",
    nom: "",
    age: "",
    secteur_activite: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

  // Vérification si l'utilisateur est déjà connecté
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("access_token");
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Fonction pour formater les erreurs du backend
  const formatBackendErrors = (errorData) => {
    if (typeof errorData === "string") {
      return errorData;
    }

    if (typeof errorData === "object") {
      let errorMessages = [];

      // Parcourir toutes les clés d'erreur
      for (const [field, messages] of Object.entries(errorData)) {
        if (Array.isArray(messages)) {
          errorMessages.push(`${field}: ${messages.join(", ")}`);
        } else if (typeof messages === "string") {
          errorMessages.push(`${field}: ${messages}`);
        }
      }

      return errorMessages.length > 0
        ? errorMessages.join("\n")
        : "Erreur de validation";
    }

    return "Une erreur s'est produite lors de l'inscription";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await registerUser(formData);

      if (result.error) {
        // Afficher l'erreur spécifique du backend
        const errorMessage = formatBackendErrors(result.message || result.data);
        showAlertDialog("error", "Erreur d'inscription", errorMessage);
      } else {
        // Succès
        showAlertDialog(
          "success",
          "Compte créé avec succès !",
          "Votre compte a été créé. Vous pouvez maintenant vous connecter.",
          () => {
            navigate("/auth/login");
          }
        );
      }
    } catch (error) {
      console.error("Erreur d'inscription :", error);

      // Tenter d'extraire le message d'erreur du backend
      let errorMessage = "Une erreur s'est produite lors de l'inscription.";

      if (error.response && error.response.data) {
        errorMessage = formatBackendErrors(error.response.data);
      } else if (error.message) {
        errorMessage = error.message;
      }

      showAlertDialog("error", "Erreur d'inscription", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Col lg="6" md="8">
        <Card className="bg-secondary shadow border-0">
          <CardHeader className="bg-transparent pb-3">
            <div className="text-muted text-center mt-2 mb-2">
              <h2>Créer un compte</h2>
            </div>
          </CardHeader>
          <CardBody className="px-lg-5 py-lg-5">
            <Form role="form" onSubmit={handleSubmit}>
              <FormGroup>
                <InputGroup className="input-group-alternative mb-3">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-hat-3" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    placeholder="Prénom"
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    required
                  />
                </InputGroup>
              </FormGroup>
              <FormGroup>
                <InputGroup className="input-group-alternative mb-3">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-hat-3" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    placeholder="Nom"
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    required
                  />
                </InputGroup>
              </FormGroup>
              <FormGroup>
                <InputGroup className="input-group-alternative mb-3">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-email-83" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    placeholder="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
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
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </InputGroup>
              </FormGroup>
              <FormGroup>
                <InputGroup className="input-group-alternative">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-calendar-grid-58" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    placeholder="Âge"
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    required
                  />
                </InputGroup>
              </FormGroup>
               <FormGroup>
                <InputGroup className="input-group-alternative">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-briefcase-24" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    type="select"
                    name="secteur_activite"
                    value={formData.secteur_activite}
                    onChange={handleChange}
                    required
                    className="form-control-alternative"
                  >
                    <option value="">
                      Sélectionnez votre secteur d'activité
                    </option>
                    <option value="Informatique/Technologies">
                      Informatique/Technologies
                    </option>
                    <option value="Santé/Médical">Santé/Médical</option>
                    <option value="Éducation/Formation">
                      Éducation/Formation
                    </option>
                    <option value="Finance/Banque">Finance/Banque</option>
                    <option value="Commerce/Retail">Commerce/Retail</option>
                    <option value="Industrie/Manufacturing">
                      Industrie/Manufacturing
                    </option>
                    <option value="Transport/Logistique">
                      Transport/Logistique
                    </option>
                    <option value="Immobilier">Immobilier</option>
                    <option value="Tourisme/Hôtellerie">
                      Tourisme/Hôtellerie
                    </option>
                     
                    <option value="Construction/BTP">Construction/BTP</option>
                    <option value="Média/Communication">
                      Média/Communication
                    </option>
                    <option value="Juridique/Droit">Juridique/Droit</option>
                    <option value="Consulting/Conseil">
                      Consulting/Conseil
                    </option>
                    <option value="Énergie/Environnement">
                      Énergie/Environnement
                    </option>
                    <option value="Automobile">Automobile</option>
                     
                    <option value="Arts/Culture/Divertissement">
                      Arts/Culture/Divertissement
                    </option>
                     
                    <option value="Recherche/Sciences">
                      Recherche/Sciences
                    </option>
                    <option value="Services publics">Services publics</option>
                    <option value="Autre">Autre</option>
                  </Input>
                </InputGroup>
              </FormGroup>
              <div className="text-center">
                <Button
                  className="mt-4"
                  color="primary"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-user-plus mr-2"></i>
                      Créer le compte
                    </>
                  )}
                </Button>
              </div>
            </Form>
          </CardBody>
        </Card>
      </Col>

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

export default Register;
