import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, Box, FormControlLabel, Switch } from '@mui/material';
import { useNavigate } from 'react-router-dom'; 
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import TokenIcon from '@mui/icons-material/Token';
import SendToMobileIcon from '@mui/icons-material/SendToMobile';

// Import logo image
import logo from '../asset/logo.png';

const Sidebar = ({ darkMode, handleThemeChange }) => {
    const drawerWidth = 240;
    const navigate = useNavigate(); 

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    backgroundColor: '#25272b', 
                    color: 'white' 
                },
            }}
        >
            <Box sx={{ overflow: 'auto', padding: 2 }}>
                {/* Box for logo and title */}
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {/* Logo */}
                    <img src={logo} alt="logo" style={{ width: 30, height: 30, marginRight: 10 }} />
                    {/* Title */}
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                        TORE
                    </Typography>
                </Box>
            </Box>
            <List>
                <ListItem button onClick={() => navigate('/')}>
                    <ListItemIcon>
                        <AppRegistrationIcon sx={{ color: 'white' }} />
                    </ListItemIcon>
                    <ListItemText primary="Register Real-Estate" />
                </ListItem>
                <ListItem button onClick={() => navigate('/all')}>
                    <ListItemIcon>
                        <TokenIcon sx={{ color: 'white' }} />
                    </ListItemIcon>
                    <ListItemText primary="All Tokens Available" />
                </ListItem>
                <ListItem button onClick={() => navigate('/rent')}>
                <ListItemIcon>
                    <AccountBalanceWalletIcon sx={{ color: 'white' }} />
                </ListItemIcon>
                <ListItemText primary="Rent" />
            </ListItem>
                <ListItem button onClick={() => navigate('/transfer')}>
                    <ListItemIcon>
                        <SendToMobileIcon sx={{ color: 'white' }} />
                    </ListItemIcon>
                    <ListItemText primary="Transfer" />
                </ListItem>
                <ListItem button onClick={() => navigate('/tokenlist')}>
                    <ListItemIcon>
                        <AccountBalanceIcon sx={{ color: 'white' }} />
                    </ListItemIcon>
                    <ListItemText primary="My Token" />
                </ListItem>
            </List>

            {/* Nút chuyển đổi theme nằm ở phía dưới */}
            <Box sx={{ position: 'absolute', bottom: 20, width: '100%' }}>
                <FormControlLabel
                    control={
                        <Switch
                            checked={darkMode}
                            onChange={handleThemeChange}
                            color="default"
                        />
                    }
                    label={
                        darkMode ? (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Brightness4Icon sx={{ marginRight: 1 }} /> Dark Mode
                            </Box>
                        ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Brightness7Icon sx={{ marginRight: 1 }} /> Light Mode
                            </Box>
                        )
                    }
                    sx={{ color: 'white', justifyContent: 'center', marginLeft: 'auto', marginRight: 'auto' }} // Center the switch
                />
            </Box>
        </Drawer>
    );
}

export default Sidebar;
