import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Button } from 'react-bootstrap';
import AppNavbar from '../components/Navbar';
import { metroLines } from '../data/metroLines';

function TicketConfirm() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    return (
      <>
        <AppNavbar />
        <div className="p-4">No ticket data. Go back to Dashboard.</div>
      </>
    );
  }

  const { passenger, from, to, quantity = 1, line } = state;
  const list = line ? metroLines[line] || [] : [];
  const i = list.indexOf(from);
  const j = list.indexOf(to);
  const stops = i >= 0 && j >= 0 ? Math.abs(i - j) : 0;
  const farePerTicket = Math.max(10, stops * 10);
  const fareTotal = farePerTicket * quantity;

  const confirm = () => {
    const id = `MT-${Date.now().toString(36).toUpperCase()}`;
    navigate('/success', {
      state: {
        id,
        passenger,
        from,
        to,
        quantity,
        fare: Number(fareTotal.toFixed(2)),
        time: new Date().toISOString(),
      },
    });
  };

  const cancel = () => navigate('/dashboard');

  return (
    <>
      <AppNavbar />
      <div className="container py-5">
        <Card className="shadow-lg rounded-3 ticket-summary" style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Card.Header className="fw-semibold bg-primary bg-gradient text-white">Ticket Summary</Card.Header>
          <Card.Body className="p-4">
            <Row className="g-4">
              <Col md={7}>
                <div className="mb-2"><span className="label">Passenger</span><div className="value fs-5">{passenger}</div></div>
                <div className="mb-2"><span className="label">Line</span><div className="value fs-5">{line || '-'}</div></div>
                <div className="mb-2"><span className="label">From</span><div className="value fs-5">{from}</div></div>
                <div className="mb-2"><span className="label">To</span><div className="value fs-5">{to}</div></div>
                <div className="mb-2"><span className="label">Stations (hops)</span><div className="value fs-5">{stops}</div></div>
              </Col>
              <Col md={5}>
                <div className="mb-2"><span className="label">Number of Tickets</span><div className="value fs-5">{quantity}</div></div>
                <div className="mb-2"><span className="label">Fare per ticket</span><div className="value fs-5">₹ {farePerTicket.toFixed(2)}</div></div>
                <div className="mb-2"><span className="label">Total Fare</span><div className="value fs-5">₹ {fareTotal.toFixed(2)}</div></div>
              </Col>
              <Col xs={12}>
                <div className="perforation rounded-3 my-2"></div>
                <div className="text-end mt-2">
                  <Button size="lg" variant="secondary" className="me-2" onClick={cancel}>Cancel</Button>
                  <Button size="lg" onClick={confirm}>Confirm Ticket</Button>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </div>
    </>
  );
}

export default TicketConfirm;
