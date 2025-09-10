import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Alert,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormHelperText,
  Chip,
  Box,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';

const CategoryFormDialog = ({ 
  open, 
  onClose, 
  onSubmit, 
  category,
  existingCategories 
}) => {
  const isEdit = !!category;
  
  const [formData, setFormData] = useState({
    category_name: '',
    category_type: 'expense',
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  useEffect(() => {
    if (category) {
      setFormData({
        category_name: category.category_name || '',
        category_type: category.category_type || 'expense',
      });
    } else {
      setFormData({
        category_name: '',
        category_type: 'expense',
      });
    }
    setErrors({});
    setGeneralError('');
  }, [category, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Category name validation
    if (!formData.category_name.trim()) {
      newErrors.category_name = 'Category name is required';
    } else if (formData.category_name.trim().length < 2) {
      newErrors.category_name = 'Category name must be at least 2 characters';
    } else if (formData.category_name.length > 50) {
      newErrors.category_name = 'Category name cannot exceed 50 characters';
    } else {
      // Check for duplicate category names (case-insensitive)
      const duplicate = existingCategories.find(c => 
        c.category_name.toLowerCase() === formData.category_name.trim().toLowerCase() &&
        c.category_type === formData.category_type &&
        (!isEdit || c.category_id !== category.category_id)
      );
      
      if (duplicate) {
        newErrors.category_name = `You already have a ${formData.category_type} category named "${duplicate.category_name}"`;
      }
    }
    
    // Category type validation
    if (!['income', 'expense'].includes(formData.category_type)) {
      newErrors.category_type = 'Invalid category type';
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
      const submitData = {
        category_name: formData.category_name.trim(),
        category_type: formData.category_type,
      };
      
      await onSubmit(submitData);
      onClose();
    } catch (err) {
      console.error('Form submission error:', err);
      if (err.response?.data) {
        if (err.response.data.category_name) {
          setErrors({ category_name: err.response.data.category_name[0] });
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

  // Common UK category suggestions
  const suggestions = {
    income: [
      'Salary', 'Freelance', 'Benefits', 'Investment Income', 
      'Rental Income', 'Pension', 'Bonus', 'Dividends'
    ],
    expense: [
      'Rent/Mortgage', 'Council Tax', 'Groceries', 'Transport',
      'Utilities', 'Insurance', 'Entertainment', 'Eating Out',
      'Shopping', 'Health & Fitness', 'Subscriptions', 'Petrol'
    ]
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        component: 'form',
        onSubmit: handleSubmit,
      }}
    >
      <DialogTitle>
        {isEdit ? 'Edit Category' : 'Add New Category'}
      </DialogTitle>
      
      <DialogContent>
        {generalError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {generalError}
          </Alert>
        )}
        
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Category Type Selection */}
          <Grid item xs={12}>
            <FormControl component="fieldset" disabled={isEdit}>
              <FormLabel component="legend">Category Type</FormLabel>
              <RadioGroup
                row
                name="category_type"
                value={formData.category_type}
                onChange={handleChange}
              >
                <FormControlLabel 
                  value="income" 
                  control={<Radio color="success" />} 
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <TrendingUp />
                      Income
                    </Box>
                  }
                />
                <FormControlLabel 
                  value="expense" 
                  control={<Radio color="error" />} 
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <TrendingDown />
                      Expense
                    </Box>
                  }
                />
              </RadioGroup>
              {isEdit && (
                <FormHelperText>
                  Category type cannot be changed after creation
                </FormHelperText>
              )}
            </FormControl>
          </Grid>
          
          {/* Category Name */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Category Name"
              name="category_name"
              value={formData.category_name}
              onChange={handleChange}
              error={!!errors.category_name}
              helperText={errors.category_name || 'Enter a descriptive name for this category'}
              required
              disabled={loading}
              inputProps={{ maxLength: 50 }}
            />
          </Grid>
          
          {/* Suggestions */}
          {!isEdit && (
            <Grid item xs={12}>
              <Box>
                <FormHelperText>
                  Common {formData.category_type} categories:
                </FormHelperText>
                <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                  {suggestions[formData.category_type].map(suggestion => (
                    <Chip
                      key={suggestion}
                      label={suggestion}
                      size="small"
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        category_name: suggestion 
                      }))}
                      variant="outlined"
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Box>
              </Box>
            </Grid>
          )}
          
          {/* Info about default categories */}
          {isEdit && category?.is_default && (
            <Grid item xs={12}>
              <Alert severity="info" variant="outlined">
                This is a default system category. You can rename it, but it cannot be deleted.
              </Alert>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="contained" 
          disabled={loading}
        >
          {loading ? 'Saving...' : (isEdit ? 'Update' : 'Add')} Category
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CategoryFormDialog;