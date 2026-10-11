<?php
// Dummy availability check: replace the arrays with a MySQL query later.
header('Content-Type: application/json');

$field = $_GET['field'] ?? '';
$value = strtolower(trim($_GET['value'] ?? ''));

$taken = [
    'username' => ['admin', 'subha', 'test', 'user123'],
    'email'    => ['admin@example.com', 'test@example.com'],
];

if (!isset($taken[$field]) || $value === '') {
    http_response_code(400);
    echo json_encode(['exists' => false, 'message' => 'Invalid request.']);
    exit;
}

$exists = in_array($value, $taken[$field], true);
$label  = ucfirst($field);
echo json_encode([
    'exists'  => $exists,
    'message' => $exists ? "$label is already taken." : "$label is available.",
]);
