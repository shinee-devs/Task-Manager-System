<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/response.php';
require_once __DIR__ . '/../config/database.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    json_response(405, ['success' => false, 'error' => ['code' => 'method_not_allowed', 'message' => 'Use POST to register.']]);
}

$input = json_decode(file_get_contents('php://input') ?: '', true);
if (!is_array($input)) {
    json_response(400, ['success' => false, 'error' => ['code' => 'invalid_json', 'message' => 'The request body must be valid JSON.']]);
}

$name = trim((string) ($input['name'] ?? ''));
$email = trim((string) ($input['email'] ?? ''));
$password = (string) ($input['password'] ?? '');
$errors = [];

if ($name === '' || mb_strlen($name) > 100) {
    $errors['name'] = 'Name is required and must be 100 characters or fewer.';
}
if ($email === '' || mb_strlen($email) > 150 || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
    $errors['email'] = 'Enter a valid email address of 150 characters or fewer.';
}
if (strlen($password) < 8) {
    $errors['password'] = 'Password must contain at least 8 characters.';
}

if ($errors !== []) {
    json_response(422, ['success' => false, 'error' => ['code' => 'validation_failed', 'message' => 'Please correct the highlighted fields.', 'fields' => $errors]]);
}

try {
    $connection = get_database_connection();
    $statement = $connection->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
    $statement->execute(['email' => $email]);
    if ($statement->fetch() !== false) {
        json_response(409, ['success' => false, 'error' => ['code' => 'email_exists', 'message' => 'An account with this email already exists.', 'fields' => ['email' => 'This email is already registered.']]]);
    }

    $statement = $connection->prepare('INSERT INTO users (name, email, password) VALUES (:name, :email, :password)');
    $statement->execute([
        'name' => $name,
        'email' => $email,
        'password' => password_hash($password, PASSWORD_DEFAULT),
    ]);

    json_response(201, ['success' => true, 'message' => 'Your account has been created.']);
} catch (PDOException $exception) {
    if ($exception->getCode() === '23000') {
        json_response(409, ['success' => false, 'error' => ['code' => 'email_exists', 'message' => 'An account with this email already exists.']]);
    }

    json_response(500, ['success' => false, 'error' => ['code' => 'server_error', 'message' => 'The account could not be created.']]);
}