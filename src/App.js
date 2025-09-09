import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';

// Context
import { AuthProvider } from './context/AuthContext';

// Layout Components
import Header from './components/Layout/Header';
import PrivateRoute from './components/Layout/PrivateRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

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
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
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
                
                {/* Placeholder routes for Phase 2 */}
                <Route
                  path="/accounts"
                  element={
                    <PrivateRoute>
                      <div style={{ padding: 20 }}>Accounts - Coming in Phase 2</div>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/transactions"
                  element={
                    <PrivateRoute>
                      <div style={{ padding: 20 }}>Transactions - Coming in Phase 2</div>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/budgets"
                  element={
                    <PrivateRoute>
                      <div style={{ padding: 20 }}>Budgets - Coming in Phase 3</div>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/categories"
                  element={
                    <PrivateRoute>
                      <div style={{ padding: 20 }}>Categories - Coming in Phase 3</div>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <div style={{ padding: 20 }}>Profile - Coming soon</div>
                    </PrivateRoute>
                  }
                />
                
                {/* Default Route */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Box>
          </Box>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;