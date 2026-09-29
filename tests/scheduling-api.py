"""Exercises exact scheduling and owner-scoped checklists on local Apache/MySQL."""
import http.cookiejar, json, urllib.request, urllib.error, uuid
from datetime import datetime, timedelta, timezone

BASE = 'http://localhost/Task%20Manager%20System/backend/public/api'
def client():
    return urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
def req(c, path, method='GET', body=None, expected=200):
    r = urllib.request.Request(BASE + path, data=json.dumps(body).encode() if body is not None else None, headers={'Content-Type': 'application/json'}, method=method)
    try: response = c.open(r)
    except urllib.error.HTTPError as error: response = error
    data = json.loads(response.read())
    assert response.code == expected, (path, response.code, data)
    return data.get('data', data)

a, b = client(), client()
for c in [a, b]:
    email = 'schedule-qa-' + uuid.uuid4().hex + '@example.test'
    req(c, '/auth/register', 'POST', {'name': 'Scheduling QA', 'email': email, 'password': 'Scheduling-QA-2026!'}, 201)
    req(c, '/auth/login', 'POST', {'email': email, 'password': 'Scheduling-QA-2026!'})
    print('QA account:', email)
now = datetime.now(timezone(timedelta(hours=8)))
future = now + timedelta(hours=1)
past = now - timedelta(minutes=2)
task = req(a, '/tasks/create', 'POST', {'title': 'Scheduling QA', 'due_date': future.strftime('%Y-%m-%d'), 'due_time': future.strftime('%H:%M'), 'reminder_mode': 'due_date', 'category': 'Work', 'tags': ['Report', 'report']}, 201)['task']
tid = task['id']
assert task['due_time'] == future.strftime('%H:%M:00') and 'priority' not in task
assert task['reminder_time'] == task['due_time'] and task['tags'] == ['report']
assert not [n for n in req(a, '/notifications/get')['notifications'] if n['type'] in ['reminder', 'overdue']]
task = req(a, '/tasks/update', 'PUT', {'id': tid, 'is_pinned': True})['task']
assert task['is_pinned'] is True
task = req(a, '/tasks/subtasks', 'POST', {'task_id': tid, 'action': 'add', 'title': 'Research'})['task']
sid = task['subtasks'][0]['id']
for done in [True, False]:
    task = req(a, '/tasks/subtasks', 'POST', {'task_id': tid, 'action': 'set_completed', 'subtask_id': sid, 'is_completed': done})['task']
    assert task['subtasks'][0]['is_completed'] is done
req(b, '/tasks/subtasks', 'POST', {'task_id': tid, 'action': 'delete', 'subtask_id': sid}, 404)
req(b, '/tasks/subtasks', 'POST', {'task_id': tid, 'action': 'add', 'title': 'Intrusion'}, 404)
own = req(b, '/tasks/create', 'POST', {'title': 'Other owner'}, 201)['task']
req(b, '/tasks/subtasks', 'POST', {'task_id': own['id'], 'action': 'set_completed', 'subtask_id': sid, 'is_completed': True}, 404)
req(b, '/tasks/update', 'PUT', {'id': tid, 'is_pinned': True}, 404)
req(a, '/tasks/update', 'PUT', {'id': tid, 'due_time': '25:00'}, 422)
task = req(a, '/tasks/update', 'PUT', {'id': tid, 'due_date': past.strftime('%Y-%m-%d'), 'due_time': past.strftime('%H:%M')})['task']
assert task['activity'][0]['action'] == 'due_date_changed'
for _ in range(2):
    notices = req(a, '/notifications/get')['notifications']
    assert len([n for n in notices if n['type'] == 'reminder']) == 1
    assert len([n for n in notices if n['type'] == 'overdue']) == 1
notice = next(n for n in notices if n['type'] == 'reminder')
req(a, '/notifications/delete', 'DELETE', {'id': notice['id']})
assert not [n for n in req(a, '/notifications/get')['notifications'] if n['type'] == 'reminder']
for status in ['Completed', 'To Do']:
    task = req(a, '/tasks/update', 'PUT', {'id': tid, 'status': status})['task']
    assert task['subtasks'][0]['id'] == sid and task['is_pinned']
task = req(a, '/tasks/subtasks', 'POST', {'task_id': tid, 'action': 'delete', 'subtask_id': sid})['task']
assert task['subtasks'] == []
req(a, '/tasks/update', 'PUT', {'id': tid, 'reminder_mode': 'none', 'due_date': None})
assert next(t for t in req(a, '/tasks/get')['tasks'] if t['id'] == tid)['due_time'] is None
req(a, '/tasks/delete', 'DELETE', {'id': tid})
req(b, '/tasks/delete', 'DELETE', {'id': own['id']})
req(a, '/auth/logout', 'POST')
req(a, '/tasks/get', expected=401)
print('PASS: exact storage/reminders/overdue, no priority, pinning, checklist CRUD and isolation, history, notifications/dedupe, auth')
