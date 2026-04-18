import { useEffect, useState } from 'react';
import { Button, Card, Container, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaBell, FaBullhorn, FaCircleCheck, FaTag, FaTriangleExclamation } from 'react-icons/fa6';
import AppNavbar from '../components/Navbar';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';

const iconMap = {
  booking_confirmed: FaCircleCheck,
  booking_cancelled: FaTriangleExclamation,
  service_disruption: FaBullhorn,
  promotion: FaTag,
};

function timeAgo(dateValue) {
  const diffInHours = Math.max(1, Math.floor((Date.now() - new Date(dateValue).getTime()) / (1000 * 60 * 60)));
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  const days = Math.floor(diffInHours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/notifications');
      setNotifications(response.data.notifications || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAllAsRead = async () => {
    try {
      await api.post('/api/notifications/mark-all-read');
      toast.success('Notifications marked as read.');
      loadNotifications();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to mark notifications as read.');
    }
  };

  return (
    <>
      <AppNavbar title="Notifications" />
      <main className="app-main-content">
        <Container fluid>
          <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap mb-4">
            <div>
              <div className="page-eyebrow">Updates</div>
              <p className="page-subtitle mb-0">Stay updated on bookings, disruptions, and offers.</p>
            </div>
            <Button variant="outline-primary" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          </div>

          <Card>
            <Card.Body className="p-4">
              {loading ? <LoadingSpinner label="Loading notifications..." /> : null}
              {!loading && notifications.length === 0 ? (
                <EmptyState title="No notifications" description="New booking and service updates will appear here." />
              ) : null}
              <div className="d-grid gap-3">
                {notifications.map((item) => {
                  const Icon = iconMap[item.type] || FaBell;
                  const severity = item.meta?.severity;

                  return (
                    <div key={item._id} className={`notification-item ${!item.read ? 'unread' : ''} ${item.type}`}>
                      <div className="notification-icon">
                        <Icon />
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between gap-3 flex-wrap">
                          <div>
                            <div className="fw-semibold">{item.title}</div>
                            <div className="text-muted small">{item.description}</div>
                          </div>
                          <div className="text-muted small">{timeAgo(item.createdAt)}</div>
                        </div>
                        {severity ? <Badge className="mt-2">{severity}</Badge> : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card.Body>
          </Card>
        </Container>
      </main>
    </>
  );
}

export default NotificationsPage;
