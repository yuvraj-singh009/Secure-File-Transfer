<?php
include 'profile.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Ensure user is logged in
if (!isset($_SESSION['username'])) {
    header("Location: login.html"); // Redirect to login if not logged in
    exit();
}

// Check if the request is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    die("Invalid request.");
}

// Validate form submission
if (isset($_POST['submit'])) {
    $servername = "localhost";
    $db_username = "root";
    $db_password = "";
    $dbname = "user_data";

    // Create database connection
    $conn = new mysqli($servername, $db_username, $db_password, $dbname);
    if ($conn->connect_error) {
        die("Database connection failed: " . $conn->connect_error);
    }

    // Sanitize and validate inputs
    $name = $conn->real_escape_string(trim($_POST['name']));
    $email = $conn->real_escape_string(trim($_POST['email']));

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        die("Invalid email format.");
    }

    // Update the database
    $username = $_SESSION['username'];
    $sql = "UPDATE users SET name = ?, email = ? WHERE username = ?";
    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        die("Database error: " . $conn->error);
    }

    $stmt->bind_param("sss", $name, $email, $username);

    if ($stmt->execute()) {
        $_SESSION['success_message'] = "Profile updated successfully!";
        header("Location: profile.php");
        exit();
    } else {
        $_SESSION['error_message'] = "Error updating profile.";
        error_log("Error updating profile: " . $stmt->error);
        header("Location: profile.php");
        exit();
    }

    // Close resources
    $stmt->close();
    $conn->close();
} else {
    echo "Invalid request.";
}
?>
