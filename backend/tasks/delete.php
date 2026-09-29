<?php
declare(strict_types=1);

require_once __DIR__ . '/common.php';

$userId = require_task_user();
require_task_method('DELETE');
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
    $statement = get_database_connection()->prepare(
        'DELETE FROM tasks WHERE id = :id AND user_id = :user_id'
    );
    $statement->execute(['id' => $taskId, 'user_id' => $userId]);
    if ($statement->rowCount() !== 1) {
        task_not_found();
    }

    json_response(200, ['success' => true, 'data' => ['id' => $taskId]]);
} catch (PDOException $exception) {
    task_server_error('The task could not be deleted.');
}