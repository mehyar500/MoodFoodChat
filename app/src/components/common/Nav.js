import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Menu, MenuItem, Hidden } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuthContext } from '../../contexts/AuthContext';

const Nav = () => {
  const { user, logout } = useAuthContext();
  // console.log(user);
  const [openDialog, setOpenDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleLoginWithGoogle = (subscriptionType) => {
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/google?subscriptionType=${subscriptionType}`;
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          MoodFood
        </Typography>
        <Hidden smDown>
          {user ? (
            <>
              <Typography variant="body1" component="span" sx={{ mr: 2, color: 'inherit' }}>
                Tokens: {user.tokens}
              </Typography>
              <Button color="inherit" component={Link} to="/">
                Home
              </Button>
              <Button color="inherit" component={Link} to="/chat">
                MoodFood Chat
              </Button>
              {/* <Button color="inherit" component={Link} to="/recipes">
                Recipes
              </Button> */}
              <Button color="inherit" component={Link} to="/profile">
                Profile
              </Button>
              <Button color="inherit" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/">
                Home
              </Button>
              {/* <Button color="inherit" component={Link} to="/recipes">
                Recipes
              </Button> */}
              <Button color="inherit" onClick={handleOpenDialog}>
                Get Started
              </Button>
            </>
          )}
        </Hidden>
        <Hidden mdUp>
          {user && (
            <Typography variant="body1" component="span" sx={{ mr: 2, color: 'inherit' }}>
              Tokens: {user.tokens}
            </Typography>
          )}
          <Button color="inherit" component={Link} to="/chat">
                MoodFood Chat
              </Button>
          <IconButton color="inherit" edge="end" onClick={handleMenuClick}>
            <MenuIcon />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            {user ? (
              [
                <MenuItem key="home" onClick={handleMenuClose} component={Link} to="/">
                  Home
                </MenuItem>,
                // <MenuItem key="chat" onClick={handleMenuClose} component={Link} to="/chat">
                //   MoodFood Chat
                // </MenuItem>,
                // <MenuItem key="recipes" onClick={handleMenuClose} component={Link} to="/recipes">
                //   Recipes
                // </MenuItem>,
                <MenuItem key="profile" onClick={handleMenuClose} component={Link} to="/profile">
                  Profile
                </MenuItem>,
                <MenuItem key="logout" onClick={logout}>
                  Logout
                </MenuItem>,
              ]
            ) : (
              [
                <MenuItem key="home" onClick={handleMenuClose} component={Link} to="/">
                  Home
                </MenuItem>,
                // <MenuItem key="recipes" onClick={handleMenuClose} component={Link} to="/recipes">
                //   Recipes
                // </MenuItem>,
                <MenuItem key="getstarted" onClick={handleOpenDialog}>
                  Get Started
                </MenuItem>,
              ]
            )}
          </Menu>
        </Hidden>
      </Toolbar>
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Login or Register</DialogTitle>
        <DialogContent>
          <Typography>
            You have 10,000 daily tokens you can use a day. Click the button below to log in or register
            using your Google account.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleLoginWithGoogle('free')} color="primary">
            Sign In With Google
          </Button>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
};

export default Nav;

