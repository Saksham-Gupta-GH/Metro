import { useEffect, useState } from 'react';
import { Button, Card, Col, Container, Modal, Nav, Row } from 'react-bootstrap';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AppNavbar from '../components/Navbar';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import { lineColors } from '../utils/metro';

function MyTickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [activeTab, setActiveTab] = useState('Upcoming');
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [viewTicket, setViewTicket] = useState(null);

  const loadTickets = async () => {
    setLoading(true);

    try {
      const response = await api.get('/api/tickets/mine');
      setTickets(response.data.tickets || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const filteredTickets = tickets.filter((ticket) =>
    activeTab === 'Upcoming' ? ticket.status === 'Confirmed' : ticket.status === 'Cancelled'
  );

  const downloadTicket = (ticketId) => {
    const svg = document.getElementById(`qr-${ticketId}`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const image = new Image();
    canvas.width = 220;
    canvas.height = 220;
    image.onload = () => {
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 10, 10, 200, 200);
      const link = document.createElement('a');
      link.download = `${ticketId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    image.src = `data:image/svg+xml;base64,${window.btoa(unescape(encodeURIComponent(svgData)))}`;
  };

  const cancelTicket = async () => {
    if (!selectedTicket) return;

    try {
      await api.post(`/api/tickets/${selectedTicket.ticketId}/cancel`);
      toast.success('Ticket cancelled successfully.');
      setSelectedTicket(null);
      loadTickets();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to cancel ticket.');
    }
  };

  return (
    <>
      <AppNavbar title="My Tickets" />
      <main className="app-main-content">
        <Container fluid>
          <div className="page-section-intro mb-4">
            <div>
              <div className="page-eyebrow">Ticket Center</div>
              <p className="page-subtitle mb-0">Manage current bookings, download QR tickets, and cancel if needed.</p>
            </div>
          </div>

          <Card>
            <Card.Body className="p-4">
              <Nav variant="pills" className="ticket-tabs mb-4">
                {['Upcoming', 'Past'].map((tab) => (
                  <Nav.Item key={tab}>
                    <Nav.Link active={activeTab === tab} onClick={() => setActiveTab(tab)}>
                      {tab}
                    </Nav.Link>
                  </Nav.Item>
                ))}
              </Nav>

              {loading ? <LoadingSpinner label="Loading your tickets..." /> : null}

              {!loading && filteredTickets.length === 0 ? (
                <EmptyState
                  title="No tickets yet"
                  description="Your booked tickets will appear here once you complete a journey booking."
                  actionLabel="Book Now"
                  onAction={() => navigate('/book')}
                />
              ) : null}

              <div className="d-grid gap-3">
                {filteredTickets.map((ticket) => (
                  <Card key={ticket.ticketId} className="ticket-list-card ticket-clickable" onClick={() => setViewTicket(ticket)}>
                    <Card.Body className="p-0">
                      <Row className="g-0">
                        <Col lg={8}>
                          <div className="ticket-list-left">
                            <div
                              className="ticket-line-bar"
                              style={{ backgroundColor: lineColors[ticket.line] || 'var(--accent)' }}
                            />
                            <div className="ticket-list-content">
                              <div className="ticket-id-chip mb-3">{ticket.ticketId}</div>
                              <h3>{ticket.from} → {ticket.to}</h3>
                              <div className="text-muted mb-2">{ticket.line}</div>
                              <div className="ticket-detail-grid">
                                <span>{new Date(ticket.createdAt || ticket.time).toLocaleString()}</span>
                                <span>₹{ticket.totalFare || ticket.fare}</span>
                                <span>{ticket.status}</span>
                              </div>
                            </div>
                          </div>
                        </Col>
                        <Col lg={4} className="ticket-list-right">
                          <QRCodeSVG
                            id={`qr-${ticket.ticketId}`}
                            value={`${ticket.ticketId}|${ticket.from}|${ticket.to}|${ticket.line}`}
                            size={120}
                            bgColor="#ffffff"
                            fgColor="#18181b"
                          />
                          <div className="d-flex flex-wrap gap-2 mt-3 justify-content-center">
                            <Button onClick={(event) => {
                              event.stopPropagation();
                              downloadTicket(ticket.ticketId);
                            }}>Download Ticket</Button>
                            {activeTab === 'Upcoming' ? (
                              <Button variant="danger" onClick={(event) => {
                                event.stopPropagation();
                                setSelectedTicket(ticket);
                              }}>
                                Cancel Ticket
                              </Button>
                            ) : null}
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Container>
      </main>

      <ConfirmModal
        show={Boolean(selectedTicket)}
        onHide={() => setSelectedTicket(null)}
        onConfirm={cancelTicket}
        title="Cancel Ticket"
        body="Are you sure you want to cancel this upcoming ticket?"
        confirmLabel="Cancel Ticket"
      />

      <Modal show={Boolean(viewTicket)} onHide={() => setViewTicket(null)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Ticket Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewTicket ? (
            <Row className="g-4 align-items-center">
              <Col md={7}>
                <div className="ticket-id-chip mb-3">{viewTicket.ticketId}</div>
                <div className="ticket-detail-grid">
                  <span><strong>Route:</strong> {viewTicket.from} → {viewTicket.to}</span>
                  <span><strong>Line:</strong> {viewTicket.line}</span>
                  <span><strong>Passenger:</strong> {viewTicket.passenger}</span>
                  <span><strong>Fare:</strong> ₹{viewTicket.totalFare || viewTicket.fare}</span>
                  <span><strong>Status:</strong> {viewTicket.status}</span>
                  <span><strong>Date & Time:</strong> {new Date(viewTicket.createdAt || viewTicket.time).toLocaleString()}</span>
                </div>
              </Col>
              <Col md={5} className="text-center">
                <QRCodeSVG
                  id={`detail-qr-${viewTicket.ticketId}`}
                  value={`${viewTicket.ticketId}|${viewTicket.from}|${viewTicket.to}|${viewTicket.line}`}
                  size={180}
                  bgColor="#ffffff"
                  fgColor="#18181b"
                />
              </Col>
            </Row>
          ) : null}
        </Modal.Body>
      </Modal>
    </>
  );
}

export default MyTickets;
