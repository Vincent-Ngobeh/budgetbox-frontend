import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Schedule,
  CalendarMonth,
} from '@mui/icons-material';
import budgetService from '../../services/budgetService';
import { formatCurrency, formatDate } from '../../utils/formatters';

const BudgetProgressDialog = ({ open, onClose, budget }) => {
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && budget) {
      fetchProgressData();
    }
  }, [open, budget]);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await budgetService.getBudgetProgress(budget.budget_id);
      setProgressData(data);
    } catch (err) {
      console.error('Error fetching budget progress:', err);
      setError('Failed to load budget progress');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    switch(status) {
      case 'on_track':
        return { color: 'success', icon: <CheckCircle />, label: 'On Track' };
      case 'attention':
        return { color: 'info', icon: <Schedule />, label: 'Needs Attention' };
      case 'warning':
        return { color: 'warning', icon: <Warning />, label: 'Warning' };
      case 'exceeded':
        return { color: 'error', icon: <Warning />, label: 'Exceeded' };
      default:
        return { color: 'default', icon: null, label: 'Unknown' };
    }
  };

  if (!budget) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md" 
      fullWidth
    >
      <DialogTitle>
        Budget Progress: {budget.budget_name}
      </DialogTitle>
      
      <DialogContent>
        {loading && (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {progressData && !loading && (
          <Box>
            {/* Budget Overview */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Budget Amount
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {formatCurrency(progressData.budget?.amount || 0)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Period
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(progressData.budget?.period?.start)} - {formatDate(progressData.budget?.period?.end)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {progressData.budget?.period?.days_remaining} days remaining
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            
            {/* Spending Progress */}
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>
                Spending Progress
              </Typography>
              
              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">
                    Spent: {formatCurrency(progressData.spending?.total_spent || 0)}
                  </Typography>
                  <Typography variant="body2">
                    Remaining: {formatCurrency(progressData.spending?.remaining || 0)}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(progressData.spending?.percentage_used || 0, 100)}
                  color={progressData.spending?.percentage_used > 100 ? 'error' : 
                         progressData.spending?.percentage_used > 80 ? 'warning' : 'success'}
                  sx={{ height: 10, borderRadius: 1 }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  {(progressData.spending?.percentage_used || 0).toFixed(1)}% of budget used
                </Typography>
              </Box>
              
              {/* Status Chip */}
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Chip
                  icon={getStatusConfig(progressData.status).icon}
                  label={getStatusConfig(progressData.status).label}
                  color={getStatusConfig(progressData.status).color}
                />
                {progressData.spending?.pace_percentage && (
                  <Typography variant="body2" color="text.secondary">
                    Spending pace: {progressData.spending.pace_percentage.toFixed(0)}% 
                    {progressData.spending.pace_percentage > 100 ? ' (over pace)' : ' (on pace)'}
                  </Typography>
                )}
              </Box>
              
              {/* Daily Allowance */}
              {progressData.spending?.daily_allowance !== undefined && (
                <Alert 
                  severity={progressData.spending.daily_allowance > 0 ? 'info' : 'warning'}
                  variant="outlined"
                >
                  <Typography variant="body2">
                    {progressData.spending.daily_allowance > 0 ? (
                      <>Daily allowance: <strong>{formatCurrency(progressData.spending.daily_allowance)}</strong> per day for remaining period</>
                    ) : (
                      <>Budget exceeded - no remaining allowance</>
                    )}
                  </Typography>
                </Alert>
              )}
            </Box>
            
            {/* Recent Transactions */}
            {progressData.recent_transactions && progressData.recent_transactions.length > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Recent Transactions
                </Typography>
                <List>
                  {progressData.recent_transactions.map((transaction) => (
                    <React.Fragment key={transaction.id}>
                      <ListItem>
                        <ListItemText
                          primary={transaction.description}
                          secondary={formatDate(transaction.date)}
                        />
                        <Typography variant="body1" color="error.main" fontWeight="bold">
                          -{formatCurrency(transaction.amount)}
                        </Typography>
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              </Box>
            )}
            
            {/* Spending Metrics */}
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Expected Spend
                    </Typography>
                    <Typography variant="h6">
                      {formatCurrency(progressData.spending?.expected_spend || 0)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Actual Spend
                    </Typography>
                    <Typography variant="h6" color={
                      progressData.spending?.total_spent > progressData.spending?.expected_spend ? 'error.main' : 'success.main'
                    }>
                      {formatCurrency(progressData.spending?.total_spent || 0)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Days Left
                    </Typography>
                    <Typography variant="h6">
                      {progressData.budget?.period?.days_remaining || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BudgetProgressDialog;