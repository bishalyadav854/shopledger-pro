import api from './api';

export const reportService = {
  sales: (params) => api.get('/reports/sales', { params }),
  customerDues: () => api.get('/reports/customer-dues'),
  topProducts: (limit) => api.get('/reports/top-products', { params: { limit } }),
  collection: (params) => api.get('/reports/collections', { params }),
};

export default reportService;
