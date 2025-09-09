import api from './api';

const categoryService = {
  // Get all categories
  getCategories: async (params = {}) => {
    const response = await api.get('/categories/', { params });
    return response.data;
  },

  // Get single category
  getCategory: async (id) => {
    const response = await api.get(`/categories/${id}/`);
    return response.data;
  },

  // Create new category
  createCategory: async (categoryData) => {
    const response = await api.post('/categories/', categoryData);
    return response.data;
  },

  // Update category
  updateCategory: async (id, categoryData) => {
    const response = await api.patch(`/categories/${id}/`, categoryData);
    return response.data;
  },

  // Delete category
  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}/`);
    return response.data;
  },

  // Get category usage statistics
  getCategoryUsage: async (id, days = 30) => {
    const response = await api.get(`/categories/${id}/usage/`, {
      params: { days }
    });
    return response.data;
  },

  // Set default categories for new user
  setDefaultCategories: async () => {
    const response = await api.post('/categories/set_defaults/');
    return response.data;
  },

  // Reassign all transactions from one category to another
  reassignTransactions: async (sourceCategoryId, targetCategoryId) => {
    const response = await api.post(`/categories/${sourceCategoryId}/reassign_transactions/`, {
      target_category_id: targetCategoryId
    });
    return response.data;
  },
};

export default categoryService;