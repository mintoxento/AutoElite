<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Connect to the database
$conn = mysqli_connect('localhost', 'root', '', 'autoelite');
if (mysqli_connect_errno()) {
    http_response_code(500);
    echo json_encode(["error" => true, "message" => "Database connection failed."]);
    exit;
}
mysqli_set_charset($conn, 'utf8');

// Determine the action from the query string
$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($action) {
    case 'get':
        // Retrieve profile info using prepared statements
        if (!isset($_GET['username']) || empty($_GET['username'])) {
            http_response_code(400);
            echo json_encode(["error" => true, "message" => "Username is required."]);
            exit;
        }

        $username = $_GET['username'];
        
        // Use prepared statement to prevent SQL injection
        $stmt = mysqli_prepare($conn, "SELECT username, fullname, email, phone, address, profilepic FROM users WHERE username = ?");
        if (!$stmt) {
            http_response_code(500);
            echo json_encode(["error" => true, "message" => "Database error."]);
            exit;
        }
        
        mysqli_stmt_bind_param($stmt, "s", $username);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        
        if (!$result) {
            http_response_code(500);
            echo json_encode(["error" => true, "message" => "Error retrieving profile."]);
            mysqli_stmt_close($stmt);
            exit;
        }
        
        $data = mysqli_fetch_assoc($result);
        mysqli_stmt_close($stmt);
        
        if (!$data) {
            http_response_code(404);
            echo json_encode(["error" => true, "message" => "Profile not found."]);
            exit;
        }
        
        echo json_encode($data);
        break;

    case 'update':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["error" => true, "message" => "Only POST method is allowed for updates."]);
            exit;
        }

        $username = isset($_POST['username']) ? mysqli_real_escape_string($conn, $_POST['username']) : '';
        $fullname = isset($_POST['fullname']) ? mysqli_real_escape_string($conn, $_POST['fullname']) : '';
        $email = isset($_POST['email']) ? mysqli_real_escape_string($conn, $_POST['email']) : '';
        $address = isset($_POST['address']) ? mysqli_real_escape_string($conn, $_POST['address']) : '';
        $phone = isset($_POST['phone']) ? mysqli_real_escape_string($conn, $_POST['phone']) : '';

        if (empty($username)) {
            http_response_code(400);
            echo json_encode(["error" => true, "message" => "Username is required."]);
            exit;
        }

        // Handle profile picture upload
        $profilePicPath = "";
        if (isset($_FILES['profilepic']) && $_FILES['profilepic']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = 'uploads/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            $fileTmp = $_FILES['profilepic']['tmp_name'];
            $fileName = basename($_FILES['profilepic']['name']);
            $fileExt = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
            $allowedExt = ['jpg', 'jpeg', 'png', 'gif'];

            if (!in_array($fileExt, $allowedExt)) {
                echo json_encode(["error" => true, "message" => "Invalid file type. Only JPG, PNG, and GIF allowed."]);
                exit;
            }

            $newFilename = uniqid("profile_", true) . "." . $fileExt;
            $destination = $uploadDir . $newFilename;

            if (!move_uploaded_file($fileTmp, $destination)) {
                echo json_encode(["error" => true, "message" => "Failed to upload profile picture."]);
                exit;
            }

            $profilePicPath = 'resources/' . $destination;
        }

        // Prepare SQL update including the phone field
        $updateFields = "fullname='$fullname', email='$email', address='$address', phone='$phone'";
        if (!empty($profilePicPath)) {
            $updateFields .= ", profilepic='$profilePicPath'";
        }

        $sql = "UPDATE users SET $updateFields WHERE username='$username'";
        if (mysqli_query($conn, $sql)) {
            echo json_encode([
                "error" => false,
                "message" => "Profile updated successfully.",
                "profilepic" => $profilePicPath
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => true, "message" => "Profile update failed."]);
        }

        break;

    default:
        http_response_code(400);
        echo json_encode(["error" => true, "message" => "Invalid action."]);
        break;
}

mysqli_close($conn);
?>