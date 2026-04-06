import { useState } from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import AppNavbar from '../components/Navbar';
import { apiRequest } from '../lib/api';

function Login() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('login');
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password || (mode === 'signup' && !username)) {
      setError(mode === 'signup' ? 'Enter email, username, and password.' : 'Enter email and password.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const path = mode === 'signup' ? '/api/auth/signup' : '/api/auth/login';
      const payload =
        mode === 'signup'
          ? { email, username, password }
          : { email, password };

      const data = await apiRequest(path, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      localStorage.setItem('metroUser', JSON.stringify(data.user));
      setMessage(data.message);
      navigate('/dashboard', { replace: true });
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AppNavbar />
      <div className="vh-100 d-flex justify-content-center align-items-center" style={{ background: 'linear-gradient(180deg,#f4f6f9,#e9f5ff)' }}>
        <Card style={{ maxWidth: 520, width: '100%' }} className="shadow-lg rounded-3 p-2 login-tower">
          <Card.Body className="p-5 d-flex flex-column justify-content-center">
            <div className="text-center mb-3">
              <i className="bi bi-train-front fs-1 text-primary d-block mb-1"></i>
              <h4 className="mb-0 fs-2">Intelligent Metro Network</h4>
              <div className="text-muted">Metro Ticket Booking System</div>
            </div>
            <div className="d-flex justify-content-center gap-2 mb-3">
              <Button
                variant={mode === 'login' ? 'primary' : 'outline-primary'}
                onClick={() => {
                  setMode('login');
                  setError('');
                  setMessage('');
                }}
                type="button"
              >
                Login
              </Button>
              <Button
                variant={mode === 'signup' ? 'primary' : 'outline-primary'}
                onClick={() => {
                  setMode('signup');
                  setError('');
                  setMessage('');
                }}
                type="button"
              >
                Sign Up
              </Button>
            </div>
            <Form onSubmit={onSubmit}>
              {error ? <div className="alert alert-danger py-2">{error}</div> : null}
              {message ? <div className="alert alert-success py-2">{message}</div> : null}
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control size="lg"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                />
              </Form.Group>
              {mode === 'signup' ? (
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control size="lg"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose username"
                  />
                </Form.Group>
              ) : null}
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control size="lg"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                />
              </Form.Group>
              <div className="d-grid">
                <Button size="lg" type="submit" disabled={loading}>
                  {loading ? 'Please wait...' : mode === 'signup' ? 'Create Account' : 'Login'}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </>
  );
}

export default Login;
