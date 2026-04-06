import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Button, Row, Col } from 'react-bootstrap';
import { QRCodeSVG } from 'qrcode.react';
import AppNavbar from '../components/Navbar';

function TicketSuccess() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const back = () => navigate('/dashboard');
  const another = () => navigate('/dashboard');

  const qrData = state
    ? (() => {
        const d = new Date(state.time);
        const dateStr = d.toLocaleDateString();
        const timeStr = d.toLocaleTimeString();
        return (
`Bangalore Metro Ticket

Ticket ID: ${state.id}
Passenger: ${state.passenger}

From: ${state.from}
To: ${state.to}

Tickets: ${state.quantity || 1}
Fare: ₹${(state.fare?.toFixed ? state.fare.toFixed(2) : state.fare)}

Date: ${dateStr}
Time: ${timeStr}`
        );
      })()
    : '';

  return (
    <>
      <AppNavbar />
      <div className="container py-5 d-flex justify-content-center">
        <Card className="shadow-lg rounded-3 ticket-card" style={{ maxWidth: 1100, width: '100%' }}>
          <Card.Header className="bg-success bg-gradient text-white">
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-check-circle-fill"></i>
              <span>Ticket Confirmed</span>
            </div>
          </Card.Header>
          <Card.Body className="p-4">
            {state ? (
              <Row className="g-4">
                <Col md={7}>
                  <div className="mb-2"><i className="bi bi-upc-scan me-2"></i>Ticket ID: <strong className="fs-5">{state.id}</strong></div>
                  <div className="mb-1"><i className="bi bi-person me-2"></i>Passenger: <strong className="fs-5">{state.passenger}</strong></div>
                  <div className="mb-1"><i className="bi bi-diagram-3 me-2"></i>Line: <strong className="fs-5">{state.line}</strong></div>
                  <div className="mb-1"><i className="bi bi-geo-alt me-2"></i>From: <strong className="fs-5">{state.from}</strong></div>
                  <div className="mb-1"><i className="bi bi-geo me-2"></i>To: <strong className="fs-5">{state.to}</strong></div>
                  <div className="mb-1"><i className="bi bi-signpost-split me-2"></i>Stops: <strong className="fs-5">{state.stops}</strong></div>
                  <div className="mb-1"><i className="bi bi-ticket-perforated me-2"></i>Tickets: <strong className="fs-5">{state.quantity || 1}</strong></div>
                  <div className="mb-1"><i className="bi bi-cash-stack me-2"></i>Fare per ticket: <strong className="fs-5">{state.farePerTicket?.toFixed ? state.farePerTicket.toFixed(2) : state.farePerTicket}</strong></div>
                  <div className="mb-3"><i className="bi bi-currency-rupee me-2"></i>Total Fare: <strong className="fs-5">{state.fare?.toFixed ? state.fare.toFixed(2) : state.fare}</strong></div>
                  <div className="mb-1"><i className="bi bi-calendar3 me-2"></i>Date: <strong className="fs-5">{new Date(state.time).toLocaleDateString()}</strong></div>
                  <div className="mb-3"><i className="bi bi-clock me-2"></i>Time: <strong className="fs-5">{new Date(state.time).toLocaleTimeString()}</strong></div>
                  <div className="d-flex gap-2 mt-2">
                    <Button size="lg" onClick={back}>Back to Dashboard</Button>
                    <Button size="lg" variant="secondary" onClick={another}>Book Another Ticket</Button>
                  </div>
                </Col>
                <Col md={5} className="d-flex flex-column align-items-center">
                  <div className="text-muted small text-center mb-2">Scan to verify ticket</div>
                  <div className="p-3 bg-light rounded-3 shadow-sm">
                    <QRCodeSVG value={qrData} size={200} bgColor="#ffffff" fgColor="#212529" includeMargin={false} />
                  </div>
                </Col>
              </Row>
            ) : (
              <div>No ticket data.</div>
            )}
          </Card.Body>
          <div className="perforation rounded-bottom"></div>
        </Card>
      </div>
    </>
  );
}

export default TicketSuccess;
