<?php
session_start();

// Check if the user is logged in
if (!isset($_SESSION['username'])) {
    header("Location: login.html"); // Redirect to login if not logged in
    exit();
}

$username = $_SESSION['username'];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Profile</title>
    <link rel="stylesheet" href="profile.css">
</head>
<body>
    <div class="profile-page">
        <!-- Top Bar -->
        <div class="top-bar">
            <div class="user-info">
                <img src="default-avatar.png" alt="User Image" class="profile-img">
                <h2 id="username"><?php echo htmlspecialchars($username); ?></h2> <!-- Dynamically display username -->
            </div>
            <button class="edit-btn" onclick="editProfile()">Edit Profile</button>
        </div>

        <!-- Data Section -->
        <div class="data-section">
            <div class="data-column">
                <h3>Saved Data</h3>
                <p>No data saved yet.</p>
                <div class="upload-container">
                    <h1>Upload Your File</h1>
                    <form action="/upload" method="post" enctype="multipart/form-data">
                        <input type="file" name="file" class="file-input" required>
                        <br>
                        <button type="submit">Upload</button>
                    </form>
                </div>
            </div>
            <div class="data-column">
                <h3>Sent Data</h3>
                <p>No data sent yet.</p>
                <div class="upload-container">
                    <h1>Upload Your File</h1>
                    <form action="/upload" method="post" enctype="multipart/form-data">
                        <input type="file" name="file" class="file-input" required>
                        <br>
                        <button type="submit">Upload</button>
                    </form>
                </div>
            </div>
            <div class="data-column">
                <h3>Received Data</h3>
                <p>No data received yet.</p>
            </div>
        </div>

        <!-- Sign Out Button -->
        <button class="sign-out-btn" onclick="window.location.href='login.php'">Sign Out</button>
    </div>

    <!-- Edit Profile Modal -->
    <div id="edit-profile-modal" class="modal">
        <div class="modal-content">
            <span class="close-btn">&times;</span>
            <h2>Edit Your Profile</h2>
            <form id="edit-profile-form"  action="updateProfile.php">
                <label for="edit-name">Name</label>
                <input type="text" id="edit-name" name="name" value="" required>

                <label for="edit-email">Email</label>
                <input type="email" id="edit-email" name="email" value="" required>

                <button type="submit" class="btn" name="submit">Save Changes</button>
            </form>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>
