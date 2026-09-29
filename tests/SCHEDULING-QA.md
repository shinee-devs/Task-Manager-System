# Scheduling and productivity QA

Verified September 29, 2026 against local Apache/PHP 8.3.28, MySQL 8.4.7 and Vite.

## Database

Applied `backend/migrations/003_task_scheduling.sql` locally after migrations 001 and 002. It adds `due_time` and `is_pinned`, removes the obsolete `priority` column, and creates owner-scoped `task_subtasks` through a cascading task foreign key. Existing dated tasks receive 23:59; due-relative reminders inherit that time. Historical activity descriptions are preserved. The complete fresh schema also passed import into a disposable database.

## Automated verification

- `python tests/scheduling-api.py`: exact due-time storage, relative reminder time, future/past notification eligibility, repeated-read and dismissed-reminder deduplication, pin persistence, subtask add/check/uncheck/delete, cross-user and cross-task ID rejection, invalid time validation, activity preservation, completion/reopening, CRUD and logout passed.
- `node tests/scheduling.mjs`: exact second before/at/after deadline, Manila display, completed exclusion, same-day time sorting, incomplete-pin ordering, combined filters and nonempty grouping passed.
- Updated Phase 7 API/filter regression scripts passed for categories, tags, history, custom reminders, authentication, ownership and search/filter/sort behavior. Their obsolete priority expectations were removed and dated creates now specify a time.
- All PHP files passed syntax checks. No current frontend or backend runtime code references priority.
- Production build passed; no application PHP errors found in the local PHP error log.

## Browser verification

- Created a task with Tomorrow shortcut, exact default time, category, tags and At Due Time reminder.
- Card has title/description, deadline text, subtle status, metadata and one Start/Complete/Reopen action. Secondary actions appear only in the three-dot disclosure.
- Tested Pin/Unpin, View Details, Edit, Next Week shortcut, Save, and Delete access. Escape closes the menu and returns focus to its trigger.
- Added two checklist items, checked one, observed “1 of 2 subtasks” on the card, and deleted an item.
- Start/Complete/Reopen worked; grouped completion moved to Completed and reopening restored Pinned. History and checklist progress survived.
- Reviewed 390×844 mobile card/checklist screenshots; no horizontal overflow. Desktop form/cards also reviewed.
- Browser error output was empty. Console showed only Vite/React development informational messages.

Screenshots: `scheduling-cards-desktop.png`, `scheduling-card-mobile.png`, `scheduling-checklist-mobile.png`, `scheduling-form-desktop.png`.

## Files changed this phase

- `backend/database.sql`
- `backend/migrations/003_task_scheduling.sql` (new)
- `backend/endpoints/tasks/index.php`
- `backend/tasks/common.php`, `create.php`, `update.php`, `organization.php`
- `backend/tasks/subtasks.php` (new)
- `backend/notifications/common.php`, `get.php`
- `frontend/src/components/TaskBadges.jsx`, `TaskCard.jsx`, `TaskDetails.jsx`, `TaskForm.jsx`, `NotificationItem.jsx`
- `frontend/src/components/SubtaskChecklist.jsx` (new)
- `frontend/src/hooks/useDeadlineClock.js` (new)
- `frontend/src/lib/taskUtils.js`, `tasks.js`
- `frontend/src/pages/Tasks.jsx`, `Dashboard.jsx`, `Notifications.jsx`
- `README.md`
- `tests/scheduling.mjs`, `scheduling-api.py`, this report and scheduling screenshots (new)
- `tests/phase7-api.py`, `phase7-filters.mjs`

## Intentional behavior

All scheduling is Manila time (UTC+8), including when the browser runs in another timezone. Due-relative reminders use the task's exact time; custom reminders use their own time. Delivery still happens on normal authenticated reads, so a closed app delivers missed reminders on the next visit. Existing due-today notices announce the day; overdue notices require the exact deadline to have passed. Completed tasks are excluded from generated reminders.

Pinned incomplete tasks appear first within the filtered results; grouping gives them their own first section. Completing all subtasks does not automatically complete the parent. Deadline clocks update labels locally without polling the API or creating background workers.

No commit, push or deployment was performed.
