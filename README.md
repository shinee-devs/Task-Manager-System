# Task Manager System

A React/Vite frontend and PHP REST API for local development with WampServer or XAMPP. Session-based authentication and owner-scoped task CRUD are implemented.

## Project layout

```text
frontend/
  src/
    components/   Navigation, task cards/forms/details, notifications, and feedback
    hooks/        Shared keyboard dialog behavior
    lib/          API clients, profile helpers, and task utilities
    pages/        Login, Register, Dashboard, Tasks, Notifications, and Profile
    App.jsx       React Router routes and workspace layout
    main.jsx      React entry point
    styles.css    Tailwind import and base styles
  index.html
  package.json
  vite.config.js
backend/
  auth/           Registration, login, logout, and session handlers
  config/         PDO, CORS, JSON response, and session helpers
  database.sql    Importable MySQL schema
  endpoints/
    auth/         Auth route dispatcher
    tasks/        Task route dispatcher
    notifications/ Notification route dispatcher
    profile/      Profile route dispatcher
  tasks/          Session-protected task CRUD handlers
  notifications/ Session-protected notification handlers
  profile/        Session-protected profile and password handlers
  migrations/    SQL updates for existing databases
  public/
    .htaccess     Apache front-controller rewrite
    index.php     API router and health response
```

## Run the frontend

Install Node.js, then from the project root run:

```powershell
cd frontend
npm install
npm run dev
```

Open the URL Vite prints, normally `http://localhost:5173`. The default API URL follows the frontend hostname so the PHP session cookie stays on the same host. The routes are `/login`, `/register`, `/dashboard`, `/tasks`, `/notifications`, and `/profile`.

## Database setup

Scheduling update: after migration 002, apply `backend/migrations/003_task_scheduling.sql` once. It adds due time, pins and subtasks, and drops the obsolete priority column. Existing dated tasks migrate to 23:59 Manila time. Fresh installs use the complete `backend/database.sql` only.

Phase 7: existing databases must apply `backend/migrations/002_task_organization.sql` once after migration 001. Fresh databases should import `backend/database.sql` only; do not then run migrations 002 or 003.

For a fresh database, import `backend/database.sql` through phpMyAdmin. For an existing database, select `task_manager`, choose **Import**, and run `backend/migrations/001_create_notifications.sql`. The PDO defaults in `backend/config/database.php` use MySQL at `127.0.0.1:3306`, username `root`, and an empty password. Override them with `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD` if needed.

## Run the PHP backend

Place the project under the Apache document root (`www` in WampServer or `htdocs` in XAMPP), then start Apache and MySQL. The API health route is `http://localhost/Task%20Manager%20System/backend/public/api/health`; Apache's `mod_rewrite` must be enabled for the `.htaccess` routes. Use PHP 7.3 or newer with PDO MySQL and mbstring enabled.

The frontend defaults to this workspace's API URL. If the folder or host differs, set `VITE_API_BASE_URL` in the frontend environment to the full `/backend/public/api` URL. CORS allows the Vite origins `http://localhost:5173` and `http://127.0.0.1:5173`; add any other frontend origin to `backend/config/cors.php`.

## Test authentication

Run `npm run dev` from `frontend` and open the Vite URL. Register with a name, email, and password of at least 8 characters; successful registration redirects to login with a confirmation message. Submit invalid values or register the same email twice to verify validation feedback. Log in to reach `/dashboard`, then refresh a protected route to verify session persistence. Use **Log out** in the sidebar/drawer, then try a protected route again; it should redirect to `/login`.

