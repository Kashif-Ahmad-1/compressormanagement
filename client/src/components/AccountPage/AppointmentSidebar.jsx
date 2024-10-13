import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  Divider,
  Drawer,
  Typography,
  ListItemIcon,
  Button,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import ClientIcon from '@mui/icons-material/Person'; 
import LogoutIcon from '@mui/icons-material/Logout';
import Swal from 'sweetalert2';

// Adjusted drawer width
const drawerWidth = 180; // Change this value

const DrawerStyled = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    backgroundColor: theme.palette.background.default,
    borderRight: `1px solid ${theme.palette.divider}`,
  },
}));

const ListItemStyled = styled(ListItem)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  borderRadius: theme.shape.borderRadius,
}));

const SidebarTitle = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(2),
  fontWeight: 'bold',
  color: theme.palette.primary.main,
  textAlign: 'left',
  fontSize: '1.5rem',
}));

const LogoutButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(2),
  width: '100%',
  backgroundColor: theme.palette.error.main,
  color: theme.palette.common.white,
  '&:hover': {
    backgroundColor: theme.palette.error.dark,
  },
}));

const AppointmentSidebar = ({ open, toggleSidebar }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    Swal.fire({
      title: 'Logged out!',
      text: 'You have successfully logged out.',
      icon: 'success',
      confirmButtonText: 'OK',
      timer: 2000,
      timerProgressBar: true,
    }).then((result) => {
      if (result.dismiss === Swal.DismissReason.timer) {
        navigate('/'); 
      }
    });
  };

  return (
    <DrawerStyled variant="temporary" open={open} onClose={toggleSidebar}>
      <div>
        <SidebarTitle variant="h6">Accountants</SidebarTitle>
        <Divider />
        <List>
          <ListItemStyled button component={Link} to="/accountspage" onClick={toggleSidebar}>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItemStyled>
          <ListItemStyled button component={Link} to="/account-add-client" onClick={toggleSidebar}>
            <ListItemIcon>
              <ClientIcon />
            </ListItemIcon>
            <ListItemText primary="Create Invoice " />
          </ListItemStyled>
        </List>
      </div>
      <Divider />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <LogoutButton variant="contained" startIcon={<LogoutIcon />} onClick={handleLogout}>
          Logout
        </LogoutButton>
        <Typography variant="caption" sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
          © 2024 Your Company
        </Typography>
      </div>
    </DrawerStyled>
  );
};

export default AppointmentSidebar;
