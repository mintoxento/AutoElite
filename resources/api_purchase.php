<?php
header("Content-Type: application/json");

// Database connection parameters – adjust these as needed.
$dbHost = 'localhost';
$dbUser = 'root';
$dbPass = '';
$dbName = 'autoelite';

// Create connection
$conn = new mysqli($dbHost, $dbUser, $dbPass, $dbName);
if ($conn->connect_error) {
    echo json_encode([
      'success' => false, 
      'message' => 'Database connection failed: ' . $conn->connect_error
    ]);
    exit;
}

$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($action === 'add') {
    // Only accept POST requests
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode([
          'success' => false, 
          'message' => 'Invalid request method.'
        ]);
        $conn->close();
        exit;
    }
    
    // Retrieve and validate parameters
    $cars = isset($_POST['cars']) ? $_POST['cars'] : '';
    $amount = isset($_POST['amount']) ? floatval($_POST['amount']) : 0;
    $user_id = isset($_POST['user_id']) ? intval($_POST['user_id']) : 0;
    
    if (empty($cars) || $amount <= 0 || $user_id <= 0) {
        echo json_encode([
          'success' => false, 
          'message' => 'Invalid parameters.'
        ]);
        $conn->close();
        exit;
    }
    
    // Prepare and execute insert query into the purchase table.
    $stmt = $conn->prepare("INSERT INTO purchase (cars, user_id, amount) VALUES (?, ?, ?)");
    if (!$stmt) {
        echo json_encode([
          'success' => false, 
          'message' => 'Prepare statement failed: ' . $conn->error
        ]);
        $conn->close();
        exit;
    }
    
    $stmt->bind_param("sid", $cars, $user_id, $amount);
    if ($stmt->execute()) {
        echo json_encode([
          'success' => true, 
          'message' => 'Purchase recorded successfully!'
        ]);
    } else {
        echo json_encode([
          'success' => false, 
          'message' => 'Purchase failed: ' . $stmt->error
        ]);
    }
    
    $stmt->close();
    $conn->close();
    exit;
} else if ($action === 'update') {
    // Only accept POST requests for updating status
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode([
          'success' => false, 
          'message' => 'Invalid request method.'
        ]);
        $conn->close();
        exit;
    }
    
    $purchase_id = isset($_POST['purchase_id']) ? intval($_POST['purchase_id']) : 0;
    $new_status = isset($_POST['status']) ? $_POST['status'] : '';
    $validStatuses = ['ongoing', 'completed', 'cancelled'];
    
    if ($purchase_id <= 0 || !in_array($new_status, $validStatuses)) {
        echo json_encode([
          'success' => false, 
          'message' => 'Invalid parameters.'
        ]);
        $conn->close();
        exit;
    }
    
    $stmt = $conn->prepare("UPDATE purchase SET status = ? WHERE id = ?");
    if (!$stmt) {
        echo json_encode([
          'success' => false, 
          'message' => 'Prepare statement failed: ' . $conn->error
        ]);
        $conn->close();
        exit;
    }
    
    $stmt->bind_param("si", $new_status, $purchase_id);
    if ($stmt->execute()) {
        echo json_encode([
          'success' => true, 
          'message' => 'Purchase status updated successfully!'
        ]);
    } else {
        echo json_encode([
          'success' => false, 
          'message' => 'Update failed: ' . $stmt->error
        ]);
    }
    
    $stmt->close();
    $conn->close();
    exit;
} else if ($action === 'delete') {
    // Only accept POST requests for deletion
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode([
          'success' => false, 
          'message' => 'Invalid request method.'
        ]);
        $conn->close();
        exit;
    }
    
    $purchase_id = isset($_POST['purchase_id']) ? intval($_POST['purchase_id']) : 0;
    if ($purchase_id <= 0) {
        echo json_encode([
          'success' => false, 
          'message' => 'Invalid purchase id.'
        ]);
        $conn->close();
        exit;
    }
    
    $stmt = $conn->prepare("DELETE FROM purchase WHERE id = ?");
    if (!$stmt) {
        echo json_encode([
          'success' => false, 
          'message' => 'Prepare statement failed: ' . $conn->error
        ]);
        $conn->close();
        exit;
    }
    
    $stmt->bind_param("i", $purchase_id);
    if ($stmt->execute()) {
        echo json_encode([
          'success' => true, 
          'message' => 'Purchase removed successfully!'
        ]);
    } else {
        echo json_encode([
          'success' => false, 
          'message' => 'Removal failed: ' . $stmt->error
        ]);
    }
    
    $stmt->close();
    $conn->close();
    exit;
} else if ($action === 'get') {
    // Only accept GET requests for retrieval.
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        echo json_encode([
          'success' => false, 
          'message' => 'Invalid request method.'
        ]);
        $conn->close();
        exit;
    }
    
    // Retrieve and validate user_id
    $user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
    if ($user_id <= 0) {
        echo json_encode([
          'success' => false, 
          'message' => 'Invalid user id.'
        ]);
        $conn->close();
        exit;
    }
    
    // Prepare and execute select query to retrieve purchase records for the user.
    $stmt = $conn->prepare("SELECT id, cars, purchase_date, status, amount FROM purchase WHERE user_id = ? ORDER BY purchase_date DESC");
    if (!$stmt) {
        echo json_encode([
          'success' => false, 
          'message' => 'Prepare statement failed: ' . $conn->error
        ]);
        $conn->close();
        exit;
    }
    
    $stmt->bind_param("i", $user_id);
    if (!$stmt->execute()) {
        echo json_encode([
          'success' => false, 
          'message' => 'Query execution failed: ' . $stmt->error
        ]);
        $stmt->close();
        $conn->close();
        exit;
    }
    
    $result = $stmt->get_result();
    $purchases = [];
    while ($row = $result->fetch_assoc()) {
        // Decode the JSON stored in the cars column.
        $row['cars'] = json_decode($row['cars'], true);
        $purchases[] = $row;
    }
    
    echo json_encode([
      'success' => true, 
      'data' => $purchases
    ]);
    
    $stmt->close();
    $conn->close();
    exit;
} else {
    echo json_encode([
      'success' => false, 
      'message' => 'Invalid action.'
    ]);
    $conn->close();
    exit;
}
?>