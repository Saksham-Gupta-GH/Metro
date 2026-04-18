import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Container, Form, Row, Tab, Tabs } from 'react-bootstrap';
import { toast } from 'react-toastify';
import AppNavbar from '../components/Navbar';
import ConfirmModal from '../components/ConfirmModal';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import { setStoredUser } from '../utils/session';

function getStrength(password) {
  if (password.length < 6) return 25;
  if (password.length < 10) return 55;
  if (!/[A-Z]/.test(password) || !/\d/.test(password)) return 75;
  return 100;
}

function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profileForm, setProfileForm] = useState({ fullName: '', email: '', phoneNumber: '', photoUrl: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [paymentValue, setPaymentValue] = useState('');
  const [deleteMethodId, setDeleteMethodId] = useState('');

  const loadProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/auth/me');
      setUser(response.data.user);
      setProfileForm({
        fullName: response.data.user.fullName || '',
        email: response.data.user.email || '',
        phoneNumber: response.data.user.phoneNumber || '',
        photoUrl: response.data.user.photoUrl || '',
      });
      setStoredUser(response.data.user);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const passwordStrength = useMemo(() => getStrength(passwordForm.newPassword), [passwordForm.newPassword]);

  const saveProfile = async () => {
    try {
      const response = await api.put('/api/auth/profile', profileForm);
      setUser(response.data.user);
      setStoredUser(response.data.user);
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update profile.');
    }
  };

  const updatePassword = async () => {
    try {
      const response = await api.put('/api/auth/password', passwordForm);
      toast.success(response.data.message);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update password.');
    }
  };

  const addPaymentMethod = async () => {
    try {
      const response = await api.post('/api/auth/payment-methods', { value: paymentValue });
      setUser((current) => ({ ...current, paymentMethods: response.data.paymentMethods }));
      setPaymentValue('');
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to save payment method.');
    }
  };

  const deletePaymentMethod = async () => {
    try {
      const response = await api.delete(`/api/auth/payment-methods/${deleteMethodId}`);
      setUser((current) => ({ ...current, paymentMethods: response.data.paymentMethods }));
      setDeleteMethodId('');
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete payment method.');
    }
  };

  return (
    <>
      <AppNavbar title="Profile" />
      <main className="app-main-content">
        <Container fluid>
          {loading ? <LoadingSpinner label="Loading profile..." /> : null}
          {user ? (
            <Row className="g-4">
              <Col xl={4}>
                <Card className="profile-summary-card">
                  <Card.Body className="p-4 text-center">
                    <div className="profile-avatar-large">
                      {user.photoUrl ? (
                        <img src={user.photoUrl} alt={user.fullName || user.username} className="profile-avatar-image" />
                      ) : (
                        (user.fullName || user.username || user.email).charAt(0).toUpperCase()
                      )}
                    </div>
                    <h3 className="mt-3 mb-1">{user.fullName || user.username}</h3>
                    <div className="text-muted">{user.email}</div>
                    {user.adminRequestStatus === 'pending' ? <div className="feedback-message success mt-3 mb-0">Admin access request pending approval.</div> : null}
                    <div className="profile-meta mt-4">
                      <div>Joined: {new Date(user.joinedAt).toLocaleDateString()}</div>
                      <div>Total Bookings: {user.totalBookings}</div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col xl={8}>
                <Card>
                  <Card.Body className="p-4">
                    <Tabs defaultActiveKey="personal" className="profile-tabs mb-4">
                      <Tab eventKey="personal" title="Personal Info">
                        <Form className="pt-3">
                          <Form.Group className="mb-3">
                            <Form.Label>Full Name</Form.Label>
                            <Form.Control
                              value={profileForm.fullName}
                              onChange={(event) => setProfileForm((current) => ({ ...current, fullName: event.target.value }))}
                            />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                              value={profileForm.email}
                              onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))}
                            />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>Phone Number</Form.Label>
                            <Form.Control
                              value={profileForm.phoneNumber}
                              onChange={(event) => setProfileForm((current) => ({ ...current, phoneNumber: event.target.value }))}
                            />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>Profile Photo URL</Form.Label>
                            <Form.Control
                              placeholder="Paste image URL"
                              value={profileForm.photoUrl}
                              onChange={(event) => setProfileForm((current) => ({ ...current, photoUrl: event.target.value }))}
                            />
                            <Form.Text className="text-muted">Paste a direct image link to use as your avatar.</Form.Text>
                          </Form.Group>
                          <Button onClick={saveProfile}>Save Changes</Button>
                        </Form>
                      </Tab>
                      <Tab eventKey="password" title="Change Password">
                        <Form className="pt-3">
                          <Form.Group className="mb-3">
                            <Form.Label>Current Password</Form.Label>
                            <Form.Control
                              type="password"
                              value={passwordForm.currentPassword}
                              onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))}
                            />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>New Password</Form.Label>
                            <Form.Control
                              type="password"
                              value={passwordForm.newPassword}
                              onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))}
                            />
                            <div className="strength-bar mt-2">
                              <div className="strength-fill" style={{ width: `${passwordStrength}%` }} />
                            </div>
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>Confirm New Password</Form.Label>
                            <Form.Control
                              type="password"
                              value={passwordForm.confirmPassword}
                              onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                            />
                          </Form.Group>
                          <Button onClick={updatePassword}>Update Password</Button>
                        </Form>
                      </Tab>
                      <Tab eventKey="payments" title="Saved Payment Methods">
                        <div className="pt-3">
                          <div className="d-grid gap-2 mb-4">
                            {(user.paymentMethods || []).map((method) => (
                              <div key={method._id} className="payment-method-item">
                                <div>
                                  <strong>{method.type}</strong>
                                  <div className="text-muted small">{method.value}</div>
                                </div>
                                <Button variant="outline-dark" size="sm" onClick={() => setDeleteMethodId(method._id)}>
                                  Delete
                                </Button>
                              </div>
                            ))}
                          </div>
                          <Form.Group className="mb-3">
                            <Form.Label>Add UPI ID or card reference</Form.Label>
                            <Form.Control value={paymentValue} onChange={(event) => setPaymentValue(event.target.value)} />
                          </Form.Group>
                          <Button onClick={addPaymentMethod}>Save</Button>
                        </div>
                      </Tab>
                    </Tabs>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          ) : null}
        </Container>
      </main>
      <ConfirmModal
        show={Boolean(deleteMethodId)}
        onHide={() => setDeleteMethodId('')}
        onConfirm={deletePaymentMethod}
        title="Delete Payment Method"
        body="Are you sure you want to remove this saved payment method?"
        confirmLabel="Delete"
      />
    </>
  );
}

export default ProfilePage;
