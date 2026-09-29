<?php
declare(strict_types=1);

require_once __DIR__ . '/common.php';

$userId = require_task_user();
require_task_method('GET');

try {
    generate_due_notifications($userId);
    $connection = get_database_connection();
    $statement = $connection->prepare(
        'SELECT n.id, n.task_id, n.type, n.message, n.is_read, n.created_at,
            t.title AS task_title, t.priority AS task_priority,
            t.status AS task_status, t.due_date AS task_due_date
         FROM notifications n
         LEFT JOIN tasks t ON t.id = n.task_id AND t.user_id = n.user_id
         WHERE n.user_id = :user_id
         ORDER BY n.created_at DESC, n.id DESC'
    );
    $statement->execute(['user_id' => $userId]);
    $notifications = $statement->fetchAll();
    $unreadCount = count(array_filter($notifications, static fn (array $notification): bool => !(bool) $notification['is_read']));

    json_response(200, [
        'success' => true,
        'data' => ['notifications' => $notifications, 'unread_count' => $unreadCount],
    ]);
} catch (PDOException $exception) {
    task_server_error('Notifications could not be loaded.');
}