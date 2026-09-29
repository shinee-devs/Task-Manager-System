<?php
declare(strict_types=1);

function normalize_organization(array $input, array $defaults, array $task): array
{
    $values = array_replace(['category' => null, 'tags' => [], 'reminder_mode' => 'none', 'reminder_date' => null, 'reminder_time' => null], $defaults, $input);
    $errors = [];
    $category = $values['category'] === '' ? null : $values['category'];
    if ($category !== null && !in_array($category, ['Personal', 'School', 'Work', 'Other'], true)) $errors['category'] = 'Choose a valid category.';
    $tags = [];
    if (!is_array($values['tags']) || count($values['tags']) > 10) {
        $errors['tags'] = 'Use at most 10 tags, each 30 characters or fewer.';
    } else {
        foreach ($values['tags'] as $tag) {
            if (!is_string($tag) || mb_strlen(trim($tag)) > 30 || trim($tag) === '') {
                $errors['tags'] = 'Tags must contain 1–30 characters.';
                continue;
            }
            $tags[] = mb_strtolower(trim($tag));
        }
    }
    $mode = $values['reminder_mode'];
    $date = null;
    $time = null;
    if (!in_array($mode, ['none', 'due_date', 'day_before', 'custom'], true)) $errors['reminder_mode'] = 'Choose a valid reminder.';
    if ($mode === 'due_date' || $mode === 'day_before') {
        if (!$task['due_date']) $errors['reminder_mode'] = 'Set a due date for this reminder.';
        else {
            $parsed = DateTimeImmutable::createFromFormat('!Y-m-d', $task['due_date']);
            if ($parsed) $date = ($mode === 'day_before' ? $parsed->modify('-1 day') : $parsed)->format('Y-m-d');
        }
    } elseif ($mode === 'custom') {
        $date = $values['reminder_date'];
        $parsed = is_string($date) ? DateTimeImmutable::createFromFormat('!Y-m-d', $date) : false;
        if (!$parsed || $parsed->format('Y-m-d') !== $date) $errors['reminder_date'] = 'Enter a valid reminder date.';
    }
    if ($mode !== 'none') {
        $time = in_array($mode, ['due_date', 'day_before'], true) ? ($task['due_time'] ?? '') : ($values['reminder_time'] ?: '09:00');
        if (!is_string($time) || !preg_match('/^(?:[01][0-9]|2[0-3]):[0-5][0-9](?::00)?$/', $time)) $errors['reminder_time'] = 'Enter a valid reminder time.';
        else $time = substr($time, 0, 5) . ':00';
    }
    return [['category' => $category, 'tags' => array_values(array_unique($tags)), 'reminder_mode' => $mode, 'reminder_date' => $date, 'reminder_time' => $time], $errors];
}

function enrich_tasks(PDO $db, array $tasks, int $userId): array
{
    if (!$tasks) return [];
    $tags = $db->prepare('SELECT tt.task_id, tt.tag FROM task_tags tt JOIN tasks t ON t.id = tt.task_id WHERE t.user_id = ? ORDER BY tt.tag');
    $tags->execute([$userId]);
    $tagMap = [];
    foreach ($tags as $row) $tagMap[$row['task_id']][] = $row['tag'];
    $activity = $db->prepare('SELECT a.* FROM task_activity a JOIN tasks t ON t.id = a.task_id WHERE t.user_id = ? AND a.user_id = ? ORDER BY a.created_at DESC, a.id DESC');
    $activity->execute([$userId, $userId]);
    $activityMap = [];
    foreach ($activity as $row) $activityMap[$row['task_id']][] = $row;
    $subtasks = $db->prepare('SELECT s.* FROM task_subtasks s JOIN tasks t ON t.id = s.task_id WHERE t.user_id = ? ORDER BY s.id');
    $subtasks->execute([$userId]);
    $subtaskMap = [];
    foreach ($subtasks as $row) {
        $row['is_completed'] = (bool) $row['is_completed'];
        $subtaskMap[$row['task_id']][] = $row;
    }
    foreach ($tasks as &$task) {
        $task['is_pinned'] = (bool) $task['is_pinned'];
        $task['subtasks'] = $subtaskMap[$task['id']] ?? [];
        $task['tags'] = $tagMap[$task['id']] ?? [];
        $task['activity'] = $activityMap[$task['id']] ?? [];
    }
    return $tasks;
}

function save_task_tags(PDO $db, int $taskId, array $tags): void
{
    $db->prepare('DELETE FROM task_tags WHERE task_id = ?')->execute([$taskId]);
    $insert = $db->prepare('INSERT INTO task_tags (task_id, tag) VALUES (?, ?)');
    foreach ($tags as $tag) $insert->execute([$taskId, $tag]);
}

function log_task_activity(PDO $db, int $taskId, int $userId, array $task, ?array $old = null): void
{
    $events = [];
    if ($old === null) $events['created'] = 'Task created';
    else {
        if ($old['status'] !== $task['status']) {
            if ($task['status'] === 'Completed') $events['completed'] = 'Task marked as Completed';
            elseif ($old['status'] === 'Completed') $events['reopened'] = 'Task reopened as ' . $task['status'];
            else $events['status_changed'] = 'Status changed from ' . $old['status'] . ' to ' . $task['status'];
        }
        if ($old['due_date'] !== $task['due_date'] || $old['due_time'] !== $task['due_time']) $events['due_date_changed'] = $task['due_date'] ? 'Due date changed to ' . (new DateTimeImmutable($task['due_date'] . ' ' . $task['due_time']))->format('M j, Y, g:i A') : 'Due date removed';
    }
    $insert = $db->prepare('INSERT INTO task_activity (task_id, user_id, action, description) VALUES (?, ?, ?, ?)');
    foreach ($events as $action => $description) $insert->execute([$taskId, $userId, $action, $description]);
}
