CREATE TABLE IF NOT EXISTS recurring_items (
  id            INT PRIMARY KEY AUTO_INCREMENT,
  user_id       INT NOT NULL,
  type          ENUM('income','expense') NOT NULL,
  name          VARCHAR(100) NOT NULL,
  amount        DECIMAL(10,2) NOT NULL,
  frequency     ENUM('weekly','fortnightly','every_4_weeks','monthly',
                     'every_2_months','quarterly','every_4_months',
                     'twice_yearly','yearly') NOT NULL,
  next_due_date DATE NOT NULL,
  category_id   INT NULL,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);
