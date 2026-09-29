<?php
declare(strict_types=1);

require_once __DIR__ . '/common.php';

$userId = require_task_user();
require_task_method('DELETE');
$input = read_task_input();
$notificationId = filter_var($input['id'] ?? null, FILTER_VALIDATE_INT, [
    'options' => ['min_range' => 1],
]);

if ($notificationId === false) {
    json_response(422, [
        'success' => false,
        'error' => ['code' => 'validation_failed', 'message' => 'A valid notification ID is required.', 'fields' => ['id' => 'Enter a positive notification ID.']],
    ]);
}

try {
    $statement = get_database_connection()->prepare(
        'DELETE FROM notifications WHERE id = :id AND user_id = :user_id'
    );
    $statement->execute(['id' => $notificationId, 'user_id' => $userId]);
    if ($statement->rowCount() !== 1) {
        task_not_found();
    }

    json_response(200, ['success' => true, 'data' => ['id' => $notificationId]]);
} catch (PDOException $exception) {
    task_server_error('The notification could not be deleted.');
}