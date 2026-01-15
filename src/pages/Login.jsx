import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  // Get the page they were trying to access
  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setGeneralError('');

    try {
      const result = await login(formData);

      if (result.success) {
        // Show success message briefly
        setGeneralError('');

        // Navigate to dashboard or the page they were trying to access
        navigate(from, { replace: true });
      } else {
        setGeneralError(result.error || 'Invalid username or password');
      }
    } catch (error) {
      setGeneralError('An unexpected error occurred. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: { xs: 4, sm: 8 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            padding: { xs: 3, sm: 4 },
            width: '100%',
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.07)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 4,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 64,
                height: 64,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #9D4EDD 0%, #7B2CBF 100%)',
                boxShadow: '0 8px 24px rgba(157, 78, 221, 0.4)',
                mb: 2,
              }}
            >
              <AccountBalanceIcon sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            <Typography
              component="h1"
              variant="h5"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(90deg, #ffffff 0%, #E0AAFF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Sign In to BudgetBox
            </Typography>
          </Box>

          {generalError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {generalError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={formData.username}
              onChange={handleChange}
              error={!!errors.username}
              helperText={errors.username}
              disabled={loading}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2">
                Don't have an account?{' '}
                <Link component={RouterLink} to="/register" variant="body2">
                  Sign Up
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Demo credentials hint for portfolio */}
        <Paper
          elevation={0}
          sx={{
            mt: 3,
            p: 2.5,
            width: '100%',
            background: 'linear-gradient(135deg, rgba(157, 78, 221, 0.1) 0%, rgba(76, 201, 240, 0.1) 100%)',
            border: '1px solid rgba(157, 78, 221, 0.2)',
            borderRadius: 3,
          }}
        >
          <Typography variant="caption" color="primary.light" sx={{ fontWeight: 600 }}>
            Demo Credentials:
          </Typography>
          <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
            Username: <strong style={{ color: 'rgba(255,255,255,0.9)' }}>testuser</strong> | Password: <strong style={{ color: 'rgba(255,255,255,0.9)' }}>testpass123</strong>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
