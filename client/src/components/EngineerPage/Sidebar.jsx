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
import LogoutIcon from '@mui/icons-material/Logout';
import Swal from 'sweetalert2';
import { FaFileInvoice, FaWhatsapp } from 'react-icons/fa6';

// Styled components
const drawerWidth = 240;

const DrawerStyled = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    backgroundColor: theme.palette.background.default,
    borderRight: `1px solid ${theme.palette.divider}`,
  },
}));

const ToolbarSpacer = styled('div')(({ theme }) => ({
  ...theme.mixins.toolbar,
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
  width: '90%',
  backgroundColor: theme.palette.error.main,
  color: theme.palette.common.white,
  '&:hover': {
    backgroundColor: theme.palette.error.dark,
  },
}));

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear token from local storage
    Swal.fire({
      title: 'Logged out!',
      text: 'You have successfully logged out.',
      icon: 'success',
      confirmButtonText: 'OK',
      timer: 2000,
      timerProgressBar: true,
    }).then((result) => {
      if (result.dismiss === Swal.DismissReason.timer) {
        navigate('/'); // Redirect to home page
      }
    });
  };

  return (
    <DrawerStyled variant="permanent">
      <ToolbarSpacer />
      <div>
        <SidebarTitle variant="h6">Engineer Panel</SidebarTitle>
        <Divider />
        <List>
          <ListItemStyled button component={Link} to="/engineerservice">
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItemStyled>


          <ListItemStyled button component={Link} to="/quotation-list">
            <ListItemIcon>
              <FaFileInvoice />
            </ListItemIcon>
            <ListItemText primary="Quotation" />
          </ListItemStyled>



          <ListItemStyled button component={Link} to="/servicerequestcheck-list">
            <ListItemIcon>
              <FaFileInvoice />
            </ListItemIcon>
            <ListItemText primary="Service Request" />
          </ListItemStyled>


          {/* <ListItemStyled button component={Link} to="/templatemanager">
            <ListItemIcon>
              <FaWhatsapp />
            </ListItemIcon>
            <ListItemText primary="Whatsapp Template" />
          </ListItemStyled> */}
          {/* Add more sidebar items if needed */}
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

export default Sidebar;
