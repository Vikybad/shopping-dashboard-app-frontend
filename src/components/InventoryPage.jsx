import { useCallback, useContext, useEffect, useState } from 'react';
import { AddRounded, ArchiveOutlined, EditOutlined, SearchRounded, TuneRounded, UploadFileRounded } from '@mui/icons-material';
import {
  Alert, Box, Button, Card, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid,
  IconButton, InputAdornment, MenuItem, Snackbar, Stack, Table, TableBody, TableCell, TableContainer,
  TableHead, TablePagination, TableRow, TextField, Tooltip, Typography,
} from '@mui/material';
import api, { getErrorMessage } from '../api/client';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { formatCurrency } from '../utils/format';

const blankProduct = { name: '', sku: '', category: '', price: '', cost: '', stock: '', reorderLevel: '5', description: '' };

const ProductDialog = ({ product, open, onClose, onSaved }) => {
  const [form, setForm] = useState(blankProduct);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const editing = Boolean(product?._id);

  useEffect(() => {
    if (!open) return;
    setForm(product ? { ...blankProduct, ...product } : blankProduct);
    setError('');
  }, [open, product]);

  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, price: Number(form.price), cost: Number(form.cost), reorderLevel: Number(form.reorderLevel) };
      if (editing) {
        delete payload.stock;
        delete payload._id;
        delete payload.userId;
        delete payload.createdAt;
        delete payload.updatedAt;
        delete payload.__v;
        delete payload.status;
        await api.patch(`/inventory/${product._id}`, payload);
      } else {
        payload.stock = Number(form.stock);
        await api.post('/inventory', payload);
      }
      onSaved(editing ? 'Product updated.' : 'Product added to inventory.');
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to save the product.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => !saving && onClose()} maxWidth="sm" fullWidth>
      <DialogTitle>{editing ? 'Edit product' : 'Add product'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} pt={1}>
          {error && <Grid item xs={12}><Alert severity="error">{error}</Alert></Grid>}
          <Grid item xs={12} sm={8}><TextField label="Product name" name="name" value={form.name} onChange={change} required fullWidth /></Grid>
          <Grid item xs={12} sm={4}><TextField label="SKU" name="sku" value={form.sku} onChange={change} required fullWidth /></Grid>
          <Grid item xs={12}><TextField label="Category" name="category" value={form.category} onChange={change} fullWidth /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Selling price" name="price" type="number" inputProps={{ min: 0, step: '.01' }} value={form.price} onChange={change} required fullWidth /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Cost price" name="cost" type="number" inputProps={{ min: 0, step: '.01' }} value={form.cost} onChange={change} required fullWidth /></Grid>
          {!editing && <Grid item xs={12} sm={6}><TextField label="Opening stock" name="stock" type="number" inputProps={{ min: 0, step: 1 }} value={form.stock} onChange={change} required fullWidth /></Grid>}
          <Grid item xs={12} sm={editing ? 12 : 6}><TextField label="Reorder level" name="reorderLevel" type="number" inputProps={{ min: 0, step: 1 }} value={form.reorderLevel} onChange={change} required fullWidth /></Grid>
          <Grid item xs={12}><TextField label="Description" name="description" value={form.description || ''} onChange={change} multiline rows={3} fullWidth /></Grid>
        </Grid>
      </DialogContent>
      <DialogActions><Button onClick={onClose} disabled={saving}>Cancel</Button><Button variant="contained" onClick={save} disabled={saving || !form.name || !form.sku || form.price === '' || form.cost === ''}>{saving ? 'Saving…' : 'Save product'}</Button></DialogActions>
    </Dialog>
  );
};

const StockDialog = ({ product, onClose, onSaved }) => {
  const [form, setForm] = useState({ quantityChange: '', reason: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    setError('');
    try {
      await api.patch(`/inventory/${product._id}/stock`, { quantityChange: Number(form.quantityChange), reason: form.reason });
      onSaved('Stock adjustment recorded.');
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to adjust stock.'));
    } finally { setSaving(false); }
  };
  return (
    <Dialog open={Boolean(product)} onClose={() => !saving && onClose()} maxWidth="xs" fullWidth>
      <DialogTitle>Adjust stock · {product?.name}</DialogTitle>
      <DialogContent><Stack spacing={2} pt={1}>{error && <Alert severity="error">{error}</Alert>}<Alert severity="info">Current stock: {product?.stock}. Use a negative value to remove stock.</Alert><TextField label="Quantity change" type="number" value={form.quantityChange} onChange={(event) => setForm({ ...form, quantityChange: event.target.value })} inputProps={{ step: 1 }} required /><TextField label="Reason" value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} placeholder="e.g. Supplier delivery or damaged item" required /></Stack></DialogContent>
      <DialogActions><Button onClick={onClose} disabled={saving}>Cancel</Button><Button variant="contained" onClick={save} disabled={saving || !Number(form.quantityChange) || form.reason.trim().length < 3}>{saving ? 'Saving…' : 'Record adjustment'}</Button></DialogActions>
    </Dialog>
  );
};

