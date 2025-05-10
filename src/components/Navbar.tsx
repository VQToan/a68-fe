import { memo, useCallback, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AppBar, Box, Toolbar, IconButton, Typography, Menu, Container, Avatar, Button, Tooltip, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../hooks/useAuth';
import { areEqual } from '@/utils/common';

const Navbar = () => {
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleOpenNavMenu =useCallback( (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  }, [setAnchorElNav]);
  
  const handleOpenUserMenu = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  }, [setAnchorElUser]);

  const handleCloseNavMenu = useCallback(() => {
    setAnchorElNav(null);
  }, [setAnchorElNav]);

  const handleCloseUserMenu = useCallback(() => {
    setAnchorElUser(null);
  }, [setAnchorElUser]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/');
    handleCloseUserMenu();
  }, [logout, navigate, handleCloseUserMenu]);

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            REACT-APP
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              <MenuItem onClick={handleCloseNavMenu} component={RouterLink} to="/">
                <Typography textAlign="center">Home</Typography>
              </MenuItem>
              {isLoggedIn ? (
                <MenuItem onClick={handleCloseNavMenu} component={RouterLink} to="/dashboard">
                  <Typography textAlign="center">Dashboard</Typography>
                </MenuItem>
              ) : (
                <>
                  <MenuItem onClick={handleCloseNavMenu} component={RouterLink} to="/login">
                    <Typography textAlign="center">Login</Typography>
                  </MenuItem>
                  <MenuItem onClick={handleCloseNavMenu} component={RouterLink} to="/register">
                    <Typography textAlign="center">Register</Typography>
                  </MenuItem>
                </>
              )}
            </Menu>
          </Box>
          
          <Typography
            variant="h5"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            REACT-APP
          </Typography>
          
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            <Button
              component={RouterLink}
              to="/"
              onClick={handleCloseNavMenu}
              sx={{ my: 2, color: 'white', display: 'block' }}
            >
              Home
            </Button>
            
            {isLoggedIn ? (
              <Button
                component={RouterLink}
                to="/dashboard"
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                Dashboard
              </Button>
            ) : (
              <>
                <Button
                  component={RouterLink}
                  to="/login"
                  onClick={handleCloseNavMenu}
                  sx={{ my: 2, color: 'white', display: 'block' }}
                >
                  Login
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  onClick={handleCloseNavMenu}
                  sx={{ my: 2, color: 'white', display: 'block' }}
                >
                  Register
                </Button>
              </>
            )}
          </Box>

          {isLoggedIn && (
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar alt={user?.full_name || 'User'} src="/static/images/avatar/2.jpg" />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem onClick={handleCloseUserMenu} component={RouterLink} to="/profile">
                  <Typography textAlign="center">Profile</Typography>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <Typography textAlign="center">Logout</Typography>
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default memo(Navbar, areEqual);