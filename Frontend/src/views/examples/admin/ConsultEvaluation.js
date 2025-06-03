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
  Input,
  InputGroup,
  InputGroupText,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Badge,
  Pagination,
  PaginationItem,
  PaginationLink,
  Progress,
} from "reactstrap";
import Header from "components/Headers/Header";
import { getAdminEvaluations, downloadAdminEvaluations } from "services/api";

// Convertit une URL Vimeo en URL embarquée
const convertToVimeoEmbed = (url) => {
  if (!url) return "";
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? `https://player.vimeo.com/video/${match[1]}` : url;
};

// Liste des critères d'évaluation
const evaluationCriteria = [
  { label: "Beauté", key: "beauty", color: "success" },
  { label: "Ennui", key: "boring", color: "warning" },
  { label: "Dépression", key: "depressing", color: "danger" },
  { label: "Vivacité", key: "lively", color: "info" },
  { label: "Richesse", key: "wealthy", color: "primary" },
  { label: "Sécurité", key: "safe", color: "success" },
];

const AdminEvaluations = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // "all", "image", "video"
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const itemsPerPage = 10;

  // Charger les évaluations
  useEffect(() => {
    const loadEvaluations = async () => {
      setLoading(true);
      try {
        const result = await getAdminEvaluations();

        if (!result.error) {
          console.log("Évaluations reçues:", result.data);
          setEvaluations(result.data);
          setError(null);
        } else {
          setError(
            "Erreur lors du chargement des évaluations: " + result.message
          );
        }
      } catch (err) {
        console.error("Erreur:", err);
        setError("Une erreur s'est produite lors du chargement des données.");
      } finally {
        setLoading(false);
      }
    };

    loadEvaluations();
  }, []);

  // Filtrer les évaluations selon le type et le terme de recherche
  const filteredEvaluations = evaluations.filter((evalItem) => {
    // Filtre par type (image/video/all)
    if (filter !== "all") {
      const mediaType = evalItem.media_info?.type;
      if (filter === "video" && mediaType !== "video") return false;
      if (filter === "image" && mediaType !== "image") return false;
    }

    // Filtre par terme de recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        evalItem.evaluator_email?.toLowerCase().includes(searchLower) ||
        evalItem.comment?.toLowerCase().includes(searchLower) ||
        evalItem.media_info?.place?.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredEvaluations.length / itemsPerPage);
  const paginatedEvaluations = filteredEvaluations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Télécharger les évaluations
  const handleDownload = async () => {
    const result = await downloadAdminEvaluations();
    if (result.error) {
      setError("Erreur lors du téléchargement: " + result.message);
    }
  };

  // Voir les détails d'une évaluation
  const handleViewDetails = (evaluation) => {
    console.log("Détails de l'évaluation:", evaluation);
    setSelectedEvaluation(evaluation);
    setModalOpen(true);
  };

  // Calculer le score total
  const calculateTotalScore = (evaluation) => {
    return (
      (evaluation.beauty || 0) +
      (evaluation.lively || 0) +
      (evaluation.wealthy || 0) +
      (evaluation.safe || 0) -
      (evaluation.boring || 0) -
      (evaluation.depressing || 0)
    );
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
                    <h3 className="mb-0">Toutes les évaluations</h3>
                  </div>
                  <div className="col text-right">
                    <Button color="primary" onClick={handleDownload}>
                      <i className="fas fa-download mr-2"></i>
                      Télécharger au format JSON
                    </Button>
                  </div>
                </Row>
              </CardHeader>
              <CardBody>
                {/* Filtres */}
                <Row className="mb-4">
                  <Col md="6">
                    <InputGroup>
                      <InputGroupText>
                        <i className="fas fa-search"></i>
                      </InputGroupText>
                      <Input
                        placeholder="Rechercher par utilisateur, lieu, commentaire..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </InputGroup>
                  </Col>
                  <Col md="6" className="text-right">
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
                  </Col>
                </Row>

                {/* Afficher le nombre total d'évaluations filtrées */}
                <div className="mb-3">
                  <Badge color="info" className="mr-2">
                    {filteredEvaluations.length} évaluations
                  </Badge>
                  {filter !== "all" && (
                    <Badge color={filter === "video" ? "info" : "primary"}>
                      Filtre: {filter === "video" ? "Vidéos" : "Images"}
                    </Badge>
                  )}
                </div>

                {/* Erreur */}
                {error && (
                  <div className="alert alert-danger mb-4">{error}</div>
                )}

                {/* Tableau des évaluations */}
                {loading ? (
                  <div className="text-center my-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="sr-only">Chargement...</span>
                    </div>
                    <p className="mt-3">Chargement des évaluations...</p>
                  </div>
                ) : paginatedEvaluations.length === 0 ? (
                  <div className="text-center my-5">
                    <p>Aucune évaluation trouvée.</p>
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
                          <th scope="col">Utilisateur</th>
                          <th scope="col">Date</th>
                          <th scope="col">Type</th>
                          <th scope="col">Score</th>
                          <th scope="col">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedEvaluations.map((evaluation) => {
                          const score = calculateTotalScore(evaluation);
                          const scoreColor =
                            score < -5
                              ? "danger"
                              : score < 0
                              ? "warning"
                              : score < 5
                              ? "info"
                              : "success";

                          return (
                            <tr key={evaluation.id}>
                              <td>{evaluation.id.substring(0, 8)}...</td>
                              <td>
                                <div>{evaluation.evaluator_email}</div>
                              </td>
                              <td>
                                {new Date(
                                  evaluation.created_at
                                ).toLocaleString()}
                              </td>
                              <td>
                                <Badge
                                  color={
                                    evaluation.media_info?.type === "video"
                                      ? "info"
                                      : "primary"
                                  }
                                >
                                  {evaluation.media_info?.type === "video"
                                    ? "Vidéo"
                                    : "Image"}
                                </Badge>
                              </td>
                              <td>
                                <Badge color={scoreColor}>{score}</Badge>
                              </td>
                              <td>
                                <Button
                                  color="info"
                                  size="sm"
                                  onClick={() => handleViewDetails(evaluation)}
                                >
                                  <i className="fas fa-eye"></i> Voir
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
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

      {/* Modal pour voir les détails d'une évaluation */}
      <Modal
        isOpen={modalOpen}
        toggle={() => setModalOpen(!modalOpen)}
        size="lg"
      >
        <ModalHeader toggle={() => setModalOpen(!modalOpen)}>
          Détails de l'évaluation
        </ModalHeader>
        <ModalBody>
          {selectedEvaluation && (
            <Row>
              <Col md="6">
                {selectedEvaluation.media_info?.type === "video" ? (
                  <div
                    className="  mb-3"
    
                  >
                    <iframe
                      src={convertToVimeoEmbed(
                        selectedEvaluation.media_info.url
                      )}
                      title="Vidéo évaluée"
                      allowFullScreen
                      frameBorder="0"
                      style={{
                        width: "100%",
                        height: "300px",
                        border: "none",
                      }}
                      className="rounded"
                    />
                  </div>
                ) : (
                  <img
                    src={selectedEvaluation.media_info?.url}
                    alt="Image évaluée"
                    className="img-fluid rounded mb-3"
                    style={{
                      maxHeight: "300px",
                      width: "100%",
                      objectFit: "cover",
                    }}
                  />
                )}
                <div>
                  <p>
                    <strong>ID:</strong> {selectedEvaluation.id}
                  </p>
                  <p>
                    <strong>Utilisateur:</strong>{" "}
                    {selectedEvaluation.evaluator_email}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(selectedEvaluation.created_at).toLocaleString()}
                  </p>
                  <p>
                    <strong>Lieu:</strong>{" "}
                    {selectedEvaluation.media_info?.place || "Non spécifié"}
                  </p>
                  <p>
                    <strong>Année:</strong>{" "}
                    {selectedEvaluation.media_info?.year || "Non spécifiée"}
                  </p>
                  <p>
                    <strong>Type:</strong>{" "}
                    {selectedEvaluation.media_info?.type === "video"
                      ? "Vidéo"
                      : "Image"}
                  </p>
                  <p>
                    <strong>Commentaire:</strong>{" "}
                    {selectedEvaluation.comment || "—"}
                  </p>
                </div>
              </Col>
              <Col md="6">
                <h5>Critères d'évaluation</h5>
                {evaluationCriteria.map(({ label, key, color }) => (
                  <div key={key} className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span>{label}</span>
                      <span>{selectedEvaluation[key]}/5</span>
                    </div>
                    <Progress
                      value={selectedEvaluation[key] * 20}
                      color={color}
                    />
                  </div>
                ))}
                <div className="mt-4">
                  <h5>Score total</h5>
                  <div className="d-flex justify-content-between mb-1">
                    <span>Score combiné</span>
                    <span>{calculateTotalScore(selectedEvaluation)}</span>
                  </div>
                  <Progress
                    value={
                      (calculateTotalScore(selectedEvaluation) + 30) *
                      (100 / 60)
                    }
                    color={
                      calculateTotalScore(selectedEvaluation) < -5
                        ? "danger"
                        : calculateTotalScore(selectedEvaluation) < 0
                        ? "warning"
                        : calculateTotalScore(selectedEvaluation) < 5
                        ? "info"
                        : "success"
                    }
                  />
                  <div className="mt-3 text-muted small">
                    <p>
                      Calcul du score: (beauté + vivacité + richesse + sécurité)
                      - (ennui + dépression)
                    </p>
                  </div>
                </div>
              </Col>
            </Row>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setModalOpen(false)}>
            Fermer
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default AdminEvaluations;
