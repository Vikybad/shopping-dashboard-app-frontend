import { useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import Navbar from './Navbar';
import Sidebar, { drawerWidth } from './Sidebar';

const AppShell = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Navbar onMenu={() => setMobileOpen(true)} />
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, width: { md: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar />
        <Box sx={{ p: { xs: 2, sm: 3, lg: 4 }, maxWidth: 1600, mx: 'auto' }}>{children}</Box>
      </Box>
    </Box>
  );
};

export default AppShell;
