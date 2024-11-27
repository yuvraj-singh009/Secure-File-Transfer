<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.13.0/css/all.min.css">

</head>

<body>


    <div class="register-container">
        <h1>Register an Account</h1>

        <!-- Registration Form -->
        <div class="form-container">
            <form id="register-form" onsubmit="registerUser(event)" action="connect.php" method="post">
                <label for="register-username">Username (Email)</label>
                <input type="text" id="register-username" name="username" color="black" required>

                <label for="register-password1">Password</label>
                <input type="password1" id="register-password1" name="passwd" required>
                <div class="col-md-7">
                    <i class="far fa-eye" id="togglePassword1"></i>
                    <!-- <input id="password-field" type="password" class="form-control" name="password" value="secret"> -->
                    <!-- <span toggle="#password-field" class="fa fa-fw fa-eye field-icon toggle-password"></span> -->
                </div>

                <button type="submit" class="btn" name="submit">Register</button>
            </form>
        </div>
    </div>
    <div class="backloginreg">
        <a href="http://localhost/User_regsistration/SFT1%20copy%202/login.php">Back to Login Page?</a>
    </div>
    <!-- <?php
// Display "Hello, World!" message
echo "Hello, World!";
?> -->

</body>

</html>