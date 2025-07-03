<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "university_db";

$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection and stop further execution if it fails
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
