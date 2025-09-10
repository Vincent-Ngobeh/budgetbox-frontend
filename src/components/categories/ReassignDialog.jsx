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
import {
  MergeType,
  Warning,
} from '@mui/icons-material';

const ReassignDialog = ({ 
  open, 
  onClose, 
  onSubmit, 
  sourceCategory,
  categories 
}) => {
  const [targetCategoryId, setTargetCategoryId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!targetCategoryId) {
      setError('Please select a target category');
      return;
    }
    
    onSubmit(targetCategoryId);
    setTargetCategoryId('');
    setError('');
  };

  const handleClose = () => {
    setTargetCategoryId('');
    setError('');
    onClose();
  };

  if (!sourceCategory) return null;

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
        <Box display="flex" alignItems="center" gap={1}>
          <MergeType />
          Reassign Transactions
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="warning" icon={<Warning />} sx={{ mb: 2 }}>
          <Typography variant="body2">
            The category <strong>"{sourceCategory.category_name}"</strong> has{' '}
            <strong>{sourceCategory.transaction_count}</strong> transaction
            {sourceCategory.transaction_count !== 1 ? 's' : ''}.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            To delete this category, you must first reassign all its transactions to another category.
            After reassignment, this category will be deactivated.
          </Typography>
        </Alert>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <TextField
          select
          fullWidth
          label="Select Target Category"
          value={targetCategoryId}
          onChange={(e) => {
            setTargetCategoryId(e.target.value);
            setError('');
          }}
          helperText={`Choose a ${sourceCategory.category_type} category to move all transactions to`}
          required
          sx={{ mt: 2 }}
        >
          <MenuItem value="" disabled>
            Choose a category...
          </MenuItem>
          {categories.length === 0 ? (
            <MenuItem disabled>
              No other {sourceCategory.category_type} categories available
            </MenuItem>
          ) : (
            categories.map((category) => (
              <MenuItem key={category.category_id} value={category.category_id}>
                <Box display="flex" justifyContent="space-between" width="100%">
                  <span>{category.category_name}</span>
                  <Typography variant="caption" color="text.secondary">
                    {category.transaction_count || 0} transactions
                  </Typography>
                </Box>
              </MenuItem>
            ))
          )}
        </TextField>
        
        <Box mt={3} p={2} bgcolor="grey.100" borderRadius={1}>
          <Typography variant="subtitle2" gutterBottom>
            What will happen:
          </Typography>
          <Typography variant="body2" color="text.secondary" component="ul" sx={{ m: 0, pl: 2 }}>
            <li>All {sourceCategory.transaction_count} transactions will be moved to the selected category</li>
            <li>"{sourceCategory.category_name}" will be deactivated (not deleted)</li>
            <li>You can reactivate it later if needed (with 0 transactions)</li>
            <li>This action cannot be undone automatically</li>
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
          color="warning"
          startIcon={<MergeType />}
          disabled={!targetCategoryId || categories.length === 0}
        >
          Reassign & Deactivate
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReassignDialog;