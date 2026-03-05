import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TicketConfirm from './pages/TicketConfirm';
import TicketSuccess from './pages/TicketSuccess';
import MetroMapPage from './pages/MetroMap';
import BookTicketPage from './pages/BookTicket';
import './styles.css';

function RequireAuth({ children }) {
  const user = typeof window !== 'undefined' ? localStorage.getItem('metroUser') : null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/map" element={<RequireAuth><MetroMapPage /></RequireAuth>} />
        <Route path="/book" element={<RequireAuth><BookTicketPage /></RequireAuth>} />
        <Route path="/confirm" element={<RequireAuth><TicketConfirm /></RequireAuth>} />
        <Route path="/success" element={<RequireAuth><TicketSuccess /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
