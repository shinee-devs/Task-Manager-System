<?php
declare(strict_types=1);

$taskAction = trim(substr($apiPath, strlen('/api/tasks')), '/');
$taskRoutes = [
    'subtasks' => __DIR__ . '/../../tasks/subtasks.php',
    'get' => __DIR__ . '/../../tasks/get.php',
    'create' => __DIR__ . '/../../tasks/create.php',
    'update' => __DIR__ . '/../../tasks/update.php',
    'delete' => __DIR__ . '/../../tasks/delete.php',
];

if (!isset($taskRoutes[$taskAction])) {
    json_response(404, [
        'success' => false,
        'error' => ['code' => 'not_found', 'message' => 'The task route was not found.'],
    ]);
}

require $taskRoutes[$taskAction];