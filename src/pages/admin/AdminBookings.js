import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Container, Form, Modal, Pagination, Table } from 'react-bootstrap';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-toastify';
import AppNavbar from '../../components/Navbar';
import ConfirmModal from '../../components/ConfirmModal';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';
import { metroLines } from '../../data/metroLines';

function AdminBookings() {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelBooking, setCancelBooking] = useState(null);
  const [deleteBooking, setDeleteBooking] = useState(null);
  const [editBooking, setEditBooking] = useState(null);
  const [filters, setFilters] = useState({ date: '', line: '', status: 'All', search: '', page: 1 });
  const availableStations = useMemo(() => (editBooking?.line ? metroLines[editBooking.line] || [] : []), [editBooking?.line]);

  const loadBookings = async (currentFilters = filters) => {
    setLoading(true);
    try {
      const response = await api.get('/api/admin/bookings', { params: { ...currentFilters, limit: 10 } });
      setBookings(response.data.bookings);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const cancelSelectedBooking = async () => {
    try {
      await api.post(`/api/admin/bookings/${cancelBooking.ticketId}/cancel`);
      toast.success('Booking cancelled successfully.');
      setCancelBooking(null);
      loadBookings(filters);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to cancel booking.');
    }
  };

  const saveBookingEdit = async () => {
    try {
      await api.put(`/api/admin/bookings/${editBooking.ticketId}`, editBooking);
      toast.success('Booking updated successfully.');
      setEditBooking(null);
      loadBookings(filters);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update booking.');
    }
  };

  const deleteSelectedBooking = async () => {
    try {
      await api.delete(`/api/admin/bookings/${deleteBooking.ticketId}`);
      toast.success('Booking deleted successfully.');
      setDeleteBooking(null);
      loadBookings(filters);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete booking.');
    }
  };

  return (
    <>
      <AppNavbar title="All Bookings" />
      <main className="app-main-content">
        <Container fluid>
          <Card>
            <Card.Body className="p-4">
              <div className="admin-filter-grid mb-4">
                <Form.Control type="date" value={filters.date} onChange={(event) => setFilters((current) => ({ ...current, date: event.target.value, page: 1 }))} />
                <Form.Select value={filters.line} onChange={(event) => setFilters((current) => ({ ...current, line: event.target.value, page: 1 }))}>
                  <option value="">All Lines</option>
                  {['Purple Line', 'Green Line', 'Blue Line', 'Pink Line', 'Yellow Line'].map((line) => <option key={line}>{line}</option>)}
                </Form.Select>
                <Form.Select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value, page: 1 }))}>
                  <option>All</option>
                  <option>Confirmed</option>
                  <option>Cancelled</option>
                </Form.Select>
                <Form.Control placeholder="Search by Booking ID or user" value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value, page: 1 }))} />
                <Button onClick={() => loadBookings({ ...filters, page: 1 })}>Apply Filters</Button>
              </div>

              {loading ? <LoadingSpinner label="Loading bookings..." /> : null}
              {!loading && bookings.length === 0 ? <EmptyState title="No bookings found" description="Try adjusting the current filters." /> : null}

              <div className="table-responsive">
                <Table className="dashboard-table align-middle">
                  <thead>
                    <tr>
                      <th>Booking ID</th>
                      <th>User</th>
                      <th>Line</th>
                      <th>Route</th>
                      <th>Fare</th>
                      <th>Date & Time</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking._id}>
                        <td>
                          <button type="button" className="table-link-button" onClick={() => setSelectedBooking(booking)}>
                            {booking.ticketId}
                          </button>
                        </td>
                        <td>{booking.passenger}</td>
                        <td>{booking.line}</td>
                        <td>{booking.from} → {booking.to}</td>
                        <td>₹{booking.totalFare}</td>
                        <td>{new Date(booking.createdAt).toLocaleString()}</td>
                        <td><span className={`status-badge ${booking.status === 'Confirmed' ? 'status-active' : 'status-inactive'}`}>{booking.status}</span></td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button size="sm" variant="outline-primary" onClick={() => setSelectedBooking(booking)}>View QR</Button>
                            <Button size="sm" variant="outline-dark" onClick={() => setEditBooking({ ...booking })}>Edit</Button>
                            <Button size="sm" variant="outline-dark" onClick={() => setCancelBooking(booking)}>Cancel Booking</Button>
                            <Button size="sm" variant="danger" onClick={() => setDeleteBooking(booking)}>Delete</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              <Pagination className="justify-content-end mt-3">
                {Array.from({ length: pagination.pages || 1 }, (_, index) => (
                  <Pagination.Item
                    key={index + 1}
                    active={pagination.page === index + 1}
                    onClick={() => setFilters((current) => ({ ...current, page: index + 1 }))}
                  >
                    {index + 1}
                  </Pagination.Item>
                ))}
              </Pagination>
            </Card.Body>
          </Card>
        </Container>
      </main>

      <Modal show={Boolean(selectedBooking)} onHide={() => setSelectedBooking(null)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Booking Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBooking ? (
            <div className="row g-4 align-items-center">
              <div className="col-md-7">
                <div className="ticket-id-chip mb-3">{selectedBooking.ticketId}</div>
                <div className="ticket-detail-grid">
                  <span><strong>User:</strong> {selectedBooking.passenger}</span>
                  <span><strong>Line:</strong> {selectedBooking.line}</span>
                  <span><strong>Route:</strong> {selectedBooking.from} → {selectedBooking.to}</span>
                  <span><strong>Fare:</strong> ₹{selectedBooking.totalFare}</span>
                  <span><strong>Status:</strong> {selectedBooking.status}</span>
                  <span><strong>Date & Time:</strong> {new Date(selectedBooking.createdAt).toLocaleString()}</span>
                </div>
              </div>
              <div className="col-md-5 text-center">
                <QRCodeSVG value={`${selectedBooking.ticketId}|${selectedBooking.from}|${selectedBooking.to}`} size={220} />
              </div>
            </div>
          ) : null}
        </Modal.Body>
      </Modal>

      <Modal show={Boolean(editBooking)} onHide={() => setEditBooking(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Booking</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editBooking ? (
            <Form className="d-grid gap-3">
              <Form.Group>
                <Form.Label>Passenger</Form.Label>
                <Form.Control value={editBooking.passenger} onChange={(event) => setEditBooking((current) => ({ ...current, passenger: event.target.value }))} />
              </Form.Group>
              <Form.Group>
                <Form.Label>Line</Form.Label>
                <Form.Select
                  value={editBooking.line}
                  onChange={(event) => {
                    const line = event.target.value;
                    const stations = metroLines[line] || [];
                    setEditBooking((current) => ({
                      ...current,
                      line,
                      from: stations[0] || '',
                      to: stations[1] || stations[0] || '',
                    }));
                  }}
                >
                  {Object.keys(metroLines).map((line) => <option key={line}>{line}</option>)}
                </Form.Select>
              </Form.Group>
              <Form.Group>
                <Form.Label>From</Form.Label>
                <Form.Select value={editBooking.from} onChange={(event) => setEditBooking((current) => ({ ...current, from: event.target.value }))}>
                  {availableStations.map((station) => <option key={station}>{station}</option>)}
                </Form.Select>
              </Form.Group>
              <Form.Group>
                <Form.Label>To</Form.Label>
                <Form.Select value={editBooking.to} onChange={(event) => setEditBooking((current) => ({ ...current, to: event.target.value }))}>
                  {availableStations.filter((station) => station !== editBooking.from).map((station) => <option key={station}>{station}</option>)}
                </Form.Select>
              </Form.Group>
              <Form.Group>
                <Form.Label>Quantity</Form.Label>
                <Form.Control type="number" min="1" value={editBooking.quantity} onChange={(event) => setEditBooking((current) => ({ ...current, quantity: event.target.value }))} />
              </Form.Group>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select value={editBooking.status} onChange={(event) => setEditBooking((current) => ({ ...current, status: event.target.value }))}>
                  <option>Confirmed</option>
                  <option>Cancelled</option>
                </Form.Select>
              </Form.Group>
            </Form>
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-dark" onClick={() => setEditBooking(null)}>Cancel</Button>
          <Button onClick={saveBookingEdit}>Save Changes</Button>
        </Modal.Footer>
      </Modal>

      <ConfirmModal
        show={Boolean(cancelBooking)}
        onHide={() => setCancelBooking(null)}
        onConfirm={cancelSelectedBooking}
        title="Cancel Booking"
        body="Are you sure you want to cancel this booking?"
        confirmLabel="Cancel Booking"
      />

      <ConfirmModal
        show={Boolean(deleteBooking)}
        onHide={() => setDeleteBooking(null)}
        onConfirm={deleteSelectedBooking}
        title="Delete Booking"
        body="Are you sure you want to permanently delete this booking?"
        confirmLabel="Delete Booking"
      />
    </>
  );
}

export default AdminBookings;
