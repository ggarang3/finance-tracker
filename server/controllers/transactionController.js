const db = require('../database/db');

// GET all transactions for the logged-in user (with category info)
const getTransactions = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
        t.id, 
        t.description, 
        t.amount, 
        t.category_id,
        c.name AS category_name,
        c.type AS category_type,
        t.created_at
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ?
      ORDER BY t.created_at DESC`,
      [req.userId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

// POST a new transaction for the logged-in user
const createTransaction = async (req, res) => {
  try {
    const { description, amount, category_id } = req.body;

    if (!description || amount === undefined) {
      return res.status(400).json({ error: 'Description and amount are required' });
    }

    const [result] = await db.query(
      'INSERT INTO transactions (user_id, category_id, description, amount) VALUES (?, ?, ?, ?)',
      [req.userId, category_id || null, description, amount]
    );

    res.status(201).json({
      id: result.insertId,
      user_id: req.userId,
      category_id: category_id || null,
      description,
      amount,
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
};

// PUT (update) a transaction — only if it belongs to the user
const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, amount, category_id } = req.body;

    if (!description || amount === undefined) {
      return res.status(400).json({ error: 'Description and amount are required' });
    }

    const [result] = await db.query(
      'UPDATE transactions SET description = ?, amount = ?, category_id = ? WHERE id = ? AND user_id = ?',
      [description, amount, category_id || null, id, req.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ id: Number(id), description, amount, category_id: category_id || null });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
};

// DELETE a transaction — only if it belongs to the user
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      'DELETE FROM transactions WHERE id = ? AND user_id = ?',
      [id, req.userId]
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