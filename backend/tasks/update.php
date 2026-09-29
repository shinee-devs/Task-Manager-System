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
    $connection->beginTransaction();
    $statement = $connection->prepare(
        'SELECT *
         FROM tasks WHERE id = :id AND user_id = :user_id LIMIT 1 FOR UPDATE'
    );
    $statement->execute(['id' => $taskId, 'user_id' => $userId]);
    $currentTask = $statement->fetch();
    if ($currentTask === false) {
        task_not_found();
    }

    $currentTask = enrich_tasks($connection, [$currentTask], $userId)[0];
    [$task, $errors] = normalize_task_fields($input, $currentTask);
    if ($errors !== []) {
        json_response(422, [
            'success' => false,
            'error' => ['code' => 'validation_failed', 'message' => 'Please correct the highlighted fields.', 'fields' => $errors],
        ]);
    }

    $statement = $connection->prepare(
        'UPDATE tasks
         SET title = :title, description = :description,
             status = :status, due_date = :due_date, due_time = :due_time, is_pinned = :is_pinned, category = :category, reminder_mode = :reminder_mode, reminder_date = :reminder_date, reminder_time = :reminder_time,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = :id AND user_id = :user_id'
    );
    $statement->execute([
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
        'id' => $taskId,
        'user_id' => $userId,
    ]);

    save_task_tags($connection, $taskId, $task['tags']);
    log_task_activity($connection, $taskId, $userId, $task, $currentTask);

    if ($currentTask['status'] !== 'Completed' && $task['status'] === 'Completed') {
        create_task_completed_notification($userId, $taskId, $task['title']);
    }

    $statement = $connection->prepare(
        'SELECT *
         FROM tasks WHERE id = :id AND user_id = :user_id'
    );
    $statement->execute(['id' => $taskId, 'user_id' => $userId]);
    $updatedTask = $statement->fetch();
    if ($updatedTask === false) {
        task_not_found();
    }

    $updatedTask = enrich_tasks($connection, [$updatedTask], $userId)[0];
    $connection->commit();
    json_response(200, ['success' => true, 'data' => ['task' => $updatedTask]]);
} catch (PDOException $exception) {
    if (isset($connection) && $connection->inTransaction()) $connection->rollBack();
    error_log($exception->getMessage());
    task_server_error('The task could not be updated.');
}
