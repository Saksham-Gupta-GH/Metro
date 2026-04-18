import { useState } from 'react';
import { Card, Form, Button, FloatingLabel } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaRightToBracket, FaTrainSubway, FaUserPlus } from 'react-icons/fa6';
import { apiRequest } from '../lib/api';
import { isAdminUser, setStoredUser } from '../utils/session';

function Login() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [signupRole, setSignupRole] = useState('user');
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
          ? { email, username, password, role: signupRole }
          : { email, password };

      const data = await apiRequest(path, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setStoredUser(data.user);
      setMessage(data.message);
      navigate(isAdminUser(data.user) ? '/admin/dashboard' : '/dashboard', { replace: true });
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Card className="auth-card p-1">
        <Card.Body className="p-4 p-md-5">
          <div className="text-center mb-4">
            <div className="auth-brand-icon"><FaTrainSubway /></div>
            <div className="auth-brand-title">Intelligent Metro Network</div>
            <p className="text-muted mb-0 mt-2">Modern metro ticketing for Bangalore commuters.</p>
          </div>

          <div className="auth-mode-heading text-center mb-3">
            {mode === 'signup' ? 'Create your account' : 'Log in to continue'}
          </div>

          <Form onSubmit={onSubmit}>
            {error ? <div className="feedback-message error mb-3">{error}</div> : null}
            {message ? <div className="feedback-message success mb-3">{message}</div> : null}
            <FloatingLabel controlId="emailInput" label="Email address" className="mb-3">
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </FloatingLabel>

            {mode === 'signup' ? (
              <FloatingLabel controlId="usernameInput" label="Username" className="mb-3">
                <Form.Control
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose username"
                />
              </FloatingLabel>
            ) : null}

            {mode === 'signup' ? (
              <FloatingLabel controlId="roleInput" label="Account Type" className="mb-3">
                <Form.Select value={signupRole} onChange={(e) => setSignupRole(e.target.value)}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </Form.Select>
              </FloatingLabel>
            ) : null}

            <FloatingLabel controlId="passwordInput" label="Password" className="mb-3">
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
              />
            </FloatingLabel>

            <div className="d-grid mt-4">
              <Button
                type="submit"
                disabled={loading}
                variant="dark"
                className="d-inline-flex align-items-center justify-content-center gap-2 py-2 auth-submit-btn"
              >
                {mode === 'signup' ? <FaUserPlus /> : <FaRightToBracket />}
                {loading ? 'Please wait...' : mode === 'signup' ? 'Create Account' : 'Login'}
              </Button>
            </div>
          </Form>

          <div className="text-center mt-4">
            {mode === 'signup' ? (
              <button
                type="button"
                className="auth-toggle-link"
                onClick={() => {
                  setMode('login');
                  setError('');
                  setMessage('');
                }}
              >
                Already have an account? Login
              </button>
            ) : (
              <button
                type="button"
                className="auth-toggle-link"
                onClick={() => {
                  setMode('signup');
                  setError('');
                  setMessage('');
                }}
              >
                Need an account? Register
              </button>
            )}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default Login;
