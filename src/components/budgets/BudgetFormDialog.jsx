import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  MenuItem,
  Alert,
  InputAdornment,
  FormHelperText,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import { formatCurrency, formatDateForAPI, getMonthStart, getMonthEnd } from '../../utils/formatters';

const BudgetFormDialog = ({ 
  open, 
  onClose, 
  onSubmit, 
  budget,
  categories,
  existingBudgets
}) => {
  const isEdit = !!budget;
  
  const [formData, setFormData] = useState({
    category: '',
    budget_name: '',
    budget_amount: '',
    budget_type: 'monthly',
    period_type: 'monthly',
    start_date: getMonthStart(),
    end_date: getMonthEnd(),
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [overlapWarning, setOverlapWarning] = useState('');

  useEffect(() => {
    if (budget) {
      setFormData({
        category: budget.category || '',
        budget_name: budget.budget_name || '',
        budget_amount: budget.budget_amount || '',
        budget_type: budget.budget_type || 'monthly',
        period_type: budget.period_type || 'monthly',
        start_date: budget.start_date || getMonthStart(),
        end_date: budget.end_date || getMonthEnd(),
      });
    } else {
      setFormData({
        category: '',
        budget_name: '',
        budget_amount: '',
        budget_type: 'monthly',
        period_type: 'monthly',
        start_date: getMonthStart(),
        end_date: getMonthEnd(),
      });
    }
    setErrors({});
    setGeneralError('');
    setOverlapWarning('');
  }, [budget, open]);

  // Check for overlapping budgets
  useEffect(() => {
    if (formData.category && formData.start_date && formData.end_date) {
      const overlap = existingBudgets.find(b => 
        b.category === formData.category &&
        b.is_active &&
        (!isEdit || b.budget_id !== budget?.budget_id) &&
        ((formData.start_date >= b.start_date && formData.start_date <= b.end_date) ||
         (formData.end_date >= b.start_date && formData.end_date <= b.end_date) ||
         (formData.start_date <= b.start_date && formData.end_date >= b.end_date))
      );
      
      if (overlap) {
        setOverlapWarning(
          `Warning: An active budget already exists for this category in this period (${overlap.budget_name})`
        );
      } else {
        setOverlapWarning('');
      }
    }
  }, [formData.category, formData.start_date, formData.end_date, existingBudgets, isEdit, budget]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Auto-generate budget name if category changes
    if (name === 'category' && !isEdit) {
      const category = categories.find(c => c.category_id === value);
      if (category) {
        const periodName = formData.period_type.charAt(0).toUpperCase() + formData.period_type.slice(1);
        setFormData(prev => ({
          ...prev,
          category: value,
          budget_name: `${periodName} ${category.category_name} Budget`
        }));
      }
    }
    
    // Auto-calculate end date based on period type
    if (name === 'period_type' || name === 'start_date') {
      const startDate = name === 'start_date' ? new Date(value) : new Date(formData.start_date);
      let endDate = new Date(startDate);
      
      const periodType = name === 'period_type' ? value : formData.period_type;
      switch(periodType) {
        case 'weekly':
          endDate.setDate(endDate.getDate() + 6);
          break;
        case 'monthly':
          endDate.setMonth(endDate.getMonth() + 1);
          endDate.setDate(0); // Last day of month
          break;
        case 'quarterly':
          endDate.setMonth(endDate.getMonth() + 3);
          endDate.setDate(0);
          break;
        case 'yearly':
          endDate.setFullYear(endDate.getFullYear() + 1);
          endDate.setDate(endDate.getDate() - 1);
          break;
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: value,
        end_date: formatDateForAPI(endDate)
      }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.budget_name.trim()) {
      newErrors.budget_name = 'Budget name is required';
    } else if (formData.budget_name.trim().length < 2) {
      newErrors.budget_name = 'Budget name must be at least 2 characters';
    } else if (formData.budget_name.length > 100) {
      newErrors.budget_name = 'Budget name cannot exceed 100 characters';
    }
    
    if (!formData.budget_amount) {
      newErrors.budget_amount = 'Budget amount is required';
    } else {
      const amount = parseFloat(formData.budget_amount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.budget_amount = 'Budget amount must be positive';
      } else if (amount > 999999.99) {
        newErrors.budget_amount = 'Budget amount exceeds maximum allowed value';
      }
    }
    
    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }
    
    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    }
    
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      
      if (start >= end) {
        newErrors.end_date = 'End date must be after start date';
      }
      
      const daysDiff = (end - start) / (1000 * 60 * 60 * 24);
      if (daysDiff > 366) {
        newErrors.end_date = 'Budget period cannot exceed 1 year';
      }
    }
    
    // Check for overlap (this is also validated on backend)
    if (overlapWarning && !isEdit) {
      newErrors.category = 'An active budget already exists for this category in this period';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setLoading(true);
    setGeneralError('');
    
    try {
      const submitData = {
        category: formData.category,
        budget_name: formData.budget_name.trim(),
        budget_amount: parseFloat(formData.budget_amount),
        budget_type: formData.budget_type,
        period_type: formData.period_type,
        start_date: formData.start_date,
        end_date: formData.end_date,
      };
      
      await onSubmit(submitData);
      onClose();
    } catch (err) {
      console.error('Form submission error:', err);
      if (err.response?.data) {
        if (err.response.data.category) {
          setErrors({ category: err.response.data.category[0] });
        } else if (err.response.data.error) {
          setGeneralError(err.response.data.error);
        } else {
          setGeneralError('An error occurred. Please try again.');
        }
      } else {
        setGeneralError('An error occurred. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Common UK budget amounts
  const budgetSuggestions = {
    'Rent/Mortgage': 1800,
    'Groceries': 400,
    'Transport': 200,
    'Utilities': 150,
    'Council Tax': 150,
    'Entertainment': 200,
    'Eating Out': 250,
    'Shopping': 300,
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        component: 'form',
        onSubmit: handleSubmit,
      }}
    >
      <DialogTitle>
        {isEdit ? 'Edit Budget' : 'Create New Budget'}
      </DialogTitle>
      
      <DialogContent>
        {generalError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {generalError}
          </Alert>
        )}
        
        {overlapWarning && !errors.category && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {overlapWarning}
          </Alert>
        )}
        
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Category Selection */}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              error={!!errors.category}
              helperText={errors.category || 'Select the expense category to budget for'}
              required
              disabled={loading || isEdit}
            >
              {categories.length === 0 ? (
                <MenuItem disabled>No expense categories available</MenuItem>
              ) : (
                categories.map((category) => (
                  <MenuItem key={category.category_id} value={category.category_id}>
                    {category.category_name}
                    {category.transaction_count > 0 && (
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        ({category.transaction_count} transactions)
                      </Typography>
                    )}
                  </MenuItem>
                ))
              )}
            </TextField>
          </Grid>
          
          {/* Period Type */}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Period Type"
              name="period_type"
              value={formData.period_type}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="quarterly">Quarterly</MenuItem>
              <MenuItem value="yearly">Yearly</MenuItem>
            </TextField>
          </Grid>
          
          {/* Budget Name */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Budget Name"
              name="budget_name"
              value={formData.budget_name}
              onChange={handleChange}
              error={!!errors.budget_name}
              helperText={errors.budget_name || 'A descriptive name for this budget'}
              required
              disabled={loading}
              inputProps={{ maxLength: 100 }}
            />
          </Grid>
          
          {/* Budget Amount */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Budget Amount"
              name="budget_amount"
              value={formData.budget_amount}
              onChange={handleChange}
              error={!!errors.budget_amount}
              helperText={errors.budget_amount || 'Maximum amount to spend in this period'}
              InputProps={{
                startAdornment: <InputAdornment position="start">£</InputAdornment>,
              }}
              required
              disabled={loading}
              type="number"
              inputProps={{ 
                min: 0, 
                step: 0.01,
                max: 999999.99 
              }}
            />
          </Grid>
          
          {/* Budget Type (hidden, matches period_type) */}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Budget Type"
              name="budget_type"
              value={formData.budget_type}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="yearly">Yearly</MenuItem>
            </TextField>
          </Grid>
          
          {/* Date Range */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Start Date"
              name="start_date"
              type="date"
              value={formData.start_date}
              onChange={handleChange}
              error={!!errors.start_date}
              helperText={errors.start_date}
              InputLabelProps={{ shrink: true }}
              required
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="End Date"
              name="end_date"
              type="date"
              value={formData.end_date}
              onChange={handleChange}
              error={!!errors.end_date}
              helperText={errors.end_date}
              InputLabelProps={{ shrink: true }}
              required
              disabled={loading}
            />
          </Grid>
          
          {/* Suggestions */}
          {!isEdit && formData.category && (
            <Grid item xs={12}>
              <Box>
                <FormHelperText>Quick amount suggestions:</FormHelperText>
                <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                  {Object.entries(budgetSuggestions).map(([name, amount]) => (
                    <Chip
                      key={name}
                      label={`${name}: £${amount}`}
                      size="small"
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        budget_amount: amount.toString() 
                      }))}
                      variant="outlined"
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Box>
              </Box>
            </Grid>
          )}
          
          {/* Period Info */}
          <Grid item xs={12}>
            <Alert severity="info" variant="outlined">
              <Typography variant="body2">
                <strong>Period: </strong>
                {formData.start_date && formData.end_date && (
                  <>
                    {Math.ceil((new Date(formData.end_date) - new Date(formData.start_date)) / (1000 * 60 * 60 * 24))} days
                    {formData.period_type === 'monthly' && ' (1 month)'}
                    {formData.period_type === 'weekly' && ' (1 week)'}
                    {formData.period_type === 'quarterly' && ' (3 months)'}
                    {formData.period_type === 'yearly' && ' (1 year)'}
                  </>
                )}
              </Typography>
              {formData.budget_amount && formData.period_type === 'monthly' && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Daily allowance: £{(parseFloat(formData.budget_amount) / 30).toFixed(2)}
                </Typography>
              )}
            </Alert>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="contained" 
          disabled={loading || categories.length === 0}
        >
          {loading ? 'Saving...' : (isEdit ? 'Update' : 'Create')} Budget
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BudgetFormDialog;