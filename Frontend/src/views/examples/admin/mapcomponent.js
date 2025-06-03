import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Row,
  Col,
  Badge,
  Progress,
} from "reactstrap";

const MapComponent = ({ data, viewMode }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  // États pour la modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [currentEvalIndex, setCurrentEvalIndex] = useState(0);

  // Effet pour initialiser la carte
  useEffect(() => {
    console.log("Initialisation de la carte, élément DOM:", mapRef.current);

    // Initialisation de la carte si elle n'existe pas
    if (!mapInstanceRef.current && mapRef.current) {
      // Coordonnées de Grenoble: ~45.18, 5.72
      mapInstanceRef.current = L.map(mapRef.current).setView([45.18, 5.72], 13);
      console.log("Carte initialisée");

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapInstanceRef.current);

      markersLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    }

    return () => {
      // Nettoyer la carte lors du démontage du composant
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Convertit une URL Vimeo en URL embarquée
  const convertToVimeoEmbed = (url) => {
    if (!url) return "";
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? `https://player.vimeo.com/video/${match[1]}` : url;
  };

  // Calcul du score total
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

  // Obtenir la couleur en fonction du score
  const getScoreColor = (score) => {
    return score < -5
      ? "danger"
      : score < 0
      ? "warning"
      : score < 5
      ? "info"
      : "success";
  };

  // Navigation entre les évaluations
  const navigateEvaluation = (direction) => {
    if (!selectedSquare || !selectedSquare.evaluations) return;

    const totalEvals = selectedSquare.evaluations.length;
    if (direction === "next") {
      setCurrentEvalIndex((currentEvalIndex + 1) % totalEvals);
    } else {
      setCurrentEvalIndex((currentEvalIndex - 1 + totalEvals) % totalEvals);
    }
  };

  // Fermer la modal
  const closeModal = () => {
    setModalOpen(false);
    setSelectedSquare(null);
    setCurrentEvalIndex(0);
  };

  // Effet pour mettre à jour les marqueurs
  useEffect(() => {
    // Mise à jour des marqueurs lorsque les données ou le mode de vue changent
    if (mapInstanceRef.current && markersLayerRef.current && data) {
      console.log("Mise à jour des marqueurs");

      // Supprimer les marqueurs existants
      markersLayerRef.current.clearLayers();

      console.log("Type de data reçu:", typeof data, Array.isArray(data), data);

      // Vérifier que data est bien un tableau et qu'il n'est pas vide
      if (Array.isArray(data) && data.length > 0) {
        console.log(`Ajout de ${data.length} marqueurs sur la carte`);

        // Ajouter les nouveaux marqueurs
        data.forEach((square) => {
          console.log("Square data:", square);

          if (square && square.coords) {
            console.log(
              "Type de coords:",
              typeof square.coords,
              JSON.stringify(square.coords)
            );

            // Extraire les coordonnées en gérant le format spécifique
            let lat, lng;

            // Format spécifique: {lat_1, lng_1, lat_2, lng_2, x_coords}
            if (typeof square.coords === "object") {
              if (
                square.coords.lat_1 !== undefined &&
                square.coords.lng_1 !== undefined
              ) {
                // Utiliser le centre du rectangle défini par (lat_1, lng_1) et (lat_2, lng_2)
                lat =
                  (square.coords.lat_1 +
                    (square.coords.lat_2 || square.coords.lat_1)) /
                  2;
                lng =
                  (square.coords.lng_1 +
                    (square.coords.lng_2 || square.coords.lng_1)) /
                  2;
                console.log(`Centre calculé: [${lat}, ${lng}]`);
              }
              // Cas de secours: tenter d'autres formats
              else if (
                square.coords.lat !== undefined &&
                square.coords.lng !== undefined
              ) {
                lat = square.coords.lat;
                lng = square.coords.lng;
              } else if (
                square.coords.latitude !== undefined &&
                square.coords.longitude !== undefined
              ) {
                lat = square.coords.latitude;
                lng = square.coords.longitude;
              }
            }
            // Format tableau: [lat, lng]
            else if (
              Array.isArray(square.coords) &&
              square.coords.length >= 2
            ) {
              [lat, lng] = square.coords;
            }

            if (lat === undefined || lng === undefined) {
              console.error(
                "Format de coordonnées non reconnu:",
                square.coords
              );
              return; // Passer au carré suivant
            }

            // Déterminer la couleur en fonction du score
            const score = square.score;
            let color;

            if (score <= -10)
              color = "rgb(255, 0, 0)"; // Rouge vif pour très négatif
            else if (score >= 10)
              color = "rgb(0, 128, 0)"; // Vert vif pour très positif
            else {
              // Calculer un dégradé
              const normalizedScore = (score + 10) / 20; // Convertir de [-10, 10] à [0, 1]
              const red = Math.round(255 * (1 - normalizedScore));
              const green = Math.round(128 * normalizedScore);
              color = `rgb(${red}, ${green}, 0)`;
            }

            // Dimensions du rectangle
            let bounds;

            // Si on a lat_1/lng_1 et lat_2/lng_2, créer un rectangle basé sur ces coordonnées
            if (
              square.coords.lat_1 !== undefined &&
              square.coords.lng_1 !== undefined &&
              square.coords.lat_2 !== undefined &&
              square.coords.lng_2 !== undefined
            ) {
              bounds = [
                [square.coords.lat_1, square.coords.lng_1],
                [square.coords.lat_2, square.coords.lng_2],
              ];
              console.log("Rectangle bounds:", bounds);
            }
            // Sinon, créer un carré autour du point central
            else {
              const squareSize = 0.002; // Taille réduite pour Grenoble (plus urbain)
              bounds = [
                [lat - squareSize / 2, lng - squareSize / 2],
                [lat + squareSize / 2, lng + squareSize / 2],
              ];
            }

            // Créer un rectangle sur la carte
            try {
              const rectangle = L.rectangle(bounds, {
                color: "black",
                weight: 1,
                fillColor: color,
                fillOpacity: 0.7,
              });
              rectangle.addTo(markersLayerRef.current);
              console.log("Rectangle ajouté à la carte");

              // Créer le contenu du popup
              const popupContent = `
<div style="text-align: center;">
  <strong>Score: ${score}</strong><br>
  Carré #${square.square_index}<br>
  <span style="font-size: 12px; color: #666;">(Cliquez pour détails)</span>
</div>
`;

              // Créer un popup qui ne s'ouvrira pas automatiquement au clic
              const popup = L.popup({
                autoClose: true,
                closeOnClick: false,
              }).setContent(popupContent);

              // Événements de survol pour afficher/masquer le popup
              rectangle.on("mouseover", function (e) {
                // Ouvrir le popup à la position de la souris
                popup.setLatLng(e.latlng).openOn(mapInstanceRef.current);
              });

              rectangle.on("mouseout", function () {
                // Fermer le popup quand la souris quitte le rectangle
                mapInstanceRef.current.closePopup(popup);
              });

              // Au clic sur le rectangle, ouvrir la modal détaillée
              rectangle.on("click", function () {
                setSelectedSquare(square);
                setCurrentEvalIndex(0);
                setModalOpen(true);
              });
            } catch (error) {
              console.error("Erreur lors de la création du rectangle:", error);
            }
          }
        });

        // Ajuster la vue pour montrer tous les marqueurs
        try {
          console.log("Ajustement de la vue de la carte");
          const validBounds = [];

          data.forEach((square) => {
            if (square && square.coords) {
              if (typeof square.coords === "object") {
                if (
                  square.coords.lat_1 !== undefined &&
                  square.coords.lng_1 !== undefined
                ) {
                  if (
                    square.coords.lat_2 !== undefined &&
                    square.coords.lng_2 !== undefined
                  ) {
                    // Utiliser les coins du rectangle
                    validBounds.push([
                      [square.coords.lat_1, square.coords.lng_1],
                      [square.coords.lat_2, square.coords.lng_2],
                    ]);
                  }
                }
              }
            }
          });

          if (validBounds.length > 0) {
            console.log("Bounds valides trouvés:", validBounds);

            // Créer un seul LatLngBounds qui englobe tous les rectangles
            const allBounds = L.latLngBounds([]);

            validBounds.forEach((bounds) => {
              // Ajouter les deux coins du rectangle au LatLngBounds
              allBounds.extend(L.latLng(bounds[0][0], bounds[0][1]));
              allBounds.extend(L.latLng(bounds[1][0], bounds[1][1]));
            });

            console.log("Bounds à appliquer:", allBounds);
            mapInstanceRef.current.fitBounds(allBounds, { padding: [50, 50] });
          } else {
            // Si pas de bounds valides, centrer sur Grenoble
            console.log("Pas de bounds valides, centrage sur Grenoble");
            mapInstanceRef.current.setView([45.18, 5.72], 13);
          }
        } catch (error) {
          console.error("Erreur lors de l'ajustement de la vue:", error);
        }
      } else {
        console.log("Aucune donnée de carte valide à afficher", data);
      }
    }
  }, [data, viewMode]);

  // Liste des critères d'évaluation
  const evaluationCriteria = [
    { label: "Beauté", key: "beauty", color: "success" },
    { label: "Ennui", key: "boring", color: "warning" },
    { label: "Dépression", key: "depressing", color: "danger" },
    { label: "Vivacité", key: "lively", color: "info" },
    { label: "Richesse", key: "wealthy", color: "primary" },
    { label: "Sécurité", key: "safe", color: "success" },
  ];

  return (
    <>
      <div
        ref={mapRef}
        style={{ width: "100%", height: "600px", border: "1px solid #ccc" }}
        id="map-container-leaflet"
      />

      {/* Modal pour afficher les détails d'une évaluation */}
      <Modal isOpen={modalOpen} toggle={closeModal} size="lg">
        <ModalHeader toggle={closeModal}>
          {selectedSquare && (
            <>
              Détails du Carré #{selectedSquare.square_index}
              <Badge
                color={
                  selectedSquare ? getScoreColor(selectedSquare.score) : "info"
                }
                className="ml-2"
              >
                Score: {selectedSquare.score}
              </Badge>
            </>
          )}
        </ModalHeader>
        <ModalBody>
          {selectedSquare &&
          selectedSquare.evaluations &&
          selectedSquare.evaluations.length > 0 ? (
            <Row>
              <Col md="6">
                {selectedSquare.evaluations[currentEvalIndex].media_info
                  ?.type === "video" ? (
                  <div
                    className="ratio ratio-16by9 mb-3"
                    style={{ paddingBottom: "56.25%" }}
                  >
                    <iframe
                      src={convertToVimeoEmbed(
                        selectedSquare.evaluations[currentEvalIndex].media_info
                          .url
                      )}
                      title="Vidéo évaluée"
                      allowFullScreen
                      frameBorder="0"
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        border: "none",
                      }}
                    />
                  </div>
                ) : (
                  <img
                    src={
                      selectedSquare.evaluations[currentEvalIndex].media_info
                        ?.url
                    }
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
                    <strong>Utilisateur:</strong>{" "}
                    {selectedSquare.evaluations[currentEvalIndex]
                      .evaluator_email || "Anonyme"}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(
                      selectedSquare.evaluations[currentEvalIndex].created_at
                    ).toLocaleString()}
                  </p>
                  <p>
                    <strong>Lieu:</strong>{" "}
                    {selectedSquare.evaluations[currentEvalIndex].media_info
                      ?.place || "Non spécifié"}
                  </p>
                  <p>
                    <strong>Année:</strong>{" "}
                    {selectedSquare.evaluations[currentEvalIndex].media_info
                      ?.year || "Non spécifiée"}
                  </p>
                  <p>
                    <strong>Type:</strong>{" "}
                    {selectedSquare.evaluations[currentEvalIndex].media_info
                      ?.type === "video"
                      ? "Vidéo"
                      : "Image"}
                  </p>
                  <p>
                    <strong>Commentaire:</strong>{" "}
                    {selectedSquare.evaluations[currentEvalIndex].comment ||
                      "—"}
                  </p>
                </div>
              </Col>
              <Col md="6">
                <h5>Critères d'évaluation</h5>
                {evaluationCriteria.map(({ label, key, color }) => (
                  <div key={key} className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span>{label}</span>
                      <span>
                        {selectedSquare.evaluations[currentEvalIndex][key] || 0}
                        /5
                      </span>
                    </div>
                    <Progress
                      value={
                        (selectedSquare.evaluations[currentEvalIndex][key] ||
                          0) * 20
                      }
                      color={color}
                    />
                  </div>
                ))}
                <div className="mt-4">
                  <h5>Score total</h5>
                  <div className="d-flex justify-content-between mb-1">
                    <span>Score combiné</span>
                    <span>
                      {calculateTotalScore(
                        selectedSquare.evaluations[currentEvalIndex]
                      )}
                    </span>
                  </div>
                  <Progress
                    value={
                      (calculateTotalScore(
                        selectedSquare.evaluations[currentEvalIndex]
                      ) +
                        30) *
                      (100 / 60)
                    }
                    color={getScoreColor(
                      calculateTotalScore(
                        selectedSquare.evaluations[currentEvalIndex]
                      )
                    )}
                  />
                  <div className="mt-3 text-muted small">
                    <p>
                      Calcul du score: (beauté + vivacité + richesse + sécurité)
                      - (ennui + dépression)
                    </p>
                  </div>
                </div>

                {/* Navigation entre les évaluations */}
                {selectedSquare.evaluations.length > 1 && (
                  <div className="mt-4">
                    <div className="d-flex justify-content-between align-items-center">
                      <span>
                        Évaluation {currentEvalIndex + 1}/
                        {selectedSquare.evaluations.length}
                      </span>
                      <div>
                        <Button
                          color="secondary"
                          size="sm"
                          onClick={() => navigateEvaluation("prev")}
                          className="mr-2"
                        >
                          <i className="fas fa-chevron-left"></i> Précédent
                        </Button>
                        <Button
                          color="secondary"
                          size="sm"
                          onClick={() => navigateEvaluation("next")}
                        >
                          Suivant <i className="fas fa-chevron-right"></i>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </Col>
            </Row>
          ) : (
            <div className="text-center my-4">
              <p>Aucune évaluation disponible pour ce carré.</p>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={closeModal}>
            Fermer
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default MapComponent;
