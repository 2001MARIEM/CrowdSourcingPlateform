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
    try {
      const data = await fetchMapDataByYear(year);
      console.log(`Données reçues de l'API pour l'année ${year}:`, data);
      setMapData(data);
    } catch (error) {
      console.error("Erreur:", error);

      // Gérer spécifiquement l'erreur 401 (Unauthorized)
      if (error.response && error.response.status === 401) {
        setError(
          "Vous n'êtes pas autorisé à accéder à ces données. Veuillez vous reconnecter."
        );
      } else {
        setError(
          `Erreur lors du chargement des données pour l'année ${year}: ${error.message}`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour préparer les données à afficher
  const getMapDataForDisplay = () => {
    console.log("mapData complet:", mapData);
    console.log("selectedYear:", selectedYear);

    if (!mapData) {
      console.log("Aucune donnée disponible, retour tableau vide");
      return [];
    }

    // Si la structure est mapData.{année}.[carrés]
    if (mapData[selectedYear] && Array.isArray(mapData[selectedYear])) {
      console.log(
        `Données trouvées pour l'année ${selectedYear}:`,
        mapData[selectedYear]
      );
      return mapData[selectedYear];
    }

    // Si mapData est directement un tableau
    if (Array.isArray(mapData)) {
      console.log("mapData est directement un tableau:", mapData);
      return mapData;
    }

    // Essayer d'autres structures possibles
    if (mapData.data && Array.isArray(mapData.data)) {
      console.log("Données trouvées dans mapData.data:", mapData.data);
      return mapData.data;
    }

    if (typeof mapData === "object") {
      console.log("mapData est un objet avec ces clés:", Object.keys(mapData));
      // Si aucune des structures attendues n'est trouvée, générer des données de test
      console.log("Structure non reconnue, génération de données de test");
      return generateTestData(selectedYear);
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

                {/* Affichage des erreurs */}
                {error && (
                  <Alert color="danger" className="mb-4">
                    {error}
                  </Alert>
                )}

                {/* Contenu de la carte */}
                <Row>
                  <Col>
                    {/* Dans votre MapPage.js */}
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
                          <i className="fas fa-spinner fa-spin fa-3x"></i>
                          <p className="mt-3">Chargement de la carte...</p>
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
                          <p>Sélectionnez une année pour afficher la carte</p>
                        </div>
                      )}
                    </div>
                  </Col>
                </Row>

                {/* Légende */}
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
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default MapPage;
