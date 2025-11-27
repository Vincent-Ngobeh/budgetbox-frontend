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
  useTheme,
  useMediaQuery,
  CardActions,
  Collapse,
  Divider,
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
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import accountService from '../services/accountService';
import { formatCurrency, formatAccountType } from '../utils/formatters';
import AccountFormDialog from '../components/accounts/AccountFormDialog';
import ConfirmDialog from '../components/common/ConfirmDialog';

const Accounts = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accountToDelete, setAccountToDelete] = useState(null);
  
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('active');
  
  const [expandedCards, setExpandedCards] = useState({});

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await accountService.getAccounts();
      
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
        await accountService.updateAccount(selectedAccount.bank_account_id, formData);
        setSuccessMessage('Account updated successfully');
      } else {
        await accountService.createAccount(formData);
        setSuccessMessage('Account created successfully');
      }
      
      setFormDialogOpen(false);
      fetchAccounts();
    } catch (err) {
      throw err;
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

  const toggleCardExpansion = (accountId) => {
    setExpandedCards(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  const filteredAccounts = accounts.filter(account => {
    if (filterType !== 'all' && account.account_type !== filterType) return false;
    if (filterStatus === 'active' && !account.is_active) return false;
    if (filterStatus === 'inactive' && account.is_active) return false;
    return true;
  });

  const accountTotals = filteredAccounts.reduce((acc, account) => {
    const type = account.account_type;
    if (!acc[type]) {
      acc[type] = { count: 0, total: 0 };
    }
    acc[type].count += 1;
    acc[type].total += parseFloat(account.current_balance || 0);
    return acc;
  }, {});

  const MobileAccountCard = ({ account }) => {
    const isExpanded = expandedCards[account.bank_account_id];
    
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
            <Box>
              <Typography variant="h6" component="div">
                {account.account_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {account.bank_name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                {account.account_number_masked}
              </Typography>
            </Box>
            <Box textAlign="right">
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 'bold',
                  color: account.current_balance >= 0 ? 'success.main' : 'error.main',
                  mb: 0.5
                }}
              >
                {formatCurrency(account.current_balance)}
              </Typography>
              <Chip
                label={formatAccountType(account.account_type)}
                size="small"
                color={account.account_type === 'credit' ? 'error' : 'primary'}
                variant="outlined"
              />
            </Box>
          </Box>
          
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Chip
              icon={account.is_active ? <CheckCircle /> : <Block />}
              label={account.is_active ? 'Active' : 'Inactive'}
              size="small"
              color={account.is_active ? 'success' : 'default'}
              variant="outlined"
            />
            <IconButton 
              size="small" 
              onClick={() => toggleCardExpansion(account.bank_account_id)}
            >
              {isExpanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
        </CardContent>
        
        <Collapse in={isExpanded}>
          <Divider />
          <CardActions sx={{ justifyContent: 'flex-end' }}>
            <Button 
              size="small" 
              startIcon={<EditIcon />}
              onClick={() => handleEditAccount(account)}
              disabled={!account.is_active}
            >
              Edit
            </Button>
            {account.is_active && account.current_balance === 0 && (
              <Button 
                size="small" 
                color="warning"
                startIcon={<Block />}
                onClick={() => handleDeactivate(account)}
              >
                Deactivate
              </Button>
            )}
            <Button 
              size="small" 
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => handleDeleteClick(account)}
              disabled={account.transaction_count > 0}
            >
              Delete
            </Button>
          </CardActions>
        </Collapse>
      </Card>
    );
  };

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

  const SummaryCard = ({ type, data, icon, color }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
        <Box display="flex" alignItems="center" mb={1}>
          {!isMobile && (
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
          )}
          <Box flexGrow={1}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
              {formatAccountType(type)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {data.count} {data.count === 1 ? 'account' : 'accounts'}
            </Typography>
          </Box>
        </Box>
        <Typography variant={isMobile ? "h6" : "h5"} fontWeight="bold" color={color + '.main'}>
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
    <Container maxWidth="lg" sx={{ mt: isMobile ? 2 : 4, mb: 4, px: isMobile ? 1 : 3 }}>
      {/* Page Header */}
      <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems={isMobile ? 'stretch' : 'center'} mb={3} gap={2}>
        <Typography variant={isMobile ? "h5" : "h4"} component="h1">
          Bank Accounts
        </Typography>
        <Box display="flex" gap={isMobile ? 1 : 2} flexDirection={isMobile ? 'column' : 'row'}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchAccounts}
            fullWidth={isMobile}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddAccount}
            fullWidth={isMobile}
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
      <Grid container spacing={isMobile ? 1 : 3} sx={{ mb: 3 }}>
        {accountTotals.current && (
          <Grid item xs={6} sm={6} md={3}>
            <SummaryCard
              type="current"
              data={accountTotals.current}
              icon={<AccountBalance />}
              color="primary"
            />
          </Grid>
        )}
        {accountTotals.savings && (
          <Grid item xs={6} sm={6} md={3}>
            <SummaryCard
              type="savings"
              data={accountTotals.savings}
              icon={<Savings />}
              color="success"
            />
          </Grid>
        )}
        {accountTotals.credit && (
          <Grid item xs={6} sm={6} md={3}>
            <SummaryCard
              type="credit"
              data={accountTotals.credit}
              icon={<CreditCard />}
              color="error"
            />
          </Grid>
        )}
        {accountTotals.isa && (
          <Grid item xs={6} sm={6} md={3}>
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
      <Paper sx={{ p: isMobile ? 1 : 2, mb: 3 }}>
        <Grid container spacing={isMobile ? 1 : 2} alignItems="center">
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

      {/* Accounts Display - Cards on mobile, DataGrid on desktop */}
      {isMobile ? (
        <Box>
          {filteredAccounts.map(account => (
            <MobileAccountCard 
              key={account.bank_account_id} 
              account={account}
            />
          ))}
        </Box>
      ) : (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <Box sx={{ height: 400, width: '100%' }}>
            <DataGrid
              rows={filteredAccounts}
              columns={columns}
              getRowId={(row) => row.bank_account_id}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 },
                },
              }}
              pageSizeOptions={[5, 10, 20]}
              disableRowSelectionOnClick
              sx={{
                '& .MuiDataGrid-cell:hover': {
                  color: 'primary.main',
                },
                border: 'none',
              }}
            />
          </Box>
        </Paper>
      )}

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