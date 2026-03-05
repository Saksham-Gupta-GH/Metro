import { Navbar, Container, Nav } from 'react-bootstrap';
import { useNavigate, NavLink } from 'react-router-dom';

function AppNavbar() {
  const navigate = useNavigate();
  const user = typeof window !== 'undefined' ? localStorage.getItem('metroUser') : null;
  if (!user) return null;
  const logout = () => {
    localStorage.removeItem('metroUser');
    navigate('/login', { replace: true });
  };
  return (
    <Navbar variant="dark" expand="lg" className="shadow-sm navbar-gradient">
      <Container>
        <Navbar.Brand>Intelligent Metro Network</Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="ms-auto">
            <Nav.Link as={NavLink} to="/dashboard">Dashboard</Nav.Link>
            <Nav.Link as={NavLink} to="/book">Book Ticket</Nav.Link>
            <Nav.Link onClick={logout}>Logout</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default AppNavbar;
