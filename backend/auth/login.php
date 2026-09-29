<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/response.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/session.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    json_response(405, ['success' => false, 'error' => ['code' => 'method_not_allowed', 'message' => 'Use POST to log in.']]);
}

$input = json_decode(file_get_contents('php://input') ?: '', true);
if (!is_array($input)) {
    json_response(400, ['success' => false, 'error' => ['code' => 'invalid_json', 'message' => 'The request body must be valid JSON.']]);
}

$email = trim((string) ($input['email'] ?? ''));
$password = (string) ($input['password'] ?? '');
$errors = [];
if ($email === '' || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
    $errors['email'] = 'Enter a valid email address.';
}
if ($password === '') {
    $errors['password'] = 'Password is required.';
}
if ($errors !== []) {
    json_response(422, ['success' => false, 'error' => ['code' => 'validation_failed', 'message' => 'Please correct the highlighted fields.', 'fields' => $errors]]);
}

try {
    $statement = get_database_connection()->prepare('SELECT id, name, email, password FROM users WHERE email = :email LIMIT 1');
    $statement->execute(['email' => $email]);
    $user = $statement->fetch();

    if ($user === false || !password_verify($password, $user['password'])) {
        json_response(401, ['success' => false, 'error' => ['code' => 'invalid_credentials', 'message' => 'Email or password is incorrect.']]);
    }

    start_app_session();
    session_regenerate_id(true);
    $_SESSION['user'] = [
        'id' => (int) $user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
    ];

    json_response(200, ['success' => true, 'data' => ['user' => $_SESSION['user']]]);
} catch (PDOException $exception) {
    json_response(500, ['success' => false, 'error' => ['code' => 'server_error', 'message' => 'The login request could not be completed.']]);
}