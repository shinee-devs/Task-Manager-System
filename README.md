# Task Manager System

A React/Vite frontend and PHP REST API for local development with WampServer. Session-based registration and login are implemented; task CRUD remains out of scope for this phase.

## Project layout

```text
frontend/
  src/
    components/   Shared Navbar and Sidebar
    pages/        Login, Register, Dashboard, and Tasks placeholders
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
    tasks/        Task endpoint placeholder
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

Open the URL Vite prints, normally `http://localhost:5173`. The routes are `/login`, `/register`, `/dashboard`, and `/tasks`.

## Database setup

In phpMyAdmin, select **Import**, choose `backend/database.sql`, and run the import. It creates the `task_manager` database and the `users` and `tasks` tables. The PDO defaults in `backend/config/database.php` use MySQL at `127.0.0.1:3306`, username `root`, and an empty password. Override them with `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD` if needed.

## Run the PHP backend with WampServer

This workspace is expected at `C:\\wamp\\www\\Task Manager System`. Start Apache and MySQL from the WampServer tray menu. The API health route is `http://localhost/Task%20Manager%20System/backend/public/api/health`; Apache's `mod_rewrite` must be enabled for the `.htaccess` routes. Use PHP 7.3 or newer; the PHP 5.3 binary currently present in this environment cannot run this project.

The frontend defaults to this workspace's API URL. If the folder or host differs, set `VITE_API_BASE_URL` in the frontend environment to the full `/backend/public/api` URL. CORS allows the Vite origins `http://localhost:5173` and `http://127.0.0.1:5173`; add any other frontend origin to `backend/config/cors.php`.

## Test authentication

Run `npm run dev` from `frontend` and open the Vite URL. Register with a name, email, and password of at least 8 characters; successful registration redirects to login with a confirmation message. Submit invalid values or register the same email twice to verify validation feedback. Log in to reach `/dashboard`, then refresh `/dashboard` or open `/tasks` directly to verify session persistence and route protection. Use **Log out** in the top bar, then try `/dashboard` and `/tasks` again; both should redirect to `/login`.

The API routes are `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, and `GET /api/auth/session`. They exchange JSON and use a PHP session cookie; frontend requests include credentials.

## Before task CRUD

Upgrade the local PHP runtime before end-to-end testing if it is still PHP 5.3. Task routes are still placeholders. Add authorization checks to each task query so users can access only their own rows, and configure deployment-specific database credentials and allowed CORS origins before publishing.