<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login</title>
    <link rel="stylesheet" href="style.css">
    <script src="https://accounts.google.com/gsi/client" async defer></script>
    <script src="https://cdn.jsdelivr.net/npm/jwt-decode/build/jwt-decode.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.13.0/css/all.min.css">
</head>

<body>
    <div class="back"><a href="index.html">&lt;&lt; &nbsp;Back!</a></div>
    <div class="login-container">
        <h1>Login to Secure File Transfer</h1>

        <!-- Traditional Login Form -->
        <div class="loginform">
            <form id="login-form" action="verifylogin.php"  method="post" >
                <label for="username">Username</label>
                <input type="text" id="username" name="username" required>

                <label for="password">Password</label>
                <input type="password" id="password" name="passwd" required class="form-control">
                <div class="col-md-6">
                    <i class="far fa-eye" id="togglePassword"></i>
                    <!-- <input id="password-field" type="password" class="form-control" name="password" value="secret"> -->
                    <!-- <span toggle="#password-field" class="fa fa-fw fa-eye field-icon toggle-password"></span> -->
                </div>
                <button type="submit" class="btn" name="submit">Login</button>
            </form>
        </div>

        <!-- Google Sign-In -->
        <div class="google-signin">
            <p bold color="black" >Or</p>
            <div id="g_id_onload"
                data-client_id="52604179963-bvd5aba8vpha3m8n6o5e3uuq9atf7brd.apps.googleusercontent.com"
                data-login_uri="http://localhost:5500" data-auto_prompt="false"
                data-callback="handleCredentialResponse">
            </div>
            <div class="g_id_signin" data-type="standard" data-shape="rectangular" data-theme="outline"
                data-text="signin_with" data-size="large" data-logo_alignment="left">
            </div>
        </div>
    </div>
    <!-- <div class="newregis">
        <a href="register.html">Create new Account?</a>
    </div> -->


    <script src="script.js"></script>
</body>

</html>