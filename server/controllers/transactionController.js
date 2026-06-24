const db = require('../database/db');

// GET all transactions
const getTransactions = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM transactions ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

// POST a new transaction
const createTransaction = async (req, res) => {
  try {
    const { description, amount } = req.body;

    if (!description || amount === undefined) {
      return res.status(400).json({ error: 'Description and amount are required' });
    }

    const [result] = await db.query(
      'INSERT INTO transactions (description, amount) VALUES (?, ?)',
      [description, amount]
    );

    res.status(201).json({
      id: result.insertId,
      description,
      amount,
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
};

// PUT (update) a transaction
const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, amount } = req.body;

    if (!description || amount === undefined) {
      return res.status(400).json({ error: 'Description and amount are required' });
    }

    const [result] = await db.query(
      'UPDATE transactions SET description = ?, amount = ? WHERE id = ?',
      [description, amount, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ id: Number(id), description, amount });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
};

// DELETE a transaction
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      'DELETE FROM transactions WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ message: 'Transaction deleted', id: Number(id) });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};