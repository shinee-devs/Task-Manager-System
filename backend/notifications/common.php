<?php
declare(strict_types=1);

require_once __DIR__ . '/../tasks/common.php';

function generate_due_notifications(int $userId): void
{
    generate_reminder_notifications($userId);
    $connection = get_database_connection();
    $now = new DateTimeImmutable('now', new DateTimeZone('Asia/Manila'));
    $today = $now->format('Y-m-d');

    $dueToday = $connection->prepare(
        "INSERT IGNORE INTO notifications (user_id, task_id, type, message, dedupe_key)
         SELECT user_id, id, 'due_today', LEFT(CONCAT(title, ' is due today.'), 255),
                CONCAT('due_today:', id, ':', :dedupe_date)
         FROM tasks
         WHERE user_id = :user_id AND due_date = :due_date AND TIMESTAMP(due_date, due_time) >= :now AND status <> 'Completed'"
    );
    $dueToday->execute([
        'dedupe_date' => $today,
        'user_id' => $userId,
        'due_date' => $today,
        'now' => $now->format('Y-m-d H:i:s'),
    ]);

    $overdue = $connection->prepare(
        "INSERT IGNORE INTO notifications (user_id, task_id, type, message, dedupe_key)
         SELECT user_id, id, 'overdue', LEFT(CONCAT(title, ' is overdue.'), 255),
                CONCAT('overdue:', id, ':', DATE_FORMAT(TIMESTAMP(due_date, due_time), '%Y-%m-%d %H:%i:%s'))
         FROM tasks
         WHERE user_id = :user_id AND TIMESTAMP(due_date, due_time) < :now AND status <> 'Completed'"
    );
    $overdue->execute(['user_id' => $userId, 'now' => $now->format('Y-m-d H:i:s')]);
}

function create_task_completed_notification(int $userId, int $taskId, string $title): void
{
    $statement = get_database_connection()->prepare(
        "INSERT INTO notifications (user_id, task_id, type, message, dedupe_key)
         VALUES (:user_id, :task_id, 'task_completed', :message, :dedupe_key)"
    );
    $statement->execute([
        'user_id' => $userId,
        'task_id' => $taskId,
        'message' => mb_substr('Task completed: ' . $title, 0, 255),
        'dedupe_key' => 'task_completed:' . $taskId . ':' . bin2hex(random_bytes(12)),
    ]);
}

function generate_reminder_notifications(int $userId): void
{
    $db = get_database_connection();
    // All reminder dates and times use the configured application timezone.
    $now = new DateTimeImmutable('now', new DateTimeZone('Asia/Manila'));
    $db->beginTransaction();
    try {
        $query = $db->prepare("SELECT id, title, reminder_date, reminder_time FROM tasks WHERE user_id = ? AND status <> 'Completed' AND reminder_mode <> 'none' AND TIMESTAMP(reminder_date, reminder_time) <= ? FOR UPDATE");
        $query->execute([$userId, $now->format('Y-m-d H:i:s')]);
        $claim = $db->prepare('INSERT IGNORE INTO task_reminder_deliveries (task_id, scheduled_at) VALUES (?, ?)');
        $insert = $db->prepare("INSERT INTO notifications (user_id, task_id, type, message, dedupe_key) VALUES (?, ?, 'reminder', ?, ?)");
        foreach ($query->fetchAll() as $task) {
            $scheduled = $task['reminder_date'] . ' ' . $task['reminder_time'];
            $claim->execute([$task['id'], $scheduled]);
            if ($claim->rowCount() === 1) $insert->execute([$userId, $task['id'], mb_substr('Reminder: ' . $task['title'], 0, 255), 'reminder:' . $task['id'] . ':' . $scheduled]);
        }
        $db->commit();
    } catch (Throwable $error) {
        $db->rollBack();
        throw $error;
    }
}
