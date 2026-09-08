import { useContext, useState } from 'react';
import { LogoutRounded, MenuRounded } from '@mui/icons-material';
import { AppBar, Avatar, Box, IconButton, Menu, MenuItem, Toolbar, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { drawerWidth } from './Sidebar';

const titles = {
  '/home': ['Overview', 'Monitor your store performance'],
  '/orders': ['Orders', 'Manage fulfilment from placement to delivery'],
  '/orders/new': ['Create order', 'Build a new order from available inventory'],
  '/inventory': ['Inventory', 'Track products, stock levels, and value'],
  '/tasks': ['Operations tasks', 'Keep the team focused on what matters next'],
};

const Navbar = ({ onMenu }) => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [anchor, setAnchor] = useState(null);
  const [title, subtitle] = titles[location.pathname] || ['Shopboard', 'Operations console'];

  const handleLogout = () => {
    setAnchor(null);
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="fixed" color="inherit" elevation={0} sx={{ width: { md: `calc(100% - ${drawerWidth}px)` }, ml: { md: `${drawerWidth}px` }, borderBottom: '1px solid #e8eaf1' }}>
      <Toolbar sx={{ minHeight: '72px !important', px: { xs: 2, sm: 3 } }}>
        <IconButton onClick={onMenu} edge="start" sx={{ mr: 1, display: { md: 'none' } }} aria-label="Open navigation"><MenuRounded /></IconButton>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="h6" noWrap>{title}</Typography>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: { xs: 'none', sm: 'block' } }}>{subtitle}</Typography>
        </Box>
        <IconButton onClick={(event) => setAnchor(event.currentTarget)} aria-label="Open account menu" sx={{ p: 0 }}>
          <Avatar src={user?.image} sx={{ width: 38, height: 38, bgcolor: 'primary.main', fontWeight: 700 }}>{user?.username?.[0]?.toUpperCase()}</Avatar>
        </IconButton>
        <Box sx={{ ml: 1.25, display: { xs: 'none', sm: 'block' } }}>
          <Typography fontSize={13} fontWeight={700} lineHeight={1.2}>{user?.username}</Typography>
          <Typography fontSize={11} color="text.secondary">{user?.storeName}</Typography>
        </Box>
        <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
          <MenuItem onClick={handleLogout}><LogoutRounded fontSize="small" sx={{ mr: 1 }} /> Sign out</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
