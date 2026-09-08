import { useContext, useEffect, useState } from 'react';
import { Inventory2Rounded, LocalShippingRounded, PaymentsRounded, TrendingUpRounded, WarningAmberRounded } from '@mui/icons-material';
import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Grid, LinearProgress, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import api, { getErrorMessage } from '../api/client';
import { AuthContext } from '../contexts/AuthContext';
import { formatCurrency, titleCase } from '../utils/format';
import ActivityChart from './ActivityChart';
import RecentOrders from './RecentOrders';
import SummaryCard from './SummaryCard';

const statusColors = { PENDING: '#dd8c16', CONFIRMED: '#3286d9', PROCESSING: '#9465d8', SHIPPED: '#5b5bd6', DELIVERED: '#129b71', CANCELLED: '#d64b5f' };

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.get('/dashboard/overview').then((response) => active && setData(response.data.data)).catch((requestError) => active && setError(getErrorMessage(requestError)));
    return () => { active = false; };
  }, []);

  if (!data && !error) return <Box minHeight={420} display="grid" sx={{ placeItems: 'center' }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" action={<Button onClick={() => window.location.reload()}>Retry</Button>}>{error}</Alert>;

  const { summary, inventory } = data;
  return (
    <Box>
      <Box display="flex" flexWrap="wrap" justifyContent="space-between" alignItems="flex-end" gap={2} mb={3}>
        <Box><Typography variant="h4">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.username?.split(' ')[0]}</Typography><Typography color="text.secondary" mt={0.5}>Here is what is happening across {user?.storeName || 'your store'}.</Typography></Box>
        <Button component={Link} to="/orders/new" variant="contained">Create order</Button>
      </Box>
      <Grid container spacing={2.25}>
        <Grid item xs={12} sm={6} lg={3}><SummaryCard title="Total revenue" value={formatCurrency(summary.revenue, user?.currency)} change={summary.revenueChange} icon={<PaymentsRounded />} /></Grid>
        <Grid item xs={12} sm={6} lg={3}><SummaryCard title="Total orders" value={summary.totalOrders.toLocaleString('en-IN')} change={summary.orderChange} icon={<LocalShippingRounded />} tone="#3286d9" /></Grid>
        <Grid item xs={12} sm={6} lg={3}><SummaryCard title="Net profit" value={formatCurrency(summary.profit, user?.currency)} helper="Recognised on delivered orders" icon={<TrendingUpRounded />} tone="#129b71" /></Grid>
        <Grid item xs={12} sm={6} lg={3}><SummaryCard title="Inventory value" value={formatCurrency(inventory.retailValue, user?.currency)} helper={`${inventory.units.toLocaleString('en-IN')} units across ${inventory.products} products`} icon={<Inventory2Rounded />} tone="#9465d8" /></Grid>
        <Grid item xs={12} lg={8}><ActivityChart data={data.trend} currency={user?.currency} /></Grid>
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}><CardContent sx={{ p: 3 }}>
            <Typography variant="h6">Fulfilment mix</Typography><Typography variant="body2" color="text.secondary">All-time order status</Typography>
            <Box height={210} position="relative"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data.statusDistribution} dataKey="value" nameKey="status" innerRadius={58} outerRadius={82} paddingAngle={3}>{data.statusDistribution.map((entry) => <Cell key={entry.status} fill={statusColors[entry.status]} />)}</Pie><Tooltip formatter={(value, name) => [value, titleCase(name)]} /></PieChart></ResponsiveContainer><Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none' }}><Box textAlign="center"><Typography variant="h5">{summary.fulfilmentRate.toFixed(0)}%</Typography><Typography fontSize={11} color="text.secondary">delivered</Typography></Box></Box></Box>
            <Box display="flex" flexWrap="wrap" gap={1}>{data.statusDistribution.map((entry) => <Chip key={entry.status} size="small" label={`${titleCase(entry.status)} ${entry.value}`} sx={{ bgcolor: `${statusColors[entry.status]}15`, color: statusColors[entry.status] }} />)}</Box>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} lg={7}><RecentOrders orders={data.recentOrders} currency={user?.currency} /></Grid>
        <Grid item xs={12} lg={5}>
          <Card sx={{ height: '100%' }}><CardContent sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" mb={2}><Box><Typography variant="h6">Low-stock watchlist</Typography><Typography variant="body2" color="text.secondary">At or below reorder level</Typography></Box><WarningAmberRounded color={data.lowStock.length ? 'warning' : 'disabled'} /></Box>
            {data.lowStock.length === 0 ? <Typography color="text.secondary" py={5} align="center">Every active product has healthy stock.</Typography> : <Stack spacing={2}>{data.lowStock.map((product) => <Box key={product._id}><Box display="flex" justifyContent="space-between" mb={0.75}><Box><Typography fontSize={13} fontWeight={700}>{product.name}</Typography><Typography fontSize={11} color="text.secondary">{product.sku}</Typography></Box><Typography fontSize={13} fontWeight={700} color={product.stock === 0 ? 'error.main' : 'warning.main'}>{product.stock} / {product.reorderLevel}</Typography></Box><LinearProgress variant="determinate" color={product.stock === 0 ? 'error' : 'warning'} value={Math.min((product.stock / Math.max(product.reorderLevel, 1)) * 100, 100)} sx={{ height: 6, borderRadius: 4 }} /></Box>)}</Stack>}
            <Button component={Link} to="/inventory" fullWidth sx={{ mt: 2 }}>Manage inventory</Button>
          </CardContent></Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
