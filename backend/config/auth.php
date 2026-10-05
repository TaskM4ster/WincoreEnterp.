<?php
declare(strict_types=1);

const STAFF_IDLE_TIMEOUT = 1800;

function startStaffSession(): void
{
    if (session_status() !== PHP_SESSION_ACTIVE) {
        ini_set('session.use_strict_mode', '1');
        ini_set('session.use_only_cookies', '1');

        ini_set('session.gc_maxlifetime', '3600');

        session_name('FIXTRACK_SESSION');

        session_set_cookie_params([
            'lifetime' => 0,
            'path' => '/',
            'secure' => !empty($_SERVER['HTTPS'])
                && $_SERVER['HTTPS'] !== 'off',
            'httponly' => true,
            'samesite' => 'Lax'
        ]);

        session_start();
    }

    if (!empty($_SESSION['staff_id'])) {
        $now = time();
        $lastActivity = $_SESSION['last_activity'] ?? null;

        $expired = !is_int($lastActivity)
            || ($now - $lastActivity) >= STAFF_IDLE_TIMEOUT;

        if ($expired) {
            $_SESSION = [];

            session_regenerate_id(true);

            return;
        }

        $_SESSION['last_activity'] = $now;
    }
}

function requireStaff(): void
{
    startStaffSession();

    if (empty($_SESSION['staff_id'])) {
        http_response_code(401);

        echo json_encode([
            'success' => false,
            'error' => 'Authentication required.'
        ]);

        exit;
    }
}

function getStaffCsrfToken(): string
{
    requireStaff();

    if (
        empty($_SESSION['csrf_token']) ||
        !is_string($_SESSION['csrf_token'])
    ) {
        $_SESSION['csrf_token'] = bin2hex(
            random_bytes(32)
        );
    }

    return $_SESSION['csrf_token'];
}

function requireStaffCsrf(): void
{
    requireStaff();

    $expected = $_SESSION['csrf_token'] ?? null;
    $provided = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';

    if (
        !is_string($expected) ||
        !is_string($provided) ||
        !hash_equals($expected, $provided)
    ) {
        http_response_code(403);

        echo json_encode([
            'success' => false,
            'error' => 'Invalid or missing CSRF token.'
        ]);

        exit;
    }
}