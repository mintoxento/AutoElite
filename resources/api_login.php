<?php
header('Content-Type: application/json');

// Read the JSON input
$input = json_decode(file_get_contents('php://input'), true);  

// Connect to the database
$conn = mysqli_connect('localhost', 'root', '', 'autoelite');
if (!$conn) {
  echo json_encode(['error' => true, 'message' => 'Database connection failed: ' . mysqli_connect_error()]);
  exit;
}
mysqli_set_charset($conn, 'utf8');

// Create the query without relying on $_SERVER['PATH_INFO']
$sql = "SELECT * FROM `users` WHERE username = '" . mysqli_real_escape_string($conn, $input['username']) . "' AND password = '" . mysqli_real_escape_string($conn, $input['password']) . "'";

// Execute the query
$result = mysqli_query($conn, $sql);
if ($result) {
  $user = mysqli_fetch_object($result);
  echo json_encode($user);
} else {
  echo json_encode(['error' => true, 'message' => 'Query error: ' . mysqli_error($conn)]);
}

mysqli_close($conn);
exit;
?>