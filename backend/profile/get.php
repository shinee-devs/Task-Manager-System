<?php
declare(strict_types=1);

require_once __DIR__ . '/common.php';

$userId = require_task_user();
require_task_method('GET');

try {
    $statement = get_database_connection()->prepare(
        'SELECT id, name, email, created_at FROM users WHERE id = :user_id LIMIT 1'
    );
    $statement->execute(['user_id' => $userId]);
    $profile = $statement->fetch();
    if ($profile === false) {
        json_response(404, ['success' => false, 'error' => ['code' => 'profile_not_found', 'message' => 'The profile was not found.']]);
    }

    json_response(200, ['success' => true, 'data' => ['profile' => $profile]]);
} catch (PDOException $exception) {
    task_server_error('Profile details could not be loaded.');
}