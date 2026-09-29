<?php
declare(strict_types=1);

$notificationAction = trim(substr($apiPath, strlen('/api/notifications')), '/');
$notificationRoutes = [
    'get' => __DIR__ . '/../../notifications/get.php',
    'mark-read' => __DIR__ . '/../../notifications/mark-read.php',
    'mark-all-read' => __DIR__ . '/../../notifications/mark-all-read.php',
    'delete' => __DIR__ . '/../../notifications/delete.php',
];

if (!isset($notificationRoutes[$notificationAction])) {
    json_response(404, [
        'success' => false,
        'error' => ['code' => 'not_found', 'message' => 'The notification route was not found.'],
    ]);
}

require $notificationRoutes[$notificationAction];