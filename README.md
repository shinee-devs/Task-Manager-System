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

For a fresh database, import `backend/database.sql` through phpMyAdmin. For an existing database, select `task_manager`, choose **Import**, and run `backend/migrations/001_create_notifications.sql`. The PDO defaults in `backend/config/database.php` use MySQL at `127.0.0.1:3306`, username `root`, and an empty password. Override them with `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD` if needed.

## Run the PHP backend

Place the project under the Apache document root (`www` in WampServer or `htdocs` in XAMPP), then start Apache and MySQL. The API health route is `http://localhost/Task%20Manager%20System/backend/public/api/health`; Apache's `mod_rewrite` must be enabled for the `.htaccess` routes. Use PHP 7.3 or newer with PDO MySQL and mbstring enabled.

The frontend defaults to this workspace's API URL. If the folder or host differs, set `VITE_API_BASE_URL` in the frontend environment to the full `/backend/public/api` URL. CORS allows the Vite origins `http://localhost:5173` and `http://127.0.0.1:5173`; add any other frontend origin to `backend/config/cors.php`.

## Test authentication

Run `npm run dev` from `frontend` and open the Vite URL. Register with a name, email, and password of at least 8 characters; successful registration redirects to login with a confirmation message. Submit invalid values or register the same email twice to verify validation feedback. Log in to reach `/dashboard`, then refresh a protected route to verify session persistence. Use **Log out** in the sidebar/drawer, then try a protected route again; it should redirect to `/login`.

The API auth routes are `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, and `GET /api/auth/session`. They exchange JSON and use a PHP session cookie; frontend requests include credentials.

Task routes require that session: `GET /api/tasks/get`, `POST /api/tasks/create`, `PUT /api/tasks/update`, and `DELETE /api/tasks/delete`. Create accepts `title`, `description`, `priority`, `status`, and optional `due_date`. Update and delete accept the task `id` in the JSON body. Every task query is scoped to the authenticated user.

Notification routes require the same session: `GET /api/notifications/get`, `POST /api/notifications/mark-read`, `POST /api/notifications/mark-all-read`, and `DELETE /api/notifications/delete`. IDs for mark-read/delete are JSON body fields. Every notification operation is scoped to the authenticated user.

Profile routes require the session: `GET /api/profile/get`, `PUT /api/profile/update` (name only), and `POST /api/profile/change-password`. Password changes verify the current password and store a password hash; email addresses are read-only.

The Dashboard shows signed-in user statistics, completion progress, a status breakdown, and five newest tasks. The light theme shares semantic badge colors and visible focus styles across task cards, details, recent tasks, and notifications. Due reminders are generated during authenticated reads with per-user/date deduplication; completion reminders fire on the transition into Completed. The responsive notification bell/page support read/unread actions. Tasks include title search, combined filters, sorting, quick status changes, and details. Profile supports name and password updates. The interface respects reduced-motion preferences; dark mode and drag-and-drop are not implemented. Configure deployment-specific database credentials and allowed CORS origins before publishing.