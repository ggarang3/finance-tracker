const API_URL = 'http://localhost:5001/api/transactions';

// GET all transactions
export const getTransactions = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error('Failed to fetch transactions');
  return response.json();
};

// POST a new transaction
export const createTransaction = async (transaction) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transaction),
  });
  if (!response.ok) throw new Error('Failed to create transaction');
  return response.json();
};

// DELETE a transaction
export const deleteTransaction = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete transaction');
  return response.json();
};