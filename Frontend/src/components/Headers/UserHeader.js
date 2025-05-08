 
import { useAuth } from "context/AuthContext";
import { Button, Container, Row, Col } from "reactstrap";


const UserHeader = () => {
  const { user } = useAuth();
  console.log("User connecté :", user);
  return (
    <>
      <div
        className="header pb-8 pt-5 pt-lg-8 d-flex align-items-center"
        style={{
          minHeight: "300px",
          backgroundImage:
            "url(" + require("../../assets/img/theme/cc.png") + ")",
          backgroundSize: "cover",
          backgroundPosition: "center top",
        }}
      >
        {/* Mask */}
        <span className="mask bg-gradient-default opacity-8" />
        {/* Header container */}
        <Container className="d-flex align-items-center" fluid>
          <Row>
            <Col lg="7" md="10">
              <h1 className="display-2 text-white">
                salut {user?.prenom || "Évaluateur"}
              </h1>
              <p className="text-white mt-0 mb-5">
                Ceci est votre page de profil. Vous pouvez consulter vos
                informations personnelles et mettre à jour vos données pour
                garantir une évaluation optimale
              </p>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default UserHeader;
