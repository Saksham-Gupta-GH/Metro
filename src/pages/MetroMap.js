import { Container, Card, Button, Row, Col, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import AppNavbar from '../components/Navbar';
import { FaArrowLeft, FaClock, FaMapLocationDot, FaRoute, FaTrainSubway } from 'react-icons/fa6';

function MetroMapPage() {
  const navigate = useNavigate();
  const back = () => navigate('/dashboard');
  return (
    <>
      <AppNavbar title="Metro Map" />
      <main className="app-main-content">
        <Container fluid>
          <div className="page-section-intro mb-4">
            <div className="page-eyebrow">Network Reference</div>
            <p className="page-subtitle mb-0">Use the system map and quick notes to plan routes across Bangalore Metro lines.</p>
          </div>

          <Row className="g-4">
            <Col xl={8}>
              <Card>
                <Card.Header className="section-card-header">
                  <FaMapLocationDot />
                  <span>Bangalore Metro Network</span>
                </Card.Header>
                <Card.Body className="d-flex flex-column align-items-center p-4">
                  <div style={{ width: '100%' }}>
                    <img
                      src="/metro-map.png"
                      alt="Bangalore Metro Network"
                      style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 12 }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="text-muted small text-center mt-2">
                      Place your map image at public/metro-map.png
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col xl={4}>
              <Card className="h-100">
                <Card.Header className="section-card-header">
                  <FaTrainSubway />
                  <span>Quick Travel Notes</span>
                </Card.Header>
                <Card.Body className="p-0">
                  <ListGroup variant="flush" className="map-note-list">
                    <ListGroup.Item><FaRoute /> Use interchange stations to switch lines smoothly.</ListGroup.Item>
                    <ListGroup.Item><FaClock /> Peak travel windows usually need earlier planning.</ListGroup.Item>
                    <ListGroup.Item><FaMapLocationDot /> Keep the map open while selecting source and destination.</ListGroup.Item>
                  </ListGroup>
                  <div className="p-4 pt-3">
                    <Button onClick={back} className="d-inline-flex align-items-center gap-2">
                      <FaArrowLeft />
                      Back to Dashboard
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </main>
    </>
  );
}

export default MetroMapPage;
