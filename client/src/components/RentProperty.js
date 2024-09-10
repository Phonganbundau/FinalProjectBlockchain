import React from 'react';
import Sidebar from './Sidebar';
import { CssBaseline, Box } from '@mui/material';
import RentProperty from './../pages/RentProperty';

const drawerWidth = 0; 

function App() {
  return (
    <>
      <CssBaseline /> 
      
      <Box sx={{ display: 'flex' }}> 
        <Sidebar />
        <Box
          component="main"
          sx={{ flexGrow: 1, marginLeft: `${drawerWidth}px` }} 
        >  
          <RentProperty />
        </Box>
      </Box>
    </>
  );
}

export default App;
