<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    http_response_code(405);

    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed.'
    ]);

    exit;
}

try {
    $body = json_decode(
        file_get_contents('php://input'),
        true
    );

    if (
        !is_array($body) ||
        !is_string($body['username'] ?? null) ||
        !is_string($body['password'] ?? null)
    ) {
        http_response_code(400);

        echo json_encode([
            'success' => false,
            'error' => 'Username and password are required.'
        ]);

        exit;
    }

    $username = trim($body['username']);
    $password = $body['password'];

    if (
        $username === '' ||
        $password === '' ||
        strlen($username) > 191 ||
        strlen($password) > 4096
    ) {
        http_response_code(400);

        echo json_encode([
            'success' => false,
            'error' => 'Invalid login information.'
        ]);

        exit;
    }

    $db = getDatabaseConnection();

    $ipAddress = $_SERVER['REMOTE_ADDR'] ?? 'unknown';

    $db->exec(
        'DELETE FROM staff_login_attempts
         WHERE attempted_at <
               UTC_TIMESTAMP() - INTERVAL 15 MINUTE'
    );

    $limitQuery = $db->prepare(
        'SELECT
            COALESCE(
                SUM(username = ? AND ip_address = ?),
                0
            ) AS pair_attempts,

            COALESCE(
                SUM(username = ?),
                0
            ) AS username_attempts,

            COALESCE(
                SUM(ip_address = ?),
                0
            ) AS ip_attempts

         FROM staff_login_attempts

         WHERE attempted_at >=
               UTC_TIMESTAMP() - INTERVAL 15 MINUTE

           AND (username = ? OR ip_address = ?)'
    );

    $limitQuery->execute([
        $username,
        $ipAddress,
        $username,
        $ipAddress,
        $username,
        $ipAddress
    ]);

    $attempts = $limitQuery->fetch(PDO::FETCH_ASSOC);

    if (
        (int) $attempts['pair_attempts'] >= 5 ||
        (int) $attempts['username_attempts'] >= 10 ||
        (int) $attempts['ip_attempts'] >= 20
    ) {
        http_response_code(429);
        header('Retry-After: 900');

        echo json_encode([
            'success' => false,
            'error' =>
                'Too many login attempts. Please try again later.'
        ]);

        exit;
    }

    $statement = $db->prepare(
        'SELECT id, username, password_hash
         FROM staff_accounts
         WHERE username = ?
         LIMIT 1'
    );

    $statement->execute([$username]);
    $staff = $statement->fetch(PDO::FETCH_ASSOC);

    if (
        !$staff ||
        !password_verify(
            $password,
            $staff['password_hash']
        )
    ) {
        $recordAttempt = $db->prepare(
            'INSERT INTO staff_login_attempts
                (username, ip_address, attempted_at)
             VALUES (?, ?, UTC_TIMESTAMP())'
        );

        $recordAttempt->execute([
            $username,
            $ipAddress
        ]);

        http_response_code(401);

        echo json_encode([
            'success' => false,
            'error' => 'Invalid username or password.'
        ]);

        exit;
    }

    $clearAttempts = $db->prepare(
        'DELETE FROM staff_login_attempts
         WHERE username = ?
           AND ip_address = ?'
    );

    $clearAttempts->execute([
        $username,
        $ipAddress
    ]);

    startStaffSession();

    $_SESSION = [];

    session_regenerate_id(true);

    $_SESSION['last_activity'] = time();

    $_SESSION['staff_id'] = (int) $staff['id'];
    $_SESSION['staff_username'] = $staff['username'];

    echo json_encode([
        'success' => true,
        'staff' => [
            'id' => (int) $staff['id'],
            'username' => $staff['username']
        ]
    ]);

    exit;

} catch (Throwable $exception) {
    error_log($exception->getMessage());

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'error' => 'Unable to process login.'
    ]);
}