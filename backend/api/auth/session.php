<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

require_once __DIR__ . '/../../config/auth.php';

startStaffSession();

if (empty($_SESSION['staff_id'])) {
    http_response_code(401);

    echo json_encode([
        'success' => false,
        'authenticated' => false
    ]);

    exit;
}

echo json_encode([
    'success' => true,
    'authenticated' => true,
    'staff' => [
        'id' => $_SESSION['staff_id'],
        'username' => $_SESSION['staff_username']
    ]
]);
