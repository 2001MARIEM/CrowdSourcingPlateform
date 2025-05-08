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
  const { logout } = useAuth();

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
                    src={require("../../assets/img/theme/team-4-800x800.jpg")}
                  />
                </span>
                <Media className="ml-2 d-none d-lg-block">
                  <span className="mb-0 text-sm font-weight-bold">
                    Jessica Jones
                  </span>
                </Media>
              </Media>
            </DropdownToggle>

            <DropdownMenu className="dropdown-menu-arrow" right>
              <DropdownItem className="noti-title" header tag="div">
                <h6 className="text-overflow m-0">Bienvenue !</h6>
              </DropdownItem>

              <DropdownItem to="/admin/user-profile" tag={Link}>
                <i className="ni ni-single-02" />
                <span>Mon profil</span>
              </DropdownItem>

              <DropdownItem divider />

              <DropdownItem onClick={logout}>
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
