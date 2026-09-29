<?php
declare(strict_types=1);

require_once __DIR__ . '/common.php';
require_once __DIR__ . '/../notifications/common.php';

$userId = require_task_user();
require_task_method('GET');

try {
    generate_due_notifications($userId);
    $statement = get_database_connection()->prepare(
        'SELECT id, title, description, priority, status, due_date, created_at, updated_at
         FROM tasks
         WHERE user_id = :user_id
         ORDER BY created_at DESC, id DESC'
    );
    $statement->execute(['user_id' => $userId]);
    $tasks = $statement->fetchAll();

    json_response(200, ['success' => true, 'data' => ['tasks' => $tasks]]);
} catch (PDOException $exception) {
    task_server_error('Tasks could not be loaded.');
}