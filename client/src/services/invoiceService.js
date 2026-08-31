import api from './api';

export const invoiceService = {
  getAll: (params) => api.get('/invoices', { params }),
  get: (id) => api.get(`/invoices/${id}`),
  create: (data) => api.post('/invoices', data),
  updateStatus: (id, status) => api.put(`/invoices/${id}/status`, { status }),
  delete: (id) => api.delete(`/invoices/${id}`),
};

export default invoiceService;
