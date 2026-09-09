import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Automatically attach JWT token to every outgoing request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('p17_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Auth API
export const loginUser = (credentials) => apiClient.post('/auth/login', credentials);
export const registerUser = (userData) => apiClient.post('/auth/register', userData);
export const getMe = () => apiClient.get('/auth/me');

// Plans API
export const getPlans = () => apiClient.get('/plans');
export const createPlan = (planData) => apiClient.post('/plans', planData);

// Customers API
export const getCustomers = () => apiClient.get('/customers');
export const createCustomer = (customerData) => apiClient.post('/customers', customerData);

// Subscriptions API
export const createSubscription = (subscriptionData) => apiClient.post('/subscriptions', subscriptionData);

// Usage API
export const getUsageLogs = (params) => apiClient.get('/usage/logs', { params });
export const ingestUsage = (apiKey, payload) => apiClient.post('/usage/ingest', payload, {
  headers: { 'x-api-key': apiKey }
});

// Wallet API
export const getWallet = (params) => apiClient.get('/wallets', { params });
export const topUpWallet = (topUpData) => apiClient.post('/wallets/topup', topUpData);

// Invoices API
export const getInvoices = (params) => apiClient.get('/invoices', { params });
export const payInvoice = (invoiceId) => apiClient.post(`/invoices/${invoiceId}/pay`);
export const generateInvoices = () => apiClient.post('/invoices/generate');

// Analytics API
export const getAnalyticsDashboard = () => apiClient.get('/analytics/dashboard');

export default apiClient;
