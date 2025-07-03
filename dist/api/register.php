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
        $response['message'] = 'Registration is only available for students.';
    } elseif (!isset($_POST['studentId'], $_POST['username'], $_POST['password'])) {
        $response['message'] = 'A required field was missing from the form.';
    } else {
        $studentId = trim($_POST['studentId']);
        $username = trim($_POST['username']);
        $password = $_POST['password'];

        if (empty($studentId) || empty($username) || empty($password)) {
            $response['message'] = 'Student ID, Username, and Password fields cannot be empty.';
        } elseif (strlen($password) < 6) {
            $response['message'] = 'Password must be at least 6 characters long.';
        } else {
            $stmt_check = $conn->prepare("SELECT id FROM students WHERE username = ?");
            
            // --- FINAL FIX 1: Check if the first prepare() was successful ---
            if ($stmt_check) {
                $stmt_check->bind_param("s", $username);
                $stmt_check->execute();
                $stmt_check->store_result();
                
                if ($stmt_check->num_rows > 0) {
                    $response['message'] = 'This username is already taken. Please choose another.';
                } else {
                    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
                    $stmt_insert = $conn->prepare("INSERT INTO students (student_id, username, password, role) VALUES (?, ?, ?, ?)");
                    
                    // --- FINAL FIX 2: Check if the second prepare() was successful ---
                    if ($stmt_insert) {
                        $role = 'student';
                        $stmt_insert->bind_param("ssss", $studentId, $username, $hashed_password, $role);
                        if ($stmt_insert->execute()) {
                            $response['status'] = 'success';
                            $response['message'] = 'Registration successful! You may now log in.';
                        } else {
                            $response['message'] = 'Registration failed due to a server error.';
                        }
                        $stmt_insert->close();
                    } else {
                        $response['message'] = 'Database query error: Could not prepare the insert statement.';
                    }
                }
                $stmt_check->close();
            } else {
                $response['message'] = 'Database query error: Could not prepare the username check.';
            }
        }
    }
} else {
    $response['message'] = 'Invalid request method. Please use POST.';
}

$conn->close();
echo json_encode($response);
?>