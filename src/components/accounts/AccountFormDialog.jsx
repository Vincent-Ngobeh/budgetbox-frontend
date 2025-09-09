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
} from '@mui/material';
import { formatCurrency } from '../../utils/formatters';

const AccountFormDialog = ({ open, onClose, onSubmit, account }) => {
  const isEdit = !!account;
  
  const [formData, setFormData] = useState({
    account_name: '',
    bank_name: '',
    account_type: 'current',
    account_number_masked: '',
    currency: 'GBP',
    current_balance: '',
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  // UK banks for suggestions
  const ukBanks = [
    'Barclays',
    'HSBC',
    'Lloyds Banking Group',
    'NatWest',
    'Santander UK',
    'TSB Bank',
    'Nationwide',
    'Metro Bank',
    'Monzo',
    'Starling Bank',
    'Revolut',
    'Halifax',
    'Bank of Scotland',
    'Royal Bank of Scotland',
    'Virgin Money',
    'Co-operative Bank',
    'First Direct',
  ];

  useEffect(() => {
    if (account) {
      // Populate form with existing account data
      setFormData({
        account_name: account.account_name || '',
        bank_name: account.bank_name || '',
        account_type: account.account_type || 'current',
        account_number_masked: account.account_number_masked || '',
        currency: account.currency || 'GBP',
        current_balance: account.current_balance || '',
      });
    } else {
      // Reset form for new account
      setFormData({
        account_name: '',
        bank_name: '',
        account_type: 'current',
        account_number_masked: '',
        currency: 'GBP',
        current_balance: '',
      });
    }
    setErrors({});
    setGeneralError('');
  }, [account, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for masked account number
    if (name === 'account_number_masked') {
      // Only allow format ****XXXX where X is a digit
      if (value.length <= 8) {
        if (value.length <= 4) {
          setFormData(prev => ({ ...prev, [name]: '*'.repeat(value.length) }));
        } else {
          const lastFour = value.slice(4).replace(/\D/g, ''); // Remove non-digits
          setFormData(prev => ({ ...prev, [name]: '****' + lastFour }));
        }
      }
    } else if (name === 'current_balance') {
      // Allow negative for credit accounts, decimals for all
      const cleaned = value.replace(/[^0-9.-]/g, '');
      setFormData(prev => ({ ...prev, [name]: cleaned }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Account name validation
    if (!formData.account_name.trim()) {
      newErrors.account_name = 'Account name is required';
    } else if (formData.account_name.trim().length < 2) {
      newErrors.account_name = 'Account name must be at least 2 characters';
    }
    
    // Bank name validation
    if (!formData.bank_name.trim()) {
      newErrors.bank_name = 'Bank name is required';
    } else if (formData.bank_name.trim().length < 2) {
      newErrors.bank_name = 'Bank name must be at least 2 characters';
    }
    
    // Account number validation
    if (!formData.account_number_masked) {
      newErrors.account_number_masked = 'Account number is required';
    } else if (formData.account_number_masked.length !== 8) {
      newErrors.account_number_masked = 'Must be 8 characters (****XXXX)';
    } else if (!formData.account_number_masked.startsWith('****')) {
      newErrors.account_number_masked = 'Must start with ****';
    } else if (!/^\*{4}\d{4}$/.test(formData.account_number_masked)) {
      newErrors.account_number_masked = 'Last 4 characters must be digits';
    }
    
    // Balance validation
    if (formData.current_balance === '') {
      newErrors.current_balance = 'Current balance is required';
    } else {
      const balance = parseFloat(formData.current_balance);
      if (isNaN(balance)) {
        newErrors.current_balance = 'Must be a valid number';
      } else if (formData.account_type !== 'credit' && balance < 0) {
        newErrors.current_balance = 'Only credit accounts can have negative balance';
      } else if (formData.account_type === 'credit' && balance > 0) {
        newErrors.current_balance = 'Credit accounts should have zero or negative balance';
      } else if (balance < -10000) {
        newErrors.current_balance = 'Overdraft limit cannot exceed £10,000';
      } else if (balance > 9999999.99) {
        newErrors.current_balance = 'Balance exceeds maximum allowed value';
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
      const submitData = {
        ...formData,
        account_name: formData.account_name.trim(),
        bank_name: formData.bank_name.trim(),
        current_balance: parseFloat(formData.current_balance),
      };
      
      await onSubmit(submitData);
      onClose();
    } catch (err) {
      console.error('Form submission error:', err);
      if (err.response?.data) {
        // Handle field-specific errors from backend
        if (typeof err.response.data === 'object') {
          const backendErrors = {};
          Object.keys(err.response.data).forEach(key => {
            if (Array.isArray(err.response.data[key])) {
              backendErrors[key] = err.response.data[key][0];
            } else {
              backendErrors[key] = err.response.data[key];
            }
          });
          setErrors(backendErrors);
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
        {isEdit ? 'Edit Account' : 'Add New Account'}
      </DialogTitle>
      
      <DialogContent>
        {generalError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {generalError}
          </Alert>
        )}
        
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Account Name"
              name="account_name"
              value={formData.account_name}
              onChange={handleChange}
              error={!!errors.account_name}
              helperText={errors.account_name || 'e.g., Main Current Account'}
              required
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              label="Bank Name"
              name="bank_name"
              value={formData.bank_name}
              onChange={handleChange}
              error={!!errors.bank_name}
              helperText={errors.bank_name || 'Select or type your bank name'}
              required
              disabled={loading}
              freeSolo
            >
              {ukBanks.map((bank) => (
                <MenuItem key={bank} value={bank}>
                  {bank}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Account Type"
              name="account_type"
              value={formData.account_type}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <MenuItem value="current">Current Account</MenuItem>
              <MenuItem value="savings">Savings Account</MenuItem>
              <MenuItem value="isa">ISA</MenuItem>
              <MenuItem value="credit">Credit Card</MenuItem>
            </TextField>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Account Number"
              name="account_number_masked"
              value={formData.account_number_masked}
              onChange={handleChange}
              error={!!errors.account_number_masked}
              helperText={errors.account_number_masked || 'Format: ****1234'}
              placeholder="****1234"
              required
              disabled={loading}
              inputProps={{ maxLength: 8 }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <MenuItem value="GBP">GBP (£)</MenuItem>
              <MenuItem value="USD">USD ($)</MenuItem>
              <MenuItem value="EUR">EUR (€)</MenuItem>
            </TextField>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Current Balance"
              name="current_balance"
              value={formData.current_balance}
              onChange={handleChange}
              error={!!errors.current_balance}
              helperText={errors.current_balance || (
                formData.account_type === 'credit' 
                  ? 'Enter negative for debt (e.g., -500.00)' 
                  : 'Enter current balance'
              )}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {formData.currency === 'GBP' ? '£' : formData.currency === 'USD' ? '$' : '€'}
                  </InputAdornment>
                ),
              }}
              required
              disabled={loading}
              type="text"
              placeholder="0.00"
            />
          </Grid>
          
          {formData.account_type === 'credit' && (
            <Grid item xs={12}>
              <FormHelperText>
                For credit cards, enter your outstanding balance as a negative number. 
                For example, if you owe £500, enter -500.00
              </FormHelperText>
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
          {loading ? 'Saving...' : (isEdit ? 'Update' : 'Add')} Account
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AccountFormDialog;