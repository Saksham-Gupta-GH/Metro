import { useEffect, useState } from 'react';
import { Badge, Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { toast } from 'react-toastify';
import AppNavbar from '../../components/Navbar';
import ConfirmModal from '../../components/ConfirmModal';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

const lines = ['Purple Line', 'Green Line', 'Blue Line', 'Pink Line', 'Yellow Line'];

function AdminDisruptions() {
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [deleteId, setDeleteId] = useState('');
  const [form, setForm] = useState({
    lines: [],
    title: '',
    description: '',
    severity: 'Info',
    startTime: '',
    endTime: '',
  });

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/announcements');
      setAnnouncements(response.data.announcements || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load announcements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const submitAnnouncement = async (event) => {
    event.preventDefault();

    try {
      const response = await api.post('/api/announcements', form);
      toast.success(response.data.message);
      setForm({ lines: [], title: '', description: '', severity: 'Info', startTime: '', endTime: '' });
      loadAnnouncements();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to create announcement.');
    }
  };

  const deleteAnnouncement = async () => {
    try {
      await api.delete(`/api/announcements/${deleteId}`);
      toast.success('Announcement deleted successfully.');
      setDeleteId('');
      loadAnnouncements();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete announcement.');
    }
  };

  return (
    <>
      <AppNavbar title="Disruption Announcements" />
      <main className="app-main-content">
        <Container fluid>
          <Row className="g-4">
            <Col xl={5}>
              <Card>
                <Card.Body className="p-4">
                  <Form onSubmit={submitAnnouncement}>
                    <Form.Group className="mb-3">
                      <Form.Label>Select Metro Line</Form.Label>
                      <Form.Select
                        multiple
                        value={form.lines}
                        onChange={(event) => setForm((current) => ({
                          ...current,
                          lines: Array.from(event.target.selectedOptions, (option) => option.value),
                        }))}
                      >
                        {lines.map((line) => <option key={line}>{line}</option>)}
                      </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Title</Form.Label>
                      <Form.Control value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Description</Form.Label>
                      <Form.Control as="textarea" rows={4} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Severity</Form.Label>
                      <Form.Select value={form.severity} onChange={(event) => setForm((current) => ({ ...current, severity: event.target.value }))}>
                        <option>Info</option>
                        <option>Warning</option>
                        <option>Critical</option>
                      </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Start Time</Form.Label>
                      <Form.Control type="datetime-local" value={form.startTime} onChange={(event) => setForm((current) => ({ ...current, startTime: event.target.value }))} />
                    </Form.Group>
                    <Form.Group className="mb-4">
                      <Form.Label>End Time</Form.Label>
                      <Form.Control type="datetime-local" value={form.endTime} onChange={(event) => setForm((current) => ({ ...current, endTime: event.target.value }))} />
                    </Form.Group>
                    <Button type="submit" className="form-submit-btn">Submit</Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
            <Col xl={7}>
              {loading ? <LoadingSpinner label="Loading announcements..." /> : null}
              {!loading && announcements.length === 0 ? <EmptyState title="No active announcements" description="Create one from the form to notify users." /> : null}
              <div className="d-grid gap-3">
                {announcements.map((item) => (
                  <Card key={item._id}>
                    <Card.Body className="p-4">
                      <div className="d-flex justify-content-between gap-3">
                        <div>
                          <Badge className="mb-2">{item.severity}</Badge>
                          <h5>{item.title}</h5>
                          <div className="text-muted small mb-2">{item.lines.join(', ')}</div>
                          <div className="text-muted small mb-3">
                            {new Date(item.startTime).toLocaleString()} - {new Date(item.endTime).toLocaleString()}
                          </div>
                          <p className="mb-0">{item.description}</p>
                        </div>
                        <Button variant="danger" size="sm" onClick={() => setDeleteId(item._id)}>Delete</Button>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </Col>
          </Row>
        </Container>
      </main>
      <ConfirmModal
        show={Boolean(deleteId)}
        onHide={() => setDeleteId('')}
        onConfirm={deleteAnnouncement}
        title="Delete Announcement"
        body="Are you sure you want to delete this announcement?"
        confirmLabel="Delete"
      />
    </>
  );
}

export default AdminDisruptions;
