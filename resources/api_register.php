<?php
header("Content-Type: application/json");

// Only allow POST method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => true, 'message' => 'Only POST method is allowed.']);
    exit;
}

// Read JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Basic validation: require username, fullname, email, and password
if (
    !isset($input['username']) || empty($input['username']) ||
    !isset($input['fullname']) || empty($input['fullname']) ||
    !isset($input['email']) || empty($input['email']) ||
    !isset($input['password']) || empty($input['password'])
) {
    http_response_code(400);
    echo json_encode(['error' => true, 'message' => 'Username, fullname, email, and password are required.']);
    exit;
}

// Connect to the database
$conn = mysqli_connect('localhost', 'root', '', 'autoelite');

if (mysqli_connect_errno()) {
    http_response_code(500);
    echo json_encode(['error' => true, 'message' => 'Database connection failed.']);
    exit;
}

mysqli_set_charset($conn, 'utf8');

// Sanitize input
$username = mysqli_real_escape_string($conn, $input['username']);
$fullname = mysqli_real_escape_string($conn, $input['fullname']);
$email = mysqli_real_escape_string($conn, $input['email']);
$password = mysqli_real_escape_string($conn, $input['password']);

// Check for existing username or email
$check_sql = "SELECT id FROM users WHERE username = '$username' OR email = '$email'";
$result = mysqli_query($conn, $check_sql);

if (mysqli_num_rows($result) > 0) {
    http_response_code(409);
    echo json_encode(['error' => true, 'message' => 'Username or email already exists.']);
    mysqli_close($conn);
    exit;
}

// Insert new user without hashing the password
// (Consider hashing the password in a production environment)
$insert_sql = "INSERT INTO users (username, fullname, email, password) VALUES ('$username', '$fullname', '$email', '$password')";

if (mysqli_query($conn, $insert_sql)) {
    echo json_encode(['error' => false, 'message' => 'User registered successfully.']);
} else {
    http_response_code(500);
    echo json_encode(['error' => true, 'message' => 'Registration failed.']);
}

mysqli_close($conn);
?>