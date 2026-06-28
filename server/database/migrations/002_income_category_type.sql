ALTER TABLE categories
  MODIFY COLUMN type ENUM('essential','lifestyle','savings','income') NOT NULL;

UPDATE categories SET type = 'income' WHERE name = 'Income';
