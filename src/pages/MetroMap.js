import { Container, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import AppNavbar from '../components/Navbar';

function MetroMapPage() {
  const navigate = useNavigate();
  const back = () => navigate('/dashboard');
  return (
    <>
      <AppNavbar />
      <Container className="py-4">
        <Card className="shadow-sm">
          <Card.Header>Bangalore Metro Network</Card.Header>
          <Card.Body className="d-flex flex-column align-items-center">
            <div style={{ width: '100%', maxWidth: 960 }}>
              <img
                src="/metro-map.png"
                alt="Bangalore Metro Network"
                style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 8 }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="text-muted small text-center mt-2">
                Place your map image at public/metro-map.png
              </div>
            </div>
            <div className="d-flex justify-content-end w-100 mt-3">
              <Button onClick={back}>Back to Dashboard</Button>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}

export default MetroMapPage;
