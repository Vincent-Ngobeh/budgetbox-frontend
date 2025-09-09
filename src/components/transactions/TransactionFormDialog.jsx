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
  FormControlLabel,
  Switch,
  Typography,
  Box,
  Chip,
  FormHelperText,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  SwapHoriz,
  Warning,
} from '@mui/icons-material';
import { formatCurrency, formatDateForAPI } from '../../utils/formatters';

const TransactionFormDialog = ({ 
  open, 
  onClose, 
  onSubmit, 
  transaction, 
  accounts, 
  categories 
}) => {
  const isEdit = !!transaction;
  
  const [formData, setFormData] = useState({
    bank_account: '',
    category: '',
    transaction_description: '',
    transaction_type: 'expense',
    transaction_amount: '',
    transaction_date: formatDateForAPI(new Date()),
    transaction_note: '',
    reference_number: '',
    is_recurring: false,
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [warningMessage, setWarningMessage] = useState('');
  
  // Available categories based on transaction type
  const [availableCategories, setAvailableCategories] = useState([]);
  
  // Selected account details for validation
  const [selectedAccount, setSelectedAccount] = useState(null);

  useEffect(() => {
    if (transaction) {
      // Populate form with existing transaction data
      // Convert amount to positive for display
      const displayAmount = Math.abs(transaction.transaction_amount);
      
      setFormData({
        bank_account: transaction.bank_account || '',
        category: transaction.category || '',
        transaction_description: transaction.transaction_description || '',
        transaction_type: transaction.transaction_type || 'expense',
        transaction_amount: displayAmount.toString(),
        transaction_date: transaction.transaction_date || formatDateForAPI(new Date()),
        transaction_note: transaction.transaction_note || '',
        reference_number: transaction.reference_number || '',
        is_recurring: transaction.is_recurring || false,
      });
    } else {
      // Reset form for new transaction
      setFormData({
        bank_account: '',
        category: '',
        transaction_description: '',
        transaction_type: 'expense',
        transaction_amount: '',
        transaction_date: formatDateForAPI(new Date()),
        transaction_note: '',
        reference_number: '',
        is_recurring: false,
      });
    }
    setErrors({});
    setGeneralError('');
    setWarningMessage('');
  }, [transaction, open]);

  // Update available categories when transaction type changes
  useEffect(() => {
    if (formData.transaction_type === 'transfer') {
      // For transfers, show all categories or a special transfer category
      setAvailableCategories(categories);
    } else {
      // Filter categories by type
      setAvailableCategories(
        categories.filter(c => c.category_type === formData.transaction_type)
      );
    }
    
    // Clear category selection if it's no longer valid
    if (formData.category) {
      const categoryStillValid = categories.find(
        c => c.category_id === formData.category &&
        (formData.transaction_type === 'transfer' || c.category_type === formData.transaction_type)
      );
      if (!categoryStillValid) {
        setFormData(prev => ({ ...prev, category: '' }));
      }
    }
  }, [formData.transaction_type, categories]);

  // Update selected account for balance validation
  useEffect(() => {
    if (formData.bank_account) {
      const account = accounts.find(a => a.bank_account_id === formData.bank_account);
      setSelectedAccount(account);
      
      // Check for insufficient funds warning
      if (account && formData.transaction_amount && formData.transaction_type === 'expense') {
        const amount = parseFloat(formData.transaction_amount);
        if (!isNaN(amount) && account.account_type !== 'credit') {
          const newBalance = parseFloat(account.current_balance) - amount;
          if (newBalance < 0) {
            setWarningMessage(
              `Warning: This transaction will result in a negative balance of ${formatCurrency(newBalance)}. ` +
              `Current balance: ${formatCurrency(account.current_balance)}`
            );
          } else if (newBalance < 100) {
            setWarningMessage(
              `Note: This will leave a low balance of ${formatCurrency(newBalance)}`
            );
          } else {
            setWarningMessage('');
          }
        }
      } else {
        setWarningMessage('');
      }
    }
  }, [formData.bank_account, formData.transaction_amount, formData.transaction_type, accounts]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear general error when user makes changes
    if (generalError) {
      setGeneralError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required field validations
    if (!formData.bank_account) {
      newErrors.bank_account = 'Account is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.transaction_description.trim()) {
      newErrors.transaction_description = 'Description is required';
    } else if (formData.transaction_description.trim().length < 2) {
      newErrors.transaction_description = 'Description must be at least 2 characters';
    } else if (formData.transaction_description.length > 255) {
      newErrors.transaction_description = 'Description cannot exceed 255 characters';
    }
    
    // Amount validation
    if (!formData.transaction_amount) {
      newErrors.transaction_amount = 'Amount is required';
    } else {
      const amount = parseFloat(formData.transaction_amount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.transaction_amount = 'Amount must be a positive number';
      } else if (amount > 999999.99) {
        newErrors.transaction_amount = 'Amount exceeds maximum allowed value';
      }
    }
    
    // Date validation
    if (!formData.transaction_date) {
      newErrors.transaction_date = 'Date is required';
    } else {
      const transDate = new Date(formData.transaction_date);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const twoYearsAgo = new Date(today);
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
      
      if (transDate > tomorrow) {
        newErrors.transaction_date = 'Date cannot be more than one day in the future';
      } else if (transDate < twoYearsAgo) {
        newErrors.transaction_date = 'Date cannot be more than 2 years in the past';
      }
    }
    
    // Reference number validation (optional field)
    if (formData.reference_number && formData.reference_number.length > 100) {
      newErrors.reference_number = 'Reference number cannot exceed 100 characters';
    }
    
    // Note validation (optional field)
    if (formData.transaction_note && formData.transaction_note.length > 500) {
      newErrors.transaction_note = 'Note cannot exceed 500 characters';
    }
    
    // Business rule: Check for insufficient funds (non-credit accounts)
    if (selectedAccount && formData.transaction_type === 'expense' && formData.transaction_amount) {
      const amount = parseFloat(formData.transaction_amount);
      if (!isNaN(amount) && selectedAccount.account_type !== 'credit') {
        const newBalance = parseFloat(selectedAccount.current_balance) - amount;
        if (newBalance < 0) {
          newErrors.transaction_amount = 'Insufficient funds. This would result in a negative balance.';
        }
      }
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
      // Prepare data for API
      // Backend expects negative amounts for expenses, positive for income
      let amount = parseFloat(formData.transaction_amount);
      if (formData.transaction_type === 'expense') {
        amount = -Math.abs(amount);
      } else if (formData.transaction_type === 'income') {
        amount = Math.abs(amount);
      }
      // For transfers, keep the amount as entered (positive or negative based on direction)
      
      const submitData = {
        bank_account: formData.bank_account,
        category: formData.category,
        transaction_description: formData.transaction_description.trim(),
        transaction_type: formData.transaction_type,
        transaction_amount: amount,
        transaction_date: formData.transaction_date,
        transaction_note: formData.transaction_note.trim() || null,
        reference_number: formData.reference_number.trim() || null,
        is_recurring: formData.is_recurring,
      };
      
      await onSubmit(submitData);
      onClose();
    } catch (err) {
      console.error('Form submission error:', err);
      if (err.response?.data) {
        // Handle field-specific errors from backend
        if (typeof err.response.data === 'object') {
          const backendErrors = {};
          let hasFieldErrors = false;
          
          Object.keys(err.response.data).forEach(key => {
            if (key === 'error' || key === 'detail') {
              setGeneralError(err.response.data[key]);
            } else {
              hasFieldErrors = true;
              if (Array.isArray(err.response.data[key])) {
                backendErrors[key] = err.response.data[key][0];
              } else {
                backendErrors[key] = err.response.data[key];
              }
            }
          });
          
          if (hasFieldErrors) {
            setErrors(backendErrors);
          }
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

  const getTypeIcon = (type) => {
    switch(type) {
      case 'income':
        return <TrendingUp />;
      case 'expense':
        return <TrendingDown />;
      case 'transfer':
        return <SwapHoriz />;
      default:
        return null;
    }
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
        {isEdit ? 'Edit Transaction' : 'Add New Transaction'}
      </DialogTitle>
      
      <DialogContent>
        {generalError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {generalError}
          </Alert>
        )}
        
        {warningMessage && (
          <Alert severity="warning" sx={{ mb: 2 }} icon={<Warning />}>
            {warningMessage}
          </Alert>
        )}
        
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Transaction Type Selection */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Transaction Type
            </Typography>
            <Box display="flex" gap={1}>
              {['income', 'expense', 'transfer'].map((type) => (
                <Chip
                  key={type}
                  label={type.charAt(0).toUpperCase() + type.slice(1)}
                  icon={getTypeIcon(type)}
                  onClick={() => handleChange({ 
                    target: { name: 'transaction_type', value: type } 
                  })}
                  color={formData.transaction_type === type ? 
                    (type === 'income' ? 'success' : type === 'expense' ? 'error' : 'info') : 
                    'default'
                  }
                  variant={formData.transaction_type === type ? 'filled' : 'outlined'}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Box>
          </Grid>
          
          {/* Description */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="transaction_description"
              value={formData.transaction_description}
              onChange={handleChange}
              error={!!errors.transaction_description}
              helperText={errors.transaction_description || 'What is this transaction for?'}
              required
              disabled={loading}
              inputProps={{ maxLength: 255 }}
            />
          </Grid>
          
          {/* Amount and Date */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Amount"
              name="transaction_amount"
              value={formData.transaction_amount}
              onChange={handleChange}
              error={!!errors.transaction_amount}
              helperText={errors.transaction_amount || 'Enter positive amount'}
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
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Date"
              name="transaction_date"
              type="date"
              value={formData.transaction_date}
              onChange={handleChange}
              error={!!errors.transaction_date}
              helperText={errors.transaction_date}
              InputLabelProps={{ shrink: true }}
              required
              disabled={loading}
            />
          </Grid>
          
          {/* Account and Category */}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Account"
              name="bank_account"
              value={formData.bank_account}
              onChange={handleChange}
              error={!!errors.bank_account}
              helperText={errors.bank_account || 'Select the account for this transaction'}
              required
              disabled={loading}
            >
              {accounts.map((account) => (
                <MenuItem key={account.bank_account_id} value={account.bank_account_id}>
                  <Box display="flex" justifyContent="space-between" width="100%">
                    <span>{account.account_name}</span>
                    <Typography variant="caption" color="text.secondary">
                      {formatCurrency(account.current_balance)}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              error={!!errors.category}
              helperText={errors.category || `Select a ${formData.transaction_type} category`}
              required
              disabled={loading || availableCategories.length === 0}
            >
              {availableCategories.length === 0 ? (
                <MenuItem disabled>
                  No {formData.transaction_type} categories available
                </MenuItem>
              ) : (
                availableCategories.map((category) => (
                  <MenuItem key={category.category_id} value={category.category_id}>
                    {category.category_name}
                  </MenuItem>
                ))
              )}
            </TextField>
          </Grid>
          
          {/* Reference Number */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Reference Number"
              name="reference_number"
              value={formData.reference_number}
              onChange={handleChange}
              error={!!errors.reference_number}
              helperText={errors.reference_number || 'Optional: Invoice, receipt, or reference number'}
              disabled={loading}
              inputProps={{ maxLength: 100 }}
            />
          </Grid>
          
          {/* Recurring Toggle */}
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_recurring}
                  onChange={handleChange}
                  name="is_recurring"
                  color="primary"
                  disabled={loading}
                />
              }
              label="Recurring Transaction"
            />
            <FormHelperText>
              Mark if this is a regular transaction (e.g., monthly bills)
            </FormHelperText>
          </Grid>
          
          {/* Notes */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Notes"
              name="transaction_note"
              value={formData.transaction_note}
              onChange={handleChange}
              error={!!errors.transaction_note}
              helperText={errors.transaction_note || 'Optional: Additional notes or details'}
              disabled={loading}
              inputProps={{ maxLength: 500 }}
            />
          </Grid>
          
          {/* Account Balance Info */}
          {selectedAccount && (
            <Grid item xs={12}>
              <Alert severity="info" variant="outlined">
                <Typography variant="body2">
                  <strong>{selectedAccount.account_name}</strong> current balance: {' '}
                  <strong>{formatCurrency(selectedAccount.current_balance)}</strong>
                  {formData.transaction_type === 'expense' && formData.transaction_amount && (
                    <>
                      {' → After transaction: '}
                      <strong>
                        {formatCurrency(
                          parseFloat(selectedAccount.current_balance) - 
                          parseFloat(formData.transaction_amount || 0)
                        )}
                      </strong>
                    </>
                  )}
                  {formData.transaction_type === 'income' && formData.transaction_amount && (
                    <>
                      {' → After transaction: '}
                      <strong>
                        {formatCurrency(
                          parseFloat(selectedAccount.current_balance) + 
                          parseFloat(formData.transaction_amount || 0)
                        )}
                      </strong>
                    </>
                  )}
                </Typography>
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
          disabled={loading || availableCategories.length === 0}
        >
          {loading ? 'Saving...' : (isEdit ? 'Update' : 'Add')} Transaction
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransactionFormDialog;