import React, { useState, useEffect, useCallback } from 'react';
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
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  TrendingUp,
  TrendingDown,
  SwapHoriz,
  FilterList,
  Clear,
  Download,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import enGB from 'date-fns/locale/en-GB';
import transactionService from '../services/transactionService';
import accountService from '../services/accountService';
import categoryService from '../services/categoryService';
import { formatCurrency, formatDate, formatDateForAPI, getDaysAgo } from '../utils/formatters';
import TransactionFormDialog from '../components/transactions/TransactionFormDialog';
import ConfirmDialog from '../components/common/ConfirmDialog';
import BulkCategorizeDialog from '../components/transactions/BulkCategorizeDialog';

const Transactions = () => {
  // Main data states
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Pagination states
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filter states
  const [filters, setFilters] = useState({
    bank_account: '',
    category: '',
    type: '',
    date_from: getDaysAgo(30), // Default to last 30 days
    date_to: '',
    min_amount: '',
    is_recurring: '',
    search: '',
  });
  
  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [bulkCategorizeOpen, setBulkCategorizeOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  
  // Fetch initial data
  useEffect(() => {
    fetchInitialData();
  }, []);
  
  // Fetch transactions when filters or pagination changes
  useEffect(() => {
    fetchTransactions();
  }, [filters, page, pageSize]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      // Fetch accounts and categories for dropdowns
      const [accountsRes, categoriesRes] = await Promise.all([
        accountService.getAccounts(),
        categoryService.getCategories(),
      ]);
      
      setAccounts(Array.isArray(accountsRes) ? accountsRes : accountsRes.results || []);
      setCategories(Array.isArray(categoriesRes) ? categoriesRes : categoriesRes.results || []);
    } catch (err) {
      console.error('Error fetching initial data:', err);
      setError('Failed to load initial data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query params, filtering out empty values
      const params = {
        page: page + 1, // API uses 1-based pagination
        page_size: pageSize,
      };
      
      // Add filters only if they have values
      Object.keys(filters).forEach(key => {
        if (filters[key] !== '' && filters[key] !== null) {
          if (key === 'search') {
            params.search = filters[key];
          } else {
            params[key] = filters[key];
          }
        }
      });
      
      // Fetch transactions and statistics in parallel
      const [transRes, statsRes] = await Promise.all([
        transactionService.getTransactions(params),
        transactionService.getStatistics({
          date_from: filters.date_from,
          date_to: filters.date_to,
        }),
      ]);
      
      // Handle paginated response
      if (transRes.results) {
        setTransactions(transRes.results);
        setTotalCount(transRes.count || 0);
      } else {
        setTransactions(Array.isArray(transRes) ? transRes : []);
        setTotalCount(transRes.length || 0);
      }
      
      setStatistics(statsRes);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setFilters({
      bank_account: '',
      category: '',
      type: '',
      date_from: getDaysAgo(30),
      date_to: '',
      min_amount: '',
      is_recurring: '',
      search: '',
    });
    setPage(0);
  };

  const handleAddTransaction = () => {
    setSelectedTransaction(null);
    setFormDialogOpen(true);
  };

  const handleEditTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setFormDialogOpen(true);
  };

  const handleDeleteClick = (transaction) => {
    setTransactionToDelete(transaction);
    setConfirmDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!transactionToDelete) return;

    try {
      await transactionService.deleteTransaction(transactionToDelete.transaction_id);
      setSuccessMessage('Transaction deleted successfully. Account balance updated.');
      fetchTransactions();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete transaction');
    } finally {
      setConfirmDialogOpen(false);
      setTransactionToDelete(null);
    }
  };

  const handleDuplicate = async (transaction) => {
    try {
      await transactionService.duplicateTransaction(
        transaction.transaction_id,
        formatDateForAPI(new Date())
      );
      setSuccessMessage('Transaction duplicated successfully');
      fetchTransactions();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to duplicate transaction');
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedTransaction) {
        await transactionService.updateTransaction(
          selectedTransaction.transaction_id,
          formData
        );
        setSuccessMessage('Transaction updated successfully');
      } else {
        await transactionService.createTransaction(formData);
        setSuccessMessage('Transaction created successfully');
      }
      
      setFormDialogOpen(false);
      fetchTransactions();
    } catch (err) {
      throw err; // Let the form dialog handle the error
    }
  };

  const handleBulkCategorize = () => {
    if (selectedTransactions.length === 0) {
      setError('Please select transactions to categorize');
      return;
    }
    setBulkCategorizeOpen(true);
  };

  const handleBulkCategorizeSubmit = async (categoryId) => {
    try {
      await transactionService.bulkCategorize(selectedTransactions, categoryId);
      setSuccessMessage(`${selectedTransactions.length} transactions categorized successfully`);
      setSelectedTransactions([]);
      setBulkCategorizeOpen(false);
      fetchTransactions();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to categorize transactions');
    }
  };

  const handleExport = () => {
    // Create CSV export of current view
    const csvContent = [
      ['Date', 'Description', 'Category', 'Account', 'Type', 'Amount'],
      ...transactions.map(t => [
        formatDate(t.transaction_date),
        t.transaction_description,
        t.category_name,
        t.account_name,
        t.transaction_type,
        t.transaction_amount,
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${formatDateForAPI(new Date())}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // DataGrid columns
  const columns = [
    {
      field: 'transaction_date',
      headerName: 'Date',
      width: 110,
      renderCell: (params) => formatDate(params.value),
    },
    {
      field: 'transaction_description',
      headerName: 'Description',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'category_name',
      headerName: 'Category',
      width: 130,
      renderCell: (params) => (
        <Chip 
          label={params.value}
          size="small"
          icon={<CategoryIcon />}
          variant="outlined"
        />
      ),
    },
    {
      field: 'account_name',
      headerName: 'Account',
      width: 150,
    },
    {
      field: 'transaction_type',
      headerName: 'Type',
      width: 100,
      renderCell: (params) => {
        const getTypeConfig = (type) => {
          switch(type) {
            case 'income':
              return { icon: <TrendingUp />, color: 'success' };
            case 'expense':
              return { icon: <TrendingDown />, color: 'error' };
            case 'transfer':
              return { icon: <SwapHoriz />, color: 'info' };
            default:
              return { icon: null, color: 'default' };
          }
        };
        const config = getTypeConfig(params.value);
        return (
          <Chip
            label={params.value}
            size="small"
            color={config.color}
            icon={config.icon}
            variant="outlined"
          />
        );
      },
    },
    {
      field: 'transaction_amount',
      headerName: 'Amount',
      width: 130,
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 'bold',
            color: params.value >= 0 ? 'success.main' : 'error.main' 
          }}
        >
          {params.value >= 0 ? '+' : ''}{formatCurrency(Math.abs(params.value))}
        </Typography>
      ),
    },
    {
      field: 'is_recurring',
      headerName: 'Recurring',
      width: 90,
      renderCell: (params) => params.value ? 
        <Chip label="Yes" size="small" color="secondary" variant="outlined" /> : null,
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
              onClick={() => handleEditTransaction(params.row)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Duplicate">
            <IconButton
              size="small"
              onClick={() => handleDuplicate(params.row)}
              color="info"
            >
              <DuplicateIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={() => handleDeleteClick(params.row)}
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // Summary cards
  const SummaryCard = ({ title, value, icon, color, prefix = '£' }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h5" fontWeight="bold" color={`${color}.main`}>
              {prefix}{Math.abs(value).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: 1,
              bgcolor: `${color}.lighter`,
              color: `${color}.main`,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading && transactions.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Page Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Transactions
          </Typography>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={handleExport}
            >
              Export CSV
            </Button>
            <Button
              variant="outlined"
              startIcon={<CategoryIcon />}
              onClick={handleBulkCategorize}
              disabled={selectedTransactions.length === 0}
            >
              Bulk Categorize ({selectedTransactions.length})
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddTransaction}
            >
              Add Transaction
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
        {statistics && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard
                title="Income"
                value={statistics.summary?.total_income || 0}
                icon={<TrendingUp />}
                color="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard
                title="Expenses"
                value={statistics.summary?.total_expenses || 0}
                icon={<TrendingDown />}
                color="error"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard
                title="Net"
                value={statistics.summary?.net_savings || 0}
                icon={<SwapHoriz />}
                color={statistics.summary?.net_savings >= 0 ? 'info' : 'warning'}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Transactions
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {statistics.summary?.transaction_count || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    in selected period
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <FilterList sx={{ mr: 1 }} />
            <Typography variant="h6">Filters</Typography>
            <Box flexGrow={1} />
            <Button
              size="small"
              startIcon={<Clear />}
              onClick={handleClearFilters}
            >
              Clear Filters
            </Button>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Search"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Description, reference..."
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Account"
                value={filters.bank_account}
                onChange={(e) => handleFilterChange('bank_account', e.target.value)}
              >
                <MenuItem value="">All Accounts</MenuItem>
                {accounts.map(account => (
                  <MenuItem key={account.bank_account_id} value={account.bank_account_id}>
                    {account.account_name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Category"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <MenuItem value="">All Categories</MenuItem>
                <MenuItem disabled><em>Income Categories</em></MenuItem>
                {categories.filter(c => c.category_type === 'income').map(category => (
                  <MenuItem key={category.category_id} value={category.category_id}>
                    {category.category_name}
                  </MenuItem>
                ))}
                <MenuItem disabled><em>Expense Categories</em></MenuItem>
                {categories.filter(c => c.category_type === 'expense').map(category => (
                  <MenuItem key={category.category_id} value={category.category_id}>
                    {category.category_name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Type"
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="income">Income</MenuItem>
                <MenuItem value="expense">Expense</MenuItem>
                <MenuItem value="transfer">Transfer</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="From Date"
                type="date"
                value={filters.date_from}
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="To Date"
                type="date"
                value={filters.date_to}
                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Min Amount"
                type="number"
                value={filters.min_amount}
                onChange={(e) => handleFilterChange('min_amount', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">£</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Recurring"
                value={filters.is_recurring}
                onChange={(e) => handleFilterChange('is_recurring', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="true">Recurring Only</MenuItem>
                <MenuItem value="false">Non-recurring Only</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Paper>

        {/* Transactions Table */}
        <Paper sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={transactions}
            columns={columns}
            getRowId={(row) => row.transaction_id}
            rowCount={totalCount}
            loading={loading}
            pageSizeOptions={[10, 20, 50]}
            paginationModel={{ page, pageSize }}
            paginationMode="server"
            onPaginationModelChange={(model) => {
              setPage(model.page);
              setPageSize(model.pageSize);
            }}
            checkboxSelection
            onRowSelectionModelChange={(newSelection) => {
              setSelectedTransactions(newSelection);
            }}
            sx={{
              '& .MuiDataGrid-cell:hover': {
                color: 'primary.main',
              },
            }}
          />
        </Paper>

        {/* Form Dialog */}
        <TransactionFormDialog
          open={formDialogOpen}
          onClose={() => setFormDialogOpen(false)}
          onSubmit={handleFormSubmit}
          transaction={selectedTransaction}
          accounts={accounts}
          categories={categories}
        />

        {/* Confirm Delete Dialog */}
        <ConfirmDialog
          open={confirmDialogOpen}
          onClose={() => setConfirmDialogOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Transaction"
          message={`Are you sure you want to delete this transaction? This will update the account balance.`}
        />

        {/* Bulk Categorize Dialog */}
        <BulkCategorizeDialog
          open={bulkCategorizeOpen}
          onClose={() => setBulkCategorizeOpen(false)}
          onSubmit={handleBulkCategorizeSubmit}
          categories={categories}
          transactionCount={selectedTransactions.length}
        />
      </Container>
    </LocalizationProvider>
  );
};

export default Transactions;