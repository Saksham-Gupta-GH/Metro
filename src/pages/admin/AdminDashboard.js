import { useEffect, useState } from 'react';
import { Badge, Card, Col, Container, Row, Table } from 'react-bootstrap';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { FaClock, FaIndianRupeeSign, FaTicket, FaTrainSubway } from 'react-icons/fa6';
import AppNavbar from '../../components/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/api/admin/dashboard').then((response) => {
      setData(response.data);
      setLoading(false);
    });
  }, []);

  const stats = data ? [
    { label: 'Total Tickets Booked Today', value: data.stats.totalTicketsBookedToday, icon: FaTicket },
    { label: 'Total Revenue Today', value: `₹${data.stats.totalRevenueToday}`, icon: FaIndianRupeeSign },
    { label: 'Active Trains Right Now', value: data.stats.activeTrainsRightNow, icon: FaTrainSubway },
    { label: 'Peak Hour Alert', value: data.stats.peakHourAlert ? 'ON' : 'OFF', icon: FaClock, badge: true },
  ] : [];

  return (
    <>
      <AppNavbar title="Admin Dashboard" />
      <main className="app-main-content">
        <Container fluid>
          {loading ? <LoadingSpinner label="Loading admin dashboard..." /> : null}
          {data ? (
            <>
              <Row className="g-3">
                {stats.map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <Col xl={3} md={6} key={stat.label}>
                      <Card className="stat-card">
                        <Card.Body>
                          <div className="stat-icon mb-3"><Icon /></div>
                          <div className="stat-value">{stat.badge ? <Badge>{stat.value}</Badge> : stat.value}</div>
                          <div className="stat-label">{stat.label}</div>
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })}
              </Row>

              <Card className="mt-4">
                <Card.Header className="section-card-header">Bookings Per Hour Today</Card.Header>
                <Card.Body className="p-4" style={{ height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.chart}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="bookings" stroke="#f59e0b" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>

              <Card className="mt-4">
                <Card.Header className="section-card-header">Recent Bookings</Card.Header>
                <Card.Body className="p-0 table-responsive">
                  <Table className="dashboard-table align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Booking ID</th>
                        <th>User</th>
                        <th>Line</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Fare</th>
                        <th>Time</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentBookings.map((booking) => (
                        <tr key={booking._id}>
                          <td>{booking.ticketId}</td>
                          <td>{booking.passenger}</td>
                          <td>{booking.line}</td>
                          <td>{booking.from}</td>
                          <td>{booking.to}</td>
                          <td>₹{booking.totalFare}</td>
                          <td>{new Date(booking.createdAt).toLocaleTimeString()}</td>
                          <td><Badge className={booking.status === 'Confirmed' ? 'status-active' : 'status-inactive'}>{booking.status}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </>
          ) : null}
        </Container>
      </main>
    </>
  );
}

export default AdminDashboard;
