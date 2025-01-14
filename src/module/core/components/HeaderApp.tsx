import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import { usePopupState, bindTrigger, bindMenu } from 'material-ui-popup-state/hooks';
import { To, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderAppProps {
  titulo: string;
}

const HeaderApp = ({ titulo }: HeaderAppProps) => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, userName } = useAuth();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const popupState = usePopupState({ variant: 'popover', popupId: 'menuPopup' });

  const handleClick = (state: any, path: To) => {
    state.close();
    navigate(path);
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <AppBar position="static">
        <Toolbar>
          {isAuthenticated && (
            <React.Fragment>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                sx={{ mr: 2 }}
                {...bindTrigger(popupState)}
              >
                <MenuIcon />
              </IconButton>
              <Menu {...bindMenu(popupState)}>
                <MenuItem onClick={() => handleClick(popupState, "/Home")}>Home</MenuItem>
                <MenuItem onClick={() => handleClick(popupState, "/Unidades")}>Unidades</MenuItem>
                <MenuItem onClick={() => handleClick(popupState, "/Paquetes")}>Productos</MenuItem>
                <MenuItem onClick={() => handleClick(popupState, "/Recetas")}>Recetas</MenuItem>
              </Menu>
            </React.Fragment>
          )}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {titulo}
          </Typography>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: "end"}}>
            {userName}
          </Typography>
          {isAuthenticated && (
            <div>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                keepMounted
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                {/* <MenuItem onClick={() => handleClick(popupState, "/RecProfileetas")}>Profile</MenuItem> */}
                <MenuItem onClick={logout}>Log out</MenuItem>
              </Menu>
            </div>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default HeaderApp;
