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

// Get username from session
$username = $_SESSION['username'];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    die("Invalid request.");
}


// Check if form data is submitted
if (isset($_POST['submit'])) {
    $servername = "localhost";
    $db_username = "root";
    $db_password = "";
    $dbname = "user_data";

    // Create connection
    $conn = new mysqli($servername, $db_username, $db_password, $dbname);

    // Check connection
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    // Get and sanitize form inputs
    $name = $conn->real_escape_string(trim($_POST['name']));
    $email = $conn->real_escape_string(trim($_POST['email']));

    // Update the database
    $sql = "UPDATE users SET name = ?, email = ? WHERE username = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sss", $name, $email, $username);

    if ($stmt->execute()) {
        echo "Profile updated successfully!";
        header("Location: profile.php"); // Redirect back to profile page
        exit();
    } else {
        echo "Error updating profile: " . $stmt->error;
    }

    // Close connection
    $stmt->close();
    $conn->close();
} else {
    echo "Invalid request.";
}
?>
