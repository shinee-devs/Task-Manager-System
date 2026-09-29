<?php
declare(strict_types=1);

function start_app_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    $sessionDriver = getenv('SESSION_DRIVER');
    if ($sessionDriver === false || $sessionDriver === '') {
        $sessionDriver = getenv('VERCEL') ? 'database' : 'files';
    }

    if ($sessionDriver === 'database') {
        require_once __DIR__ . '/database_session_handler.php';
        session_set_save_handler(new DatabaseSessionHandler(), true);
    }

    $forwardedProtocol = strtolower(trim(explode(',', $_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '')[0]));
    $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || $forwardedProtocol === 'https';

    session_set_cookie_params([
        'httponly' => true,
        'secure' => $isHttps,
        'samesite' => 'Lax',
        'path' => '/',
    ]);
    session_start();
}