import { useContext, useRef, useState } from 'react';
import {
  AutoAwesomeRounded,
  DeleteForeverRounded,
  DownloadRounded,
  ScheduleRounded,
  UploadFileRounded,
  WarningAmberRounded,
} from '@mui/icons-material';
import {
  Alert, Box, Button, Card, CardContent, Chip, Dialog, DialogActions, DialogContent,
  DialogTitle, Divider, Grid, LinearProgress, Snackbar, Stack, TextField, Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api, { getErrorMessage } from '../api/client';
import { AuthContext } from '../contexts/AuthContext';

function filenameFromHeader(header, fallback) {
  const match = header?.match(/filename="?([^";]+)"?/i);
  return match?.[1] || fallback;
}

async function downloadCsv(path, fallback) {
  const response = await api.get(path, { responseType: 'blob' });
  const url = URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = filenameFromHeader(response.headers['content-disposition'], fallback);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

const ImportCard = ({ type, title, description, required, onNotice }) => {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const importFile = async () => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      const { data } = await api.post(`/data/import/${type}`, form);
      const result = data.data;
      onNotice(type === 'products'
        ? `${result.productsCreated} products imported successfully.`
        : `${result.ordersCreated} orders imported successfully from ${result.rows} rows.`);
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
    } catch (requestError) {
      const details = requestError.response?.data?.details;
      const detail = Array.isArray(details) && details.length ? ` ${typeof details[0] === 'object' ? `Row ${details[0].row}: ${details[0].message}` : details.join(', ')}` : '';
      setError(`${getErrorMessage(requestError, 'Import failed.')}${detail}`);
    } finally {
      setBusy(false);
    }
  };

  const getTemplate = async () => {
    setError('');
    try { await downloadCsv(`/data/templates/${type}`, `${type}-template.csv`); }
    catch (requestError) { setError(getErrorMessage(requestError, 'Unable to download the template.')); }
  };

  return (
    <Card variant="outlined" sx={{ height: '100%', boxShadow: 'none' }}>
      {busy && <LinearProgress />}
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
          <Box><Typography variant="h6">{title}</Typography><Typography color="text.secondary" fontSize={14} mt={0.75}>{description}</Typography></Box>
          <UploadFileRounded color="primary" />
        </Stack>
        <Alert severity="info" icon={false} sx={{ mt: 2.5, fontSize: 12.5 }}><strong>Required columns:</strong> {required}</Alert>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.25} mt={2.5}>
          <Button variant="outlined" startIcon={<DownloadRounded />} onClick={getTemplate}>Sample CSV</Button>
          <Button variant="outlined" component="label" startIcon={<UploadFileRounded />}>
            {file ? 'Change file' : 'Choose CSV'}
            <input ref={inputRef} hidden type="file" accept=".csv,text/csv" onChange={(event) => setFile(event.target.files?.[0] || null)} />
          </Button>
          <Button variant="contained" onClick={importFile} disabled={!file || busy}>Import</Button>
        </Stack>
        {file && <Typography fontSize={12.5} color="text.secondary" mt={1.5} noWrap>Selected: {file.name}</Typography>}
      </CardContent>
    </Card>
  );
};

const DangerDialog = ({ action, onClose, onComplete }) => {
  const phrase = action === 'delete' ? 'DELETE MY ACCOUNT' : 'RESET MY DATA';
  const [confirmation, setConfirmation] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      if (action === 'delete') await api.delete('/users/me', { data: { confirmation, password } });
      else await api.delete('/data/reset', { data: { confirmation, password } });
      onComplete(action);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'The operation could not be completed.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={Boolean(action)} onClose={() => !busy && onClose()} maxWidth="xs" fullWidth>
      <DialogTitle>{action === 'delete' ? 'Delete account permanently?' : 'Reset all store data?'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} pt={1}>
          <Alert severity="error">This cannot be undone. {action === 'delete' ? 'Your account and all of its data will be permanently deleted.' : 'All orders, products, stock history, and tasks will be permanently deleted.'}</Alert>
          {error && <Alert severity="error">{error}</Alert>}
          <Typography fontSize={13}>Type <strong>{phrase}</strong> to confirm.</Typography>
          <TextField label="Confirmation phrase" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="off" fullWidth />
          <TextField label="Current password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" fullWidth />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>Cancel</Button>
        <Button color="error" variant="contained" onClick={submit} disabled={busy || confirmation !== phrase || !password}>{busy ? 'Working…' : action === 'delete' ? 'Delete account' : 'Reset data'}</Button>
      </DialogActions>
    </Dialog>
  );
};

