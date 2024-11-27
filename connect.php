<?php
// Include the form
include 'register.php';

// Check if form is submitted
if (isset($_POST['submit'])) {
    // Database connection details
    $servername = "localhost";
    $db_username = "root";
    $db_password = "";
    $dbname = "user_data";

    // Create connection
    $conn = new mysqli("localhost", "root", "", "user_data");

    // Check connection
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    // Retrieve and sanitize form data
    $user = $conn->real_escape_string(trim($_POST['username']));
    $pass = trim($_POST['passwd']); // Trim to clean up spaces

    // Validate password (alphanumeric and not purely numeric)
    if (!preg_match('/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]+$/', $pass)) {
        echo "Error: Password must be alphanumeric and contain at least one letter.";
    } else {
        // Check for duplicate username
        $check_sql = "SELECT username FROM users WHERE username = ?";
        $check_stmt = $conn->prepare($check_sql);
        $check_stmt->bind_param("s", $user);
        $check_stmt->execute();
        $check_result = $check_stmt->get_result();

        if ($check_result->num_rows > 0) {
            // Username exists
            echo "Error: Username '$user' is already taken. Please choose a different username.";
        } else {
            // Insert into database using prepared statement
            $insert_sql = "INSERT INTO users (username, passwd) VALUES (?, ?)";
            $insert_stmt = $conn->prepare($insert_sql);
            $insert_stmt->bind_param("ss", $user, $pass);

            if ($insert_stmt->execute()) {
                echo "Registration successful!";
            } else {
                echo "Error: " . $insert_stmt->error;
            }

            // Close insert statement
            $insert_stmt->close();
        }

        // Close duplicate check statement
        $check_stmt->close();
    }

    // Close connection
    $conn->close();
}
?>
