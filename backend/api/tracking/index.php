<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

require_once __DIR__ . '/../../config/database.php';

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
    $db = getDatabaseConnection();

    // Do not trust client-supplied X-Forwarded-For headers.
    $ipAddress = $_SERVER['REMOTE_ADDR'] ?? 'unknown';

    $db->exec(
        'DELETE FROM customer_tracking_requests
         WHERE requested_at <
             UTC_TIMESTAMP() - INTERVAL 15 MINUTE'
    );

    $countStatement = $db->prepare(
        'SELECT COUNT(*)
         FROM customer_tracking_requests
         WHERE ip_address = ?
           AND requested_at >=
             UTC_TIMESTAMP() - INTERVAL 15 MINUTE'
    );

    $countStatement->execute([$ipAddress]);

    $requestCount = (int) $countStatement->fetchColumn();

    if ($requestCount >= 15) {
        http_response_code(429);
        header('Retry-After: 900');

        echo json_encode([
            'success' => false,
            'error' =>
                'Too many tracking requests. Please try again later.'
        ]);

        exit;
    }

    // Both successful and unsuccessful searches are counted.
    $recordStatement = $db->prepare(
        'INSERT INTO customer_tracking_requests
            (ip_address, requested_at)
         VALUES (?, UTC_TIMESTAMP())'
    );

    $recordStatement->execute([$ipAddress]);

    $body = json_decode(
        file_get_contents('php://input'),
        true
    );

    if (!is_array($body)) {
        http_response_code(400);

        echo json_encode([
            'success' => false,
            'error' => 'Invalid request.'
        ]);

        exit;
    }

    $tracking = $body['trackingNumber'] ?? null;
    $contactNumber = $body['contactNumber'] ?? null;

    if (
        !is_string($tracking) ||
        !is_string($contactNumber)
    ) {
        http_response_code(404);

        echo json_encode([
            'success' => false,
            'error' =>
                'Tracking information not found. Check your details.'
        ]);

        exit;
    }

    $tracking = strtoupper(trim($tracking));
    $contactNumber = trim($contactNumber);

    if (
        !preg_match(
            '/^FIX-[0-9]{4}-[A-Z0-9]{3,20}$/',
            $tracking
        ) ||
        !preg_match('/^[0-9]{11}$/', $contactNumber)
    ) {
        http_response_code(404);

        echo json_encode([
            'success' => false,
            'error' =>
                'Tracking information not found. Check your details.'
        ]);

        exit;
    }

    $statement = $db->prepare(
        'SELECT
            tracking_number,
            gadget_type,
            brand,
            model,
            date_received,
            status
         FROM repairs
         WHERE tracking_number = ?
           AND contact_number = ?
         LIMIT 1'
    );

    $statement->execute([
        $tracking,
        $contactNumber
    ]);

    $repair = $statement->fetch(PDO::FETCH_ASSOC);

    if (!$repair) {
        http_response_code(404);

        echo json_encode([
            'success' => false,
            'error' =>
                'Tracking information not found. Check your details.'
        ]);

        exit;
    }

    // Return only customer-safe information.
    echo json_encode([
        'success' => true,
        'data' => $repair
    ]);

} catch (Throwable $exception) {
    error_log($exception->getMessage());

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'error' => 'Unable to retrieve tracking information.'
    ]);
}