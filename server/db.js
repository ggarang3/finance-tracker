const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'finance_tracker',
});

module.exports = pool.promise();