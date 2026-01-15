import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout Components
import Header from './components/Layout/Header';
import PrivateRoute from './components/Layout/PrivateRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import Transactions from './pages/Transactions';
import Categories from './pages/Categories';
import Budgets from './pages/Budgets';
import Profile from './pages/Profile';

// Midnight Theme with Glassmorphism
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#9D4EDD',
      light: '#C77DFF',
      dark: '#7B2CBF',
      lighter: 'rgba(157, 78, 221, 0.15)',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#E0AAFF',
      light: '#F0D6FF',
      dark: '#C77DFF',
      lighter: 'rgba(224, 170, 255, 0.15)',
      contrastText: '#1a1a2e',
    },
    success: {
      main: '#00D9A5',
      light: '#5EEAD4',
      dark: '#00B884',
      lighter: 'rgba(0, 217, 165, 0.15)',
    },
    error: {
      main: '#FF6B6B',
      light: '#FFA0A0',
      dark: '#EE5A5A',
      lighter: 'rgba(255, 107, 107, 0.15)',
    },
    info: {
      main: '#4CC9F0',
      light: '#7DD8F4',
      dark: '#3BA4C7',
      lighter: 'rgba(76, 201, 240, 0.15)',
    },
    warning: {
      main: '#FFB347',
      light: '#FFCC80',
      dark: '#FF9800',
      lighter: 'rgba(255, 179, 71, 0.15)',
    },
    background: {
      default: 'transparent',
      paper: 'rgba(255, 255, 255, 0.05)',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
      disabled: 'rgba(255, 255, 255, 0.4)',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
    },
    subtitle2: {
      fontWeight: 500,
    },
    body1: {
      fontWeight: 400,
      lineHeight: 1.6,
    },
    body2: {
      fontWeight: 400,
      lineHeight: 1.5,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: 'rgba(157, 78, 221, 0.5) transparent',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.07)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          borderRadius: 20,
          transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
            borderColor: 'rgba(157, 78, 221, 0.3)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.25)',
        },
        elevation1: {
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)',
        },
        elevation2: {
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
        },
        elevation3: {
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(26, 26, 46, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'rgba(26, 26, 46, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          fontWeight: 600,
        },
        contained: {
          background: 'linear-gradient(135deg, #9D4EDD 0%, #7B2CBF 100%)',
          boxShadow: '0 4px 15px rgba(157, 78, 221, 0.4)',
          '&:hover': {
            background: 'linear-gradient(135deg, #C77DFF 0%, #9D4EDD 100%)',
            boxShadow: '0 6px 20px rgba(157, 78, 221, 0.5)',
          },
        },
        outlined: {
          borderColor: 'rgba(157, 78, 221, 0.5)',
          '&:hover': {
            borderColor: '#9D4EDD',
            background: 'rgba(157, 78, 221, 0.1)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            background: 'rgba(255, 255, 255, 0.03)',
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.15)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(157, 78, 221, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#9D4EDD',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontWeight: 500,
        },
        outlined: {
          borderColor: 'rgba(255, 255, 255, 0.2)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: 'rgba(26, 26, 46, 0.95)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 24,
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.5)',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          background: 'rgba(26, 26, 46, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 16,
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #9D4EDD 0%, #7B2CBF 100%)',
          fontWeight: 600,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        },
        standardError: {
          background: 'rgba(255, 107, 107, 0.15)',
          border: '1px solid rgba(255, 107, 107, 0.3)',
        },
        standardSuccess: {
          background: 'rgba(0, 217, 165, 0.15)',
          border: '1px solid rgba(0, 217, 165, 0.3)',
        },
        standardWarning: {
          background: 'rgba(255, 179, 71, 0.15)',
          border: '1px solid rgba(255, 179, 71, 0.3)',
        },
        standardInfo: {
          background: 'rgba(76, 201, 240, 0.15)',
          border: '1px solid rgba(76, 201, 240, 0.3)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: '4px 8px',
          '&.Mui-selected': {
            background: 'rgba(157, 78, 221, 0.2)',
            '&:hover': {
              background: 'rgba(157, 78, 221, 0.25)',
            },
          },
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.05)',
          },
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: 'none',
          background: 'transparent',
          '& .MuiDataGrid-cell': {
            borderColor: 'rgba(255, 255, 255, 0.08)',
          },
          '& .MuiDataGrid-columnHeaders': {
            background: 'rgba(255, 255, 255, 0.03)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
          },
          '& .MuiDataGrid-row:hover': {
            background: 'rgba(157, 78, 221, 0.1)',
          },
          '& .MuiDataGrid-footerContainer': {
            borderColor: 'rgba(255, 255, 255, 0.08)',
          },
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: '#9D4EDD',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          background: 'rgba(255, 255, 255, 0.1)',
        },
        bar: {
          borderRadius: 8,
          background: 'linear-gradient(90deg, #9D4EDD 0%, #C77DFF 100%)',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          background: 'rgba(26, 26, 46, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 8,
          fontSize: '0.75rem',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  },
});

// Component to handle root redirect based on auth status
function RootRedirect() {
  const { user, loading } = useAuth();

  // If still checking auth status, you might want to show a loading spinner
  if (loading) {
    return null; // Or a loading component
  }

  // Redirect based on authentication status
  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
}

// Separate AppRoutes component that can use useAuth hook
function AppRoutes() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* Accounts Route */}
          <Route
            path="/accounts"
            element={
              <PrivateRoute>
                <Accounts />
              </PrivateRoute>
            }
          />

          {/* Transactions Route */}
          <Route
            path="/transactions"
            element={
              <PrivateRoute>
                <Transactions />
              </PrivateRoute>
            }
          />

          {/* Categories Route */}
          <Route
            path="/categories"
            element={
              <PrivateRoute>
                <Categories />
              </PrivateRoute>
            }
          />

          {/* Budgets Route */}
          <Route
            path="/budgets"
            element={
              <PrivateRoute>
                <Budgets />
              </PrivateRoute>
            }
          />

          {/* Profile Route */}
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />

          {/* Default Route - Now checks auth status */}
          <Route path="/" element={<RootRedirect />} />

          {/* Catch all route for 404s */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
