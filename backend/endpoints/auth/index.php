<?php
declare(strict_types=1);

$authAction = trim(substr($apiPath, strlen('/api/auth')), '/');
$authActions = ['register', 'login', 'logout', 'session'];

if (!in_array($authAction, $authActions, true)) {
    json_response(404, [
        'success' => false,
        'error' => ['code' => 'not_found', 'message' => 'The authentication route was not found.'],
    ]);
}

require __DIR__ . '/../../auth/' . $authAction . '.php';