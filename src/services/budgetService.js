import api from './api';

const budgetService = {
  // Get all budgets with filters
  getBudgets: async (params = {}) => {
    const response = await api.get('/budgets/', { params });
    return response.data;
  },

  // Get single budget
  getBudget: async (id) => {
    const response = await api.get(`/budgets/${id}/`);
    return response.data;
  },

  // Create new budget
  createBudget: async (budgetData) => {
    const response = await api.post('/budgets/', budgetData);
    return response.data;
  },

  // Update budget
  updateBudget: async (id, budgetData) => {
    const response = await api.patch(`/budgets/${id}/`, budgetData);
    return response.data;
  },

  // Delete budget
  deleteBudget: async (id) => {
    const response = await api.delete(`/budgets/${id}/`);
    return response.data;
  },

  // Get budget progress details
  getBudgetProgress: async (id) => {
    const response = await api.get(`/budgets/${id}/progress/`);
    return response.data;
  },

  // Get budgets overview
  getOverview: async () => {
    const response = await api.get('/budgets/overview/');
    return response.data;
  },

  // Get budget recommendations
  getRecommendations: async (months = 3) => {
    const response = await api.get('/budgets/recommendations/', {
      params: { months }
    });
    return response.data;
  },

  // Clone a budget for next period
  cloneBudget: async (id, data) => {
    const response = await api.post(`/budgets/${id}/clone/`, data);
    return response.data;
  },

  // Deactivate budget
  deactivateBudget: async (id) => {
    const response = await api.post(`/budgets/${id}/deactivate/`);
    return response.data;
  },

  // Reactivate budget
  reactivateBudget: async (id) => {
    const response = await api.post(`/budgets/${id}/reactivate/`);
    return response.data;
  },

  // Bulk create budgets from template
  bulkCreateBudgets: async (data) => {
    const response = await api.post('/budgets/bulk_create/', data);
    return response.data;
  },
};

export default budgetService;