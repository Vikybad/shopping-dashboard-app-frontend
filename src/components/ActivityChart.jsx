import { Box, Card, CardContent, Typography } from '@mui/material';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCurrency } from '../utils/format';

const ActivityChart = ({ data = [], currency = 'INR' }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Box>
          <Typography variant="h6">Revenue trend</Typography>
          <Typography variant="body2" color="text.secondary">Non-cancelled order value over the last 14 days</Typography>
        </Box>
      </Box>
      <Box height={300} ml={-2}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5b5bd6" stopOpacity={0.32} /><stop offset="100%" stopColor="#5b5bd6" stopOpacity={0.02} /></linearGradient>
            </defs>
            <CartesianGrid stroke="#eceef4" vertical={false} />
            <XAxis dataKey="date" tickFormatter={(value) => new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} axisLine={false} tickLine={false} tick={{ fill: '#8990a1', fontSize: 11 }} minTickGap={20} />
            <YAxis tickFormatter={(value) => value >= 1000 ? `${Math.round(value / 1000)}k` : value} axisLine={false} tickLine={false} tick={{ fill: '#8990a1', fontSize: 11 }} width={42} />
            <Tooltip formatter={(value) => [formatCurrency(value, currency), 'Revenue']} labelFormatter={(value) => new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', { dateStyle: 'medium' })} contentStyle={{ borderRadius: 10, border: '1px solid #e8eaf1' }} />
            <Area type="monotone" dataKey="revenue" stroke="#5b5bd6" strokeWidth={2.5} fill="url(#revenueFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </CardContent>
  </Card>
);

export default ActivityChart;
