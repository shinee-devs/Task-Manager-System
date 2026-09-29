<?php
declare(strict_types=1);

require_once __DIR__ . '/common.php';

$userId = require_task_user();
require_task_method('POST');

try {
    $statement = get_database_connection()->prepare(
        'UPDATE notifications SET is_read = TRUE WHERE user_id = :user_id AND is_read = FALSE'
    );
    $statement->execute(['user_id' => $userId]);

    json_response(200, ['success' => true, 'data' => ['updated' => $statement->rowCount()]]);
} catch (PDOException $exception) {
    task_server_error('Notifications could not be marked as read.');
}