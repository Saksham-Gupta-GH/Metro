import { useEffect, useState } from 'react';
import { Button, Card, Container, Form, Table } from 'react-bootstrap';
import { toast } from 'react-toastify';
import AppNavbar from '../../components/Navbar';
import ConfirmModal from '../../components/ConfirmModal';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

function AdminDiscounts() {
  const [loading, setLoading] = useState(true);
  const [discounts, setDiscounts] = useState([]);
  const [actionTarget, setActionTarget] = useState(null);
  const [actionType, setActionType] = useState('');
  const [form, setForm] = useState({
    code: '',
    type: 'percentage',
    value: '',
    maxUses: '',
    expiryDate: '',
  });

  const loadDiscounts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/discounts');
      setDiscounts(response.data.discounts || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load discount codes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiscounts();
  }, []);

  const createDiscount = async (event) => {
    event.preventDefault();

    try {
      const response = await api.post('/api/discounts', form);
      toast.success(response.data.message);
      setForm({ code: '', type: 'percentage', value: '', maxUses: '', expiryDate: '' });
      loadDiscounts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to create discount code.');
    }
  };

  const runAction = async () => {
    try {
      if (actionType === 'deactivate') {
        await api.post(`/api/discounts/${actionTarget._id}/deactivate`);
      } else {
        await api.delete(`/api/discounts/${actionTarget._id}`);
      }

      toast.success(`Discount ${actionType}d successfully.`);
      setActionTarget(null);
      setActionType('');
      loadDiscounts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update discount code.');
    }
  };

  return (
    <>
      <AppNavbar title="Discount Codes" />
      <main className="app-main-content">
        <Container fluid>
          <Card className="mb-4">
            <Card.Body className="p-4">
              <Form onSubmit={createDiscount} className="admin-filter-grid">
                <Form.Control placeholder="Code" value={form.code} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))} />
                <Form.Select value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}>
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat (₹)</option>
                </Form.Select>
                <Form.Control type="number" placeholder="Discount Value" value={form.value} onChange={(event) => setForm((current) => ({ ...current, value: event.target.value }))} />
                <Form.Control type="number" placeholder="Max Uses" value={form.maxUses} onChange={(event) => setForm((current) => ({ ...current, maxUses: event.target.value }))} />
                <Form.Control type="date" value={form.expiryDate} onChange={(event) => setForm((current) => ({ ...current, expiryDate: event.target.value }))} />
                <Button type="submit">Submit</Button>
              </Form>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body className="p-4">
              {loading ? <LoadingSpinner label="Loading discount codes..." /> : null}
              {!loading && discounts.length === 0 ? <EmptyState title="No discount codes" description="Create a discount code to get started." /> : null}
              <div className="table-responsive">
                <Table className="dashboard-table align-middle">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Type</th>
                      <th>Value</th>
                      <th>Used / Max</th>
                      <th>Expiry</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {discounts.map((discount) => {
                      const expired = new Date(discount.expiryDate) < new Date();
                      const active = discount.isActive && !expired;

                      return (
                        <tr key={discount._id}>
                          <td>{discount.code}</td>
                          <td>{discount.type}</td>
                          <td>{discount.type === 'percentage' ? `${discount.value}%` : `₹${discount.value}`}</td>
                          <td>{discount.usedCount} / {discount.maxUses}</td>
                          <td>{new Date(discount.expiryDate).toLocaleDateString()}</td>
                          <td><span className={`status-badge ${active ? 'status-active' : 'status-inactive'}`}>{active ? 'Active' : 'Expired'}</span></td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button size="sm" variant="outline-dark" onClick={() => { setActionTarget(discount); setActionType('deactivate'); }}>Deactivate</Button>
                              <Button size="sm" variant="danger" onClick={() => { setActionTarget(discount); setActionType('delete'); }}>Delete</Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Container>
      </main>
      <ConfirmModal
        show={Boolean(actionTarget)}
        onHide={() => {
          setActionTarget(null);
          setActionType('');
        }}
        onConfirm={runAction}
        title={actionType === 'delete' ? 'Delete Discount Code' : 'Deactivate Discount Code'}
        body={actionType === 'delete' ? 'Are you sure you want to delete this code?' : 'Are you sure you want to deactivate this code?'}
        confirmLabel={actionType === 'delete' ? 'Delete' : 'Deactivate'}
      />
    </>
  );
}

export default AdminDiscounts;
