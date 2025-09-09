import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Alert,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import { Category as CategoryIcon } from '@mui/icons-material';

const BulkCategorizeDialog = ({ 
  open, 
  onClose, 
  onSubmit, 
  categories, 
  transactionCount 
}) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedCategory) {
      setError('Please select a category');
      return;
    }
    
    onSubmit(selectedCategory);
    setSelectedCategory('');
    setError('');
  };

  const handleClose = () => {
    setSelectedCategory('');
    setError('');
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        component: 'form',
        onSubmit: handleSubmit,
      }}
    >
      <DialogTitle>
        Bulk Categorize Transactions
      </DialogTitle>
      
      <DialogContent>
        <Box mb={2}>
          <Alert severity="info" variant="outlined">
            You are about to categorize <strong>{transactionCount}</strong> selected transaction{transactionCount !== 1 ? 's' : ''}.
            This action will update the category for all selected transactions.
          </Alert>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <TextField
          select
          fullWidth
          label="Select Category"
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setError('');
          }}
          helperText="Choose the category to apply to all selected transactions"
          required
        >
          <MenuItem value="" disabled>
            Choose a category...
          </MenuItem>
          
          <MenuItem disabled>
            <Typography variant="caption" color="text.secondary">
              INCOME CATEGORIES
            </Typography>
          </MenuItem>
          {categories
            .filter(c => c.category_type === 'income')
            .map((category) => (
              <MenuItem key={category.category_id} value={category.category_id}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip 
                    label="Income" 
                    size="small" 
                    color="success" 
                    variant="outlined"
                  />
                  {category.category_name}
                </Box>
              </MenuItem>
            ))
          }
          
          <MenuItem disabled>
            <Typography variant="caption" color="text.secondary">
              EXPENSE CATEGORIES
            </Typography>
          </MenuItem>
          {categories
            .filter(c => c.category_type === 'expense')
            .map((category) => (
              <MenuItem key={category.category_id} value={category.category_id}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip 
                    label="Expense" 
                    size="small" 
                    color="error" 
                    variant="outlined"
                  />
                  {category.category_name}
                </Box>
              </MenuItem>
            ))
          }
        </TextField>
        
        <Box mt={2}>
          <Typography variant="caption" color="text.secondary">
            <strong>Note:</strong> Transactions can only be categorized with matching category types. 
            Income transactions need income categories, expense transactions need expense categories.
            Transfer transactions can use any category.
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="contained"
          startIcon={<CategoryIcon />}
          disabled={!selectedCategory}
        >
          Apply Category
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkCategorizeDialog;