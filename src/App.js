import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box, Typography, Paper } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h2" component="h1" gutterBottom>
              BudgetBox
            </Typography>
            <Typography variant="h5" color="text.secondary" paragraph>
              Personal Finance Tracker
            </Typography>
            <Typography variant="body1">
              ✅ React app is running successfully!
            </Typography>
            <Typography variant="body1">
              ✅ Material-UI is configured
            </Typography>
            <Typography variant="body1">
              ✅ Ready to connect to Django backend at{' '}
              {process.env.REACT_APP_API_URL}
            </Typography>
          </Paper>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
