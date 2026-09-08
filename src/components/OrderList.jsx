import { useCallback, useContext, useEffect, useState } from 'react';
import { AddRounded, SearchRounded } from '@mui/icons-material';
import {
  Alert, Box, Button, Card, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControl,
  InputAdornment, InputLabel, MenuItem, Select, Snackbar, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TablePagination, TableRow, TextField, Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../api/client';
import { AuthContext } from '../contexts/AuthContext';
import { formatCurrency, formatDate, statusColor, titleCase } from '../utils/format';

const transitions = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

const OrderList = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [query, setQuery] = useState({ search: '', status: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [selected, setSelected] = useState(null);
  const [nextStatus, setNextStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/orders', { params: { ...query, page: pagination.page, limit: pagination.limit } });
      setOrders(data.data);
      setPagination((current) => ({ ...current, total: data.pagination.total }));
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to load orders.'));
    } finally {
      setLoading(false);
    }
  }, [pagination.limit, pagination.page, query]);

  useEffect(() => { load(); }, [load]);

  const applyFilters = (event) => {
    event.preventDefault();
    setPagination((current) => ({ ...current, page: 1 }));
    setQuery(filters);
  };

  const openStatus = (order) => {
    setSelected(order);
    setNextStatus(transitions[order.deliveryStatus]?.[0] || '');
  };

  const updateStatus = async () => {
    if (!selected || !nextStatus) return;
    setUpdating(true);
    try {
      await api.patch(`/orders/${selected._id}/status`, { deliveryStatus: nextStatus });
      setNotice(`${selected.orderNumber} moved to ${titleCase(nextStatus)}.`);
      setSelected(null);
      await load();
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to update the order.'));
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Box>
      <Box display="flex" flexWrap="wrap" justifyContent="space-between" alignItems="flex-end" gap={2} mb={3}>
        <Box><Typography variant="h4">Orders</Typography><Typography color="text.secondary" mt={0.5}>{pagination.total.toLocaleString('en-IN')} orders across your store</Typography></Box>
        <Button component={Link} to="/orders/new" variant="contained" startIcon={<AddRounded />}>Create order</Button>
      </Box>
      <Card>
        <Box component="form" onSubmit={applyFilters} sx={{ p: 2.5, display: 'flex', flexWrap: 'wrap', gap: 1.5, borderBottom: '1px solid #eceef4' }}>
          <TextField placeholder="Search customer or order…" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} sx={{ minWidth: { xs: '100%', sm: 280 } }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchRounded fontSize="small" /></InputAdornment> }} />
          <FormControl sx={{ minWidth: 170 }}><InputLabel>Status</InputLabel><Select label="Status" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}><MenuItem value="">All statuses</MenuItem>{Object.keys(transitions).map((status) => <MenuItem key={status} value={status}>{titleCase(status)}</MenuItem>)}</Select></FormControl>
          <Button type="submit" variant="outlined">Apply filters</Button>
        </Box>
        {error && <Alert severity="error" onClose={() => setError('')} sx={{ m: 2 }}>{error}</Alert>}
        <TableContainer>
          <Table sx={{ minWidth: 900 }}>
            <TableHead><TableRow><TableCell>Order</TableCell><TableCell>Customer</TableCell><TableCell>Items</TableCell><TableCell>Placed</TableCell><TableCell>Payment</TableCell><TableCell>Status</TableCell><TableCell align="right">Total</TableCell><TableCell align="right">Action</TableCell></TableRow></TableHead>
            <TableBody>
              {!loading && orders.map((order) => (
                <TableRow key={order._id} hover>
                  <TableCell><Typography fontSize={13} fontWeight={750}>{order.orderNumber}</Typography><Typography fontSize={11} color="text.secondary">{titleCase(order.channel || 'ONLINE')}</Typography></TableCell>
                  <TableCell><Typography fontSize={13} fontWeight={650}>{order.customerName}</Typography><Typography fontSize={11} color="text.secondary">{order.customerEmail || order.customerPhone || 'No contact'}</Typography></TableCell>
                  <TableCell>{order.items?.reduce((sum, item) => sum + item.quantity, 0) || 1}</TableCell>
                  <TableCell>{formatDate(order.orderReceiveDate)}</TableCell>
                  <TableCell><Chip size="small" variant="outlined" color={statusColor[order.paymentStatus] || 'default'} label={titleCase(order.paymentStatus)} /></TableCell>
                  <TableCell><Chip size="small" color={statusColor[order.deliveryStatus] || 'default'} label={titleCase(order.deliveryStatus)} /></TableCell>
                  <TableCell align="right"><Typography fontWeight={700}>{formatCurrency(order.totalAmount ?? order.soldAtAmount, user?.currency)}</Typography></TableCell>
                  <TableCell align="right"><Button size="small" onClick={() => openStatus(order)} disabled={!transitions[order.deliveryStatus]?.length}>Update</Button></TableCell>
                </TableRow>
              ))}
              {!loading && orders.length === 0 && <TableRow><TableCell colSpan={8}><Box py={7} textAlign="center"><Typography variant="h6">No orders found</Typography><Typography color="text.secondary" mt={0.5}>Try another filter or create your first order.</Typography></Box></TableCell></TableRow>}
              {loading && <TableRow><TableCell colSpan={8}><Typography color="text.secondary" py={6} align="center">Loading orders…</Typography></TableCell></TableRow>}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination component="div" count={pagination.total} page={pagination.page - 1} onPageChange={(_, page) => setPagination((current) => ({ ...current, page: page + 1 }))} rowsPerPage={pagination.limit} onRowsPerPageChange={(event) => setPagination({ ...pagination, page: 1, limit: Number(event.target.value) })} rowsPerPageOptions={[10, 20, 50]} />
      </Card>
      <Dialog open={Boolean(selected)} onClose={() => !updating && setSelected(null)} fullWidth maxWidth="xs">
        <DialogTitle>Update order status</DialogTitle>
        <DialogContent><Stack spacing={2} pt={1}><Alert severity="info">Current status: {titleCase(selected?.deliveryStatus)}</Alert><FormControl fullWidth><InputLabel>Next status</InputLabel><Select label="Next status" value={nextStatus} onChange={(event) => setNextStatus(event.target.value)}>{(transitions[selected?.deliveryStatus] || []).map((status) => <MenuItem key={status} value={status}>{titleCase(status)}</MenuItem>)}</Select></FormControl>{nextStatus === 'CANCELLED' && <Alert severity="warning">Cancelling returns reserved item quantities to inventory.</Alert>}</Stack></DialogContent>
        <DialogActions><Button onClick={() => setSelected(null)} disabled={updating}>Close</Button><Button variant="contained" onClick={updateStatus} disabled={updating || !nextStatus}>{updating ? 'Updating…' : 'Confirm update'}</Button></DialogActions>
      </Dialog>
      <Snackbar open={Boolean(notice)} autoHideDuration={3500} onClose={() => setNotice('')}><Alert severity="success" variant="filled">{notice}</Alert></Snackbar>
    </Box>
  );
};

export default OrderList;
