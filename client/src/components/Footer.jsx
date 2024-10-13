
import React from 'react';
import { Box, Typography, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box
      sx={{
        backgroundColor: 'grey',
        color: 'white',
        padding: 2,
        position: 'static',
        // position: 'relative',
        bottom: 0,
        width: '100%',
        textAlign: 'center',
      }}
    >
      <Typography variant="body2">
        &copy; {new Date().getFullYear()} AEROLUBE ENGINEERS All rights reserved.
      </Typography>
      <Typography variant="body2">
        {/* <Link href="#" color="inherit" underline="hover">Privacy Policy</Link> |  */}
        <Link href="#" color="inherit" underline="hover"> Design and Developed By ❤️ @SmartITBox</Link>
      </Typography>
    </Box>
  );
};

export default Footer;
