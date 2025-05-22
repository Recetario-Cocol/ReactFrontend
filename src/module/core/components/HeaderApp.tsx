import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircle from "@mui/icons-material/AccountCircle";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import { usePopupState } from "material-ui-popup-state/hooks";
import { To, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Drawer, List, ListItem, ListItemButton, ListItemText } from "@mui/material";

export interface HeaderAppProps {
  titulo: string;
}

interface MenuItems {
  text: string;
  url: string;
}

const HeaderApp = ({ titulo }: HeaderAppProps) => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, userName, isAdmin } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const popupState = usePopupState({
    variant: "popover",
    popupId: "menuPopup",
  });
  const [openLeftBar, setOpenLeftBar] = React.useState(false);
  const toggleDrawer = (newOpen: boolean) => () => {
    setOpenLeftBar(newOpen);
  };

  const handleClick = (state: { close: () => void }, path: To) => {
    state.close();
    navigate(path);
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const menuItems: Array<MenuItems> = [
    { text: "Home", url: "/Home" },
    { text: "Unidades", url: "/Unidades" },
    { text: "Productos", url: "/Paquetes" },
    { text: "Recetas", url: "/Recetas" },
  ];

  const DrawerList = (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
      <List>
        {menuItems.map((item: MenuItems) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => handleClick(popupState, item.url)}>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ width: "100%", position: "sticky", top: 0 }}>
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
                onClick={toggleDrawer(true)}>
                <MenuIcon />
              </IconButton>
              <Drawer open={openLeftBar} onClose={toggleDrawer(false)}>
                {DrawerList}
              </Drawer>
            </React.Fragment>
          )}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, height: "32px" }}>
            {titulo}
          </Typography>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              textAlign: "end",
              height: "32px",
              margin: "0 12px",
              overflow: "hidden",
            }}>
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
                color="inherit">
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                keepMounted
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                open={Boolean(anchorEl)}
                onClose={handleClose}>
                {isAdmin && (
                  <MenuItem onClick={() => handleClick(popupState, "/Usuarios")}>Usuarios</MenuItem>
                )}
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
