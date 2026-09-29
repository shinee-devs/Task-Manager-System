<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/response.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/session.php';

function require_task_user(): int
{
    start_app_session();
    $userId = filter_var($_SESSION['user']['id'] ?? null, FILTER_VALIDATE_INT, [
        'options' => ['min_range' => 1],
    ]);

    if ($userId === false) {
        json_response(401, [
            'success' => false,
            'error' => ['code' => 'unauthenticated', 'message' => 'Sign in to access your workspace.'],
        ]);
    }

    return $userId;
}

function require_task_method(string $method): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== $method) {
        header('Allow: ' . $method);
        json_response(405, [
            'success' => false,
            'error' => ['code' => 'method_not_allowed', 'message' => 'Use ' . $method . ' for this task endpoint.'],
        ]);
    }
}

function read_task_input(): array
{
    $input = json_decode(file_get_contents('php://input') ?: '', true);
    if (!is_array($input) || json_last_error() !== JSON_ERROR_NONE) {
        json_response(400, [
            'success' => false,
            'error' => ['code' => 'invalid_json', 'message' => 'The request body must be valid JSON.'],
        ]);
    }

    return $input;
}

function normalize_task_fields(array $input, array $defaults = []): array
{
    $titleInput = array_key_exists('title', $input) ? $input['title'] : ($defaults['title'] ?? '');
    $descriptionInput = array_key_exists('description', $input) ? $input['description'] : ($defaults['description'] ?? '');
    $priorityInput = array_key_exists('priority', $input) ? $input['priority'] : ($defaults['priority'] ?? 'Medium');
    $statusInput = array_key_exists('status', $input) ? $input['status'] : ($defaults['status'] ?? 'To Do');
    $dueDateInput = array_key_exists('due_date', $input) ? $input['due_date'] : ($defaults['due_date'] ?? null);

    $title = is_string($titleInput) ? trim($titleInput) : '';
    $description = is_string($descriptionInput) ? trim($descriptionInput) : '';
    $priority = is_string($priorityInput) ? $priorityInput : '';
    $status = is_string($statusInput) ? $statusInput : '';
    $dueDate = $dueDateInput === null ? '' : (is_string($dueDateInput) ? trim($dueDateInput) : 'invalid');
    $errors = [];

    if ($title === '') {
        $errors['title'] = 'Title is required.';
    } elseif (mb_strlen($title) > 255) {
        $errors['title'] = 'Title must be 255 characters or fewer.';
    }
    if (!in_array($priority, ['Low', 'Medium', 'High'], true)) {
        $errors['priority'] = 'Choose Low, Medium, or High.';
    }
    if (!in_array($status, ['To Do', 'In Progress', 'Completed'], true)) {
        $errors['status'] = 'Choose To Do, In Progress, or Completed.';
    }
    if ($dueDate !== '' && ($parsedDate = DateTimeImmutable::createFromFormat('!Y-m-d', $dueDate)) === false || ($dueDate !== '' && $parsedDate->format('Y-m-d') !== $dueDate)) {
        $errors['due_date'] = 'Enter a valid due date.';
    }

    return [
        [
            'title' => $title,
            'description' => $description,
            'priority' => $priority,
            'status' => $status,
            'due_date' => $dueDate === '' ? null : $dueDate,
        ],
        $errors,
    ];
}

function task_not_found(): void
{
    json_response(404, [
        'success' => false,
        'error' => ['code' => 'task_not_found', 'message' => 'The requested task was not found.'],
    ]);
}

function task_server_error(string $message): void
{
    json_response(500, [
        'success' => false,
        'error' => ['code' => 'server_error', 'message' => $message],
    ]);
}