const DataAccountPage = () => {
  const navigate = useNavigate();
  const { clearSession, user } = useContext(AuthContext);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [sampleBusy, setSampleBusy] = useState(false);
  const [dangerAction, setDangerAction] = useState(null);

  const addSampleData = async () => {
    setSampleBusy(true);
    setError('');
    try {
      const { data } = await api.post('/data/sample');
      const result = data.data;
      setNotice(`Sample workspace created with ${result.productsCreated} products, ${result.ordersCreated} orders, and ${result.tasksCreated} tasks.`);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to add sample data.'));
    } finally {
      setSampleBusy(false);
    }
  };

  const exportData = async (type) => {
    setError('');
    try { await downloadCsv(`/data/export/${type}`, `shopboard-${type}.csv`); }
    catch (requestError) { setError(getErrorMessage(requestError, `Unable to export ${type}.`)); }
  };

  const completeDangerAction = (action) => {
    setDangerAction(null);
    if (action === 'delete') {
      clearSession();
      navigate('/signup', { replace: true });
    } else {
      setNotice('All store operational data was deleted. Your account is still active.');
    }
  };

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h4">Data & account</Typography>
        <Typography color="text.secondary" mt={0.5}>Import, back up, seed, and safely manage {user?.storeName || 'your workspace'}.</Typography>
      </Box>
      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2.5 }}>{error}</Alert>}

      <Typography variant="h6" mb={1.5}>CSV imports</Typography>
      <Alert severity="warning" sx={{ mb: 2 }}>Import products before orders. Every import is atomic: if one row fails validation, nothing from that file is saved.</Alert>
      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={6}><ImportCard type="products" title="Products & opening stock" description="Create catalogue items and their initial inventory movements." required="name, sku, price, cost, stock" onNotice={setNotice} /></Grid>
        <Grid item xs={12} lg={6}><ImportCard type="orders" title="Orders" description="Use the same order reference on multiple rows to add several line items." required="order_reference, customer_name, sku, quantity" onNotice={setNotice} /></Grid>
      </Grid>

      <Grid container spacing={2.5} mt={0}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}><CardContent sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start"><Box><Typography variant="h6">Export your data</Typography><Typography color="text.secondary" fontSize={14} mt={0.75}>Download product and order CSV copies for analysis or migration.</Typography></Box><DownloadRounded color="primary" /></Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.25} mt={3}><Button variant="outlined" onClick={() => exportData('products')}>Export products</Button><Button variant="outlined" onClick={() => exportData('orders')}>Export orders</Button></Stack>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}><CardContent sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start"><Box><Typography variant="h6">Explore with sample data</Typography><Typography color="text.secondary" fontSize={14} mt={0.75}>Populate an empty account with realistic products, order history, and tasks.</Typography></Box><AutoAwesomeRounded color="secondary" /></Stack>
            <Button variant="contained" color="secondary" sx={{ mt: 3 }} onClick={addSampleData} disabled={sampleBusy}>{sampleBusy ? 'Adding sample data…' : 'Add sample data'}</Button>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12}>
          <Card><CardContent sx={{ p: 3 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2}>
              <Stack direction="row" gap={2}><ScheduleRounded color="disabled" /><Box><Typography variant="h6">Email reports</Typography><Typography color="text.secondary" fontSize={14} mt={0.5}>Daily and weekly store summaries are prepared for a future release. No scheduled report emails are currently sent.</Typography></Box></Stack>
              <Chip label="Paused" color="default" />
            </Stack>
          </CardContent></Card>
        </Grid>
      </Grid>

      <Card sx={{ mt: 2.5, borderColor: 'error.light' }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" gap={1.5} alignItems="center"><WarningAmberRounded color="error" /><Box><Typography variant="h6">Danger zone</Typography><Typography color="text.secondary" fontSize={14}>Password confirmation and an exact phrase are required.</Typography></Box></Stack>
          <Divider sx={{ my: 2.5 }} />
          <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.25}>
            <Button color="error" variant="outlined" onClick={() => setDangerAction('reset')}>Reset all store data</Button>
            <Button color="error" variant="contained" startIcon={<DeleteForeverRounded />} onClick={() => setDangerAction('delete')}>Delete account</Button>
          </Stack>
        </CardContent>
      </Card>

      <DangerDialog key={dangerAction || 'closed'} action={dangerAction} onClose={() => setDangerAction(null)} onComplete={completeDangerAction} />
      <Snackbar open={Boolean(notice)} autoHideDuration={5000} onClose={() => setNotice('')}><Alert severity="success" variant="filled">{notice}</Alert></Snackbar>
    </Box>
  );
};

export default DataAccountPage;
