<?php
declare(strict_types=1);

require_once __DIR__ . '/../tasks/common.php';

function generate_due_notifications(int $userId): void
{
    $connection = get_database_connection();
    $today = (new DateTimeImmutable('today'))->format('Y-m-d');

    $dueToday = $connection->prepare(
        "INSERT IGNORE INTO notifications (user_id, task_id, type, message, dedupe_key)
         SELECT user_id, id, 'due_today', LEFT(CONCAT(title, ' is due today.'), 255),
                CONCAT('due_today:', id, ':', :dedupe_date)
         FROM tasks
         WHERE user_id = :user_id AND due_date = :due_date AND status <> 'Completed'"
    );
    $dueToday->execute([
        'dedupe_date' => $today,
        'user_id' => $userId,
        'due_date' => $today,
    ]);

    $overdue = $connection->prepare(
        "INSERT IGNORE INTO notifications (user_id, task_id, type, message, dedupe_key)
         SELECT user_id, id, 'overdue', LEFT(CONCAT(title, ' is overdue.'), 255),
                CONCAT('overdue:', id, ':', DATE_FORMAT(due_date, '%Y-%m-%d'))
         FROM tasks
         WHERE user_id = :user_id AND due_date < :today AND status <> 'Completed'"
    );
    $overdue->execute(['user_id' => $userId, 'today' => $today]);
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