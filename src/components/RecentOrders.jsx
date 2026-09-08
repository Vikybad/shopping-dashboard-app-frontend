import { ArrowForwardRounded } from '@mui/icons-material';
import { Avatar, Box, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate, statusColor, titleCase } from '../utils/format';

const RecentOrders = ({ orders = [], currency = 'INR' }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box><Typography variant="h6">Recent orders</Typography><Typography variant="body2" color="text.secondary">Latest customer activity</Typography></Box>
        <Button component={Link} to="/orders" endIcon={<ArrowForwardRounded />} size="small">View all</Button>
      </Box>
      {orders.length === 0 ? <Typography color="text.secondary" py={6} align="center">No orders yet.</Typography> : (
        <Stack divider={<Box sx={{ borderTop: '1px solid #eceef4' }} />}>
          {orders.map((order) => (
            <Box key={order._id} display="grid" gridTemplateColumns="auto minmax(0,1fr) auto" alignItems="center" gap={1.5} py={1.35}>
              <Avatar sx={{ bgcolor: '#efeffd', color: 'primary.main', width: 38, height: 38, fontWeight: 700 }}>{order.customerName?.[0]?.toUpperCase()}</Avatar>
              <Box minWidth={0}><Typography fontSize={13} fontWeight={700} noWrap>{order.customerName}</Typography><Typography fontSize={11.5} color="text.secondary" noWrap>{order.orderNumber} · {formatDate(order.orderReceiveDate, { year: undefined })}</Typography></Box>
              <Box textAlign="right"><Typography fontSize={13} fontWeight={700}>{formatCurrency(order.totalAmount ?? order.soldAtAmount, currency)}</Typography><Chip label={titleCase(order.deliveryStatus)} color={statusColor[order.deliveryStatus]} size="small" variant="outlined" sx={{ mt: 0.5, height: 21, fontSize: 10 }} /></Box>
            </Box>
          ))}
        </Stack>
      )}
    </CardContent>
  </Card>
);

export default RecentOrders;
