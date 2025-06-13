<?php
header('Content-Type: application/json');

// Read and decode JSON input.
$data = json_decode(file_get_contents("php://input"), true);
if (!$data || empty($data['email']) || empty($data['newPassword'])) {
    echo json_encode([
        'success' => false, 
        'message' => 'Email and new password are required.'
    ]);
    exit;
}

$email = trim($data['email']);
$newPassword = $data['newPassword'];

// Connect to the database.
$host = "localhost";
$dbUser = "root"; // Adjust as needed
$dbPassword = ""; // Adjust as needed
$database = "autoelite";

$conn = new mysqli($host, $dbUser, $dbPassword, $database);
if ($conn->connect_error) {
    echo json_encode([
        'success' => false, 
        'message' => 'Database connection failed: ' . $conn->connect_error
    ]);
    exit;
}

// Prepare and execute the update query.
$stmt = $conn->prepare("UPDATE users SET password = ? WHERE email = ?");
if (!$stmt) {
    echo json_encode([
        'success' => false, 
        'message' => 'Prepare statement failed: ' . $conn->error
    ]);
    $conn->close();
    exit;
}

$stmt->bind_param("ss", $newPassword, $email);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    echo json_encode([
        'success' => true, 
        'message' => 'Password reset successful.'
    ]);
} else {
    echo json_encode([
        'success' => false, 
        'message' => 'Password reset failed. Please check that the email address is registered.'
    ]);
}

$stmt->close();
$conn->close();
exit;
?>