const db = require('../database/db');

// GET all categories for the logged-in user
const getCategories = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, type FROM categories WHERE user_id = ? ORDER BY type, name',
      [req.userId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

module.exports = {
  getCategories,
};