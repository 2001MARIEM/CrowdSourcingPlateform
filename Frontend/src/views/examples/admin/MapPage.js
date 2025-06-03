import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  ButtonGroup,
  Button,
  FormGroup,
  Label,
  Input,
  Alert,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import Header from "components/Headers/Header.js";
import { fetchMapDataByYear } from "../../../services/api";
import MapComponent from "./mapcomponent";

const MapPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [mapData, setMapData] = useState(null);
  const [mapView, setMapView] = useState("composite"); // composite, individual
  const [noDataForYear, setNoDataForYear] = useState(false);

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
      case "info":
        return <i className="fas fa-info-circle fa-3x text-info mb-3"></i>;
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
      case "info":
        return "info";
      default:
        return "primary";
    }
  };

  // Années disponibles (hardcodées car pas d'API disponible)
  const AVAILABLE_YEARS = [
    2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024,
  ];

  useEffect(() => {
    // Initialisation des années disponibles
    setYears(AVAILABLE_YEARS);

    // Sélectionner l'année la plus récente par défaut
    if (AVAILABLE_YEARS.length > 0) {
      setSelectedYear(Math.max(...AVAILABLE_YEARS));
    }
  }, []);

  useEffect(() => {
    if (selectedYear) {
      loadMapData(selectedYear);
    }
  }, [selectedYear]);

  // Fonction pour charger les données de la carte
  const loadMapData = async (year) => {
    setLoading(true);
    setError(null);
    setNoDataForYear(false);

    try {
      const data = await fetchMapDataByYear(year);
      console.log(`Données reçues de l'API pour l'année ${year}:`, data);

      // Vérifier si on a des données
      const displayData = getMapDataForDisplay(data, year);

      if (!displayData || displayData.length === 0) {
        setNoDataForYear(true);
        setMapData(null);
      } else {
        setMapData(data);
        setNoDataForYear(false);
      }
    } catch (error) {
      console.error("Erreur:", error);

      // Gérer spécifiquement l'erreur 404 (pas de données) comme info, pas erreur
      if (error.response && error.response.status === 404) {
        setNoDataForYear(true);
        setMapData(null);
        return; // Ne pas traiter comme une erreur
      }

      // Gérer les vraies erreurs
      let errorMessage = `Erreur lors du chargement des données pour l'année ${year}`;

      if (error.response && error.response.status === 401) {
        errorMessage =
          "Vous n'êtes pas autorisé à accéder à ces données. Veuillez vous reconnecter.";
      } else if (error.response?.data) {
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

      showAlertDialog("error", "Erreur de chargement", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour préparer les données à afficher
  const getMapDataForDisplay = (data = mapData, year = selectedYear) => {
    console.log("mapData complet:", data);
    console.log("selectedYear:", year);

    if (!data) {
      console.log("Aucune donnée disponible, retour tableau vide");
      return [];
    }

    // Si la structure est mapData.{année}.[carrés]
    if (data[year] && Array.isArray(data[year])) {
      console.log(`Données trouvées pour l'année ${year}:`, data[year]);
      return data[year];
    }

    // Si mapData est directement un tableau
    if (Array.isArray(data)) {
      console.log("mapData est directement un tableau:", data);
      return data;
    }

    // Essayer d'autres structures possibles
    if (data.data && Array.isArray(data.data)) {
      console.log("Données trouvées dans mapData.data:", data.data);
      return data.data;
    }

    if (typeof data === "object") {
      console.log("mapData est un objet avec ces clés:", Object.keys(data));
      return [];
    }

    console.log("Aucune structure reconnue, retour tableau vide");
    return [];
  };

  // Fonction pour générer des données de test
  const generateTestData = (year) => {
    const result = [];
    // Génération de 10 carrés aléatoires pour la Tunisie
    for (let i = 1; i <= 10; i++) {
      result.push({
        square_index: i,
        score: Math.floor(Math.random() * 21) - 10, // Score entre -10 et 10
        coords: [
          36.8 + Math.random() * 0.5, // Latitude approximative pour la Tunisie
          10.0 + Math.random() * 1.0, // Longitude approximative pour la Tunisie
        ],
      });
    }
    return result;
  };

  return (
    <>
      <Header />
      <Container className="mt--7" fluid>
        <Row>
          <Col className="mb-5 mb-xl-0" xl="12">
            <Card className="shadow">
              <CardHeader className="border-0">
                <Row className="align-items-center">
                  <div className="col">
                    <h3 className="mb-0">Carte d'évaluation</h3>
                  </div>
                  <div className="col text-right">
                    <ButtonGroup>
                      <Button
                        color={
                          mapView === "composite" ? "primary" : "secondary"
                        }
                        onClick={() => setMapView("composite")}
                      >
                        Vue composite
                      </Button>
                      <Button
                        color={
                          mapView === "individual" ? "primary" : "secondary"
                        }
                        onClick={() => setMapView("individual")}
                      >
                        Par critère
                      </Button>
                    </ButtonGroup>
                  </div>
                </Row>
              </CardHeader>
              <CardBody>
                {/* Sélecteur d'année */}
                <Row className="mb-4">
                  <Col md="6">
                    <FormGroup>
                      <Label for="yearSelect">Année</Label>
                      <Input
                        type="select"
                        name="year"
                        id="yearSelect"
                        value={selectedYear || ""}
                        onChange={(e) =>
                          setSelectedYear(parseInt(e.target.value))
                        }
                      >
                        <option value="">Sélectionnez une année</option>
                        {years.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>
                  </Col>
                </Row>

                {/* Message informatif pour pas de données */}
                {noDataForYear && (
                  <Alert color="info" className="mb-4">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-info-circle mr-3"></i>
                      <div>
                        <strong>
                          Aucune évaluation disponible pour {selectedYear}
                        </strong>
                        <br />
                        <small>
                          Les évaluateurs n'ont pas encore évalué de médias pour
                          cette année.
                        </small>
                      </div>
                    </div>
                  </Alert>
                )}

                {/* Contenu de la carte */}
                <Row>
                  <Col>
                    <div
                      id="map-container"
                      style={{
                        height: "600px",
                        width: "100%",
                        position: "relative",
                      }}
                    >
                      {loading ? (
                        <div className="text-center py-5">
                          <i className="fas fa-spinner fa-spin fa-3x text-primary"></i>
                          <p className="mt-3">Chargement de la carte...</p>
                        </div>
                      ) : noDataForYear ? (
                        <div className="text-center py-5">
                          <div className="mb-4">
                            <i className="fas fa-map fa-4x text-muted"></i>
                          </div>
                          <h4 className="text-muted">Carte non disponible</h4>
                          <p className="text-muted">
                            Aucune donnée d'évaluation pour l'année{" "}
                            {selectedYear}
                          </p>
                          <Button
                            color="primary"
                            outline
                            onClick={() =>
                              setSelectedYear(Math.max(...AVAILABLE_YEARS))
                            }
                          >
                            <i className="fas fa-calendar-alt mr-2"></i>
                            Voir l'année la plus récente
                          </Button>
                        </div>
                      ) : mapData ? (
                        <div style={{ height: "100%", width: "100%" }}>
                          <MapComponent
                            data={getMapDataForDisplay()}
                            viewMode={mapView}
                          />
                        </div>
                      ) : (
                        <div className="text-center py-5">
                          <div className="mb-4">
                            <i className="fas fa-calendar-check fa-4x text-muted"></i>
                          </div>
                          <h4 className="text-muted">Sélectionnez une année</h4>
                          <p className="text-muted">
                            Choisissez une année pour afficher la carte
                            d'évaluation
                          </p>
                        </div>
                      )}
                    </div>
                  </Col>
                </Row>

                {/* Légende - seulement si on a des données */}
                {mapData && !noDataForYear && (
                  <Row className="mt-4">
                    <Col>
                      <Card className="bg-default">
                        <CardBody>
                          <h4 className="text-white">Légende</h4>
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <div
                                style={{
                                  width: "20px",
                                  height: "20px",
                                  backgroundColor: "red",
                                  display: "inline-block",
                                  marginRight: "10px",
                                }}
                              ></div>
                              <span className="text-white">
                                Zone perçue comme dangereuse
                              </span>
                            </div>
                            <div>
                              <div
                                style={{
                                  width: "20px",
                                  height: "20px",
                                  background:
                                    "linear-gradient(to right, red, green)",
                                  display: "inline-block",
                                  marginRight: "10px",
                                }}
                              ></div>
                              <span className="text-white">
                                Zone intermédiaire
                              </span>
                            </div>
                            <div>
                              <div
                                style={{
                                  width: "20px",
                                  height: "20px",
                                  backgroundColor: "green",
                                  display: "inline-block",
                                  marginRight: "10px",
                                }}
                              ></div>
                              <span className="text-white">
                                Zone perçue comme belle/vivante
                              </span>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    </Col>
                  </Row>
                )}
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

export default MapPage;
