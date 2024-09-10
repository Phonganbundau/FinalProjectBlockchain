import React from 'react';
import Sidebar from './Sidebar';
import { CssBaseline, Box } from '@mui/material';
import AllTokenList from './../pages/AllTokenList';

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
          <AllTokenList />
        </Box>
      </Box>
    </>
  );
}

export default App;
