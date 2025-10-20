import { apiRequest } from './client.js';

export const suppliersApi = {
  list: (token) => apiRequest('suppliers', { token }),
  create: (token, payload) => apiRequest('suppliers', { method: 'POST', token, body: payload }),
  update: (token, id, payload) => apiRequest(`suppliers/${id}`, { method: 'PUT', token, body: payload }),
  remove: (token, id) => apiRequest(`suppliers/${id}`, { method: 'DELETE', token }),
  show: (token, id) => apiRequest(`suppliers/${id}`, { token }),
};

export const storesApi = {
  list: (token) => apiRequest('stores', { token }),
  create: (token, payload) => apiRequest('stores', { method: 'POST', token, body: payload }),
  update: (token, id, payload) => apiRequest(`stores/${id}`, { method: 'PUT', token, body: payload }),
  remove: (token, id) => apiRequest(`stores/${id}`, { method: 'DELETE', token }),
};

export const ordersApi = {
  list: (token, params = {}) => {
    const search = new URLSearchParams(params).toString();
    const suffix = search ? `?${search}` : '';
    return apiRequest(`orders${suffix}`, { token });
  },
  create: (token, payload) => apiRequest('orders', { method: 'POST', token, body: payload }),
  update: (token, id, payload) => apiRequest(`orders/${id}`, { method: 'PUT', token, body: payload }),
  remove: (token, id) => apiRequest(`orders/${id}`, { method: 'DELETE', token }),
};

export const salesApi = {
  create: (token, payload) => apiRequest('sales', { method: 'POST', token, body: payload }),
  remove: (token, id) => apiRequest(`sales/${id}`, { method: 'DELETE', token }),
};

export const dashboardApi = {
  summary: (token) => apiRequest('dashboard/summary', { token }),
};

export const reportsApi = {
  overview: (token) => apiRequest('reports/overview', { token }),
  bestCategories: (token) => apiRequest('reports/best-categories', { token }),
  profitVsRevenue: (token) => apiRequest('reports/profit-vs-revenue', { token }),
  bestProducts: (token) => apiRequest('reports/best-products', { token }),
};
