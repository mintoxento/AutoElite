<?php
header('Content-Type: application/json');

$action = isset($_GET['action']) ? $_GET['action'] : '';

// Database connection parameters (adjust as necessary)
$dbHost = 'localhost';
$dbUser = 'root';
$dbPass = '';
$dbName = 'autoelite';

// Create a connection
$conn = new mysqli($dbHost, $dbUser, $dbPass, $dbName);
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $conn->connect_error]);
    exit;
}

if ($action === 'add') {
    // Only accept POST requests
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
        $conn->close();
        exit;
    }

    // Retrieve and validate the car_id from POST data
    $car_id = isset($_POST['car_id']) ? intval($_POST['car_id']) : 0;
    if ($car_id <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid car id.']);
        $conn->close();
        exit;
    }
    
    // Retrieve and validate the user_id from POST data
    $user_id = isset($_POST['user_id']) ? intval($_POST['user_id']) : 0;
    if ($user_id <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid user id.']);
        $conn->close();
        exit;
    }

    // Prepare and execute the insert query with car_id and user_id
    $stmt = $conn->prepare("INSERT INTO cart (car_id, user_id) VALUES (?, ?)");
    if (!$stmt) {
        echo json_encode(['success' => false, 'message' => 'Prepare statement failed: ' . $conn->error]);
        $conn->close();
        exit;
    }

    $stmt->bind_param("ii", $car_id, $user_id);
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Car added to cart successfully!']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Query execution failed: ' . $stmt->error]);
    }

    $stmt->close();
    $conn->close();
    exit;
} else if ($action === 'remove') {
    // Only accept POST requests for removal.
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
        $conn->close();
        exit;
    }
    
    // Retrieve and validate the car_id and user_id from POST data.
    $car_id = isset($_POST['car_id']) ? intval($_POST['car_id']) : 0;
    $user_id = isset($_POST['user_id']) ? intval($_POST['user_id']) : 0;
    
    if ($car_id <= 0 || $user_id <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid car id or user id.']);
        $conn->close();
        exit;
    }
    
    // Prepare and execute the DELETE query based on car_id and user_id.
    $stmt = $conn->prepare("DELETE FROM cart WHERE car_id = ? AND user_id = ?");
    if (!$stmt) {
        echo json_encode(['success' => false, 'message' => 'Prepare statement failed: ' . $conn->error]);
        $conn->close();
        exit;
    }
    
    $stmt->bind_param("ii", $car_id, $user_id);
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Car removed from cart successfully!']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Removal failed: ' . $stmt->error]);
    }
    
    $stmt->close();
    $conn->close();
    exit;
} else if ($action === 'get') {
    // Retrieve all cart items
    $sql = "SELECT car_id FROM cart";
    $result = $conn->query($sql);
    if ($result) {
        $cartItems = [];
        while ($row = $result->fetch_assoc()) {
            $cartItems[] = $row;  // Each row is expected to have a 'car_id' field
        }
        echo json_encode(['success' => true, 'data' => $cartItems]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Query failed: ' . $conn->error]);
    }
    $conn->close();
    exit;
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid action.']);
    $conn->close();
    exit;
}
?>