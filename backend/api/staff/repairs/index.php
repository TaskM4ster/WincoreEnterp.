<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/auth.php';


requireStaff();


if (
    in_array(
        $_SERVER['REQUEST_METHOD'],
        ['POST', 'PUT', 'DELETE'],
        true
    )
) {
    requireStaffCsrf();
}


function respond(int $status, array $data): void
{
    http_response_code($status);
    echo json_encode($data);
    exit;
}

function readBody(): array
{
    $body = json_decode(
        file_get_contents('php://input'),
        true
    );

    if (!is_array($body)) {
        respond(400, [
            'success' => false,
            'error' => 'Invalid JSON request.'
        ]);
    }

    return $body;
}

function validateRepair(array $data): array
{
    $fields = [
        'customerName',
        'contactNumber',
        'gadgetType',
        'brand',
        'model',
        'issue'
    ];

    $clean = [];

    foreach ($fields as $field) {
        if (
            !isset($data[$field]) ||
            !is_string($data[$field]) ||
            trim($data[$field]) === ''
        ) {
            respond(422, [
                'success' => false,
                'error' => "Invalid or missing field: $field"
            ]);
        }

        $clean[$field] = trim($data[$field]);
    }

    if (!preg_match('/^09[0-9]{9}$/', $clean['contactNumber'])) {
        respond(422, [
            'success' => false,
            'error' => 'Enter a valid 11-digit contact number.'
        ]);
    }

    $types = [
        'Smartphone',
        'Laptop',
        'Tablet',
        'Desktop',
        'Other'
    ];

    if (!in_array($clean['gadgetType'], $types, true)) {
        respond(422, [
            'success' => false,
            'error' => 'Invalid gadget type.'
        ]);
    }

    return $clean;
}

try {
    $db = getDatabaseConnection();
    $method = $_SERVER['REQUEST_METHOD'];

    // READ
    if ($method === 'GET') {
        $stmt = $db->query(
            'SELECT * FROM repairs ORDER BY id DESC'
        );

        respond(200, [
            'success' => true,
            'data' => $stmt->fetchAll()
        ]);
    }

    // CREATE
    if ($method === 'POST') {
        $data = validateRepair(readBody());

        $db->beginTransaction();

        $stmt = $db->prepare(
            'INSERT INTO repairs (
                tracking_number,
                customer_name,
                contact_number,
                gadget_type,
                brand,
                model,
                issue,
                date_received,
                status
            ) VALUES (
                :tracking,
                :customer,
                :contact,
                :type,
                :brand,
                :model,
                :issue,
                CURDATE(),
                :status
            )'
        );

        // Temporary unique tracking code.
        // We'll finalize the format before deployment.
        $tracking = 'FIX-' . date('Y') . '-' .
            strtoupper(bin2hex(random_bytes(6)));

        $stmt->execute([
            'tracking' => $tracking,
            'customer' => $data['customerName'],
            'contact' => $data['contactNumber'],
            'type' => $data['gadgetType'],
            'brand' => $data['brand'],
            'model' => $data['model'],
            'issue' => $data['issue'],
            'status' => 'Pending'
        ]);

        $id = (int) $db->lastInsertId();

        $stmt = $db->prepare(
            'SELECT * FROM repairs WHERE id = ?'
        );

        $stmt->execute([$id]);
        $repair = $stmt->fetch();

        $db->commit();

        respond(201, [
            'success' => true,
            'data' => $repair
        ]);
    }

    // UPDATE
    if ($method === 'PUT') {
        $body = readBody();

        $id = filter_var(
            $body['id'] ?? null,
            FILTER_VALIDATE_INT
        );

        if (!$id || $id < 1) {
            respond(422, [
                'success' => false,
                'error' => 'Invalid repair ID.'
            ]);
        }

        $data = validateRepair($body);

        $statuses = [
            'Pending',
            'Under Repair',
            'Ready for Pickup',
            'Claimed'
        ];

        $status = $body['status'] ?? '';

        if (!in_array($status, $statuses, true)) {
            respond(422, [
                'success' => false,
                'error' => 'Invalid repair status.'
            ]);
        }

        $stmt = $db->prepare(
            'UPDATE repairs SET
                customer_name = :customer,
                contact_number = :contact,
                gadget_type = :type,
                brand = :brand,
                model = :model,
                issue = :issue,
                status = :status
             WHERE id = :id'
        );

        $stmt->execute([
            'customer' => $data['customerName'],
            'contact' => $data['contactNumber'],
            'type' => $data['gadgetType'],
            'brand' => $data['brand'],
            'model' => $data['model'],
            'issue' => $data['issue'],
            'status' => $status,
            'id' => $id
        ]);

        $stmt = $db->prepare(
            'SELECT * FROM repairs WHERE id = ?'
        );

        $stmt->execute([$id]);
        $repair = $stmt->fetch();

        if (!$repair) {
            respond(404, [
                'success' => false,
                'error' => 'Repair record not found.'
            ]);
        }

        respond(200, [
            'success' => true,
            'data' => $repair
        ]);
    }

    // DELETE
    if ($method === 'DELETE') {
        $body = readBody();

        $id = filter_var(
            $body['id'] ?? null,
            FILTER_VALIDATE_INT
        );

        if (!$id || $id < 1) {
            respond(422, [
                'success' => false,
                'error' => 'Invalid repair ID.'
            ]);
        }

        $stmt = $db->prepare(
            'DELETE FROM repairs WHERE id = ?'
        );

        $stmt->execute([$id]);

        if ($stmt->rowCount() === 0) {
            respond(404, [
                'success' => false,
                'error' => 'Repair record not found.'
            ]);
        }

        respond(200, [
            'success' => true,
            'message' => 'Repair deleted successfully.'
        ]);
    }

    header('Allow: GET, POST, PUT, DELETE');

    respond(405, [
        'success' => false,
        'error' => 'Method not allowed.'
    ]);

} catch (Throwable $exception) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }

    error_log($exception->getMessage());

    respond(500, [
        'success' => false,
        'error' => 'An unexpected server error occurred.'
    ]);
}
