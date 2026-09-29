<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/response.php';
require_once __DIR__ . '/../config/session.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    header('Allow: GET');
    json_response(405, ['success' => false, 'error' => ['code' => 'method_not_allowed', 'message' => 'Use GET to check the session.']]);
}

start_app_session();
json_response(200, ['success' => true, 'data' => ['user' => $_SESSION['user'] ?? null]]);