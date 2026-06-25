const API_URL = 'http://localhost:5001/api';

// Helper: build headers, including the auth token if we have one
const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// ===== AUTH =====

export const registerUser = async (userData) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Registration failed');
  }
  return response.json();
};

export const loginUser = async (credentials) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Login failed');
  }
  return response.json();
};

// ===== TRANSACTIONS =====

export const getTransactions = async () => {
  const response = await fetch(`${API_URL}/transactions`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch transactions');
  return response.json();
};

export const createTransaction = async (transaction) => {
  const response = await fetch(`${API_URL}/transactions`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(transaction),
  });
  if (!response.ok) throw new Error('Failed to create transaction');
  return response.json();
};

export const deleteTransaction = async (id) => {
  const response = await fetch(`${API_URL}/transactions/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete transaction');
  return response.json();
};