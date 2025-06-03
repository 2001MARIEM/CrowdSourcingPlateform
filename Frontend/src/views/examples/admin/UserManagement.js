import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  Button,
  ButtonGroup,
  Table,
  Badge,
  Input,
  InputGroup,
  InputGroupText,
  Pagination,
  PaginationItem,
  PaginationLink,
  Alert,
  Spinner,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  FormFeedback,
} from "reactstrap";
import Header from "components/Headers/Header";
import {
  getEvaluatorsList,
  DisableUser,
  ActivateUser,
  createChercheurUser,
} from "services/api";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [actionResult, setActionResult] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [userTypeFilter, setUserTypeFilter] = useState("all"); // "all", "evaluateurs", "chercheurs"
  const [modalOpen, setModalOpen] = useState(false);
  const itemsPerPage = 10;

  // États pour le formulaire de création de chercheur
  const [formData, setFormData] = useState({
    email: "",
    prenom: "",
    nom: "",
    age: "",
    secteur_activite: "",
  });
  const [formErrors, setFormErrors] = useState({});

  // Charger la liste des évaluateurs
  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const result = await getEvaluatorsList();
        if (!result.error) {
          console.log("Utilisateurs reçus:", result.data);
          setUsers(result.data);
          setError(null);
        } else {
          setError(
            "Erreur lors du chargement des utilisateurs: " + result.message
          );
        }
      } catch (err) {
        console.error("Erreur:", err);
        setError("Une erreur s'est produite lors du chargement des données.");
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  // Gestion des changements dans le formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Réinitialiser l'erreur pour ce champ si l'utilisateur commence à le modifier
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
  };

  // Validation du formulaire
  const validateForm = () => {
    const errors = {};

    if (!formData.email) {
      errors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Format d'email invalide";
    }

    if (!formData.prenom) errors.prenom = "Le prénom est requis";
    if (!formData.nom) errors.nom = "Le nom est requis";

    if (!formData.age) {
      errors.age = "L'âge est requis";
    } else if (
      isNaN(formData.age) ||
      parseInt(formData.age) < 18 ||
      parseInt(formData.age) > 100
    ) {
      errors.age = "L'âge doit être un nombre entre 18 et 100";
    }

    if (!formData.secteur_activite)
      errors.secteur_activite = "Le secteur d'activité est requis";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setActionInProgress(true);

    try {
      // Convertir l'âge en nombre
      const formDataToSend = {
        ...formData,
        age: parseInt(formData.age),
      };

      const result = await createChercheurUser(formDataToSend);

      if (!result.error) {
        setActionResult({
          type: "success",
          message:
            "Compte chercheur créé avec succès. Un email a été envoyé avec les identifiants.",
        });

        // Fermer la modal et réinitialiser le formulaire
        setModalOpen(false);
        setFormData({
          email: "",
          prenom: "",
          nom: "",
          age: "",
          secteur_activite: "",
        });

        // Recharger la liste des utilisateurs
        const updatedResult = await getEvaluatorsList();
        if (!updatedResult.error) {
          setUsers(updatedResult.data);
        }
      } else {
        setActionResult({
          type: "danger",
          message: `Erreur: ${result.message}`,
        });
      }
    } catch (err) {
      console.error("Erreur lors de la création du compte chercheur:", err);
      setActionResult({
        type: "danger",
        message:
          "Une erreur s'est produite lors de la création du compte chercheur.",
      });
    } finally {
      setActionInProgress(false);

      // Effacer le message après 5 secondes
      setTimeout(() => {
        setActionResult(null);
      }, 5000);
    }
  };

  // Filtrer les utilisateurs selon le terme de recherche et le type d'utilisateur
  const filteredUsers = users.filter((user) => {
    // Filtre par type d'utilisateur
    if (userTypeFilter === "evaluateurs" && user.is_chercheur) return false;
    if (userTypeFilter === "chercheurs" && !user.is_chercheur) return false;

    // Filtre par terme de recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        user.email?.toLowerCase().includes(searchLower) ||
        user.username?.toLowerCase().includes(searchLower) ||
        user.first_name?.toLowerCase().includes(searchLower) ||
        user.last_name?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Activer/Désactiver un utilisateur
  const handleToggleUserStatus = async (userId, isActive) => {
    setActionInProgress(true);
    setActionResult(null);

    try {
      const result = isActive
        ? await DisableUser(userId)
        : await ActivateUser(userId);

      if (!result.error) {
        // Mettre à jour l'état de l'utilisateur dans la liste
        setUsers(
          users.map((user) =>
            user.id === userId ? { ...user, is_active: !isActive } : user
          )
        );

        setActionResult({
          type: "success",
          message: `Utilisateur ${
            isActive ? "désactivé" : "activé"
          } avec succès.`,
        });
      } else {
        setActionResult({
          type: "danger",
          message: `Erreur: ${result.message}`,
        });
      }
    } catch (err) {
      console.error("Erreur lors de la modification du statut:", err);
      setActionResult({
        type: "danger",
        message:
          "Une erreur s'est produite lors de la modification du statut de l'utilisateur.",
      });
    } finally {
      setActionInProgress(false);

      // Effacer le message après 3 secondes
      setTimeout(() => {
        setActionResult(null);
      }, 3000);
    }
  };

  return (
    <>
      <Header />
      <Container className="mt--7" fluid>
        <Row>
          <Col>
            <Card className="shadow">
              <CardHeader className="border-0">
                <Row className="align-items-center">
                  <div className="col">
                    <h3 className="mb-0">Gestion des utilisateurs</h3>
                  </div>
                  <div className="col text-right">
                    <Button color="primary" onClick={() => setModalOpen(true)}>
                      <i className="fas fa-plus mr-2"></i>
                      Ajouter un chercheur
                    </Button>
                  </div>
                </Row>
              </CardHeader>
              <CardBody>
                {/* Recherche et filtres */}
                <Row className="mb-4">
                  <Col md="6">
                    <InputGroup>
                      <InputGroupText>
                        <i className="fas fa-search"></i>
                      </InputGroupText>
                      <Input
                        placeholder="Rechercher par email, nom..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </InputGroup>
                  </Col>
                  <Col md="6" className="text-right">
                    <ButtonGroup className="mb-2">
                      <Button
                        color={
                          userTypeFilter === "all" ? "primary" : "secondary"
                        }
                        onClick={() => setUserTypeFilter("all")}
                      >
                        Tous
                      </Button>
                      <Button
                        color={
                          userTypeFilter === "evaluateurs"
                            ? "primary"
                            : "secondary"
                        }
                        onClick={() => setUserTypeFilter("evaluateurs")}
                      >
                        Évaluateurs
                      </Button>
                      <Button
                        color={
                          userTypeFilter === "chercheurs"
                            ? "primary"
                            : "secondary"
                        }
                        onClick={() => setUserTypeFilter("chercheurs")}
                      >
                        Chercheurs
                      </Button>
                    </ButtonGroup>
                    <div>
                      <Badge color="info" className="mr-2">
                        {filteredUsers.length} utilisateurs
                      </Badge>
                    </div>
                  </Col>
                </Row>

                {/* Message d'action */}
                {actionResult && (
                  <Alert color={actionResult.type} className="mb-4">
                    {actionResult.message}
                  </Alert>
                )}

                {/* Erreur */}
                {error && (
                  <Alert color="danger" className="mb-4">
                    {error}
                  </Alert>
                )}

                {/* Tableau des utilisateurs */}
                {loading ? (
                  <div className="text-center my-5">
                    <Spinner color="primary" />
                    <p className="mt-3">Chargement des utilisateurs...</p>
                  </div>
                ) : paginatedUsers.length === 0 ? (
                  <div className="text-center my-5">
                    <p>Aucun utilisateur trouvé.</p>
                  </div>
                ) : (
                  <>
                    <Table
                      className="align-items-center table-flush"
                      responsive
                    >
                      <thead className="thead-light">
                        <tr>
                          <th scope="col">ID</th>
                          <th scope="col">Email</th>
                          <th scope="col">Nom</th>
                          <th scope="col">Type</th>
                          <th scope="col">Date d'inscription</th>
                          <th scope="col">Statut</th>
                          <th scope="col">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedUsers.map((user) => (
                          <tr key={user.id}>
                            <td>{user.id.substring(0, 8)}...</td>
                            <td>{user.email}</td>
                            <td>
                              {user.first_name || user.last_name
                                ? `${user.first_name || ""} ${
                                    user.last_name || ""
                                  }`
                                : user.username || "—"}
                            </td>
                            <td>
                              <Badge
                                color={user.is_chercheur ? "info" : "primary"}
                              >
                                {user.is_chercheur ? "Chercheur" : "Évaluateur"}
                              </Badge>
                            </td>
                            <td>
                              {new Date(user.date_joined).toLocaleDateString()}
                            </td>
                            <td>
                              <Badge
                                color={user.is_active ? "success" : "danger"}
                              >
                                {user.is_active ? "Actif" : "Inactif"}
                              </Badge>
                            </td>
                            <td>
                              <Button
                                color={user.is_active ? "danger" : "success"}
                                size="sm"
                                onClick={() =>
                                  handleToggleUserStatus(
                                    user.id,
                                    user.is_active
                                  )
                                }
                                disabled={actionInProgress}
                              >
                                {actionInProgress ? (
                                  <Spinner size="sm" />
                                ) : user.is_active ? (
                                  <>
                                    <i className="fas fa-ban mr-1"></i>{" "}
                                    Désactiver
                                  </>
                                ) : (
                                  <>
                                    <i className="fas fa-check mr-1"></i>{" "}
                                    Activer
                                  </>
                                )}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <nav>
                        <Pagination className="pagination justify-content-end mb-0">
                          <PaginationItem disabled={currentPage === 1}>
                            <PaginationLink
                              previous
                              onClick={() => setCurrentPage(currentPage - 1)}
                            />
                          </PaginationItem>

                          {[...Array(totalPages)].map((_, index) => (
                            <PaginationItem
                              key={index}
                              active={index + 1 === currentPage}
                            >
                              <PaginationLink
                                onClick={() => setCurrentPage(index + 1)}
                              >
                                {index + 1}
                              </PaginationLink>
                            </PaginationItem>
                          ))}

                          <PaginationItem disabled={currentPage === totalPages}>
                            <PaginationLink
                              next
                              onClick={() => setCurrentPage(currentPage + 1)}
                            />
                          </PaginationItem>
                        </Pagination>
                      </nav>
                    )}
                  </>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Modal pour créer un compte chercheur */}
      <Modal
        isOpen={modalOpen}
        toggle={() => setModalOpen(!modalOpen)}
        size="lg"
      >
        <ModalHeader toggle={() => setModalOpen(!modalOpen)}>
          Créer un compte chercheur
        </ModalHeader>
        <ModalBody>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label for="email">Email *</Label>
                  <Input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="email@exemple.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    invalid={!!formErrors.email}
                  />
                  <FormFeedback>{formErrors.email}</FormFeedback>
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label for="age">Âge *</Label>
                  <Input
                    type="number"
                    name="age"
                    id="age"
                    placeholder="30"
                    value={formData.age}
                    onChange={handleInputChange}
                    invalid={!!formErrors.age}
                  />
                  <FormFeedback>{formErrors.age}</FormFeedback>
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label for="prenom">Prénom *</Label>
                  <Input
                    type="text"
                    name="prenom"
                    id="prenom"
                    placeholder="Prénom"
                    value={formData.prenom}
                    onChange={handleInputChange}
                    invalid={!!formErrors.prenom}
                  />
                  <FormFeedback>{formErrors.prenom}</FormFeedback>
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label for="nom">Nom *</Label>
                  <Input
                    type="text"
                    name="nom"
                    id="nom"
                    placeholder="Nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                    invalid={!!formErrors.nom}
                  />
                  <FormFeedback>{formErrors.nom}</FormFeedback>
                </FormGroup>
              </Col>
            </Row>
            <FormGroup>
              <Label for="secteur_activite">Secteur d'activité *</Label>
              <Input
                type="text"
                name="secteur_activite"
                id="secteur_activite"
                placeholder="Ex: Urbanisme, Architecture, Sociologie..."
                value={formData.secteur_activite}
                onChange={handleInputChange}
                invalid={!!formErrors.secteur_activite}
              />
              <FormFeedback>{formErrors.secteur_activite}</FormFeedback>
            </FormGroup>
            <small className="text-muted">
              * Un mot de passe sera généré automatiquement et envoyé par email
              au chercheur.
            </small>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setModalOpen(false)}>
            Annuler
          </Button>
          <Button
            color="primary"
            onClick={handleSubmit}
            disabled={actionInProgress}
          >
            {actionInProgress ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Création en cours...
              </>
            ) : (
              "Créer le compte"
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default UserManagement;
