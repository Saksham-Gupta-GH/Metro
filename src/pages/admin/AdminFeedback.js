import { useEffect, useState } from 'react';
import { Button, Card, Container, Form, Modal, Table } from 'react-bootstrap';
import { FaStar } from 'react-icons/fa6';
import { toast } from 'react-toastify';
import AppNavbar from '../../components/Navbar';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

function AdminFeedback() {
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState([]);
  const [filters, setFilters] = useState({ type: 'All', status: 'All' });
  const [selected, setSelected] = useState(null);

  const loadFeedback = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/feedback/admin', { params: filters });
      setFeedback(response.data.feedback || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load feedback.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const markResolved = async (item) => {
    try {
      await api.post(`/api/feedback/admin/${item._id}/resolve`);
      toast.success('Feedback marked as resolved.');
      loadFeedback();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update feedback.');
    }
  };

  return (
    <>
      <AppNavbar title="Feedback Review" />
      <main className="app-main-content">
        <Container fluid>
          <Card>
            <Card.Body className="p-4">
              <div className="admin-filter-grid mb-4">
                <Form.Select value={filters.type} onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value }))}>
                  <option>All</option>
                  <option>Feedback</option>
                  <option>Complaint</option>
                  <option>Suggestion</option>
                </Form.Select>
                <Form.Select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
                  <option>All</option>
                  <option>Open</option>
                  <option>Resolved</option>
                </Form.Select>
              </div>
              {loading ? <LoadingSpinner label="Loading feedback..." /> : null}
              {!loading && feedback.length === 0 ? <EmptyState title="No feedback found" description="Try adjusting the filters." /> : null}
              <div className="table-responsive">
                <Table className="dashboard-table align-middle">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Subject</th>
                      <th>User</th>
                      <th>Related To</th>
                      <th>Rating</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedback.map((item) => (
                      <tr key={item._id}>
                        <td>{item.type}</td>
                        <td>{item.subject}</td>
                        <td>{item.userName}</td>
                        <td>{item.relatedTo}</td>
                        <td>{Array.from({ length: item.rating }).map((_, index) => <FaStar key={index} className="text-warning" />)}</td>
                        <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button size="sm" variant="outline-primary" onClick={() => setSelected(item)}>View Details</Button>
                            <Button size="sm" variant="outline-dark" onClick={() => markResolved(item)}>Mark Resolved</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Container>
      </main>

      <Modal show={Boolean(selected)} onHide={() => setSelected(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Feedback Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selected ? (
            <>
              <p><strong>Type:</strong> {selected.type}</p>
              <p><strong>Subject:</strong> {selected.subject}</p>
              <p><strong>User:</strong> {selected.userName}</p>
              <p><strong>Description:</strong> {selected.description}</p>
              <p><strong>Status:</strong> {selected.status}</p>
            </>
          ) : null}
        </Modal.Body>
      </Modal>
    </>
  );
}

export default AdminFeedback;
