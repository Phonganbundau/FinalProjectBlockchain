import React from 'react';
import Sidebar from './Sidebar';
import { CssBaseline, Box } from '@mui/material';
import TokenList from './../pages/TokenList';

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
          <TokenList />
        </Box>
      </Box>
    </>
  );
}

export default App;
