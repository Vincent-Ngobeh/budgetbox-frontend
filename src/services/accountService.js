import api from './api';

const accountService = {
  // Get all accounts
  getAccounts: async (params = {}) => {
    const response = await api.get('/accounts/', { params });
    return response.data;
  },

  // Get single account
  getAccount: async (id) => {
    const response = await api.get(`/accounts/${id}/`);
    return response.data;
  },

  // Create new account
  createAccount: async (accountData) => {
    const response = await api.post('/accounts/', accountData);
    return response.data;
  },

  // Update account
  updateAccount: async (id, accountData) => {
    const response = await api.patch(`/accounts/${id}/`, accountData);
    return response.data;
  },

  // Delete account
  deleteAccount: async (id) => {
    const response = await api.delete(`/accounts/${id}/`);
    return response.data;
  },

  // Get account summary (dashboard data)
  getAccountSummary: async () => {
    const response = await api.get('/accounts/summary/');
    return response.data;
  },

  // Get account statement
  getAccountStatement: async (id, days = 30) => {
    const response = await api.get(`/accounts/${id}/statement/`, {
      params: { days }
    });
    return response.data;
  },

  // Transfer between accounts
  transferBetweenAccounts: async (sourceId, transferData) => {
    const response = await api.post(`/accounts/${sourceId}/transfer/`, transferData);
    return response.data;
  },

  // Deactivate account
  deactivateAccount: async (id) => {
    const response = await api.post(`/accounts/${id}/deactivate/`);
    return response.data;
  },
};

export default accountService;