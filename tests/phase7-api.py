"""Local integration QA; creates disposable accounts. Run against a migrated database."""
import http.cookiejar
import json
import urllib.request
import urllib.error
import uuid
from datetime import datetime

BASE = 'http://localhost/Task%20Manager%20System/backend/public/api'

def client():
    return urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))

def request(c, path, method='GET', body=None, expected=200):
    req = urllib.request.Request(BASE + path, data=json.dumps(body).encode() if body is not None else None,
                                 headers={'Content-Type': 'application/json'}, method=method)
    try:
        response = c.open(req)
    except urllib.error.HTTPError as error:
        response = error
    data = json.loads(response.read())
    assert response.code == expected, (path, response.code, data)
    return data.get('data', data)

a, b = client(), client()
emails = []
for c in [a, b]:
    email = 'phase7-' + uuid.uuid4().hex + '@example.test'
    emails.append(email)
    request(c, '/auth/register', 'POST', {'name': 'Phase 7 QA', 'email': email, 'password': 'Phase7-Test-Password!'}, 201)
    request(c, '/auth/login', 'POST', {'email': email, 'password': 'Phase7-Test-Password!'})

today = datetime.now().strftime('%Y-%m-%d')
task = request(a, '/tasks/create', 'POST', {'title': 'Phase 7 report', 'category': 'Work', 'tags': ['urgent', 'URGENT', ' report '], 'due_date': today, 'due_time': '17:00', 'reminder_mode': 'custom', 'reminder_date': '2020-01-01', 'reminder_time': '09:00'}, 201)['task']
tid = task['id']
assert task['category'] == 'Work' and sorted(task['tags']) == ['report', 'urgent']
assert [e['action'] for e in task['activity']] == ['created']
for body, action in [({'status': 'In Progress'}, 'status_changed'), ({'due_date': '2026-10-05'}, 'due_date_changed'), ({'status': 'Completed'}, 'completed'), ({'status': 'To Do'}, 'reopened')]:
    task = request(a, '/tasks/update', 'PUT', {'id': tid, **body})['task']
    assert task['activity'][0]['action'] == action
assert task['category'] == 'Work' and len(task['tags']) == 2
count = len(task['activity'])
task = request(a, '/tasks/update', 'PUT', {'id': tid, 'title': 'Text edit'})['task']
assert len(task['activity']) == count
assert request(b, '/tasks/get')['tasks'] == []
request(b, '/tasks/update', 'PUT', {'id': tid, 'status': 'Completed'}, 404)
request(b, '/tasks/delete', 'DELETE', {'id': tid}, 404)
request(client(), '/tasks/get', expected=401)
for body in [{'category': 'Invalid'}, {'tags': ['x' * 31]}, {'reminder_mode': 'custom', 'reminder_date': '2026-02-30'}, {'reminder_time': '25:00'}]:
    request(a, '/tasks/update', 'PUT', {'id': tid, **body}, 422)
for _ in range(3):
    notifications = request(a, '/notifications/get')['notifications']
    reminders = [n for n in notifications if n['type'] == 'reminder']
    assert len(reminders) == 1
nid = reminders[0]['id']
request(b, '/notifications/delete', 'DELETE', {'id': nid}, 404)
request(a, '/notifications/delete', 'DELETE', {'id': nid})
assert not [n for n in request(a, '/notifications/get')['notifications'] if n['type'] == 'reminder']
task = request(a, '/tasks/update', 'PUT', {'id': tid, 'reminder_mode': 'day_before', 'due_date': '2026-10-05'})['task']
assert task['reminder_date'] == '2026-10-04'
task = request(a, '/tasks/update', 'PUT', {'id': tid, 'due_date': '2026-10-06'})['task']
assert task['reminder_date'] == '2026-10-05'
task = request(a, '/tasks/update', 'PUT', {'id': tid, 'reminder_mode': 'none', 'tags': [], 'category': None})['task']
assert task['reminder_date'] is None and task['reminder_time'] is None and task['tags'] == []
request(a, '/tasks/update', 'PUT', {'id': tid, 'reminder_mode': 'custom', 'reminder_date': '2099-01-01'})
assert not [n for n in request(a, '/notifications/get')['notifications'] if n['type'] == 'reminder']
request(a, '/tasks/update', 'PUT', {'id': tid, 'status': 'Completed', 'reminder_date': '2020-01-02'})
assert not [n for n in request(a, '/notifications/get')['notifications'] if n['type'] == 'reminder']
request(a, '/tasks/update', 'PUT', {'id': tid, 'status': 'To Do'})
assert len([n for n in request(a, '/notifications/get')['notifications'] if n['type'] == 'reminder']) == 1
request(a, '/tasks/delete', 'DELETE', {'id': tid})
assert request(a, '/tasks/get')['tasks'] == []
request(a, '/auth/logout', 'POST')
request(a, '/tasks/get', expected=401)
print('PASS: categories, tags, activity, reminders, dedupe after dismissal, ownership, validation, CRUD and authentication')
print('Disposable accounts: ' + ', '.join(emails))
