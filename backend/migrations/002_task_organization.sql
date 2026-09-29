-- Apply once after 001_create_notifications.sql. Existing tasks remain uncategorized.
USE task_manager;
ALTER TABLE tasks
  ADD category ENUM('Personal','School','Work','Other') NULL,
  ADD reminder_mode ENUM('none','due_date','day_before','custom') NOT NULL DEFAULT 'none',
  ADD reminder_date DATE NULL,
  ADD reminder_time TIME NULL,
  ADD KEY index_user_deadline (user_id, status, due_date);

CREATE TABLE task_tags (
  task_id INT NOT NULL,
  tag VARCHAR(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  PRIMARY KEY (task_id, tag),
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE task_activity (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_id INT NOT NULL,
  user_id INT NOT NULL,
  action VARCHAR(50) NOT NULL,
  description VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY index_task_activity (task_id, user_id, created_at),
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Delivery ledger survives notification dismissal and enforces one delivery per schedule.
CREATE TABLE task_reminder_deliveries (
  task_id INT NOT NULL,
  scheduled_at DATETIME NOT NULL,
  PRIMARY KEY (task_id, scheduled_at),
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
) ENGINE=InnoDB;
