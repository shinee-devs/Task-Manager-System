<?php
declare(strict_types=1);

require_once __DIR__ . '/common.php';

$userId = require_task_user();
require_task_method('PUT');
$input = read_task_input();
$nameInput = $input['name'] ?? null;
$name = is_string($nameInput) ? trim($nameInput) : '';

if ($name === '' || mb_strlen($name) > 100) {
    $message = $name === '' ? 'Name is required.' : 'Name must be 100 characters or fewer.';
    json_response(422, [
        'success' => false,
        'error' => ['code' => 'validation_failed', 'message' => 'Please correct the highlighted field.', 'fields' => ['name' => $message]],
    ]);
}

try {
    $connection = get_database_connection();
    $statement = $connection->prepare('UPDATE users SET name = :name WHERE id = :user_id');
    $statement->execute(['name' => $name, 'user_id' => $userId]);

    $_SESSION['user']['name'] = $name;
    $statement = $connection->prepare('SELECT id, name, email, created_at FROM users WHERE id = :user_id LIMIT 1');
    $statement->execute(['user_id' => $userId]);

    json_response(200, ['success' => true, 'data' => ['profile' => $statement->fetch(), 'user' => $_SESSION['user']]]);
} catch (PDOException $exception) {
    task_server_error('Your profile could not be updated.');
}