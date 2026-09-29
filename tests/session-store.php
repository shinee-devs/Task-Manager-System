<?php
declare(strict_types=1);

putenv('SESSION_DRIVER=database');
require_once __DIR__ . '/../backend/config/session.php';

start_app_session();
$sessionId = session_id();
$probe = bin2hex(random_bytes(16));
$_SESSION['session_store_probe'] = $probe;
session_write_close();

session_id($sessionId);
start_app_session();
$persistedProbe = $_SESSION['session_store_probe'] ?? null;
session_destroy();

if ($persistedProbe !== $probe) {
    throw new RuntimeException('Database-backed PHP session did not persist across requests.');
}

echo "Database-backed PHP session round-trip passed.\n";