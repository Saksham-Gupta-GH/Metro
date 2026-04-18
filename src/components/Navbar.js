import { useEffect, useState } from 'react';
import { Navbar, Container, Button, Offcanvas, Badge } from 'react-bootstrap';
import { useLocation, useNavigate, NavLink } from 'react-router-dom';
import {
  FaArrowRightFromBracket,
  FaBars,
  FaBell,
  FaBullhorn,
  FaCalculator,
  FaChartLine,
  FaCircleDollarToSlot,
  FaComments,
  FaMapLocationDot,
  FaTicket,
  FaTrainSubway,
  FaUser,
  FaUsers,
} from 'react-icons/fa6';
import api from '../services/api';
import { clearStoredUser, getStoredUser, isAdminUser } from '../utils/session';

function AppNavbar({ title = 'Dashboard' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showSidebar, setShowSidebar] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const user = getStoredUser();
  const adminMode = isAdminUser(user) && location.pathname.startsWith('/admin');
  const username = user?.fullName || user?.username || user?.email || 'Metro User';
  const initials = username.trim().charAt(0).toUpperCase() || 'M';
  const photoUrl = user?.photoUrl || '';

  const userNavItems = [
    { to: '/dashboard', label: 'Dashboard', icon: FaChartLine },
    { to: '/book', label: 'Book Ticket', icon: FaTicket },
    { to: '/my-tickets', label: 'My Tickets', icon: FaTicket },
    { to: '/fare-calculator', label: 'Fare Calculator', icon: FaCalculator },
    { to: '/notifications', label: 'Notifications', icon: FaBell },
    { to: '/profile', label: 'Profile', icon: FaUser },
    { to: '/feedback', label: 'Feedback', icon: FaComments },
    { to: '/map', label: 'Metro Map', icon: FaMapLocationDot },
  ];

  const adminNavItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: FaChartLine },
    { to: '/admin/bookings', label: 'All Bookings', icon: FaTicket },
    { to: '/admin/users', label: 'User Management', icon: FaUsers },
    { to: '/admin/disruptions', label: 'Disruptions', icon: FaBullhorn },
    { to: '/admin/discounts', label: 'Discount Codes', icon: FaCircleDollarToSlot },
    { to: '/admin/feedback', label: 'Feedback', icon: FaComments },
  ];

  const navItems = adminMode ? adminNavItems : userNavItems;

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    if (adminMode) {
      let ignore = false;

      api
        .get('/api/admin/admin-requests/count')
        .then((response) => {
          if (!ignore) {
            setUnreadCount(response.data.count || 0);
          }
        })
        .catch(() => {
          if (!ignore) {
            setUnreadCount(0);
          }
        });

      return () => {
        ignore = true;
      };
    }

    let ignore = false;

    api
      .get('/api/notifications')
      .then((response) => {
        if (!ignore) {
          setUnreadCount(response.data.unreadCount || 0);
        }
      })
      .catch(() => {
        if (!ignore) {
          setUnreadCount(0);
        }
      });

    return () => {
      ignore = true;
    };
  }, [adminMode, location.pathname, user]);

  if (!user) {
    return null;
  }

  const logout = () => {
    clearStoredUser();
    navigate('/login', { replace: true });
  };

  const SidebarContent = ({ onNavigate }) => (
    <div className="d-flex flex-column h-100">
      <div>
        <div className="sidebar-brand">
          <FaTrainSubway />
          <span>{adminMode ? 'Metro Admin' : 'Intelligent Metro'}</span>
        </div>
        <div className="sidebar-subtitle">{adminMode ? 'Operations Control Panel' : 'Metro Ticketing Portal'}</div>
        <div className="sidebar-nav mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onNavigate}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <Icon className="sidebar-link-icon" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
      <Button
        variant="outline-light"
        className="sidebar-logout mt-auto d-inline-flex align-items-center justify-content-center gap-2"
        onClick={() => {
          if (onNavigate) onNavigate();
          logout();
        }}
      >
        <FaArrowRightFromBracket />
        Logout
      </Button>
    </div>
  );

  return (
    <>
      <aside className="app-sidebar d-none d-lg-flex">
        <SidebarContent />
      </aside>

      <Navbar className="app-topbar app-topbar-with-sidebar">
        <Container fluid className="py-2 px-3 px-lg-4">
          <div className="d-flex align-items-center gap-2">
            <Button
              variant="link"
              className="topbar-menu-btn d-lg-none p-0"
              onClick={() => setShowSidebar(true)}
              aria-label="Open navigation"
            >
              <FaBars />
            </Button>
            <div className="topbar-title">{title}</div>
          </div>
          <div className="d-flex align-items-center gap-2 gap-md-3">
            <button
              type="button"
              className="topbar-icon-btn position-relative"
              aria-label="Notifications"
              onClick={() => {
                navigate(adminMode ? '/admin/users' : '/notifications');
              }}
            >
              <FaBell />
              {unreadCount > 0 ? (
                <Badge pill bg="danger" className="notification-dot">
                  {unreadCount}
                </Badge>
              ) : null}
            </button>
            <button type="button" className="user-avatar avatar-button" onClick={() => navigate('/profile')} aria-label="Open profile">
              {photoUrl ? <img src={photoUrl} alt={username} className="avatar-image" /> : initials}
            </button>
          </div>
        </Container>
      </Navbar>

      <Offcanvas
        show={showSidebar}
        onHide={() => setShowSidebar(false)}
        placement="start"
        className="app-sidebar-offcanvas d-lg-none"
      >
        <Offcanvas.Header closeButton closeVariant="white">
          <Offcanvas.Title className="text-white">{adminMode ? 'Admin Navigation' : 'Navigation'}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-3">
          <SidebarContent onNavigate={() => setShowSidebar(false)} />
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default AppNavbar;
