import { useEffect, useMemo, useState } from 'react';
import { Container, Card, Form, Row, Col, Button, FloatingLabel } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import AppNavbar from '../components/Navbar';
import { metroLines } from '../data/metroLines';
import { FaArrowRight, FaLocationDot, FaTicket, FaUser } from 'react-icons/fa6';

function BookTicketPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const lineOptions = useMemo(() => Object.keys(metroLines), []);
  const [selectedLine, setSelectedLine] = useState(lineOptions[0] || '');
  const [stations, setStations] = useState(selectedLine ? metroLines[selectedLine] : []);
  const [name, setName] = useState('');
  const [from, setFrom] = useState(stations[0] || '');
  const [to, setTo] = useState(stations[1] || stations[0] || '');
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');
  const prefill = location.state?.prefill;

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

  useEffect(() => {
    if (!prefill) {
      return;
    }

    if (prefill.line && metroLines[prefill.line]) {
      const list = metroLines[prefill.line];
      setSelectedLine(prefill.line);
      setStations(list);
      setFrom(prefill.from && list.includes(prefill.from) ? prefill.from : list[0] || '');
      setTo(prefill.to && list.includes(prefill.to) ? prefill.to : list[1] || list[0] || '');
    }
  }, [prefill]);

  const proceed = () => {
    if (!name || !from || !to || from === to) {
      setError('Please enter a valid passenger name and select different source and destination stations.');
      return;
    }

    setError('');
    navigate('/confirm', { state: { passenger: name, from, to, quantity: Number(qty), line: selectedLine } });
  };
  const isReady = Boolean(name && from && to && from !== to);

  return (
    <>
      <AppNavbar title="Book Ticket" />
      <main className="app-main-content">
        <Container fluid>
          <div className="form-page-wrap">
            <div className="page-section-intro mb-4 text-center">
              <div className="page-eyebrow">Journey Builder</div>
              <p className="page-subtitle mb-0">Enter your trip details and continue to confirmation.</p>
            </div>

            <div className="form-shell">
              <Card className="p-1">
                <Card.Header className="section-card-header">
                  <FaTicket />
                  <span>Passenger Ticket Form</span>
                </Card.Header>
                <Card.Body className="p-4">
                  <Form>
                    {error ? <div className="feedback-message error mb-3">{error}</div> : null}
                    {isReady ? <div className="feedback-message success mb-3">Looks good. You can proceed to confirmation.</div> : null}
                    <Row className="g-3">
                      <Col md={12}>
                        <FloatingLabel controlId="passengerName" label="Passenger Name">
                          <Form.Control
                            value={name}
                            onChange={(e) => {
                              setName(e.target.value);
                              setError('');
                            }}
                            placeholder="Passenger Name"
                          />
                        </FloatingLabel>
                      </Col>
                      <Col md={12}>
                        <FloatingLabel controlId="lineSelect" label="Metro Line">
                          <Form.Select
                            value={selectedLine}
                            onChange={(e) => {
                              setSelectedLine(e.target.value);
                              setError('');
                            }}
                          >
                            {lineOptions.map((l) => (
                              <option key={l} value={l}>
                                {l}
                              </option>
                            ))}
                          </Form.Select>
                        </FloatingLabel>
                      </Col>
                      <Col md={6}>
                        <FloatingLabel controlId="fromSelect" label="Source Station">
                          <Form.Select
                            value={from}
                            onChange={(e) => {
                              setFrom(e.target.value);
                              setError('');
                            }}
                          >
                            {stations.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </Form.Select>
                        </FloatingLabel>
                      </Col>
                      <Col md={6}>
                        <FloatingLabel controlId="toSelect" label="Destination Station">
                          <Form.Select
                            value={to}
                            onChange={(e) => {
                              setTo(e.target.value);
                              setError('');
                            }}
                          >
                            {stations
                              .filter((s) => s !== from)
                              .map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                          </Form.Select>
                        </FloatingLabel>
                      </Col>
                      <Col md={6}>
                        <FloatingLabel controlId="qtySelect" label="Number of Tickets">
                          <Form.Select value={qty} onChange={(e) => setQty(e.target.value)}>
                            {[1, 2, 3, 4, 5, 6].map((n) => (
                              <option key={n} value={n}>
                                {n}
                              </option>
                            ))}
                          </Form.Select>
                        </FloatingLabel>
                      </Col>
                      <Col md={6} className="d-flex align-items-center">
                        <div className="w-100">
                          <div className="small text-muted mb-2">Journey Preview</div>
                          <div className="ticket-id-chip">
                            <FaUser />
                            {name || 'Passenger'}
                          </div>
                          <div className="mt-2 small text-muted d-flex align-items-center gap-2">
                            <FaLocationDot />
                            {from || '-'} to {to || '-'}
                          </div>
                          <div className="mt-3 small text-muted">
                            Have a discount code? You can apply it on the confirmation page.
                          </div>
                        </div>
                      </Col>
                    </Row>

                    <div className="mt-4">
                      <Button onClick={proceed} className="d-inline-flex align-items-center gap-2 form-submit-btn">
                        <FaArrowRight />
                        Proceed to Confirmation
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </div>
          </div>
        </Container>
      </main>
    </>
  );
}

export default BookTicketPage;
