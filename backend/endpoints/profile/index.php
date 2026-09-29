<?php
declare(strict_types=1);

$profileAction = trim(substr($apiPath, strlen('/api/profile')), '/');
$profileRoutes = [
    'get' => __DIR__ . '/../../profile/get.php',
    'update' => __DIR__ . '/../../profile/update.php',
    'change-password' => __DIR__ . '/../../profile/change-password.php',
];

if (!isset($profileRoutes[$profileAction])) {
    json_response(404, [
        'success' => false,
        'error' => ['code' => 'not_found', 'message' => 'The profile route was not found.'],
    ]);
}

require $profileRoutes[$profileAction];