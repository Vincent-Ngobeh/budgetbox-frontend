import React from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
} from '@mui/material';
import {
  AccountBalance,
  TrendingUp,
  TrendingDown,
  Wallet,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  // Placeholder data - will be replaced with API calls in Phase 2
  const stats = {
    totalBalance: 5234.67,
    monthlyIncome: 2500.00,
    monthlyExpenses: 1876.43,
    activeBudgets: 4,
  };

  const StatCard = ({ title, value, icon, color }) => (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
            borderRadius: 1,
            bgcolor: `${color}.lighter`,
            color: `${color}.main`,
            mr: 2,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
        £{value.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
      </Typography>
    </Paper>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.first_name || user?.username || 'User'}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's your financial overview
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Total Balance */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Balance"
            value={stats.totalBalance}
            icon={<AccountBalance />}
            color="primary"
          />
        </Grid>

        {/* Monthly Income */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Monthly Income"
            value={stats.monthlyIncome}
            icon={<TrendingUp />}
            color="success"
          />
        </Grid>

        {/* Monthly Expenses */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Monthly Expenses"
            value={stats.monthlyExpenses}
            icon={<TrendingDown />}
            color="error"
          />
        </Grid>

        {/* Net Savings */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Net Savings"
            value={stats.monthlyIncome - stats.monthlyExpenses}
            icon={<Wallet />}
            color="info"
          />
        </Grid>

        {/* Placeholder for more content */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Transactions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Transaction list will be implemented in Phase 2
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Budget Overview
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Budget charts will be implemented in Phase 3
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Spending by Category
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Category breakdown will be implemented in Phase 3
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;