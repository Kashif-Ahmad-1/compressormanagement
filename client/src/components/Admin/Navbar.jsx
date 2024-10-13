// Navbar.js
import React from 'react';
import { AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const AppBarStyled = styled(AppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: '#ff4d30', // Navbar color
}));



const Navbar = ({ onMenuClick }) => {
  const navigate = useNavigate();


  return (
    <AppBarStyled sx={{ backgroundColor: 'gray'}} position="fixed">
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu" onClick={onMenuClick}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6">AEROLUBE ENGINEERS</Typography>
      </Toolbar>
    </AppBarStyled>
  );
};


export default Navbar;
