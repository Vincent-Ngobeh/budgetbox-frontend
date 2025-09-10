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
  TextField,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
  TrendingUp,
  TrendingDown,
  MergeType,
  CheckCircle,
  Block,
} from '@mui/icons-material';
import categoryService from '../services/categoryService';
import { formatCurrency, formatDate } from '../utils/formatters';
import CategoryFormDialog from '../components/categories/CategoryFormDialog';
import ReassignDialog from '../components/categories/ReassignDialog';
import ConfirmDialog from '../components/common/ConfirmDialog';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Filter states
  const [filterType, setFilterType] = useState('all');
  const [filterActive, setFilterActive] = useState('active');
  
  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [reassignDialogOpen, setReassignDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [categoryToReassign, setCategoryToReassign] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await categoryService.getCategories();
      const categoriesData = Array.isArray(response) ? response : response.results || [];
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setFormDialogOpen(true);
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setFormDialogOpen(true);
  };

  const handleDeleteClick = (category) => {
    if (category.is_default) {
      setError('Cannot delete default categories');
      return;
    }
    
    if (category.transaction_count > 0) {
      // If category has transactions, open reassign dialog instead
      setCategoryToReassign(category);
      setReassignDialogOpen(true);
    } else {
      // If no transactions, proceed with delete
      setCategoryToDelete(category);
      setConfirmDialogOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    try {
      await categoryService.deleteCategory(categoryToDelete.category_id);
      setSuccessMessage('Category deleted successfully');
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete category');
    } finally {
      setConfirmDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedCategory) {
        await categoryService.updateCategory(selectedCategory.category_id, formData);
        setSuccessMessage('Category updated successfully');
      } else {
        await categoryService.createCategory(formData);
        setSuccessMessage('Category created successfully');
      }
      
      setFormDialogOpen(false);
      fetchCategories();
    } catch (err) {
      throw err; // Let the form dialog handle the error
    }
  };

  const handleReassignSubmit = async (targetCategoryId) => {
    if (!categoryToReassign) return;

    try {
      await categoryService.reassignTransactions(
        categoryToReassign.category_id,
        targetCategoryId
      );
      setSuccessMessage(
        `Transactions reassigned and ${categoryToReassign.category_name} deactivated successfully`
      );
      setReassignDialogOpen(false);
      setCategoryToReassign(null);
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reassign transactions');
    }
  };

  const handleSetDefaults = async () => {
    try {
      const response = await categoryService.setDefaultCategories();
      setSuccessMessage(response.message || 'Default categories created');
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create default categories');
    }
  };

  // Filter categories
  const filteredCategories = categories.filter(category => {
    if (filterType !== 'all' && category.category_type !== filterType) return false;
    if (filterActive === 'active' && !category.is_active) return false;
    if (filterActive === 'inactive' && category.is_active) return false;
    return true;
  });

  // Group categories by type for display
  const incomeCategories = filteredCategories.filter(c => c.category_type === 'income');
  const expenseCategories = filteredCategories.filter(c => c.category_type === 'expense');

  // Calculate statistics
  const stats = {
    totalCategories: categories.length,
    activeCategories: categories.filter(c => c.is_active).length,
    incomeCategories: categories.filter(c => c.category_type === 'income').length,
    expenseCategories: categories.filter(c => c.category_type === 'expense').length,
    totalTransactions: categories.reduce((sum, c) => sum + (c.transaction_count || 0), 0),
  };

  const CategoryListItem = ({ category }) => (
    <ListItem
      sx={{
        '&:hover': { bgcolor: 'action.hover' },
        borderRadius: 1,
        mb: 1,
      }}
    >
      <ListItemText
        primary={
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body1">
              {category.category_name}
            </Typography>
            {category.is_default && (
              <Chip label="Default" size="small" color="primary" variant="outlined" />
            )}
            {!category.is_active && (
              <Chip label="Inactive" size="small" color="default" variant="outlined" />
            )}
          </Box>
        }
        secondary={
          <Typography variant="caption" color="text.secondary">
            {category.transaction_count || 0} transactions
            {category.is_default && ' • System default'}
          </Typography>
        }
      />
      <ListItemSecondaryAction>
        <Box display="flex" alignItems="center" gap={1}>
          <Badge badgeContent={category.transaction_count} color="primary" max={999}>
            <CategoryIcon fontSize="small" color="action" />
          </Badge>
          
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => handleEditCategory(category)}
              disabled={!category.is_active}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          {category.transaction_count > 0 ? (
            <Tooltip title="Reassign transactions and delete">
              <IconButton
                size="small"
                onClick={() => handleDeleteClick(category)}
                color="warning"
                disabled={category.is_default}
              >
                <MergeType fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title={category.is_default ? "Cannot delete default category" : "Delete"}>
              <span>
                <IconButton
                  size="small"
                  onClick={() => handleDeleteClick(category)}
                  color="error"
                  disabled={category.is_default}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          )}
        </Box>
      </ListItemSecondaryAction>
    </ListItem>
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Page Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Categories
        </Typography>
        <Box display="flex" gap={2}>
          {categories.length === 0 && (
            <Button
              variant="outlined"
              onClick={handleSetDefaults}
            >
              Create Default Categories
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddCategory}
          >
            Add Category
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

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Categories
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {stats.totalCategories}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Active
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {stats.activeCategories}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Income
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {stats.incomeCategories}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Expense
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="error.main">
                {stats.expenseCategories}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Transactions
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {stats.totalTransactions}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4} md={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Category Type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="income">Income Only</MenuItem>
              <MenuItem value="expense">Expense Only</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Status"
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active Only</MenuItem>
              <MenuItem value="inactive">Inactive Only</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Categories Lists */}
      <Grid container spacing={3}>
        {/* Income Categories */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <TrendingUp sx={{ mr: 1, color: 'success.main' }} />
              <Typography variant="h6">
                Income Categories ({incomeCategories.length})
              </Typography>
            </Box>
            {incomeCategories.length > 0 ? (
              <List>
                {incomeCategories.map(category => (
                  <CategoryListItem key={category.category_id} category={category} />
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                No income categories found
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Expense Categories */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <TrendingDown sx={{ mr: 1, color: 'error.main' }} />
              <Typography variant="h6">
                Expense Categories ({expenseCategories.length})
              </Typography>
            </Box>
            {expenseCategories.length > 0 ? (
              <List>
                {expenseCategories.map(category => (
                  <CategoryListItem key={category.category_id} category={category} />
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                No expense categories found
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Info Box */}
      <Paper sx={{ p: 2, mt: 3, bgcolor: 'info.lighter' }}>
        <Typography variant="body2" color="info.main">
          <strong>Note:</strong> Categories with transactions cannot be deleted directly. 
          Use the reassign feature to move transactions to another category first. 
          Default categories are system-generated and cannot be deleted.
        </Typography>
      </Paper>

      {/* Form Dialog */}
      <CategoryFormDialog
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        onSubmit={handleFormSubmit}
        category={selectedCategory}
        existingCategories={categories}
      />

      {/* Reassign Dialog */}
      <ReassignDialog
        open={reassignDialogOpen}
        onClose={() => setReassignDialogOpen(false)}
        onSubmit={handleReassignSubmit}
        sourceCategory={categoryToReassign}
        categories={categories.filter(c => 
          c.category_id !== categoryToReassign?.category_id &&
          c.category_type === categoryToReassign?.category_type &&
          c.is_active
        )}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Category"
        message={`Are you sure you want to delete "${categoryToDelete?.category_name}"? This action cannot be undone.`}
      />
    </Container>
  );
};

export default Categories;