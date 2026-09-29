<?php
declare(strict_types=1);

require_once __DIR__ . '/common.php';

$userId = require_task_user();
require_task_method('POST');
$input = read_task_input();
$currentPassword = is_string($input['current_password'] ?? null) ? $input['current_password'] : '';
$newPassword = is_string($input['new_password'] ?? null) ? $input['new_password'] : '';
$confirmPassword = is_string($input['confirm_password'] ?? null) ? $input['confirm_password'] : '';
$errors = [];

if ($currentPassword === '') {
    $errors['current_password'] = 'Enter your current password.';
}
if (strlen($newPassword) < 8) {
    $errors['new_password'] = 'Use at least 8 characters for your new password.';
}
if ($newPassword !== $confirmPassword) {
    $errors['confirm_password'] = 'Passwords do not match.';
}
if ($errors !== []) {
    json_response(422, [
        'success' => false,
        'error' => ['code' => 'validation_failed', 'message' => 'Please correct the highlighted fields.', 'fields' => $errors],
    ]);
}

try {
    $connection = get_database_connection();
    $statement = $connection->prepare('SELECT password FROM users WHERE id = :user_id LIMIT 1');
    $statement->execute(['user_id' => $userId]);
    $user = $statement->fetch();

    if ($user === false || !password_verify($currentPassword, $user['password'])) {
        json_response(422, [
            'success' => false,
            'error' => ['code' => 'current_password_invalid', 'message' => 'Current password is incorrect.', 'fields' => ['current_password' => 'Current password is incorrect.']],
        ]);
    }

    $statement = $connection->prepare('UPDATE users SET password = :password WHERE id = :user_id');
    $statement->execute(['password' => password_hash($newPassword, PASSWORD_DEFAULT), 'user_id' => $userId]);

    json_response(200, ['success' => true, 'message' => 'Your password has been changed.']);
} catch (PDOException $exception) {
    task_server_error('Your password could not be changed.');
}