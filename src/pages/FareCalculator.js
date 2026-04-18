import { useState } from 'react';
import { Button, Card, Container, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaArrowRightArrowLeft } from 'react-icons/fa6';
import AppNavbar from '../components/Navbar';
import { allStations, calculateLocalJourney } from '../utils/metro';

function FareCalculator() {
  const navigate = useNavigate();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [ticketType, setTicketType] = useState('single');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const calculateFare = () => {
    if (!from || !to || from === to) {
      setError('Please select different source and destination stations.');
      setResult(null);
      return;
    }

    const journey = calculateLocalJourney(from, to, ticketType);

    if (!journey) {
      setError('Unable to calculate this route right now.');
      setResult(null);
      return;
    }

    setError('');
    setResult(journey);
  };

  return (
    <>
      <AppNavbar title="Fare Calculator" />
      <main className="app-main-content">
        <Container fluid>
          <div className="form-shell">
            <Card>
              <Card.Header className="section-card-header">Fare Calculator</Card.Header>
              <Card.Body className="p-4">
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Source Station</Form.Label>
                    <Form.Control list="stations-list" value={from} onChange={(event) => setFrom(event.target.value)} />
                  </Form.Group>
                  <div className="text-center mb-3">
                    <Button variant="outline-dark" onClick={() => {
                      const currentFrom = from;
                      setFrom(to);
                      setTo(currentFrom);
                    }}>
                      <FaArrowRightArrowLeft />
                    </Button>
                  </div>
                  <Form.Group className="mb-3">
                    <Form.Label>Destination Station</Form.Label>
                    <Form.Control list="stations-list" value={to} onChange={(event) => setTo(event.target.value)} />
                    <datalist id="stations-list">
                      {allStations.map((station) => (
                        <option key={station} value={station} />
                      ))}
                    </datalist>
                  </Form.Group>
                  <div className="d-flex gap-2 mb-3">
                    <Button
                      variant={ticketType === 'single' ? 'primary' : 'outline-dark'}
                      onClick={() => setTicketType('single')}
                    >
                      Single
                    </Button>
                    <Button
                      variant={ticketType === 'return' ? 'primary' : 'outline-dark'}
                      onClick={() => setTicketType('return')}
                    >
                      Return
                    </Button>
                  </div>
                  {error ? <div className="invalid-feedback d-block mb-3">{error}</div> : null}
                  <Button className="form-submit-btn" onClick={calculateFare}>
                    Calculate Fare
                  </Button>
                </Form>

                {result ? (
                  <div className="fare-result mt-4">
                    <div className="fare-amount">₹{result.fare}</div>
                    <div className="fare-meta">Distance: {result.distance} km</div>
                    <div className="fare-meta">Estimated Travel Time: {result.travelTime} min</div>
                    <div className="fare-meta">
                      Interchange required: {result.interchangeRequired ? `Yes (${result.interchangeStation})` : 'No'}
                    </div>
                    <Button
                      className="mt-3"
                      onClick={() => navigate('/book', { state: { prefill: { from, to, line: result.line } } })}
                    >
                      Book This Ticket
                    </Button>
                  </div>
                ) : null}
              </Card.Body>
            </Card>
          </div>
        </Container>
      </main>
    </>
  );
}

export default FareCalculator;
