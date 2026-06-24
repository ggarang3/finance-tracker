const express = require('express');
const cors = require('cors');
const db = require('./database/db');

const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running' });
});

// GET all transactions
app.get('/api/transactions', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM transactions ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// POST a new transaction
app.post('/api/transactions', async (req, res) => {
  try {
    const { description, amount } = req.body;

    // Basic validation
    if (!description || amount === undefined) {
      return res.status(400).json({ error: 'Description and amount are required' });
    }

    const [result] = await db.query(
      'INSERT INTO transactions (description, amount) VALUES (?, ?)',
      [description, amount]
    );

    // Return the newly created transaction
    res.status(201).json({
      id: result.insertId,
      description,
      amount,
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});
// PUT (update) a transaction
app.put('/api/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { description, amount } = req.body;

    // Basic validation
    if (!description || amount === undefined) {
      return res.status(400).json({ error: 'Description and amount are required' });
    }

    const [result] = await db.query(
      'UPDATE transactions SET description = ?, amount = ? WHERE id = ?',
      [description, amount, id]
    );

    // Check if the transaction existed
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ id: Number(id), description, amount });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

// DELETE a transaction
app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      'DELETE FROM transactions WHERE id = ?',
      [id]
    );

    // Check if the transaction existed
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ message: 'Transaction deleted', id: Number(id) });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

