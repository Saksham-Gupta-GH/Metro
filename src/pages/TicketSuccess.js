import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Button, Row, Col, Container } from 'react-bootstrap';
import { QRCodeSVG } from 'qrcode.react';
import AppNavbar from '../components/Navbar';
import {
  FaArrowLeft,
  FaCalendarDay,
  FaCircleCheck,
  FaClock,
  FaLocationDot,
  FaMapLocationDot,
  FaMoneyBillWave,
  FaQrcode,
  FaTicket,
  FaUser,
} from 'react-icons/fa6';

function TicketSuccess() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const back = () => navigate('/dashboard');
  const another = () => navigate('/book');

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
      <AppNavbar title="Ticket Confirmed" />
      <main className="app-main-content">
        <Container fluid>
          <div className="page-section-intro mb-4">
            <div className="page-eyebrow">Booking Complete</div>
            <p className="page-subtitle mb-0">Your metro ticket is ready to use and can be verified from the QR panel.</p>
          </div>

          <Row className="justify-content-center">
            <Col xxl={10}>
              <Card className="ticket-card">
                <Card.Header className="section-card-header">
                  <FaCircleCheck />
                  <span>Booking Success</span>
                </Card.Header>
                <Card.Body className="p-4">
                  {state ? (
                    <Row className="g-4 summary-grid">
                      <Col lg={7}>
                        <div className="ticket-id-chip mb-3">
                          <FaTicket />
                          Ticket ID: {state.id}
                        </div>
                        <div className="mb-2 d-flex align-items-center gap-2"><FaUser /> Passenger: <strong>{state.passenger}</strong></div>
                        <div className="mb-2 d-flex align-items-center gap-2"><FaMapLocationDot /> Line: <strong>{state.line}</strong></div>
                        <div className="mb-2 d-flex align-items-center gap-2"><FaLocationDot /> From: <strong>{state.from}</strong></div>
                        <div className="mb-2 d-flex align-items-center gap-2"><FaLocationDot /> To: <strong>{state.to}</strong></div>
                        <div className="mb-2 d-flex align-items-center gap-2"><FaTicket /> Tickets: <strong>{state.quantity || 1}</strong></div>
                        <div className="mb-2 d-flex align-items-center gap-2">
                          <FaMoneyBillWave />
                          Fare per ticket:
                          <strong>{state.farePerTicket?.toFixed ? state.farePerTicket.toFixed(2) : state.farePerTicket}</strong>
                        </div>
                        <div className="mb-2 d-flex align-items-center gap-2">
                          <FaMoneyBillWave />
                          Total Fare:
                          <strong>{state.fare?.toFixed ? state.fare.toFixed(2) : state.fare}</strong>
                        </div>
                        {state.discountCode ? (
                          <div className="mb-2 d-flex align-items-center gap-2">
                            <FaTicket />
                            Discount Code:
                            <strong>{state.discountCode}</strong>
                          </div>
                        ) : null}
                        <div className="mb-2 d-flex align-items-center gap-2"><FaCalendarDay /> Date: <strong>{new Date(state.time).toLocaleDateString()}</strong></div>
                        <div className="mb-3 d-flex align-items-center gap-2"><FaClock /> Time: <strong>{new Date(state.time).toLocaleTimeString()}</strong></div>
                        <div className="d-flex flex-wrap gap-2 mt-3">
                          <Button onClick={back} className="d-inline-flex align-items-center gap-2 px-4">
                            <FaArrowLeft />
                            Back to Dashboard
                          </Button>
                          <Button variant="outline-primary" onClick={another} className="d-inline-flex align-items-center gap-2 px-4">
                            <FaTicket />
                            Book Another Ticket
                          </Button>
                        </div>
                      </Col>
                      <Col lg={5} className="d-flex flex-column align-items-center justify-content-center">
                        <Card className="w-100">
                          <Card.Body className="p-4 text-center">
                            <div className="small text-muted mb-3 d-flex align-items-center justify-content-center gap-2">
                              <FaQrcode />
                              Scan to verify ticket
                            </div>
                            <div className="p-3 rounded-3 bg-light d-inline-block">
                              <QRCodeSVG value={qrData} size={200} bgColor="#ffffff" fgColor="#212529" includeMargin={false} />
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  ) : (
                    <div className="feedback-message error mb-0">No ticket data available.</div>
                  )}
                </Card.Body>
                <div className="perforation rounded-bottom"></div>
              </Card>
            </Col>
          </Row>
        </Container>
      </main>
    </>
  );
}

export default TicketSuccess;
