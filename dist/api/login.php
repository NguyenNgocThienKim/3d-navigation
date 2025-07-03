<?php
session_start();
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');
require_once __DIR__ . '/../../db.php';



$response = ['status' => 'error', 'message' => 'An unknown error occurred.'];

if ($conn->connect_error) {
    $response['message'] = "Database connection failed: " . $conn->connect_error;
    echo json_encode($response);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_POST['userType']) || $_POST['userType'] !== 'student') {
        $response['message'] = 'Invalid user type for login.';
    } elseif (!isset($_POST['username'], $_POST['password']) || empty(trim($_POST['username'])) || empty($_POST['password'])) {
        $response['message'] = 'Please enter both your username and password.';
    } else {
        $username = trim($_POST['username']);
        $password = $_POST['password'];

        $sql = "SELECT id, student_id, username, password, role FROM students WHERE username = ? AND role = 'student'";
        $stmt = $conn->prepare($sql);
        
        // --- FINAL FIX: Check if the prepare() statement itself failed ---
        if ($stmt) {
            $stmt->bind_param("s", $username);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($user = $result->fetch_assoc()) {
                if (password_verify($password, $user['password'])) {
                    $_SESSION['user_id'] = $user['id'];
                    $_SESSION['username'] = $user['username'];
                    $_SESSION['role'] = $user['role'];

                    $response['status'] = 'success';
                    $response['message'] = 'Login successful! Entering the university...';
                    $response['userData'] = [
                        'username' => $user['username'],
                        'studentId' => $user['student_id'],
                        'userType' => $user['role']
                    ];
                } else {
                    $response['message'] = 'Invalid username or password.';
                }
            } else {
                $response['message'] = 'Invalid username or password.';
            }
            $stmt->close();
        } else {
            // If prepare() fails, it's a fatal error. We now catch it and send a proper JSON response.
            $response['message'] = 'Database query error. Could not prepare the login statement.';
        }
    }
} else {
    $response['message'] = 'Invalid request method.';
}

$conn->close();
echo json_encode($response);
?>