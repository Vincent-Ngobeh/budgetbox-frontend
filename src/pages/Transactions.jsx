// Import React hooks and Material-UI components
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
  InputAdornment,
  useTheme,
  useMediaQuery,
  Checkbox,
  CardActions,
  Collapse,
  Stack,
  Pagination,
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
  ExpandMore,
  ExpandLess,
  CheckBox as CheckboxIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';

// Import services and utilities
import transactionService from '../services/transactionService';
import accountService from '../services/accountService';
import categoryService from '../services/categoryService';
import { formatCurrency, formatDate, formatDateForAPI, getDaysAgo } from '../utils/formatters';
import TransactionFormDialog from '../components/transactions/TransactionFormDialog';
import ConfirmDialog from '../components/common/ConfirmDialog';
import BulkCategorizeDialog from '../components/transactions/BulkCategorizeDialog';

const Transactions = () => {
  // Theme and responsive breakpoints
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Data state management
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filter state with default values
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
  
  // Dialog and UI state management
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [bulkCategorizeOpen, setBulkCategorizeOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  
  // Mobile UI state
  const [expandedCards, setExpandedCards] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  
  // Load initial data on component mount
  useEffect(() => {
    fetchInitialData();
  }, []);
  
  // Fetch transactions when filters or pagination changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchTransactions();
  }, [filters, page, pageSize]);

  /**
   * Fetches accounts and categories data on initial load
   */
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [accountsRes, categoriesRes] = await Promise.all([
        accountService.getAccounts(),
        categoryService.getCategories(),
      ]);
      
      // Handle both array and paginated response formats
      setAccounts(Array.isArray(accountsRes) ? accountsRes : accountsRes.results || []);
      setCategories(Array.isArray(categoriesRes) ? categoriesRes : categoriesRes.results || []);
    } catch (err) {
      setError('Failed to load initial data');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetches transactions and statistics based on current filters and pagination
   */
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params = {
        page: page + 1, // API uses 1-based pagination
        page_size: pageSize,
      };
      
      // Add active filters to params
      Object.keys(filters).forEach(key => {
        if (filters[key] !== '' && filters[key] !== null) {
          if (key === 'search') {
            params.search = filters[key];
          } else {
            params[key] = filters[key];
          }
        }
      });
      
      // Fetch both transactions and statistics in parallel
      const [transRes, statsRes] = await Promise.all([
        transactionService.getTransactions(params),
        transactionService.getStatistics({
          date_from: filters.date_from,
          date_to: filters.date_to,
        }),
      ]);
      
      // Handle paginated or array response
      if (transRes.results) {
        setTransactions(transRes.results);
        setTotalCount(transRes.count || 0);
      } else {
        setTransactions(Array.isArray(transRes) ? transRes : []);
        setTotalCount(transRes.length || 0);
      }
      
      setStatistics(statsRes);
    } catch (err) {
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Updates filter state and resets pagination
   */
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0); // Reset to first page when filters change
  };

  /**
   * Resets all filters to default values
   */
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

  /**
   * Opens the transaction form dialog for creating a new transaction
   */
  const handleAddTransaction = () => {
    setSelectedTransaction(null);
    setFormDialogOpen(true);
  };

  /**
   * Opens the transaction form dialog for editing an existing transaction
   */
  const handleEditTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setFormDialogOpen(true);
  };

  /**
   * Opens confirmation dialog for transaction deletion
   */
  const handleDeleteClick = (transaction) => {
    setTransactionToDelete(transaction);
    setConfirmDialogOpen(true);
  };

  /**
   * Confirms and executes transaction deletion
   */
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

  /**
   * Duplicates a transaction with today's date
   */
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

  /**
   * Handles form submission for creating or updating transactions
   */
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

  /**
   * Opens bulk categorization dialog
   */
  const handleBulkCategorize = () => {
    if (selectedTransactions.length === 0) {
      setError('Please select transactions to categorize');
      return;
    }
    setBulkCategorizeOpen(true);
  };

  /**
   * Applies category to all selected transactions
   */
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

  /**
   * Exports transactions to CSV file
   */
  const handleExport = () => {
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

  /**
   * Toggles expanded state for mobile transaction cards
   */
  const toggleCardExpansion = (transactionId) => {
    setExpandedCards(prev => ({
      ...prev,
      [transactionId]: !prev[transactionId]
    }));
  };

  /**
   * Handles selection/deselection of individual transactions
   */
  const handleSelectTransaction = (transactionId) => {
    setSelectedTransactions(prev => {
      if (prev.includes(transactionId)) {
        return prev.filter(id => id !== transactionId);
      } else {
        return [...prev, transactionId];
      }
    });
  };

  /**
   * Checks if a transaction is currently selected
   */
  const isTransactionSelected = (transactionId) => {
    return selectedTransactions.includes(transactionId);
  };

  /**
   * Mobile-optimized transaction card component
   */
  const MobileTransactionCard = ({ transaction }) => {
    const isExpanded = expandedCards[transaction.transaction_id];
    const isSelected = isTransactionSelected(transaction.transaction_id);
    
    // Helper function to get icon based on transaction type
    const getTypeIcon = (type) => {
      switch(type) {
        case 'income': return <TrendingUp />;
        case 'expense': return <TrendingDown />;
        case 'transfer': return <SwapHoriz />;
        default: return null;
      }
    };
    
    // Helper function to get color based on transaction type
    const getTypeColor = (type) => {
      switch(type) {
        case 'income': return 'success';
        case 'expense': return 'error';
        case 'transfer': return 'info';
        default: return 'default';
      }
    };
    
    return (
      <Card 
        sx={{ 
          mb: 1,
          backgroundColor: isSelected ? 'action.selected' : 'background.paper'
        }}
      >
        <CardContent sx={{ pb: 1 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            {/* Left side: Checkbox and description */}
            <Box display="flex" alignItems="flex-start" gap={1}>
              <Checkbox
                size="small"
                checked={isSelected}
                onChange={() => handleSelectTransaction(transaction.transaction_id)}
              />
              <Box>
                <Typography variant="body1" fontWeight="medium">
                  {transaction.transaction_description}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(transaction.transaction_date)} • {transaction.account_name}
                </Typography>
              </Box>
            </Box>
            {/* Right side: Amount and type */}
            <Box textAlign="right">
              <Typography 
                variant="h6" 
                color={transaction.transaction_amount >= 0 ? 'success.main' : 'error.main'}
                fontWeight="bold"
              >
                {transaction.transaction_amount >= 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.transaction_amount))}
              </Typography>
              <Chip
                size="small"
                icon={getTypeIcon(transaction.transaction_type)}
                label={transaction.transaction_type}
                color={getTypeColor(transaction.transaction_type)}
                variant="outlined"
              />
            </Box>
          </Box>
          
          {/* Category and expand button */}
          <Box display="flex" gap={1} mt={1} alignItems="center">
            <Chip 
              size="small" 
              label={transaction.category_name}
              icon={<CategoryIcon />}
              variant="outlined"
            />
            {transaction.is_recurring && (
              <Chip size="small" label="Recurring" color="secondary" variant="outlined" />
            )}
            <Box flexGrow={1} />
            <IconButton 
              size="small" 
              onClick={() => toggleCardExpansion(transaction.transaction_id)}
            >
              {isExpanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
        </CardContent>
        
        {/* Expandable actions section */}
        <Collapse in={isExpanded}>
          <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
            <Button 
              size="small" 
              startIcon={<EditIcon />}
              onClick={() => handleEditTransaction(transaction)}
            >
              Edit
            </Button>
            <Button 
              size="small" 
              startIcon={<DuplicateIcon />}
              onClick={() => handleDuplicate(transaction)}
            >
              Duplicate
            </Button>
            <Button 
              size="small" 
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => handleDeleteClick(transaction)}
            >
              Delete
            </Button>
          </CardActions>
        </Collapse>
      </Card>
    );
  };

  /**
   * DataGrid column definitions for desktop view
   */
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

  /**
   * Summary card component for displaying statistics
   */
  const SummaryCard = ({ title, value, icon, color, prefix = '£' }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
              {title}
            </Typography>
            <Typography variant={isMobile ? "h6" : "h5"} fontWeight="bold" color={`${color}.main`}>
              {prefix}{Math.abs(value).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
            </Typography>
          </Box>
          {!isMobile && (
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
          )}
        </Box>
      </CardContent>
    </Card>
  );

  // Show loading spinner on initial load
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
    <Container maxWidth="lg" sx={{ mt: isMobile ? 2 : 4, mb: 4, px: isMobile ? 1 : 3 }}>
      {/* Page Header */}
      <Box mb={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant={isMobile ? "h5" : "h4"} component="h1">
            Transactions
          </Typography>
          {/* Desktop action buttons */}
          {!isMobile && (
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
          )}
        </Box>
        
        {/* Mobile action buttons - stacked vertically */}
        {isMobile && (
          <Stack spacing={1}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddTransaction}
              fullWidth
            >
              Add Transaction
            </Button>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={handleExport}
              fullWidth
            >
              Export CSV
            </Button>
            <Button
              variant="outlined"
              startIcon={<CategoryIcon />}
              onClick={handleBulkCategorize}
              disabled={selectedTransactions.length === 0}
              fullWidth
            >
              Bulk Categorize ({selectedTransactions.length})
            </Button>
            {/* Select/Unselect All buttons for mobile */}
            {selectedTransactions.length > 0 ? (
              <Button
                variant="outlined"
                startIcon={<Clear />}
                onClick={() => setSelectedTransactions([])}
                fullWidth
                color="secondary"
              >
                Unselect All ({selectedTransactions.length})
              </Button>
            ) : (
              transactions.length > 0 && (
                <Button
                  variant="outlined"
                  startIcon={<CheckboxIcon />}
                  onClick={() => {
                    const allTransactionIds = transactions.map(t => t.transaction_id);
                    setSelectedTransactions(allTransactionIds);
                  }}
                  fullWidth
                  color="primary"
                >
                  Select All on Page
                </Button>
              )
            )}
          </Stack>
        )}
      </Box>

      {/* Alert messages */}
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

      {/* Statistics summary cards */}
      {statistics && (
        <Grid container spacing={isMobile ? 1 : 3} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={6} md={3}>
            <SummaryCard
              title="Income"
              value={statistics.summary?.total_income || 0}
              icon={<TrendingUp />}
              color="success"
            />
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <SummaryCard
              title="Expenses"
              value={statistics.summary?.total_expenses || 0}
              icon={<TrendingDown />}
              color="error"
            />
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <SummaryCard
              title="Net"
              value={statistics.summary?.net_savings || 0}
              icon={<SwapHoriz />}
              color={statistics.summary?.net_savings >= 0 ? 'info' : 'warning'}
            />
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                  Transactions
                </Typography>
                <Typography variant={isMobile ? "h6" : "h5"} fontWeight="bold">
                  {statistics.summary?.transaction_count || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  in period
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters section */}
      <Paper sx={{ p: isMobile ? 1 : 2, mb: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <FilterList sx={{ mr: 1 }} />
          <Typography variant={isMobile ? "body1" : "h6"}>Filters</Typography>
          <Box flexGrow={1} />
          {isMobile && (
            <Button
              size="small"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide' : 'Show'}
            </Button>
          )}
          <Button
            size="small"
            startIcon={<Clear />}
            onClick={handleClearFilters}
          >
            Clear
          </Button>
        </Box>
        
        {/* Collapsible filter fields */}
        <Collapse in={!isMobile || showFilters}>
          <Grid container spacing={isMobile ? 1 : 2}>
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
        </Collapse>
      </Paper>

      {/* Transactions display - Mobile cards or Desktop DataGrid */}
      {isMobile ? (
        <>
          {/* Mobile view: Card-based layout */}
          <Box>
            {transactions.map(transaction => (
              <MobileTransactionCard 
                key={transaction.transaction_id} 
                transaction={transaction}
              />
            ))}
          </Box>
          
          {/* Mobile pagination */}
          <Box display="flex" justifyContent="center" mt={2}>
            <Pagination
              count={Math.ceil(totalCount / pageSize)}
              page={page + 1}
              onChange={(e, value) => setPage(value - 1)}
              color="primary"
              size="small"
            />
          </Box>
        </>
      ) : (
        /* Desktop view: DataGrid */
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <Box sx={{ height: 600, width: '100%' }}>
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
              rowSelectionModel={selectedTransactions} // Syncs selection with mobile view
              onRowSelectionModelChange={(newSelection) => {
                setSelectedTransactions(newSelection);
              }}
              disableColumnMenu
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

      {/* Dialog Components */}
      {/* Transaction form dialog for create/edit */}
      <TransactionFormDialog
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        onSubmit={handleFormSubmit}
        transaction={selectedTransaction}
        accounts={accounts}
        categories={categories}
      />

      {/* Confirmation dialog for deletion */}
      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Transaction"
        message={`Are you sure you want to delete this transaction? This will update the account balance.`}
      />

      {/* Bulk categorization dialog */}
      <BulkCategorizeDialog
        open={bulkCategorizeOpen}
        onClose={() => setBulkCategorizeOpen(false)}
        onSubmit={handleBulkCategorizeSubmit}
        categories={categories}
        transactionCount={selectedTransactions.length}
      />
    </Container>
  );
};

export default Transactions;
                