const InventoryPage = () => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [productDialog, setProductDialog] = useState({ open: false, product: null });
  const [stockProduct, setStockProduct] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/inventory', { params: { search: query, stock: stockFilter, page: pagination.page, limit: pagination.limit } });
      setProducts(data.data);
      setPagination((current) => ({ ...current, total: data.pagination.total }));
    } catch (requestError) { setError(getErrorMessage(requestError, 'Unable to load inventory.')); }
    finally { setLoading(false); }
  }, [pagination.limit, pagination.page, query, stockFilter]);

  useEffect(() => { load(); }, [load]);
  const saved = async (message) => { setProductDialog({ open: false, product: null }); setStockProduct(null); setNotice(message); await load(); };
  const archive = async (product) => {
    if (!window.confirm(`Archive ${product.name}? Existing orders keep their product snapshot.`)) return;
    try { await api.delete(`/inventory/${product._id}`); setNotice('Product archived.'); await load(); }
    catch (requestError) { setError(getErrorMessage(requestError, 'Unable to archive product.')); }
  };

  return (
    <Box>
      <Box display="flex" flexWrap="wrap" justifyContent="space-between" alignItems="flex-end" gap={2} mb={3}>
        <Box><Typography variant="h4">Inventory</Typography><Typography color="text.secondary" mt={0.5}>{pagination.total.toLocaleString('en-IN')} active products</Typography></Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.25} width={{ xs: '100%', sm: 'auto' }}><Button component={Link} to="/data" variant="outlined" startIcon={<UploadFileRounded />}>Import CSV</Button><Button variant="contained" startIcon={<AddRounded />} onClick={() => setProductDialog({ open: true, product: null })}>Add product</Button></Stack>
      </Box>
      <Card>
        <Box component="form" onSubmit={(event) => { event.preventDefault(); setPagination((current) => ({ ...current, page: 1 })); setQuery(search); }} sx={{ p: 2.5, display: 'flex', flexWrap: 'wrap', gap: 1.5, borderBottom: '1px solid #eceef4' }}>
          <TextField placeholder="Search product, SKU, or category…" value={search} onChange={(event) => setSearch(event.target.value)} sx={{ minWidth: { xs: '100%', sm: 300 } }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchRounded fontSize="small" /></InputAdornment> }} />
          <TextField select label="Stock level" value={stockFilter} onChange={(event) => { setStockFilter(event.target.value); setPagination((current) => ({ ...current, page: 1 })); }} sx={{ minWidth: 160 }} InputProps={{ startAdornment: <InputAdornment position="start"><TuneRounded fontSize="small" /></InputAdornment> }}><MenuItem value="">All stock</MenuItem><MenuItem value="low">Low stock</MenuItem><MenuItem value="out">Out of stock</MenuItem></TextField>
          <Button type="submit" variant="outlined">Search</Button>
        </Box>
        {error && <Alert severity="error" onClose={() => setError('')} sx={{ m: 2 }}>{error}</Alert>}
        <TableContainer><Table sx={{ minWidth: 850 }}><TableHead><TableRow><TableCell>Product</TableCell><TableCell>SKU</TableCell><TableCell>Category</TableCell><TableCell align="right">Price</TableCell><TableCell align="right">Cost</TableCell><TableCell>Stock</TableCell><TableCell align="right">Value</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead><TableBody>
          {!loading && products.map((product) => {
            const low = product.stock <= product.reorderLevel;
            return <TableRow key={product._id} hover><TableCell><Typography fontSize={13} fontWeight={700}>{product.name}</Typography><Typography color="text.secondary" fontSize={11} noWrap maxWidth={240}>{product.description || 'No description'}</Typography></TableCell><TableCell>{product.sku}</TableCell><TableCell>{product.category}</TableCell><TableCell align="right">{formatCurrency(product.price, user?.currency)}</TableCell><TableCell align="right">{formatCurrency(product.cost, user?.currency)}</TableCell><TableCell><Chip size="small" color={product.stock === 0 ? 'error' : low ? 'warning' : 'success'} variant={low ? 'filled' : 'outlined'} label={`${product.stock} units`} /><Typography fontSize={10.5} color="text.secondary" mt={0.5}>Reorder at {product.reorderLevel}</Typography></TableCell><TableCell align="right"><Typography fontWeight={700}>{formatCurrency(product.stock * product.price, user?.currency)}</Typography></TableCell><TableCell align="right" sx={{ whiteSpace: 'nowrap' }}><Tooltip title="Adjust stock"><IconButton size="small" onClick={() => setStockProduct(product)}><TuneRounded fontSize="small" /></IconButton></Tooltip><Tooltip title="Edit product"><IconButton size="small" onClick={() => setProductDialog({ open: true, product })}><EditOutlined fontSize="small" /></IconButton></Tooltip><Tooltip title="Archive"><IconButton size="small" color="error" onClick={() => archive(product)}><ArchiveOutlined fontSize="small" /></IconButton></Tooltip></TableCell></TableRow>;
          })}
          {!loading && products.length === 0 && <TableRow><TableCell colSpan={8}><Box py={7} textAlign="center"><Typography variant="h6">No products found</Typography><Typography color="text.secondary" mt={0.5}>Add a product to start tracking inventory.</Typography></Box></TableCell></TableRow>}
          {loading && <TableRow><TableCell colSpan={8}><Typography color="text.secondary" py={6} align="center">Loading inventory…</Typography></TableCell></TableRow>}
        </TableBody></Table></TableContainer>
        <TablePagination component="div" count={pagination.total} page={pagination.page - 1} onPageChange={(_, page) => setPagination((current) => ({ ...current, page: page + 1 }))} rowsPerPage={pagination.limit} onRowsPerPageChange={(event) => setPagination({ ...pagination, page: 1, limit: Number(event.target.value) })} rowsPerPageOptions={[10, 20, 50]} />
      </Card>
      <ProductDialog {...productDialog} onClose={() => setProductDialog({ open: false, product: null })} onSaved={saved} />
      {stockProduct && <StockDialog product={stockProduct} onClose={() => setStockProduct(null)} onSaved={saved} />}
      <Snackbar open={Boolean(notice)} autoHideDuration={3500} onClose={() => setNotice('')}><Alert severity="success" variant="filled">{notice}</Alert></Snackbar>
    </Box>
  );
};

export default InventoryPage;
