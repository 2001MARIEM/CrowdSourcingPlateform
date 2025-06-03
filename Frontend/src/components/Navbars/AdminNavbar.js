import { useAuth } from "context/AuthContext";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  DropdownToggle,
  Navbar,
  Nav,
  Container,
  Media,
} from "reactstrap";

const AdminNavbar = () => {
  const { user, logout } = useAuth();
  const handleLogout = () => {
    logout();
  };
  console.log("🔍 User dans navbar:", user);
  console.log("🔍 Prenom:", user?.prenom);
  console.log("🔍 Nom:", user?.nom);
  return (
    <Navbar className="navbar-top navbar-dark" expand="md" id="navbar-main">
      <Container fluid className="justify-content-end">
        <Nav className="align-items-center" navbar>
          <UncontrolledDropdown nav>
            <DropdownToggle className="pr-0" nav>
              <Media className="align-items-center">
                <span className="avatar avatar-sm rounded-circle">
                  <img
                    alt="..."
                    src={require("../../assets/img/theme/admin.png")}
                  />
                </span>
                <div className="ml-2 d-lg-block">
                  <span className="mb-0 text-sm font-weight-bold">
                    {user?.prenom} {user?.nom}
                  </span>
                </div>
              </Media>
            </DropdownToggle>

            <DropdownMenu className="dropdown-menu-arrow" right>
              <DropdownItem className="noti-title" header tag="div">
                <h6 className="text-overflow m-0">Bienvenue !</h6>
              </DropdownItem>

              <DropdownItem to="/admin/profile" tag={Link}>
                <i className="ni ni-single-02" />
                <span>Mon profil</span>
              </DropdownItem>

              <DropdownItem divider />

              <DropdownItem onClick={handleLogout}>
                <i className="ni ni-user-run" />
                <span>Déconnexion</span>
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default AdminNavbar;
