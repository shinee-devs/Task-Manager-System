<?php
declare(strict_types=1);
require_once __DIR__ . '/common.php';
$userId = require_task_user();
require_task_method('POST');
$input = read_task_input();
$taskId = filter_var($input['task_id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
$action = $input['action'] ?? '';
$subtaskId = filter_var($input['subtask_id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
$title = is_string($input['title'] ?? null) ? trim($input['title']) : '';
if (!$taskId || !in_array($action, ['add', 'set_completed', 'delete'], true)
    || ($action === 'add' && ($title === '' || mb_strlen($title) > 255))
    || ($action !== 'add' && !$subtaskId)
    || ($action === 'set_completed' && !is_bool($input['is_completed'] ?? null))) {
    json_response(422, ['success' => false, 'error' => ['code' => 'validation_failed', 'message' => 'Provide a valid checklist action and a title of 1–255 characters.']]);
}
try {
    $db = get_database_connection();
    $db->beginTransaction();
    $owner = $db->prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ? FOR UPDATE');
    $owner->execute([$taskId, $userId]);
    if (!$owner->fetch()) { $db->rollBack(); task_not_found(); }
    if ($action === 'add') {
        $db->prepare('INSERT INTO task_subtasks (task_id, title) VALUES (?, ?)')->execute([$taskId, $title]);
    } else {
        $check = $db->prepare('SELECT id FROM task_subtasks WHERE id = ? AND task_id = ?');
        $check->execute([$subtaskId, $taskId]);
        if (!$check->fetch()) { $db->rollBack(); task_not_found(); }
        if ($action === 'delete') $db->prepare('DELETE FROM task_subtasks WHERE id = ? AND task_id = ?')->execute([$subtaskId, $taskId]);
        else $db->prepare('UPDATE task_subtasks SET is_completed = ? WHERE id = ? AND task_id = ?')->execute([(int) $input['is_completed'], $subtaskId, $taskId]);
    }
    $db->prepare('UPDATE tasks SET updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?')->execute([$taskId, $userId]);
    $owner->execute([$taskId, $userId]);
    $task = enrich_tasks($db, [$owner->fetch()], $userId)[0];
    $db->commit();
    json_response(200, ['success' => true, 'data' => ['task' => $task]]);
} catch (PDOException $error) {
    if (isset($db) && $db->inTransaction()) $db->rollBack();
    error_log($error->getMessage());
    task_server_error('The checklist could not be updated.');
}
