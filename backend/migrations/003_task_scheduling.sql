-- Apply once after 002. Existing date-only deadlines retain their full day.
USE task_manager;
ALTER TABLE tasks
  ADD due_time TIME NULL AFTER due_date,
  ADD is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  DROP COLUMN priority;
UPDATE tasks SET due_time = '23:59:00' WHERE due_date IS NOT NULL;
UPDATE tasks SET reminder_time = due_time
WHERE reminder_mode IN ('due_date', 'day_before');

CREATE TABLE task_subtasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY index_task_subtasks (task_id, id),
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
) ENGINE=InnoDB;
