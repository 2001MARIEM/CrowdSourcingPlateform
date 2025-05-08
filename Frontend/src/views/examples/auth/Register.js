import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Pour la redirection
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
} from "reactstrap";
import { registerUser } from "services/api"; // L'appel API pour l'enregistrement

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    prenom: "",
    nom: "",
    age: "",
    secteur_activite: "",
  });
  const [loading, setLoading] = useState(false); // Pour afficher un état de chargement
  const [error, setError] = useState(null); // Pour afficher l'erreur de l'API
  const navigate = useNavigate();

  // Vérification si l'utilisateur est déjà connecté
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("access_token"); // Exemple avec localStorage
    if (isAuthenticated) {
      navigate("/dashboard"); // Redirection vers le tableau de bord si l'utilisateur est déjà connecté
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null); // Réinitialise l'erreur avant chaque soumission

    try {
      // Appel API pour enregistrer l'utilisateur
      await registerUser(formData);
      alert("Compte créé avec succès !");
      navigate("/auth/login"); // Redirection vers la page de login
    } catch (error) {
      console.error("Erreur d'inscription :", error);
      setError(
        "Erreur lors de l'inscription. Veuillez vérifier vos informations."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Col lg="6" md="8">
      <Card className="bg-secondary shadow border-0">
        <CardHeader className="bg-transparent pb-3">
          <div className="text-muted text-center mt-2 mb-2">
            <h2>Créer un compte</h2>
          </div>
        </CardHeader>
        <CardBody className="px-lg-5 py-lg-5">
          <Form role="form" onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}{" "}
            {/* Afficher l'erreur */}
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
                  placeholder="Secteur d'activité"
                  type="text"
                  name="secteur_activite"
                  value={formData.secteur_activite}
                  onChange={handleChange}
                  required
                />
              </InputGroup>
            </FormGroup>
            <div className="text-center">
              <Button
                className="mt-4"
                color="primary"
                type="submit"
                disabled={loading}
              >
                {loading ? "Création en cours..." : "Créer le compte"}
              </Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </Col>
  );
};

export default Register;
