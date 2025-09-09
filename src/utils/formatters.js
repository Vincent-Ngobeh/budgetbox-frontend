// Currency formatting utilities
export const formatCurrency = (amount, currency = 'GBP') => {
  const symbols = {
    GBP: '£',
    USD: '$',
    EUR: '€'
  };

  const symbol = symbols[currency] || currency;
  const absAmount = Math.abs(amount);
  
  // Format with proper thousand separators
  const formatted = absAmount.toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  // Add symbol and handle negative values
  if (amount < 0) {
    return `-${symbol}${formatted}`;
  }
  return `${symbol}${formatted}`;
};

// Format currency with color coding (positive green, negative red)
export const formatCurrencyColored = (amount, currency = 'GBP') => {
  const formatted = formatCurrency(amount, currency);
  const color = amount >= 0 ? 'success.main' : 'error.main';
  return { text: formatted, color };
};

// Date formatting utilities
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  // UK date format: DD/MM/YYYY
  return date.toLocaleDateString('en-GB');
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  // UK datetime format: DD/MM/YYYY, HH:MM
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format date for API (YYYY-MM-DD)
export const formatDateForAPI = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

// Get date X days ago
export const getDaysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return formatDateForAPI(date);
};

// Get start of current month
export const getMonthStart = () => {
  const date = new Date();
  date.setDate(1);
  return formatDateForAPI(date);
};

// Get end of current month
export const getMonthEnd = () => {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  date.setDate(0);
  return formatDateForAPI(date);
};

// Format percentage
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return '0%';
  return `${value.toFixed(decimals)}%`;
};

// Format account type for display
export const formatAccountType = (type) => {
  const types = {
    current: 'Current Account',
    savings: 'Savings Account',
    isa: 'ISA',
    credit: 'Credit Card'
  };
  return types[type] || type;
};

// Format transaction type with color
export const getTransactionTypeColor = (type) => {
  const colors = {
    income: 'success',
    expense: 'error',
    transfer: 'info'
  };
  return colors[type] || 'default';
};

// Calculate percentage change
export const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return 0;
  return ((current - previous) / Math.abs(previous)) * 100;
};

// Format large numbers (e.g., 1.2K, 1.5M)
export const formatLargeNumber = (num) => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};