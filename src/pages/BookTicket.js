import { useEffect, useMemo, useState } from 'react';
import { Container, Card, Form, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import AppNavbar from '../components/Navbar';
import { metroLines } from '../data/metroLines';

function BookTicketPage() {
  const navigate = useNavigate();
  const lineOptions = useMemo(() => Object.keys(metroLines), []);
  const [selectedLine, setSelectedLine] = useState(lineOptions[0] || '');
  const [stations, setStations] = useState(selectedLine ? metroLines[selectedLine] : []);
  const [name, setName] = useState('');
  const [from, setFrom] = useState(stations[0] || '');
  const [to, setTo] = useState(stations[1] || stations[0] || '');
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (selectedLine) {
      const list = metroLines[selectedLine] || [];
      setStations(list);
      setFrom(list[0] || '');
      setTo(list[1] || list[0] || '');
    } else {
      setStations([]);
      setFrom('');
      setTo('');
    }
  }, [selectedLine]);

  const proceed = () => {
    if (!name || !from || !to || from === to) return;
    navigate('/confirm', { state: { passenger: name, from, to, quantity: Number(qty), line: selectedLine } });
  };

  return (
    <>
      <AppNavbar />
      <Container className="py-5">
        <Card className="shadow-sm rounded-3 p-1">
          <Card.Header className="fw-semibold bg-info bg-gradient text-white">Book Ticket</Card.Header>
          <Card.Body className="p-4">
            <Form>
              <Row className="g-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label><i className="bi bi-person me-2"></i>Passenger Name</Form.Label>
                    <Form.Control size="lg" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter name" />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label><i className="bi bi-signpost-2 me-2"></i>Metro Line</Form.Label>
                    <Form.Select size="lg" value={selectedLine} onChange={(e) => setSelectedLine(e.target.value)}>
                      {lineOptions.map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label><i className="bi bi-geo-alt me-2"></i>Source Station</Form.Label>
                    <Form.Select size="lg" value={from} onChange={(e) => setFrom(e.target.value)}>
                      {stations.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label><i className="bi bi-geo me-2"></i>Destination Station</Form.Label>
                    <Form.Select size="lg" value={to} onChange={(e) => setTo(e.target.value)}>
                      {stations
                        .filter((s) => s !== from)
                        .map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label><i className="bi bi-ticket-perforated me-2"></i>Number of Tickets</Form.Label>
                    <Form.Select size="lg" value={qty} onChange={(e) => setQty(e.target.value)}>
                      {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <div className="text-end mt-3">
                <Button size="lg" className="btn btn-primary" onClick={proceed}>
                  <i className="bi bi-arrow-right-circle me-2"></i>
                  Proceed to Confirmation
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}

export default BookTicketPage;
