<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/response.php';

$requestPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$apiPosition = strpos($requestPath, '/api');
$apiPath = $apiPosition === false ? '/' : substr($requestPath, $apiPosition);
$requestMethod = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($apiPath === '/' || $apiPath === '/api/health') {
    json_response(200, ['status' => 'ok', 'message' => 'Task Manager API is ready.']);
}

if (preg_match('#^/api/auth(?:/.*)?$#', $apiPath) === 1) {
    require __DIR__ . '/../endpoints/auth/index.php';
}

if (preg_match('#^/api/tasks(?:/.*)?$#', $apiPath) === 1) {
    require __DIR__ . '/../endpoints/tasks/index.php';
}

json_response(404, ['error' => 'not_found', 'message' => 'The requested API route was not found.']);