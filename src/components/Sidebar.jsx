import {
  AddShoppingCartRounded,
  DashboardRounded,
  Inventory2Rounded,
  LocalShippingRounded,
  SettingsRounded,
  TaskAltRounded,
} from '@mui/icons-material';
import { Box, Divider, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { NavLink } from 'react-router-dom';

export const drawerWidth = 244;

const items = [
  { label: 'Overview', icon: DashboardRounded, path: '/home' },
  { label: 'Orders', icon: LocalShippingRounded, path: '/orders' },
  { label: 'Inventory', icon: Inventory2Rounded, path: '/inventory' },
  { label: 'New order', icon: AddShoppingCartRounded, path: '/orders/new' },
  { label: 'Tasks', icon: TaskAltRounded, path: '/tasks' },
  { label: 'Data & account', icon: SettingsRounded, path: '/data' },
];

const SidebarContent = ({ onClose }) => (
  <Box sx={{ height: '100%', p: 2, display: 'flex', flexDirection: 'column' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.4, px: 1, py: 1.25 }}>
      <Box sx={{ width: 38, height: 38, borderRadius: '12px', bgcolor: 'primary.main', color: 'white', display: 'grid', placeItems: 'center', fontWeight: 800 }}>S</Box>
      <Box>
        <Typography variant="h6" lineHeight={1}>Shopboard</Typography>
        <Typography variant="caption" color="text.secondary">Operations console</Typography>
      </Box>
    </Box>
    <Divider sx={{ my: 2 }} />
    <Typography variant="overline" color="text.secondary" sx={{ px: 1.5, letterSpacing: '.12em', fontWeight: 700 }}>Workspace</Typography>
    <List sx={{ mt: 0.75 }}>
      {items.map(({ label, icon: Icon, path }) => (
        <ListItemButton
          key={path}
          component={NavLink}
          to={path}
          onClick={onClose}
          sx={{
            mb: 0.5,
            borderRadius: 2.5,
            color: 'text.secondary',
            '&.active': { bgcolor: 'primary.main', color: 'white', '& .MuiListItemIcon-root': { color: 'white' } },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}><Icon fontSize="small" /></ListItemIcon>
          <ListItemText primary={label} primaryTypographyProps={{ fontWeight: 650, fontSize: 14 }} />
        </ListItemButton>
      ))}
    </List>
    <Box sx={{ mt: 'auto', p: 1.5, borderRadius: 3, bgcolor: '#f2f1ff' }}>
      <Typography fontWeight={700} fontSize={13}>Keep stock healthy</Typography>
      <Typography color="text.secondary" fontSize={12} mt={0.5}>Review low-stock products before they block new orders.</Typography>
    </Box>
  </Box>
);

const Sidebar = ({ mobileOpen, onClose }) => (
  <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }} aria-label="Primary navigation">
    <Drawer variant="temporary" open={mobileOpen} onClose={onClose} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth } }}>
      <SidebarContent onClose={onClose} />
    </Drawer>
    <Drawer variant="permanent" open sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', borderRight: '1px solid #e8eaf1' } }}>
      <SidebarContent />
    </Drawer>
  </Box>
);

export default Sidebar;
