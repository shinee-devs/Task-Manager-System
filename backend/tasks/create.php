<?php
declare(strict_types=1);

require_once __DIR__ . '/common.php';

$userId = require_task_user();
require_task_method('POST');
$input = read_task_input();
[$task, $errors] = normalize_task_fields($input);

if ($errors !== []) {
    json_response(422, [
        'success' => false,
        'error' => ['code' => 'validation_failed', 'message' => 'Please correct the highlighted fields.', 'fields' => $errors],
    ]);
}

try {
    $connection = get_database_connection();
    $statement = $connection->prepare(
        'INSERT INTO tasks (user_id, title, description, priority, status, due_date)
         VALUES (:user_id, :title, :description, :priority, :status, :due_date)'
    );
    $statement->execute([
        'user_id' => $userId,
        'title' => $task['title'],
        'description' => $task['description'],
        'priority' => $task['priority'],
        'status' => $task['status'],
        'due_date' => $task['due_date'],
    ]);

    $statement = $connection->prepare(
        'SELECT id, title, description, priority, status, due_date, created_at, updated_at
         FROM tasks WHERE id = :id AND user_id = :user_id'
    );
    $statement->execute(['id' => $connection->lastInsertId(), 'user_id' => $userId]);

    json_response(201, ['success' => true, 'data' => ['task' => $statement->fetch()]]);
} catch (PDOException $exception) {
    task_server_error('The task could not be created.');
}