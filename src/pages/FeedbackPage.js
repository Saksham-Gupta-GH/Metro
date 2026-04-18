import { useState } from 'react';
import { Button, Card, Container, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaStar } from 'react-icons/fa6';
import AppNavbar from '../components/Navbar';
import api from '../services/api';

function FeedbackPage() {
  const [form, setForm] = useState({
    type: 'Feedback',
    relatedTo: 'Booking',
    subject: '',
    description: '',
    rating: 5,
    screenshotName: '',
  });

  const submitFeedback = async (event) => {
    event.preventDefault();

    if (form.description.trim().length < 20) {
      toast.error('Description must be at least 20 characters long.');
      return;
    }

    try {
      const response = await api.post('/api/feedback', form);
      toast.success(response.data.message);
      setForm({
        type: 'Feedback',
        relatedTo: 'Booking',
        subject: '',
        description: '',
        rating: 5,
        screenshotName: '',
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to submit feedback.');
    }
  };

  return (
    <>
      <AppNavbar title="Feedback & Complaints" />
      <main className="app-main-content">
        <Container fluid>
          <div className="form-shell">
            <Card>
              <Card.Header className="section-card-header">Share Feedback</Card.Header>
              <Card.Body className="p-4">
                <Form onSubmit={submitFeedback}>
                  <Form.Group className="mb-3">
                    <Form.Label>Type</Form.Label>
                    <Form.Select value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}>
                      <option>Feedback</option>
                      <option>Complaint</option>
                      <option>Suggestion</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Related To</Form.Label>
                    <Form.Select value={form.relatedTo} onChange={(event) => setForm((current) => ({ ...current, relatedTo: event.target.value }))}>
                      <option>Booking</option>
                      <option>Station</option>
                      <option>Train</option>
                      <option>App</option>
                      <option>Other</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Subject</Form.Label>
                    <Form.Control value={form.subject} onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))} />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      value={form.description}
                      onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Rating</Form.Label>
                    <div className="star-rating">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className={`star-button ${form.rating >= star ? 'active' : ''}`}
                          onClick={() => setForm((current) => ({ ...current, rating: star }))}
                        >
                          <FaStar />
                        </button>
                      ))}
                    </div>
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Label>Attach Screenshot</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={(event) =>
                        setForm((current) => ({ ...current, screenshotName: event.target.files?.[0]?.name || '' }))
                      }
                    />
                  </Form.Group>
                  <Button type="submit" className="form-submit-btn">Submit</Button>
                </Form>
              </Card.Body>
            </Card>
          </div>
        </Container>
      </main>
    </>
  );
}

export default FeedbackPage;
