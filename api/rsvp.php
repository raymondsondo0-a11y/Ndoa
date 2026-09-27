<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success'=>false,'message'=>'Method not allowed']);
    exit;
}

$name = trim((string)($_POST['name'] ?? ''));
$guests = (int)($_POST['guests'] ?? 0);
$attendance = trim((string)($_POST['attendance'] ?? ''));
$message = trim((string)($_POST['message'] ?? ''));

if ($name === '' || mb_strlen($name) > 120 || $guests < 1 || $guests > 10 || $attendance === '') {
    http_response_code(422);
    echo json_encode(['success'=>false,'message'=>'Please provide valid RSVP details.']);
    exit;
}

$allowed = ['Joyfully, yes!', 'Sorry, I cannot make it'];
if (!in_array($attendance, $allowed, true)) {
    http_response_code(422);
    echo json_encode(['success'=>false,'message'=>'Invalid attendance selection.']);
    exit;
}

$entry = [
    'id' => bin2hex(random_bytes(8)),
    'name' => htmlspecialchars($name, ENT_QUOTES, 'UTF-8'),
    'guests' => $guests,
    'attendance' => $attendance,
    'message' => htmlspecialchars(mb_substr($message, 0, 1000), ENT_QUOTES, 'UTF-8'),
    'submitted_at' => gmdate('c'),
    'ip_hash' => hash('sha256', (string)($_SERVER['REMOTE_ADDR'] ?? 'unknown'))
];

$dir = dirname(__DIR__) . '/data';
$file = $dir . '/rsvps.json';

if (!is_dir($dir)) {
    @mkdir($dir, 0750, true);
}

$fp = @fopen($file, 'c+');
if (!$fp) {
    http_response_code(500);
    echo json_encode(['success'=>false,'message'=>'RSVP storage is unavailable.']);
    exit;
}

flock($fp, LOCK_EX);
$raw = stream_get_contents($fp);
$list = json_decode($raw ?: '[]', true);
if (!is_array($list)) $list = [];
$list[] = $entry;
ftruncate($fp, 0);
rewind($fp);
fwrite($fp, json_encode($list, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
fflush($fp);
flock($fp, LOCK_UN);
fclose($fp);

echo json_encode(['success'=>true,'message'=>'RSVP received.']);
