import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TicketConfirm from './pages/TicketConfirm';
import TicketSuccess from './pages/TicketSuccess';
import MetroMapPage from './pages/MetroMap';
import BookTicketPage from './pages/BookTicket';
import AssistantSidebar from './components/AssistantSidebar';
import MyTickets from './pages/MyTickets';
import FareCalculator from './pages/FareCalculator';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import FeedbackPage from './pages/FeedbackPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBookings from './pages/admin/AdminBookings';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDisruptions from './pages/admin/AdminDisruptions';
import AdminDiscounts from './pages/admin/AdminDiscounts';
import AdminFeedback from './pages/admin/AdminFeedback';
import { getStoredUser, isAdminUser } from './utils/session';
import './styles.css';

function RequireAuth({ children }) {
  const user = getStoredUser();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function RequireAdmin({ children }) {
  const user = getStoredUser();
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdminUser(user)) return <Navigate to="/dashboard" replace />;
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
        <Route path="/my-tickets" element={<RequireAuth><MyTickets /></RequireAuth>} />
        <Route path="/fare-calculator" element={<RequireAuth><FareCalculator /></RequireAuth>} />
        <Route path="/notifications" element={<RequireAuth><NotificationsPage /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
        <Route path="/feedback" element={<RequireAuth><FeedbackPage /></RequireAuth>} />
        <Route path="/admin/dashboard" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
        <Route path="/admin/bookings" element={<RequireAdmin><AdminBookings /></RequireAdmin>} />
        <Route path="/admin/users" element={<RequireAdmin><AdminUsers /></RequireAdmin>} />
        <Route path="/admin/disruptions" element={<RequireAdmin><AdminDisruptions /></RequireAdmin>} />
        <Route path="/admin/discounts" element={<RequireAdmin><AdminDiscounts /></RequireAdmin>} />
        <Route path="/admin/feedback" element={<RequireAdmin><AdminFeedback /></RequireAdmin>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <AssistantSidebar />
      <ToastContainer position="top-right" autoClose={2500} />
    </BrowserRouter>
  );
}

export default App;
