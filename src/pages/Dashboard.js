import { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge } from 'react-bootstrap';
import AppNavbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import {
  FaArrowRight,
  FaClock,
  FaMapLocationDot,
  FaPenToSquare,
  FaRoute,
  FaTrainSubway,
  FaTriangleExclamation,
} from 'react-icons/fa6';
import { metroLines } from '../data/metroLines';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';

function Dashboard() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const toBook = () => navigate('/book');
  const toMap = () => navigate('/map');
  const allStations = useMemo(() => Object.values(metroLines).flat(), []);
  const uniqueStations = useMemo(() => new Set(allStations).size, [allStations]);
  const interchanges = useMemo(() => {
    const stationCounts = allStations.reduce((acc, station) => {
      acc[station] = (acc[station] || 0) + 1;
      return acc;
    }, {});

    return Object.values(stationCounts).filter((count) => count > 1).length;
  }, [allStations]);
  const statCards = [
    { label: 'Metro Lines', value: Object.keys(metroLines).length, icon: FaTrainSubway },
    { label: 'Unique Stations', value: uniqueStations, icon: FaMapLocationDot },
    { label: 'Interchanges', value: interchanges, icon: FaRoute },
    { label: 'Avg. Wait Time', value: '5 min', icon: FaClock },
  ];
  const getBadgeClass = (status) => (status === 'Confirmed' ? 'status-active' : 'status-inactive');

  useEffect(() => {
    let ignore = false;

    api.get('/api/tickets/mine')
      .then((response) => {
        if (!ignore) {
          setTickets(response.data.tickets || []);
        }
      })
      .catch(() => {
        if (!ignore) {
          setTickets([]);
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const recentTickets = tickets.slice(0, 6);

  return (
    <>
      <AppNavbar title="Dashboard" />
      <main className="app-main-content">
        <Container fluid>
          <div className="page-section-intro mb-4">
            <div>
              <div className="page-eyebrow">Operations Overview</div>
              <p className="page-subtitle mb-0">Monitor network coverage, service frequency, and line activity from one place.</p>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <Button variant="outline-primary" onClick={toMap} className="d-inline-flex align-items-center gap-2">
                <FaMapLocationDot />
                View Metro Map
              </Button>
              <Button onClick={toBook} className="d-inline-flex align-items-center gap-2">
                <FaArrowRight />
                Book Ticket
              </Button>
            </div>
          </div>

          <Row className="g-3">
            {statCards.map((stat) => {
              const Icon = stat.icon;

              return (
                <Col key={stat.label} xs={12} sm={6} xl={3}>
                  <Card className="h-100 stat-card">
                    <Card.Body className="d-flex align-items-center gap-3">
                      <div className="stat-icon">
                        <Icon />
                      </div>
                      <div>
                        <div className="stat-label">{stat.label}</div>
                        <div className="stat-value">{stat.value}</div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>

          <Card className="mt-4">
            <Card.Header className="section-card-header">
              <FaTrainSubway />
              <span>Recent Ticket Activity</span>
            </Card.Header>
            <Card.Body className="p-0">
              {loading ? <LoadingSpinner label="Loading recent ticket activity..." /> : null}
              {!loading && recentTickets.length === 0 ? (
                <div className="p-4">
                  <EmptyState
                    title="No bookings yet"
                    description="Once you book tickets, your latest activity will appear here."
                    actionLabel="Book Now"
                    onAction={toBook}
                  />
                </div>
              ) : null}
              {!loading && recentTickets.length > 0 ? (
                <Table responsive hover className="dashboard-table align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Booking ID</th>
                      <th>Line</th>
                      <th>Route</th>
                      <th>Fare</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTickets.map((item) => (
                      <tr key={item._id || item.ticketId}>
                        <td>{item.ticketId}</td>
                        <td>{item.line}</td>
                        <td>{item.from} ↔ {item.to}</td>
                        <td>₹{item.totalFare || item.fare}</td>
                        <td>{new Date(item.createdAt || item.time).toLocaleString()}</td>
                        <td>
                          <Badge bg="light" text="dark" className={`status-badge ${getBadgeClass(item.status)}`}>
                            {item.status}
                          </Badge>
                        </td>
                        <td className="text-end">
                          <div className="d-inline-flex gap-2">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              className="d-inline-flex align-items-center gap-1"
                              onClick={() => navigate('/my-tickets')}
                            >
                              <FaPenToSquare />
                              View
                            </Button>
                            {item.status === 'Cancelled' ? (
                              <Button size="sm" variant="outline-dark" className="d-inline-flex align-items-center gap-1" disabled>
                                <FaTriangleExclamation />
                                Cancelled
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline-dark"
                                className="d-inline-flex align-items-center gap-1"
                                onClick={() => navigate('/my-tickets')}
                              >
                                <FaTriangleExclamation />
                                Manage
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : null}
            </Card.Body>
          </Card>
        </Container>
      </main>
    </>
  );
}

export default Dashboard;
