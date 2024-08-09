import React, { useState, useContext } from 'react';
import { AppBar, Toolbar, IconButton, InputBase, Badge, Avatar, Box, Menu, MenuItem, Divider } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import MailIcon from '@mui/icons-material/Mail';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';


const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: 80,
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const Navbar = ({ showSnackbar }) => {

  const BASEURL = "https://shopping-dashboard-backend-production.up.railway.app/"
  // const BASEURL = "http://localhost:5000/"

  let { token } = useContext(AuthContext)
  const [anchorEl, setAnchorEl] = useState(null);

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };


  const deleteUser = async () => {
    try {
      await axios.delete(BASEURL + 'api/users/me', { headers: { 'x-auth-token': token } });

      showSnackbar({
        message: 'Account Deleted! Redirecting to signup page...',
        severity: 'success',
        autoHideDuration: 1000,
        redirectToPath: '/signup'
      });

    } catch (error) {
      console.error(`Error in login: ${error.message}`);
      showSnackbar({
        message: `Some error occured: ${error.message}`,
        severity: 'error',
        autoHideDuration: 2000
      });
    }
  }

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteUser = () => {
    // Implement user deletion logic here
    deleteUser()
    console.log('Delete user');
    handleClose();
  };

  const handleUpdateUser = () => {
    // Implement user update logic here
    console.log('Update user info');
    handleClose();
  };

  return (
    <AppBar position="fixed" sx={{ backgroundColor: '#202022' }}>
      <Toolbar>
        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search…"
            inputProps={{ 'aria-label': 'search' }}
          />
        </Search>

        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ display: 'flex' }}>

          <IconButton color="inherit">
            <Badge badgeContent={4} color="error">
              <MailIcon />
            </Badge>
          </IconButton>

          <IconButton color="inherit">
            <SettingsIcon />
          </IconButton>

          <IconButton color="inherit">
            <Badge badgeContent={17} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <IconButton color="inherit" onClick={handleAvatarClick}>
            <Avatar alt="User Avatar" src="/static/images/avatar/1.jpg" sx={{ width: 32, height: 32 }} />
          </IconButton>

        </Box>
      </Toolbar>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {/* <MenuItem onClick={handleUpdateUser}>Update Info</MenuItem> */}
        {/* <Divider /> */}
        <MenuItem onClick={handleDeleteUser}>Delete Account</MenuItem>
      </Menu>
    </AppBar>
  );
};

export default Navbar;

