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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccountBalance,
  CreditCard,
  Savings,
  Block,
  CheckCircle,
  Refresh,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import accountService from '../services/accountService';
import { formatCurrency, formatDate, formatAccountType } from '../utils/formatters';
import AccountFormDialog from '../components/accounts/AccountFormDialog';
import ConfirmDialog from '../components/common/ConfirmDialog';

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accountToDelete, setAccountToDelete] = useState(null);
  
  // Filter states
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('active');

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await accountService.getAccounts();
      
      // Transform the data for DataGrid
      const transformedAccounts = response.results ? response.results : response;
      setAccounts(Array.isArray(transformedAccounts) ? transformedAccounts : []);
    } catch (err) {
      console.error('Error fetching accounts:', err);
      setError('Failed to load accounts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = () => {
    setSelectedAccount(null);
    setFormDialogOpen(true);
  };

  const handleEditAccount = (account) => {
    setSelectedAccount(account);
    setFormDialogOpen(true);
  };

  const handleDeleteClick = (account) => {
    setAccountToDelete(account);
    setConfirmDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!accountToDelete) return;

    try {
      await accountService.deleteAccount(accountToDelete.bank_account_id);
      setSuccessMessage('Account deleted successfully');
      fetchAccounts();
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to delete account. It may have existing transactions.');
      }
    } finally {
      setConfirmDialogOpen(false);
      setAccountToDelete(null);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedAccount) {
        // Update existing account
        await accountService.updateAccount(selectedAccount.bank_account_id, formData);
        setSuccessMessage('Account updated successfully');
      } else {
        // Create new account
        await accountService.createAccount(formData);
        setSuccessMessage('Account created successfully');
      }
      
      setFormDialogOpen(false);
      fetchAccounts();
    } catch (err) {
      throw err; // Let the form dialog handle the error
    }
  };

  const handleDeactivate = async (account) => {
    try {
      await accountService.deactivateAccount(account.bank_account_id);
      setSuccessMessage(`${account.account_name} has been deactivated`);
      fetchAccounts();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to deactivate account');
    }
  };

  // Filter accounts based on selected filters
  const filteredAccounts = accounts.filter(account => {
    if (filterType !== 'all' && account.account_type !== filterType) return false;
    if (filterStatus === 'active' && !account.is_active) return false;
    if (filterStatus === 'inactive' && account.is_active) return false;
    return true;
  });

  // Calculate totals by account type
  const accountTotals = filteredAccounts.reduce((acc, account) => {
    const type = account.account_type;
    if (!acc[type]) {
      acc[type] = { count: 0, total: 0 };
    }
    acc[type].count += 1;
    acc[type].total += parseFloat(account.current_balance || 0);
    return acc;
  }, {});

  // DataGrid columns
  const columns = [
    {
      field: 'account_name',
      headerName: 'Account Name',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'bank_name',
      headerName: 'Bank',
      flex: 1,
      minWidth: 120,
    },
    {
      field: 'account_type',
      headerName: 'Type',
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={formatAccountType(params.value)}
          size="small"
          color={params.value === 'credit' ? 'error' : 'primary'}
          variant="outlined"
        />
      ),
    },
    {
      field: 'account_number_masked',
      headerName: 'Account Number',
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'current_balance',
      headerName: 'Balance',
      width: 150,
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 'bold',
            color: params.value >= 0 ? 'success.main' : 'error.main' 
          }}
        >
          {formatCurrency(params.value)}
        </Typography>
      ),
    },
    {
      field: 'is_active',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Chip
          icon={params.value ? <CheckCircle /> : <Block />}
          label={params.value ? 'Active' : 'Inactive'}
          size="small"
          color={params.value ? 'success' : 'default'}
          variant="outlined"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => handleEditAccount(params.row)}
              disabled={!params.row.is_active}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {params.row.is_active && params.row.current_balance === 0 && (
            <Tooltip title="Deactivate">
              <IconButton
                size="small"
                onClick={() => handleDeactivate(params.row)}
                color="warning"
              >
                <Block fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title={params.row.transaction_count > 0 ? "Cannot delete account with transactions" : "Delete"}>
            <span>
              <IconButton
                size="small"
                onClick={() => handleDeleteClick(params.row)}
                color="error"
                disabled={params.row.transaction_count > 0}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // Summary cards for account types
  const SummaryCard = ({ type, data, icon, color }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={1}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 1,
              bgcolor: `${color}.lighter`,
              color: `${color}.main`,
              mr: 2,
            }}
          >
            {icon}
          </Box>
          <Box flexGrow={1}>
            <Typography variant="body2" color="text.secondary">
              {formatAccountType(type)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {data.count} {data.count === 1 ? 'account' : 'accounts'}
            </Typography>
          </Box>
        </Box>
        <Typography variant="h5" fontWeight="bold" color={color + '.main'}>
          {formatCurrency(data.total)}
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Page Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Bank Accounts
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchAccounts}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddAccount}
          >
            Add Account
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

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {accountTotals.current && (
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard
              type="current"
              data={accountTotals.current}
              icon={<AccountBalance />}
              color="primary"
            />
          </Grid>
        )}
        {accountTotals.savings && (
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard
              type="savings"
              data={accountTotals.savings}
              icon={<Savings />}
              color="success"
            />
          </Grid>
        )}
        {accountTotals.credit && (
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard
              type="credit"
              data={accountTotals.credit}
              icon={<CreditCard />}
              color="error"
            />
          </Grid>
        )}
        {accountTotals.isa && (
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard
              type="isa"
              data={accountTotals.isa}
              icon={<Savings />}
              color="info"
            />
          </Grid>
        )}
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4} md={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Account Type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="current">Current</MenuItem>
              <MenuItem value="savings">Savings</MenuItem>
              <MenuItem value="credit">Credit</MenuItem>
              <MenuItem value="isa">ISA</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Accounts Table */}
      <Paper sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={filteredAccounts}
          columns={columns}
          getRowId={(row) => row.bank_account_id}
          pageSize={10}
          rowsPerPageOptions={[5, 10, 20]}
          disableSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell:hover': {
              color: 'primary.main',
            },
          }}
        />
      </Paper>

      {/* Form Dialog */}
      <AccountFormDialog
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        onSubmit={handleFormSubmit}
        account={selectedAccount}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Account"
        message={`Are you sure you want to delete "${accountToDelete?.account_name}"? This action cannot be undone.`}
      />
    </Container>
  );
};

export default Accounts;