import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
});

export const getDashboardStats = () => api.get('/dashboard').then(res => res.data);
export const getOrders = (status) => api.get('/orders', { params: { status } }).then(res => res.data);
export const getOrder = (id) => api.get(`/orders/${id}`).then(res => res.data);
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}/status`, null, { params: { status } }).then(res => res.data);
export const getInventory = () => api.get('/inventory').then(res => res.data);
export const transferInventory = (sku, qty) => api.post('/inventory/transfer', null, { params: { sku, qty } }).then(res => res.data);
export const getExceptions = () => api.get('/exceptions').then(res => res.data);
export const resolveException = (id) => api.put(`/exceptions/${id}/resolve`).then(res => res.data);
