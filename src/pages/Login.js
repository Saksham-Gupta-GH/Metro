import { useState } from 'react';
import { Card, Container, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import AppNavbar from '../components/Navbar';

function Login() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const onSubmit = (e) => {
    e.preventDefault();
    if (email && username && password) {
      localStorage.setItem('metroUser', username);
      navigate('/dashboard', { replace: true });
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
            <Form onSubmit={onSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control size="lg"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control size="lg"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                />
              </Form.Group>
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
                <Button size="lg" type="submit">Login</Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </>
  );
}

export default Login;
