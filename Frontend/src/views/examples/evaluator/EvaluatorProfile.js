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
} from "reactstrap";
import UserHeader from "components/Headers/UserHeader.js";
import { updateUserProfile } from "services/api";

const EvaluatorProfile = () => {
  const { user, logout } = useAuth();
  const [editable, setEditable] = useState(false);
  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    email: "",
    age: "",
    secteur_activite: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        prenom: user?.prenom || "",
        nom: user?.nom || "",
        email: user?.email || "",
        age: user?.age || "",
        secteur_activite: user?.secteur_activite || "", // ✅ cohérent avec le back
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
    try {
      const accessToken = localStorage.getItem("access_token");
      const response = await updateUserProfile(accessToken, formData);
      console.log("Profil mis à jour :", response);
      alert("Profil mis à jour avec succès !");
      setEditable(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil :", error);
      alert("Erreur lors de la mise à jour du profil.");
    }
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
                            id="secteur_activite" // ✅ correspond bien au formData
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
                          <Button color="primary" type="submit">
                            Sauvegarder les modifications
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
    </>
  );
};

export default EvaluatorProfile;
