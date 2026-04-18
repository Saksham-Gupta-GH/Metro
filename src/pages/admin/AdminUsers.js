import { useEffect, useState } from 'react';
import { Button, Card, Container, Form, Modal, Table } from 'react-bootstrap';
import { toast } from 'react-toastify';
import AppNavbar from '../../components/Navbar';
import ConfirmModal from '../../components/ConfirmModal';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

function AdminUsers() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [pendingAdminRequests, setPendingAdminRequests] = useState([]);
  const [filters, setFilters] = useState({ search: '', status: 'All' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/admin/users', { params: filters });
      setUsers(response.data.users || []);
      setPendingAdminRequests(response.data.pendingAdminRequests || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const openUserDetails = async (userId) => {
    try {
      const response = await api.get(`/api/admin/users/${userId}`);
      setSelectedUserDetail(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load user details.');
    }
  };

  const toggleBan = async () => {
    try {
      const response = await api.post(`/api/admin/users/${selectedUser._id}/toggle-ban`);
      toast.success(response.data.message);
      setSelectedUser(null);
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update user status.');
    }
  };

  const deleteSelectedUser = async () => {
    try {
      const response = await api.delete(`/api/admin/users/${deleteUser._id}`);
      toast.success(response.data.message);
      setDeleteUser(null);
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete user.');
    }
  };

  const approveAdminRequest = async (userId) => {
    try {
      const response = await api.post(`/api/admin/users/${userId}/approve-admin`);
      toast.success(response.data.message);
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to approve admin request.');
    }
  };

  const rejectAdminRequest = async (userId) => {
    try {
      const response = await api.post(`/api/admin/users/${userId}/reject-admin`);
      toast.success(response.data.message);
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to reject admin request.');
    }
  };

  return (
    <>
      <AppNavbar title="User Management" />
      <main className="app-main-content">
        <Container fluid>
          {pendingAdminRequests.length > 0 ? (
            <Card className="mb-4">
              <Card.Header className="section-card-header">Pending Admin Requests</Card.Header>
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table className="dashboard-table align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingAdminRequests.map((user) => (
                        <tr key={user._id}>
                          <td>{user.fullName || user.username}</td>
                          <td>{user.email}</td>
                          <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button size="sm" variant="outline-primary" onClick={() => approveAdminRequest(user._id)}>Approve</Button>
                              <Button size="sm" variant="outline-dark" onClick={() => rejectAdminRequest(user._id)}>Reject</Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          ) : null}

          <Card>
            <Card.Body className="p-4">
              <div className="admin-filter-grid mb-4">
                <Form.Control placeholder="Search by name or email" value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} />
                <Form.Select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
                  <option>All</option>
                  <option>Active</option>
                  <option>Banned</option>
                </Form.Select>
              </div>

              {loading ? <LoadingSpinner label="Loading users..." /> : null}
              {!loading && users.length === 0 ? <EmptyState title="No users found" description="Try changing the current filters." /> : null}

              <div className="table-responsive">
                <Table className="dashboard-table align-middle">
                  <thead>
                    <tr>
                      <th>Avatar</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Joined Date</th>
                      <th>Total Bookings</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td>
                          <div className="table-avatar">
                            {user.photoUrl ? <img src={user.photoUrl} alt={user.fullName || user.username} className="avatar-image" /> : (user.fullName || user.username || user.email).charAt(0).toUpperCase()}
                          </div>
                        </td>
                        <td>{user.fullName || user.username}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>{user.totalBookings}</td>
                        <td><span className={`status-badge ${user.status === 'active' ? 'status-active' : 'status-inactive'}`}>{user.status}</span></td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button size="sm" variant="outline-primary" onClick={() => openUserDetails(user._id)}>View</Button>
                            <Button size="sm" variant="outline-dark" onClick={() => setSelectedUser(user)}>{user.status === 'active' ? 'Ban' : 'Unban'}</Button>
                            <Button size="sm" variant="danger" onClick={() => setDeleteUser(user)}>Delete</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Container>
      </main>

      <Modal show={Boolean(selectedUserDetail)} onHide={() => setSelectedUserDetail(null)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>User Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUserDetail ? (
            <>
              <p><strong>Name:</strong> {selectedUserDetail.user.fullName || selectedUserDetail.user.username}</p>
              <p><strong>Email:</strong> {selectedUserDetail.user.email}</p>
              <p><strong>Role:</strong> {selectedUserDetail.user.role}</p>
              <h6 className="mt-4">Booking History</h6>
              <div className="table-responsive">
                <Table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Route</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedUserDetail.bookings.map((booking) => (
                      <tr key={booking._id}>
                        <td>{booking.ticketId}</td>
                        <td>{booking.from} → {booking.to}</td>
                        <td>{booking.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </>
          ) : null}
        </Modal.Body>
      </Modal>

      <ConfirmModal
        show={Boolean(selectedUser)}
        onHide={() => setSelectedUser(null)}
        onConfirm={toggleBan}
        title={selectedUser?.status === 'active' ? 'Ban User' : 'Unban User'}
        body={selectedUser?.status === 'active' ? 'Are you sure you want to ban this user?' : 'Are you sure you want to unban this user?'}
        confirmLabel={selectedUser?.status === 'active' ? 'Ban User' : 'Unban User'}
      />

      <ConfirmModal
        show={Boolean(deleteUser)}
        onHide={() => setDeleteUser(null)}
        onConfirm={deleteSelectedUser}
        title="Delete User"
        body="Are you sure you want to permanently delete this user?"
        confirmLabel="Delete User"
      />
    </>
  );
}

export default AdminUsers;
