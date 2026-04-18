import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Button, Container, Form, InputGroup, Collapse } from 'react-bootstrap';
import { useState } from 'react';
import AppNavbar from '../components/Navbar';
import { metroLines } from '../data/metroLines';
import { apiRequest } from '../lib/api';
import {
  FaArrowLeft,
  FaCheck,
  FaCircleCheck,
  FaTag,
  FaLocationDot,
  FaMoneyBillWave,
  FaRoute,
  FaTicket,
  FaUser,
} from 'react-icons/fa6';

function TicketConfirm() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDiscount, setShowDiscount] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [discountInfo, setDiscountInfo] = useState(null);
  const [discountError, setDiscountError] = useState('');
  const [discountLoading, setDiscountLoading] = useState(false);

  if (!state) {
    return (
      <>
        <AppNavbar title="Ticket Confirmation" />
        <main className="app-main-content">
          <Container fluid>
            <Card className="p-3">
              <div className="feedback-message error mb-0">No ticket data found. Please go back to the dashboard.</div>
            </Card>
          </Container>
        </main>
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
  const finalFare = discountInfo?.finalFare ?? fareTotal;

  const confirm = async () => {
    let metroUser = {};

    try {
      metroUser = JSON.parse(localStorage.getItem('metroUser') || '{}');
    } catch (parseError) {
      metroUser = {};
    }

    setLoading(true);
    setError('');

    try {
      const data = await apiRequest('/api/tickets', {
        method: 'POST',
        body: JSON.stringify({
          passenger,
          email: metroUser.email,
          line,
          from,
          to,
          quantity,
          discountCode: discountInfo?.code || '',
        }),
      });

      navigate('/success', {
        state: data.ticket,
      });
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  const applyDiscount = async () => {
    setDiscountLoading(true);
    setDiscountError('');

    try {
      const data = await apiRequest('/api/tickets/discounts/validate', {
        method: 'POST',
        body: JSON.stringify({
          code: discountCode,
          line,
          from,
          to,
          quantity,
        }),
      });

      setDiscountInfo(data.discount);
    } catch (apiError) {
      setDiscountInfo(null);
      setDiscountError(apiError.message);
    } finally {
      setDiscountLoading(false);
    }
  };

  const cancel = () => navigate('/dashboard');

  return (
    <>
      <AppNavbar title="Ticket Confirmation" />
      <main className="app-main-content">
        <Container fluid>
          <div className="page-section-intro mb-4">
            <div className="page-eyebrow">Review Journey</div>
            <p className="page-subtitle mb-0">Double-check fare and route details before generating the e-ticket.</p>
          </div>

          <Row className="justify-content-center">
            <Col xxl={10}>
              <Card className="ticket-summary">
                <Card.Header className="section-card-header">
                  <FaTicket />
                  <span>Ticket Summary</span>
                </Card.Header>
                <Card.Body className="p-4">
                  <Row className="g-4 summary-grid">
                    <Col md={6}>
                      <div className="mb-3">
                        <div className="label">Passenger</div>
                        <div className="value d-flex align-items-center gap-2"><FaUser /> {passenger}</div>
                      </div>
                      <div className="mb-3">
                        <div className="label">Line</div>
                        <div className="value d-flex align-items-center gap-2"><FaRoute /> {line || '-'}</div>
                      </div>
                      <div className="mb-3">
                        <div className="label">From</div>
                        <div className="value d-flex align-items-center gap-2"><FaLocationDot /> {from}</div>
                      </div>
                      <div className="mb-0">
                        <div className="label">To</div>
                        <div className="value d-flex align-items-center gap-2"><FaLocationDot /> {to}</div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <div className="label">Stations (hops)</div>
                        <div className="value">{stops}</div>
                      </div>
                      <div className="mb-3">
                        <div className="label">Number of Tickets</div>
                        <div className="value">{quantity}</div>
                      </div>
                      <div className="mb-3">
                        <div className="label">Fare per Ticket</div>
                        <div className="value d-flex align-items-center gap-2"><FaMoneyBillWave /> ₹ {farePerTicket.toFixed(2)}</div>
                      </div>
                      <div className="mb-0">
                        <div className="label">Total Fare</div>
                        <div className="value d-flex align-items-center gap-2">
                          <FaMoneyBillWave />
                          {discountInfo ? (
                            <>
                              <span className="fare-strike">₹ {fareTotal.toFixed(2)}</span>
                              <span>₹ {Number(finalFare).toFixed(2)}</span>
                            </>
                          ) : (
                            <span>₹ {fareTotal.toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                    </Col>
                    <Col xs={12}>
                      <Card className="discount-card mb-3">
                        <Card.Body className="p-3">
                          <button type="button" className="discount-toggle" onClick={() => setShowDiscount((current) => !current)}>
                            <span className="d-inline-flex align-items-center gap-2"><FaTag /> Have a discount code?</span>
                            <span>{showDiscount ? 'Hide' : 'Apply'}</span>
                          </button>
                          <Collapse in={showDiscount}>
                            <div className="pt-3">
                              <InputGroup>
                                <Form.Control
                                  value={discountCode}
                                  onChange={(event) => setDiscountCode(event.target.value.toUpperCase())}
                                  placeholder="Enter code"
                                />
                                <Button onClick={applyDiscount} disabled={discountLoading || !discountCode}>
                                  {discountLoading ? 'Applying...' : 'Apply'}
                                </Button>
                              </InputGroup>
                              {discountError ? <div className="invalid-feedback d-block mt-2">{discountError}</div> : null}
                              {discountInfo ? (
                                <div className="feedback-message success mt-3 mb-0 d-flex align-items-center gap-2">
                                  <FaCheck />
                                  {discountInfo.code} applied. You saved ₹{Number(discountInfo.discountAmount).toFixed(2)}.
                                </div>
                              ) : null}
                            </div>
                          </Collapse>
                        </Card.Body>
                      </Card>
                      <div className="perforation rounded-3 my-2"></div>
                      {error ? <div className="feedback-message error mb-3">{error}</div> : null}
                      <div className="d-flex justify-content-end flex-wrap gap-2">
                        <Button variant="outline-secondary" onClick={cancel} className="d-inline-flex align-items-center gap-2 px-4">
                          <FaArrowLeft />
                          Cancel
                        </Button>
                        <Button onClick={confirm} disabled={loading} className="d-inline-flex align-items-center gap-2 px-4">
                          <FaCircleCheck />
                          {loading ? 'Confirming...' : 'Confirm Ticket'}
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </main>
    </>
  );
}

export default TicketConfirm;
