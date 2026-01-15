import React, { useState } from 'react';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Button,
  Avatar,
  Tooltip,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Dashboard,
  AccountBalanceWallet,
  Receipt,
  AttachMoney,
  Category,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    handleCloseUserMenu();
    setMobileMenuOpen(false);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  const navigationItems = [
    { title: 'Dashboard', path: '/dashboard', icon: <Dashboard /> },
    { title: 'Accounts', path: '/accounts', icon: <AccountBalanceWallet /> },
    { title: 'Transactions', path: '/transactions', icon: <Receipt /> },
    { title: 'Budgets', path: '/budgets', icon: <AttachMoney /> },
    { title: 'Categories', path: '/categories', icon: <Category /> },
  ];

  const handleNavigate = (path) => {
    navigate(path);
    handleMobileMenuClose();
  };

  return (
    <>
      <AppBar position="sticky" elevation={0}>
        <Toolbar sx={{ py: 1 }}>
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #9D4EDD 0%, #7B2CBF 100%)',
              mr: 1.5,
              boxShadow: '0 4px 15px rgba(157, 78, 221, 0.3)',
            }}
          >
            <AccountBalanceIcon sx={{ fontSize: 22, color: 'white' }} />
          </Box>
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
              background: 'linear-gradient(90deg, #ffffff 0%, #E0AAFF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            BudgetBox
          </Typography>

          {/* Mobile menu icon - Only show when authenticated */}
          {isAuthenticated && (
            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="menu"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMobileMenuToggle}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
            </Box>
          )}

          {/* Mobile logo */}
          <Typography
            variant="h5"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontWeight: 700,
              textDecoration: 'none',
              background: 'linear-gradient(90deg, #ffffff 0%, #E0AAFF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            BudgetBox
          </Typography>

          {/* Desktop navigation */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 0.5 }}>
            {isAuthenticated &&
              navigationItems.map((item) => (
                <Button
                  key={item.path}
                  component={RouterLink}
                  to={item.path}
                  sx={{
                    my: 1,
                    px: 2.5,
                    py: 1,
                    color: location.pathname === item.path ? '#ffffff' : 'rgba(255,255,255,0.7)',
                    borderRadius: 2,
                    background: location.pathname === item.path
                      ? 'linear-gradient(135deg, rgba(157, 78, 221, 0.3) 0%, rgba(123, 44, 191, 0.2) 100%)'
                      : 'transparent',
                    border: location.pathname === item.path
                      ? '1px solid rgba(157, 78, 221, 0.3)'
                      : '1px solid transparent',
                    fontWeight: location.pathname === item.path ? 600 : 500,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      background: 'rgba(157, 78, 221, 0.2)',
                      borderColor: 'rgba(157, 78, 221, 0.2)',
                      color: '#ffffff',
                      transform: 'translateY(-1px)',
                    }
                  }}
                >
                  {item.title}
                </Button>
              ))}
          </Box>

          {/* User menu */}
          <Box sx={{ flexGrow: 0 }}>
            {isAuthenticated ? (
              <>
                <Tooltip title="Account settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar
                      sx={{
                        width: 42,
                        height: 42,
                        background: 'linear-gradient(135deg, #C77DFF 0%, #9D4EDD 100%)',
                        border: '2px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 4px 15px rgba(157, 78, 221, 0.3)',
                        fontWeight: 600,
                        fontSize: '1rem',
                      }}
                    >
                      {user?.first_name?.[0] || user?.username?.[0] || 'U'}
                    </Avatar>
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
                  <MenuItem disabled>
                    <Typography textAlign="center">
                      {user?.email || 'User'}
                    </Typography>
                  </MenuItem>
                  <MenuItem onClick={() => {
                    navigate('/profile');
                    handleCloseUserMenu();
                  }}>
                    Profile
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Button
                  component={RouterLink}
                  to="/login"
                  sx={{
                    color: 'rgba(255,255,255,0.9)',
                    px: 2.5,
                    '&:hover': {
                      color: '#ffffff',
                      background: 'rgba(255,255,255,0.05)',
                    }
                  }}
                >
                  Login
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  sx={{
                    px: 2.5,
                    background: 'linear-gradient(135deg, #9D4EDD 0%, #7B2CBF 100%)',
                    boxShadow: '0 4px 15px rgba(157, 78, 221, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #C77DFF 0%, #9D4EDD 100%)',
                      boxShadow: '0 6px 20px rgba(157, 78, 221, 0.5)',
                    }
                  }}
                >
                  Register
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={handleMobileMenuClose}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 240,
            backgroundColor: 'background.paper',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(90deg, #ffffff 0%, #E0AAFF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            BudgetBox
          </Typography>
          <IconButton
            onClick={handleMobileMenuClose}
            sx={{
              color: 'rgba(255,255,255,0.7)',
              '&:hover': {
                color: '#ffffff',
                background: 'rgba(157, 78, 221, 0.2)',
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider />

        {/* User info in mobile drawer */}
        {isAuthenticated && user && (
          <>
            <Box
              sx={{
                p: 2.5,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                background: 'rgba(157, 78, 221, 0.1)',
                borderRadius: 2,
                mx: 1.5,
                my: 1,
              }}
            >
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  background: 'linear-gradient(135deg, #C77DFF 0%, #9D4EDD 100%)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  fontWeight: 600,
                }}
              >
                {user?.first_name?.[0] || user?.username?.[0] || 'U'}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#ffffff' }}>
                  {user?.first_name} {user?.last_name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 1 }} />
          </>
        )}

        {/* Navigation items */}
        <List>
          {isAuthenticated ? (
            <>
              {navigationItems.map((item) => (
                <ListItem key={item.path} disablePadding sx={{ px: 1 }}>
                  <ListItemButton
                    onClick={() => handleNavigate(item.path)}
                    selected={location.pathname === item.path}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      '&.Mui-selected': {
                        background: 'linear-gradient(135deg, rgba(157, 78, 221, 0.25) 0%, rgba(123, 44, 191, 0.15) 100%)',
                        border: '1px solid rgba(157, 78, 221, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, rgba(157, 78, 221, 0.3) 0%, rgba(123, 44, 191, 0.2) 100%)',
                        }
                      },
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.05)',
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          color: location.pathname === item.path ? '#C77DFF' : 'rgba(255,255,255,0.6)',
                        }}
                      >
                        {item.icon}
                      </Box>
                      <ListItemText
                        primary={item.title}
                        primaryTypographyProps={{
                          fontWeight: location.pathname === item.path ? 600 : 400,
                          color: location.pathname === item.path ? '#ffffff' : 'rgba(255,255,255,0.8)',
                        }}
                      />
                    </Box>
                  </ListItemButton>
                </ListItem>
              ))}

              <Divider sx={{ my: 1 }} />

              <ListItem disablePadding>
                <ListItemButton onClick={() => handleNavigate('/profile')}>
                  <ListItemText primary="Profile" />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton onClick={handleLogout}>
                  <ListItemText primary="Logout" />
                </ListItemButton>
              </ListItem>
            </>
          ) : (
            <>
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleNavigate('/login')}>
                  <ListItemText primary="Login" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleNavigate('/register')}>
                  <ListItemText primary="Register" />
                </ListItemButton>
              </ListItem>
            </>
          )}
        </List>
      </Drawer>
    </>
  );
};

export default Header;
