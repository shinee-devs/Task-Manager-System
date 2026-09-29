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
    $connection->beginTransaction();
    $statement = $connection->prepare(
        'INSERT INTO tasks (user_id, title, description, status, due_date, due_time, is_pinned, category, reminder_mode, reminder_date, reminder_time)
         VALUES (:user_id, :title, :description, :status, :due_date, :due_time, :is_pinned, :category, :reminder_mode, :reminder_date, :reminder_time)'
    );
    $statement->execute([
        'user_id' => $userId,
        'title' => $task['title'],
        'description' => $task['description'],
        'status' => $task['status'],
        'due_date' => $task['due_date'],
        'due_time' => $task['due_time'],
        'is_pinned' => $task['is_pinned'],
        'category' => $task['category'],
        'reminder_mode' => $task['reminder_mode'],
        'reminder_date' => $task['reminder_date'],
        'reminder_time' => $task['reminder_time'],
    ]);

    $taskId = (int) $connection->lastInsertId();
    save_task_tags($connection, $taskId, $task['tags']);
    log_task_activity($connection, $taskId, $userId, $task);
    $connection->commit();
    $statement = $connection->prepare(
        'SELECT *
         FROM tasks WHERE id = :id AND user_id = :user_id'
    );
    $statement->execute(['id' => $taskId, 'user_id' => $userId]);

    json_response(201, ['success' => true, 'data' => ['task' => enrich_tasks($connection, [$statement->fetch()], $userId)[0]]]);
} catch (PDOException $exception) {
    if (isset($connection) && $connection->inTransaction()) $connection->rollBack();
    error_log($exception->getMessage());
    task_server_error('The task could not be created.');
}