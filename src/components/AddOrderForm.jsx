import { useContext, useEffect, useMemo, useState } from 'react';
import { AddRounded, DeleteOutlineRounded } from '@mui/icons-material';
import {
  Alert, Box, Button, Card, CardContent, Divider, FormControl, Grid, IconButton, InputLabel,
  MenuItem, Select, Stack, TextField, Typography,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import api, { getErrorMessage } from '../api/client';
import { AuthContext } from '../contexts/AuthContext';
import { formatCurrency } from '../utils/format';

const emptyItem = () => ({ productId: '', quantity: 1 });

const AddOrderForm = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    customerName: '', customerEmail: '', customerPhone: '', channel: 'ONLINE', paymentStatus: 'PENDING',
    discount: 0, tax: 0, shippingFee: 0, instructions: '', items: [emptyItem()],
  });

  useEffect(() => {
    api.get('/inventory', { params: { limit: 100 } })
      .then(({ data }) => setProducts(data.data))
      .catch((requestError) => setError(getErrorMessage(requestError, 'Unable to load products.')))
      .finally(() => setLoading(false));
  }, []);

  const productMap = useMemo(() => new Map(products.map((product) => [product._id, product])), [products]);
  const subtotal = form.items.reduce((sum, item) => {
    const product = productMap.get(item.productId);
    return sum + (product?.price || 0) * (Number(item.quantity) || 0);
  }, 0);
  const total = Math.max(0, subtotal - (Number(form.discount) || 0) + (Number(form.tax) || 0) + (Number(form.shippingFee) || 0));

  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const changeItem = (index, key, value) => setForm({ ...form, items: form.items.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item) });
  const removeItem = (index) => setForm({ ...form, items: form.items.filter((_, itemIndex) => itemIndex !== index) });

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (form.items.some((item) => !item.productId || Number(item.quantity) < 1)) return setError('Choose a product and valid quantity for every line item.');
    if (form.items.some((item) => Number(item.quantity) > productMap.get(item.productId)?.stock)) return setError('One or more quantities exceed available stock.');
    setSubmitting(true);
    try {
      await api.post('/orders', {
        ...form,
        discount: Number(form.discount), tax: Number(form.tax), shippingFee: Number(form.shippingFee),
        items: form.items.map((item) => ({ ...item, quantity: Number(item.quantity) })),
      });
      navigate('/orders', { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to create the order.'));
    } finally { setSubmitting(false); }
  };

  if (!loading && products.length === 0) {
    return <Card><CardContent sx={{ p: { xs: 3, sm: 6 }, textAlign: 'center' }}><Typography variant="h5">Add inventory before creating an order</Typography><Typography color="text.secondary" my={1.5}>Order pricing and stock are derived from your product catalogue.</Typography><Button component={Link} to="/inventory" variant="contained">Go to inventory</Button></CardContent></Card>;
  }

  return (
    <Box component="form" onSubmit={submit}>
      <Box mb={3}><Typography variant="h4">Create order</Typography><Typography color="text.secondary" mt={0.5}>Inventory prices are snapshotted and stock is reserved when the order is placed.</Typography></Box>
      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={8}>
          <Stack spacing={2.5}>
            <Card><CardContent sx={{ p: 3 }}><Typography variant="h6" mb={2.5}>Customer</Typography><Grid container spacing={2}><Grid item xs={12} sm={6}><TextField label="Customer name" name="customerName" value={form.customerName} onChange={change} required fullWidth /></Grid><Grid item xs={12} sm={6}><TextField label="Email (optional)" name="customerEmail" type="email" value={form.customerEmail} onChange={change} fullWidth /></Grid><Grid item xs={12} sm={6}><TextField label="Phone (optional)" name="customerPhone" value={form.customerPhone} onChange={change} fullWidth /></Grid><Grid item xs={12} sm={6}><FormControl fullWidth><InputLabel>Channel</InputLabel><Select name="channel" label="Channel" value={form.channel} onChange={change}><MenuItem value="ONLINE">Online</MenuItem><MenuItem value="STORE">Store</MenuItem><MenuItem value="MARKETPLACE">Marketplace</MenuItem></Select></FormControl></Grid></Grid></CardContent></Card>
            <Card><CardContent sx={{ p: 3 }}><Box display="flex" justifyContent="space-between" alignItems="center" mb={2}><Typography variant="h6">Line items</Typography><Button startIcon={<AddRounded />} onClick={() => setForm({ ...form, items: [...form.items, emptyItem()] })} disabled={form.items.length >= 50}>Add item</Button></Box><Stack spacing={1.5}>{form.items.map((item, index) => {
              const product = productMap.get(item.productId);
              return <Box key={index} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr auto', sm: 'minmax(0, 1fr) 120px 130px auto' }, gap: 1.5, alignItems: 'center', p: 1.5, bgcolor: '#f8f8fb', borderRadius: 2.5 }}><FormControl sx={{ gridColumn: { xs: '1 / -1', sm: 'auto' } }}><InputLabel>Product</InputLabel><Select label="Product" value={item.productId} onChange={(event) => changeItem(index, 'productId', event.target.value)} required>{products.map((option) => <MenuItem key={option._id} value={option._id} disabled={option.stock === 0}>{option.name} · {option.sku} ({option.stock} available)</MenuItem>)}</Select></FormControl><TextField label="Quantity" type="number" value={item.quantity} onChange={(event) => changeItem(index, 'quantity', event.target.value)} inputProps={{ min: 1, max: product?.stock || 1, step: 1 }} required /><Box textAlign={{ sm: 'right' }}><Typography fontSize={11} color="text.secondary">Line total</Typography><Typography fontWeight={700}>{formatCurrency((product?.price || 0) * (Number(item.quantity) || 0), user?.currency)}</Typography></Box><IconButton aria-label="Remove line item" onClick={() => removeItem(index)} disabled={form.items.length === 1}><DeleteOutlineRounded /></IconButton></Box>;
            })}</Stack></CardContent></Card>
            <Card><CardContent sx={{ p: 3 }}><Typography variant="h6" mb={2}>Notes</Typography><TextField label="Internal or delivery instructions" name="instructions" value={form.instructions} onChange={change} multiline rows={3} fullWidth /></CardContent></Card>
          </Stack>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Card sx={{ position: { lg: 'sticky' }, top: { lg: 96 } }}><CardContent sx={{ p: 3 }}><Typography variant="h6" mb={2.5}>Order summary</Typography><Stack spacing={2}><FormControl fullWidth><InputLabel>Payment status</InputLabel><Select name="paymentStatus" label="Payment status" value={form.paymentStatus} onChange={change}><MenuItem value="PENDING">Pending</MenuItem><MenuItem value="PAID">Paid</MenuItem></Select></FormControl><TextField label="Discount" name="discount" type="number" inputProps={{ min: 0, step: '.01', max: subtotal }} value={form.discount} onChange={change} /><TextField label="Tax" name="tax" type="number" inputProps={{ min: 0, step: '.01' }} value={form.tax} onChange={change} /><TextField label="Shipping fee" name="shippingFee" type="number" inputProps={{ min: 0, step: '.01' }} value={form.shippingFee} onChange={change} /><Divider /><Box display="flex" justifyContent="space-between"><Typography color="text.secondary">Subtotal</Typography><Typography>{formatCurrency(subtotal, user?.currency)}</Typography></Box><Box display="flex" justifyContent="space-between"><Typography variant="h6">Total</Typography><Typography variant="h6" color="primary.main">{formatCurrency(total, user?.currency)}</Typography></Box><Button type="submit" variant="contained" size="large" disabled={submitting || loading}>{submitting ? 'Creating order…' : 'Place order'}</Button><Button component={Link} to="/orders" color="inherit">Cancel</Button></Stack></CardContent></Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddOrderForm;