The API auth routes are `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, and `GET /api/auth/session`. They exchange JSON and use a PHP session cookie; frontend requests include credentials.

Task routes require that session: `GET /api/tasks/get`, `POST /api/tasks/create`, `PUT /api/tasks/update`, and `DELETE /api/tasks/delete`. Create accepts `title`, `description`, `status`, and optional `due_date`. Update and delete accept the task `id` in the JSON body. Every task query is scoped to the authenticated user.

Notification routes require the same session: `GET /api/notifications/get`, `POST /api/notifications/mark-read`, `POST /api/notifications/mark-all-read`, and `DELETE /api/notifications/delete`. IDs for mark-read/delete are JSON body fields. Every notification operation is scoped to the authenticated user.

Profile routes require the session: `GET /api/profile/get`, `PUT /api/profile/update` (name only), and `POST /api/profile/change-password`. Password changes verify the current password and store a password hash; email addresses are read-only.

The Dashboard shows signed-in user statistics, completion progress, a status breakdown, and five newest tasks. The light theme shares semantic badge colors and visible focus styles across task cards, details, recent tasks, and notifications. Due reminders are generated during authenticated reads with per-user/date deduplication; completion reminders fire on the transition into Completed. The responsive notification bell/page support read/unread actions. Tasks include title search, combined filters, sorting, quick status changes, and details. Profile supports name and password updates. The interface respects reduced-motion preferences; dark mode and drag-and-drop are not implemented. Configure deployment-specific database credentials and allowed CORS origins before publishing.

## Phase 7: organization, activity, and reminders

Tasks accept optional `category` (`Personal`, `School`, `Work`, `Other`, or null), `tags` (up to 10 unique lowercase strings, 1-30 characters each), and reminder fields. Tags use a normalized `task_tags` table. Responses include tags and newest-first activity scoped to the authenticated owner.

Reminder fields: `reminder_mode` (`none`, `due_date`, `day_before`, `custom`), `reminder_date` (`YYYY-MM-DD`), and `reminder_time` (`HH:mm`, default 09:00). PHP computes due-relative dates and recalculates them after due-date edits. Removing a due date requires changing its relative reminder to None or Custom. Times use Asia/Manila consistently in the API and browser.

Authenticated task and notification reads generate eligible reminders, including missed reminders on the next visit. Completed tasks are excluded. A transactional delivery ledger prevents duplicate delivery even after notification deletion. A different reminder date/time permits a new delivery; returning to an already-delivered schedule does not. Existing automatic due-today, overdue, and completion notifications remain separate from optional reminders. No background scheduler is used.

Task Details includes category, tags, reminder, dates, and activity. Creation, status transitions (including completion/reopening), due-date changes are logged atomically with updates. Existing tasks begin with empty history; historical events are not invented.

Upcoming tasks offers Today, Tomorrow, and Next 7 Days (today through seven days ahead, inclusive), excludes completed tasks, and combines with all filters. Dashboard Upcoming Deadlines shows up to five incomplete tasks from today onward, nearest deadline first.

QA: `python tests/phase7-api.py` uses local Apache/MySQL and creates disposable QA accounts; `node tests/phase7-filters.mjs` checks filtering and date boundaries. See `tests/PHASE7-QA.md` for results and changed files.


## Exact scheduling and productivity

Tasks use optional `due_date` plus `due_time` (24-hour `HH:mm` input; `HH:mm:ss` responses), both in Manila time (UTC+8). A dated task requires a valid time; clearing the date clears the time. New forms default to 17:00 and offer Today, Tomorrow and Next Week shortcuts. A task is overdue strictly after its deadline, never just because the calendar date has arrived. Due-relative reminders follow the task time; the day-before option uses the same clock time on the previous day. Custom reminders retain their independent date/time. As before, notifications are generated on authenticated reads, not by a background service.

Priority is removed from the current schema, requests, UI, filters, and sorting. Past audit descriptions are retained as history. Cards show one deadline badge, subtle status, and one Start/Complete/Reopen button; View Details, Edit, Pin/Unpin and Delete live in the three-dot disclosure. Escape, outside click and focus departure close it.

`is_pinned` is an optional boolean. Incomplete pinned tasks sort ahead of other filtered results. Optional deadline grouping adds a Pinned section first, then nonempty Overdue, Today, Upcoming, No deadline and Completed sections. Sorting applies within each section. Completion updates the task in place without reloading the list and shows a small toast.

Task Details contains a checklist. `POST /api/tasks/subtasks` accepts `task_id` and `action`: `add` with `title`, `set_completed` with `subtask_id` and boolean `is_completed`, or `delete` with `subtask_id`. Every action locks and verifies the owning task; subtask IDs must belong to that task. Checking all items does not automatically complete the parent. Completion/reopening preserves the checklist. Deleting a task cascades to its checklist.

Verification: `node tests/scheduling.mjs`, `python tests/scheduling-api.py`, and the updated Phase 7 regression scripts. See `tests/SCHEDULING-QA.md` for results and screenshots.
