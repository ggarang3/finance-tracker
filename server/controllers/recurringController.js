const db = require('../database/db');

const VALID_FREQUENCIES = new Set([
  'weekly', 'fortnightly', 'every_4_weeks', 'monthly',
  'every_2_months', 'quarterly', 'every_4_months', 'twice_yearly', 'yearly',
]);

const getRecurring = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
        r.id,
        r.type,
        r.name,
        r.amount,
        r.frequency,
        r.next_due_date,
        r.category_id,
        c.name AS category_name,
        c.type AS category_type,
        r.is_active,
        r.created_at
      FROM recurring_items r
      LEFT JOIN categories c ON r.category_id = c.id
      WHERE r.user_id = ?
      ORDER BY r.next_due_date ASC`,
      [req.userId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching recurring items:', error);
    res.status(500).json({ error: 'Failed to fetch recurring items' });
  }
};

const createRecurring = async (req, res) => {
  try {
    const { type, name, amount, frequency, next_due_date, category_id } = req.body;

    if (!type || !name || amount === undefined || !frequency || !next_due_date) {
      return res.status(400).json({ error: 'type, name, amount, frequency, and next_due_date are required' });
    }
    if (!VALID_FREQUENCIES.has(frequency)) {
      return res.status(400).json({ error: `Invalid frequency. Must be one of: ${[...VALID_FREQUENCIES].join(', ')}` });
    }

    // Amount is stored as positive magnitude — type carries direction
    const positiveAmount = Math.abs(Number(amount));

    const [result] = await db.query(
      'INSERT INTO recurring_items (user_id, type, name, amount, frequency, next_due_date, category_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.userId, type, name, positiveAmount, frequency, next_due_date, category_id || null]
    );

    res.status(201).json({
      id: result.insertId,
      user_id: req.userId,
      type,
      name,
      amount: positiveAmount,
      frequency,
      next_due_date,
      category_id: category_id || null,
      is_active: true,
    });
  } catch (error) {
    console.error('Error creating recurring item:', error);
    res.status(500).json({ error: 'Failed to create recurring item' });
  }
};

const updateRecurring = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, name, amount, frequency, next_due_date, category_id, is_active } = req.body;

    if (!type || !name || amount === undefined || !frequency || !next_due_date) {
      return res.status(400).json({ error: 'type, name, amount, frequency, and next_due_date are required' });
    }

    const positiveAmount = Math.abs(Number(amount));

    const [result] = await db.query(
      `UPDATE recurring_items
       SET type = ?, name = ?, amount = ?, frequency = ?, next_due_date = ?, category_id = ?, is_active = ?
       WHERE id = ? AND user_id = ?`,
      [type, name, positiveAmount, frequency, next_due_date, category_id || null, is_active ?? true, id, req.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Recurring item not found' });
    }

    res.json({ id: Number(id), type, name, amount: positiveAmount, frequency, next_due_date, category_id: category_id || null, is_active: is_active ?? true });
  } catch (error) {
    console.error('Error updating recurring item:', error);
    res.status(500).json({ error: 'Failed to update recurring item' });
  }
};

const deleteRecurring = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      'DELETE FROM recurring_items WHERE id = ? AND user_id = ?',
      [id, req.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Recurring item not found' });
    }

    res.json({ message: 'Recurring item deleted', id: Number(id) });
  } catch (error) {
    console.error('Error deleting recurring item:', error);
    res.status(500).json({ error: 'Failed to delete recurring item' });
  }
};

module.exports = { getRecurring, createRecurring, updateRecurring, deleteRecurring };
