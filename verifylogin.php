<?php
session_start();
// Check if form is submitted
if (isset($_POST['submit'])) {
    // Database connection details
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

    // Retrieve and sanitize form data
    $username = $conn->real_escape_string(trim($_POST['username']));
    $password = (string)trim($_POST['passwd']); // Plaintext password entered by the user

    // Fetch the stored password for the given username
    $sql = "SELECT passwd FROM users WHERE username = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        // Username exists; fetch the stored password
        $row = $result->fetch_assoc();
        $stored_password = trim($row['passwd']);

        // Compare the entered password with the stored password
        if ((string)$password === (string)$stored_password) {
            // Redirect to profile.html after successful login
            $_SESSION['username'] = $username;
            header("Location: profile.php");
            exit(); // Terminate script to ensure redirection happens
        } else {
            echo "Invalid password.";
        }
    } else {
        echo "Username not found.";
    }

    // Close statement and connection
    $stmt->close();
    $conn->close();
}
?>
