ALTER TABLE transactions
  ADD COLUMN source ENUM('manual', 'csv', 'pdf') NOT NULL DEFAULT 'manual';
