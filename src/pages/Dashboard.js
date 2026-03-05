import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import AppNavbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();
  const toMap = () => navigate('/map');
  const toBook = () => navigate('/book');

  return (
    <>
      <AppNavbar />
      <Container className="py-5">
        <Row className="g-4">
          <Col md={6}>
            <Card className="shadow-sm rounded-3 h-100 dash-card card-accent-primary" style={{ minHeight: 560 }}>
              <Card.Header className="fw-semibold">Book Ticket</Card.Header>
              <Card.Body className="d-flex flex-column p-4">
                <div className="mb-3">
                  <div className="text-muted">Plan your journey and book tickets quickly.</div>
                </div>
                <div className="mt-auto d-flex justify-content-end">
                  <Button size="lg" onClick={toBook}>Book Ticket</Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="shadow-sm rounded-3 h-100 dash-card card-accent-info" style={{ minHeight: 560 }}>
              <Card.Header className="fw-semibold">View Metro Map</Card.Header>
              <Card.Body className="d-flex flex-column p-4">
                <div className="flex-grow-1">
                  <img
                    src="/metro-map.png"
                    alt="Metro Map"
                    style={{ width: '100%', maxHeight: 420, objectFit: 'contain', borderRadius: 8 }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="text-muted small mt-2"></div>
                </div>
                <div className="mt-3 d-flex justify-content-end">
                  <Button size="lg" variant="danger" onClick={toMap}>View Full Metro Map</Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Dashboard;
