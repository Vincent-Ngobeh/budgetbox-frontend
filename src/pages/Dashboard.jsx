import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  AccountBalance,
  TrendingUp,
  TrendingDown,
  Wallet,
  AttachMoney,
  Warning,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import accountService from '../services/accountService';
import transactionService from '../services/transactionService';
import { formatCurrency, formatDate, formatAccountType } from '../utils/formatters';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    summary: null,
    statistics: null,
    recentActivity: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch data in parallel for better performance
      const [accountSummary, transactionStats] = await Promise.all([
        accountService.getAccountSummary(),
        transactionService.getStatistics()
      ]);

      setDashboardData({
        summary: accountSummary,
        statistics: transactionStats
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, prefix = '£', showSign = false }) => (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, ${color === 'primary' ? '#9D4EDD' : color === 'success' ? '#00D9A5' : color === 'error' ? '#FF6B6B' : color === 'info' ? '#4CC9F0' : '#FFB347'} 0%, transparent 100%)`,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 52,
              height: 52,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${color === 'primary' ? 'rgba(157, 78, 221, 0.2)' : color === 'success' ? 'rgba(0, 217, 165, 0.2)' : color === 'error' ? 'rgba(255, 107, 107, 0.2)' : color === 'info' ? 'rgba(76, 201, 240, 0.2)' : 'rgba(255, 179, 71, 0.2)'} 0%, transparent 100%)`,
              border: `1px solid ${color === 'primary' ? 'rgba(157, 78, 221, 0.3)' : color === 'success' ? 'rgba(0, 217, 165, 0.3)' : color === 'error' ? 'rgba(255, 107, 107, 0.3)' : color === 'info' ? 'rgba(76, 201, 240, 0.3)' : 'rgba(255, 179, 71, 0.3)'}`,
              color: `${color}.main`,
              mr: 2,
            }}
          >
            {icon}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, fontWeight: 500 }}>
            {title}
          </Typography>
        </Box>
        <Typography
          variant="h4"
          component="div"
          sx={{
            fontWeight: 700,
            color: `${color}.main`,
            letterSpacing: '-0.02em',
          }}
        >
          {showSign && value > 0 ? '+' : ''}{prefix}{Math.abs(value).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
        </Typography>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  // Calculate total balance from all accounts
  const totalBalance = dashboardData.summary?.summary?.totals_by_currency?.GBP?.total || 0;
  const monthlyIncome = dashboardData.statistics?.summary?.total_income || 0;
  const monthlyExpenses = dashboardData.statistics?.summary?.total_expenses || 0;
  const netSavings = dashboardData.statistics?.summary?.net_savings || 0;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 5 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(90deg, #ffffff 0%, #C77DFF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Welcome back, {user?.first_name || user?.username || 'User'}!
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 400 }}>
          Here's your financial overview for the last 30 days
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Total Balance */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Balance"
            value={totalBalance}
            icon={<AccountBalance />}
            color="primary"
          />
        </Grid>

        {/* Monthly Income */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Income (30 days)"
            value={monthlyIncome}
            icon={<TrendingUp />}
            color="success"
            showSign={true}
          />
        </Grid>

        {/* Monthly Expenses */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Expenses (30 days)"
            value={monthlyExpenses}
            icon={<TrendingDown />}
            color="error"
          />
        </Grid>

        {/* Net Savings */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Net Savings"
            value={netSavings}
            icon={<Wallet />}
            color={netSavings >= 0 ? 'info' : 'warning'}
            showSign={true}
          />
        </Grid>

        {/* Accounts Overview */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, height: '100%', borderRadius: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2.5 }}>
              Your Accounts
            </Typography>
            {dashboardData.summary?.accounts?.length > 0 ? (
              <List>
                {dashboardData.summary.accounts.slice(0, 5).map((account) => (
                  <ListItem key={account.id} sx={{ px: 0 }}>
                    <ListItemText
                      primary={account.name}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {account.bank} • {formatAccountType(account.type)}
                          </Typography>
                        </Box>
                      }
                    />
                    <Typography
                      variant="h6"
                      sx={{
                        color: account.balance >= 0 ? 'success.main' : 'error.main',
                        fontWeight: 'bold'
                      }}
                    >
                      {formatCurrency(account.balance)}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No accounts found. Add your first account to get started.
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              {dashboardData.summary?.summary?.total_accounts || 0} total accounts
            </Typography>
          </Paper>
        </Grid>

        {/* Recent Transactions */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, height: '100%', borderRadius: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2.5 }}>
              Recent Activity
            </Typography>
            {dashboardData.summary?.recent_activity?.length > 0 ? (
              <List>
                {dashboardData.summary.recent_activity.slice(0, 5).map((transaction, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemText
                      primary={transaction.description}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="caption">
                            {formatDate(transaction.date)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            • {transaction.account}
                          </Typography>
                        </Box>
                      }
                    />
                    <Typography
                      variant="body1"
                      sx={{
                        color: transaction.amount >= 0 ? 'success.main' : 'error.main',
                        fontWeight: 'medium'
                      }}
                    >
                      {transaction.amount >= 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No recent transactions found.
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Top Spending Categories */}
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2.5 }}>
              Top Spending Categories
            </Typography>
            {dashboardData.statistics?.category_breakdown?.length > 0 ? (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {dashboardData.statistics.category_breakdown.slice(0, 6).map((category, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Box sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 2.5,
                      background: 'rgba(255, 107, 107, 0.08)',
                      border: '1px solid rgba(255, 107, 107, 0.15)',
                      borderRadius: 3,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: 'rgba(255, 107, 107, 0.12)',
                        borderColor: 'rgba(255, 107, 107, 0.25)',
                        transform: 'translateY(-2px)',
                      }
                    }}>
                      <Box>
                        <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>
                          {category.category}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {category.count} transactions
                        </Typography>
                      </Box>
                      <Typography variant="h6" color="error.main" sx={{ fontWeight: 600 }}>
                        {formatCurrency(category.total)}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No spending data available for the selected period.
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Account Summary Info */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              background: 'linear-gradient(135deg, rgba(76, 201, 240, 0.1) 0%, rgba(157, 78, 221, 0.1) 100%)',
              border: '1px solid rgba(76, 201, 240, 0.2)',
              borderRadius: 3,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  background: 'rgba(76, 201, 240, 0.2)',
                  border: '1px solid rgba(76, 201, 240, 0.3)',
                }}
              >
                <AttachMoney sx={{ color: 'info.main' }} />
              </Box>
              <Box>
                <Typography variant="body2" color="info.main" sx={{ fontWeight: 600 }}>
                  Financial Summary
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  You have {dashboardData.summary?.summary?.active_accounts || 0} active accounts
                  {dashboardData.statistics?.summary?.transaction_count > 0 &&
                    ` with ${dashboardData.statistics.summary.transaction_count} transactions in the last 30 days`}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
