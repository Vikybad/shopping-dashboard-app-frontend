import { Box, Chip, Paper, Typography } from '@mui/material';

const AuthLayout = ({ eyebrow, title, subtitle, children }) => (
  <Box sx={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(360px, 0.9fr) minmax(500px, 1.1fr)' }, bgcolor: 'background.default' }}>
    <Box sx={{ display: { xs: 'none', md: 'flex' }, p: 7, flexDirection: 'column', justifyContent: 'space-between', color: 'white', background: 'radial-gradient(circle at 15% 15%, #7676ee 0, transparent 38%), linear-gradient(145deg, #25265a 0%, #15162e 100%)' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ width: 42, height: 42, borderRadius: '13px', bgcolor: 'white', color: 'primary.main', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 20 }}>S</Box>
        <Typography variant="h5">Shopboard</Typography>
      </Box>
      <Box maxWidth={560}>
        <Chip label="Built for focused operators" sx={{ bgcolor: 'rgba(255,255,255,.12)', color: 'white', mb: 3 }} />
        <Typography variant="h2" fontSize={{ md: 44, lg: 56 }} lineHeight={1.08}>Every order and stock decision, in one place.</Typography>
        <Typography mt={3} color="rgba(255,255,255,.68)" fontSize={17} lineHeight={1.7}>Live revenue trends, fulfilment progress, low-stock signals, and the operational context needed to act quickly.</Typography>
      </Box>
      <Typography color="rgba(255,255,255,.5)" variant="caption">Shopboard operations console</Typography>
    </Box>
    <Box sx={{ display: 'grid', placeItems: 'center', p: { xs: 2, sm: 5 } }}>
      <Paper elevation={0} sx={{ p: { xs: 3, sm: 5 }, width: '100%', maxWidth: 500, borderRadius: 4 }}>
        <Typography variant="overline" color="primary.main" fontWeight={800} letterSpacing=".12em">{eyebrow}</Typography>
        <Typography variant="h3" mt={0.5}>{title}</Typography>
        <Typography color="text.secondary" mt={1} mb={3.5}>{subtitle}</Typography>
        {children}
      </Paper>
    </Box>
  </Box>
);

export default AuthLayout;
