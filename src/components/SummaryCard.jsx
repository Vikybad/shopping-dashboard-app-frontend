import { ArrowDownwardRounded, ArrowUpwardRounded } from '@mui/icons-material';
import { Box, Card, CardContent, Typography } from '@mui/material';

const SummaryCard = ({ title, value, change, icon, tone = '#5b5bd6', helper }) => {
  const hasChange = Number.isFinite(change);
  const positive = change >= 0;
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography color="text.secondary" fontSize={13} fontWeight={650}>{title}</Typography>
            <Typography variant="h4" mt={1.5} fontSize={{ xs: 26, lg: 30 }}>{value}</Typography>
          </Box>
          <Box sx={{ width: 42, height: 42, borderRadius: 2.5, color: tone, bgcolor: `${tone}16`, display: 'grid', placeItems: 'center' }}>{icon}</Box>
        </Box>
        <Box mt={1.5} minHeight={20} display="flex" alignItems="center" gap={0.5}>
          {hasChange && <>
            <Box display="flex" alignItems="center" color={positive ? 'success.main' : 'error.main'}>
              {positive ? <ArrowUpwardRounded sx={{ fontSize: 15 }} /> : <ArrowDownwardRounded sx={{ fontSize: 15 }} />}
              <Typography fontSize={12} fontWeight={750}>{Math.abs(change)}%</Typography>
            </Box>
            <Typography color="text.secondary" fontSize={12}>vs previous 30 days</Typography>
          </>}
          {!hasChange && <Typography color="text.secondary" fontSize={12}>{helper}</Typography>}
        </Box>
      </CardContent>
    </Card>
  );
};

export default SummaryCard;
