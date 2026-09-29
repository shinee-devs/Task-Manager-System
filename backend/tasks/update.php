<?php
declare(strict_types=1);

require_once __DIR__ . '/common.php';
require_once __DIR__ . '/../notifications/common.php';

$userId = require_task_user();
require_task_method('PUT');
$input = read_task_input();
$taskId = filter_var($input['id'] ?? null, FILTER_VALIDATE_INT, [
    'options' => ['min_range' => 1],
]);

if ($taskId === false) {
    json_response(422, [
        'success' => false,
        'error' => ['code' => 'validation_failed', 'message' => 'A valid task ID is required.', 'fields' => ['id' => 'Enter a positive task ID.']],
    ]);
}

try {
    $connection = get_database_connection();
    $statement = $connection->prepare(
        'SELECT id, title, description, priority, status, due_date
         FROM tasks WHERE id = :id AND user_id = :user_id LIMIT 1'
    );
    $statement->execute(['id' => $taskId, 'user_id' => $userId]);
    $currentTask = $statement->fetch();
    if ($currentTask === false) {
        task_not_found();
    }

    [$task, $errors] = normalize_task_fields($input, $currentTask);
    if ($errors !== []) {
        json_response(422, [
            'success' => false,
            'error' => ['code' => 'validation_failed', 'message' => 'Please correct the highlighted fields.', 'fields' => $errors],
        ]);
    }

    $statement = $connection->prepare(
        'UPDATE tasks
         SET title = :title, description = :description, priority = :priority,
             status = :status, due_date = :due_date
         WHERE id = :id AND user_id = :user_id'
    );
    $statement->execute([
        'title' => $task['title'],
        'description' => $task['description'],
        'priority' => $task['priority'],
        'status' => $task['status'],
        'due_date' => $task['due_date'],
        'id' => $taskId,
        'user_id' => $userId,
    ]);

    if ($currentTask['status'] !== 'Completed' && $task['status'] === 'Completed') {
        create_task_completed_notification($userId, $taskId, $task['title']);
    }

    $statement = $connection->prepare(
        'SELECT id, title, description, priority, status, due_date, created_at, updated_at
         FROM tasks WHERE id = :id AND user_id = :user_id'
    );
    $statement->execute(['id' => $taskId, 'user_id' => $userId]);
    $updatedTask = $statement->fetch();
    if ($updatedTask === false) {
        task_not_found();
    }

    json_response(200, ['success' => true, 'data' => ['task' => $updatedTask]]);
} catch (PDOException $exception) {
    task_server_error('The task could not be updated.');
}