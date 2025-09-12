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

// Create theme with additional color definitions
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      lighter: '#E3F2FD',
    },
    secondary: {
      main: '#dc004e',
      lighter: '#FCE4EC',
    },
    success: {
      main: '#2e7d32',
      lighter: '#E8F5E9',
    },
    error: {
      main: '#d32f2f',
      lighter: '#FFEBEE',
    },
    info: {
      main: '#0288d1',
      lighter: '#E1F5FE',
    },
    warning: {
      main: '#ed6c02',
      lighter: '#FFF4E5',
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