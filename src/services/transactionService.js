import api from './api';

const transactionService = {
  // Get all transactions with filters
  getTransactions: async (params = {}) => {
    const response = await api.get('/transactions/', { params });
    return response.data;
  },

  // Get single transaction
  getTransaction: async (id) => {
    const response = await api.get(`/transactions/${id}/`);
    return response.data;
  },

  // Create new transaction
  createTransaction: async (transactionData) => {
    const response = await api.post('/transactions/', transactionData);
    return response.data;
  },

  // Update transaction
  updateTransaction: async (id, transactionData) => {
    const response = await api.patch(`/transactions/${id}/`, transactionData);
    return response.data;
  },

  // Delete transaction
  deleteTransaction: async (id) => {
    const response = await api.delete(`/transactions/${id}/`);
    return response.data;
  },

  // Get transaction statistics
  getStatistics: async (params = {}) => {
    const response = await api.get('/transactions/statistics/', { params });
    return response.data;
  },

  // Get monthly summary
  getMonthlySummary: async (year, month) => {
    const response = await api.get('/transactions/monthly_summary/', {
      params: { year, month }
    });
    return response.data;
  },

  // Bulk categorize transactions
  bulkCategorize: async (transactionIds, categoryId) => {
    const response = await api.post('/transactions/bulk_categorize/', {
      transaction_ids: transactionIds,
      category_id: categoryId
    });
    return response.data;
  },

  // Duplicate transaction
  duplicateTransaction: async (id, transactionDate) => {
    const response = await api.post(`/transactions/${id}/duplicate/`, {
      transaction_date: transactionDate
    });
    return response.data;
  },
};

export default transactionService;