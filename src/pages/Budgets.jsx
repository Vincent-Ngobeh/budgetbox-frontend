import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  LinearProgress,
  TextField,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CloneIcon,
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Schedule,
  CalendarMonth,
  AttachMoney,
  Block,
  PlayArrow,
  Refresh,
} from '@mui/icons-material';
import budgetService from '../services/budgetService';
import categoryService from '../services/categoryService';
import { formatCurrency, formatDate, formatDateForAPI, getMonthStart, getMonthEnd } from '../utils/formatters';
import BudgetFormDialog from '../components/budgets/BudgetFormDialog';
import BudgetProgressDialog from '../components/budgets/BudgetProgressDialog';
import ConfirmDialog from '../components/common/ConfirmDialog';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  
  // Filter states
  const [filterPeriod, setFilterPeriod] = useState('current');
  const [filterCategory, setFilterCategory] = useState('');
  
  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [budgetToDelete, setBudgetToDelete] = useState(null);
  const [budgetToView, setBudgetToView] = useState(null);
  
  // Overview data
  const [overview, setOverview] = useState(null);
  const [recommendations, setRecommendations] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 1) {
      fetchOverview();
    } else if (activeTab === 2) {
      fetchRecommendations();
    }
  }, [activeTab]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [budgetsRes, categoriesRes] = await Promise.all([
        budgetService.getBudgets({ current: filterPeriod === 'current' }),
        categoryService.getCategories({ type: 'expense' }),
      ]);
      
      setBudgets(Array.isArray(budgetsRes) ? budgetsRes : budgetsRes.results || []);
      setCategories(Array.isArray(categoriesRes) ? categoriesRes : categoriesRes.results || []);
    } catch (err) {
      console.error('Error fetching initial data:', err);
      setError('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  const fetchOverview = async () => {
    try {
      const data = await budgetService.getOverview();
      setOverview(data);
    } catch (err) {
      console.error('Error fetching overview:', err);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const data = await budgetService.getRecommendations();
      setRecommendations(data);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    }
  };

  const handleAddBudget = () => {
    setSelectedBudget(null);
    setFormDialogOpen(true);
  };

  const handleEditBudget = (budget) => {
    setSelectedBudget(budget);
    setFormDialogOpen(true);
  };

  const handleViewProgress = (budget) => {
    setBudgetToView(budget);
    setProgressDialogOpen(true);
  };

  const handleDeleteClick = (budget) => {
    setBudgetToDelete(budget);
    setConfirmDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!budgetToDelete) return;

    try {
      await budgetService.deleteBudget(budgetToDelete.budget_id);
      setSuccessMessage('Budget deleted successfully');
      fetchInitialData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete budget');
    } finally {
      setConfirmDialogOpen(false);
      setBudgetToDelete(null);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedBudget) {
        await budgetService.updateBudget(selectedBudget.budget_id, formData);
        setSuccessMessage('Budget updated successfully');
      } else {
        await budgetService.createBudget(formData);
        setSuccessMessage('Budget created successfully');
      }
      
      setFormDialogOpen(false);
      fetchInitialData();
    } catch (err) {
      throw err; // Let the form dialog handle the error
    }
  };

  const handleCloneBudget = async (budget) => {
    try {
      await budgetService.cloneBudget(budget.budget_id, { period_shift: 'next' });
      setSuccessMessage(`Budget "${budget.budget_name}" cloned for next period`);
      fetchInitialData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to clone budget');
    }
  };

  const handleDeactivate = async (budget) => {
    try {
      await budgetService.deactivateBudget(budget.budget_id);
      setSuccessMessage(`Budget "${budget.budget_name}" deactivated`);
      fetchInitialData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to deactivate budget');
    }
  };

  const handleReactivate = async (budget) => {
    try {
      await budgetService.reactivateBudget(budget.budget_id);
      setSuccessMessage(`Budget "${budget.budget_name}" reactivated`);
      fetchInitialData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reactivate budget');
    }
  };

  const handleBulkCreate = async (template) => {
    try {
      const response = await budgetService.bulkCreateBudgets({
        template,
        start_date: getMonthStart(),
      });
      setSuccessMessage(`Created ${response.created_count} budgets`);
      fetchInitialData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create budgets');
    }
  };

  // Calculate budget status color and icon
  const getBudgetStatus = (budget) => {
    const percentage = budget.percentage_used || 0;
    if (percentage <= 50) {
      return { color: 'success', icon: <CheckCircle />, label: 'On Track' };
    } else if (percentage <= 80) {
      return { color: 'info', icon: <Schedule />, label: 'Monitor' };
    } else if (percentage <= 100) {
      return { color: 'warning', icon: <Warning />, label: 'Warning' };
    } else {
      return { color: 'error', icon: <Warning />, label: 'Exceeded' };
    }
  };

  const BudgetCard = ({ budget }) => {
    const status = getBudgetStatus(budget);
    const percentageUsed = parseFloat(budget.percentage_used || 0);
    
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
            <Box>
              <Typography variant="h6" gutterBottom>
                {budget.budget_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {budget.category_name}
              </Typography>
            </Box>
            <Chip
              icon={status.icon}
              label={status.label}
              color={status.color}
              size="small"
              variant="outlined"
            />
          </Box>
          
          <Box mb={2}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2" color="text.secondary">
                Spent: {formatCurrency(budget.spent_amount || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Budget: {formatCurrency(budget.budget_amount)}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(percentageUsed, 100)}
              color={status.color}
              sx={{ height: 8, borderRadius: 1 }}
            />
            <Box display="flex" justifyContent="space-between" mt={1}>
              <Typography variant="caption" color="text.secondary">
                {percentageUsed.toFixed(1)}% used
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatCurrency(budget.remaining_amount || 0)} remaining
              </Typography>
            </Box>
          </Box>
          
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" color="text.secondary">
              {formatDate(budget.start_date)} - {formatDate(budget.end_date)}
            </Typography>
            <Box>
              <Tooltip title="View Progress">
                <IconButton size="small" onClick={() => handleViewProgress(budget)}>
                  <TrendingUp fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit">
                <IconButton size="small" onClick={() => handleEditBudget(budget)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Clone for Next Period">
                <IconButton size="small" onClick={() => handleCloneBudget(budget)} color="info">
                  <CloneIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              {budget.is_active ? (
                <Tooltip title="Deactivate">
                  <IconButton size="small" onClick={() => handleDeactivate(budget)} color="warning">
                    <Block fontSize="small" />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title="Reactivate">
                  <IconButton size="small" onClick={() => handleReactivate(budget)} color="success">
                    <PlayArrow fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Page Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Budgets
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchInitialData}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddBudget}
          >
            Add Budget
          </Button>
        </Box>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab label="Active Budgets" />
          <Tab label="Overview" />
          <Tab label="Recommendations" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <>
          {/* Quick Actions for New Users */}
          {budgets.length === 0 && (
            <Paper sx={{ p: 3, mb: 3, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Get Started with Budgets
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Create your first budget or use our templates
              </Typography>
              <Box display="flex" justifyContent="center" gap={2} mt={2}>
                <Button
                  variant="outlined"
                  onClick={() => handleBulkCreate('essential')}
                >
                  Create Essential Budgets
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => handleBulkCreate('comprehensive')}
                >
                  Create Comprehensive Budgets
                </Button>
              </Box>
            </Paper>
          )}

          {/* Budget Grid */}
          <Grid container spacing={3}>
            {budgets.map(budget => (
              <Grid item xs={12} sm={6} md={4} key={budget.budget_id}>
                <BudgetCard budget={budget} />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {activeTab === 1 && overview && (
        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Budgeted
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {formatCurrency(overview.summary?.total_budgeted || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Spent
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="error.main">
                  {formatCurrency(overview.summary?.total_spent || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Remaining
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="success.main">
                  {formatCurrency(overview.summary?.total_remaining || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Overall Usage
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {(overview.summary?.overall_percentage || 0).toFixed(1)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Active Budgets List */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Budget Performance
              </Typography>
              <List>
                {overview.active_budgets?.map(budget => {
                  const status = getBudgetStatus(budget);
                  return (
                    <ListItem key={budget.id}>
                      <ListItemText
                        primary={budget.name}
                        secondary={`${budget.category} • ${formatCurrency(budget.spent)} of ${formatCurrency(budget.amount)}`}
                      />
                      <Chip
                        label={`${budget.percentage.toFixed(0)}%`}
                        color={status.color}
                        size="small"
                      />
                    </ListItem>
                  );
                })}
              </List>
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && recommendations && (
        <Grid container spacing={3}>
          {/* Unbudgeted Categories */}
          {recommendations.unbudgeted_categories?.length > 0 && (
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Categories Without Budgets
                </Typography>
                <List>
                  {recommendations.unbudgeted_categories.map((cat, idx) => (
                    <ListItem key={idx}>
                      <ListItemText
                        primary={cat.category}
                        secondary={`Recent spending: ${formatCurrency(cat.recent_spending)}`}
                      />
                      <Typography variant="body2" color="primary">
                        Suggested: {formatCurrency(cat.suggested_budget)}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          )}

          {/* Adjustment Needed */}
          {recommendations.adjustment_needed?.length > 0 && (
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Budgets Needing Adjustment
                </Typography>
                <List>
                  {recommendations.adjustment_needed.map((adj, idx) => (
                    <ListItem key={idx}>
                      <ListItemText
                        primary={adj.category}
                        secondary={`Overspent by ${adj.overspend_percentage.toFixed(0)}%`}
                      />
                      <Typography variant="body2" color="error">
                        Increase to: {formatCurrency(adj.recommended_budget)}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

      {/* Form Dialog */}
      <BudgetFormDialog
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        onSubmit={handleFormSubmit}
        budget={selectedBudget}
        categories={categories}
        existingBudgets={budgets}
      />

      {/* Progress Dialog */}
      <BudgetProgressDialog
        open={progressDialogOpen}
        onClose={() => setProgressDialogOpen(false)}
        budget={budgetToView}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Budget"
        message={`Are you sure you want to delete "${budgetToDelete?.budget_name}"?`}
      />
    </Container>
  );
};

export default Budgets;