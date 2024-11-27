// Helper function to get the list of users from localStorage
function getUsers() {
    let users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
}

// Helper function to save the list of users back to localStorage
function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// Function to handle traditional login with username and password
function loginUser(event) {
    event.preventDefault(); // Prevent form from submitting

    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    var users = getUsers();
    var foundUser = users.find(user => user.username === username);

    if (foundUser) {
        // Check if the entered password matches the stored password
        if (foundUser.password === password) {
            // Store the current user in localStorage for the session
            localStorage.setItem('currentUser', JSON.stringify(foundUser));
            alert("Login successful!");
            window.location.href = "profile.html";
        } else {
            alert("Incorrect password. Please try again.");
        }
    } else {
        alert("Username not found. Please register or try again.");
    }
}

// Function to register a new user (if the username is unique)
function registerUser(event) {
    event.preventDefault();

    var username = document.getElementById('register-username').value;
    var password = document.getElementById('register-password').value;

    var users = getUsers();
    var foundUser = users.find(user => user.username === username);

    if (foundUser) {
        // Username already exists
        alert("Username already exists. Please choose a different username.");
    } else {
        // Register the new user
        users.push({ username: username, password: password });
        saveUsers(users);

        // Automatically log in the newly registered user
        localStorage.setItem('currentUser', JSON.stringify({ username, password }));
        alert("Account created successfully! You are now logged in.");
        window.location.href = "profile.html";
    }
}

// Function to load and display the current user's profile
window.onload = function() {
    if (window.location.pathname.includes('profile.html')) {
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));

        if (currentUser) {
            // Display the username for the current user on profile page
            document.getElementById('username').textContent = currentUser.username;
        } else {
            alert("No user is currently logged in.");
            window.location.href = "login.html";
        }
    }
};

// Function to sign out the current user
function signOut() {
    localStorage.removeItem('currentUser');

    // Redirect to login page
    window.location.href = "http://localhost/User_regsistration/SFT1%20copy%202/login.php";
}

// Function to open the Edit Profile modal
function editProfile() {
    document.getElementById('edit-profile-modal').style.display = 'flex';

    // Pre-fill current user details in the modal form
    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    document.getElementById('edit-name').value = currentUser.username;
}

// Function to close the Edit Profile modal
function closeModal() {
    document.getElementById('edit-profile-modal').style.display = 'none';
}

// Function to update user profile information
function updateProfile(event) {
    event.preventDefault();

    var newName = document.getElementById('edit-name').value;
    var users = getUsers();
    var currentUser = JSON.parse(localStorage.getItem('currentUser'));

    // Find the user and update their details
    var userIndex = users.findIndex(user => user.username === currentUser.username);
    if (userIndex > -1) {
        users[userIndex].username = newName;
        saveUsers(users);

        // Update the current user in localStorage
        localStorage.setItem('currentUser', JSON.stringify(users[userIndex]));

        alert("Profile updated successfully!");
        closeModal();

        // Update the profile page with new name
        document.getElementById('username').textContent = newName;
    }
}
function handleCredentialResponse(response) {
    const userObject = jwt_decode(response.credential);
    console.log(userObject);
  
    document.getElementById("user-name").textContent = `Name: ${userObject.name}`;
    document.getElementById("user-photo").src = userObject.picture;
    document.getElementById("user-info").classList.remove("hidden");
  }
  
  // Load the Google Sign-In button.
  window.onload = function () {
    google.accounts.id.initialize({
      client_id: "52604179963-bvd5aba8vpha3m8n6o5e3uuq9atf7brd.apps.googleusercontent.com",
      callback: handleCredentialResponse,
    });
    google.accounts.id.renderButton(
      document.querySelector(".g_id_signin"),
      { theme: "outline", size: "large" } // Customization
    );
    google.accounts.id.prompt(); // Optional auto-prompt.
  };

  //automatically email fill on username

  function handleCredentialResponse(response) {
    // Decode the token using jwt-decode
    const userObject = jwt_decode(response.credential);

    // Extract the email from the decoded token
    const email = userObject.email;

    // Redirect to register.html with the email as a query parameter
    window.location.href = `http://localhost/User_regsistration/SFT1%20copy%202/connect.php?email=${encodeURIComponent(email)}`;
}
  

  // Retrieve query parameters from the URL
  const params = new URLSearchParams(window.location.search);
  const email = params.get('email'); // Get the 'email' parameter

  // Populate the username field if the email exists
  if (email) {
      document.getElementById('register-username').value = email;
  }

  function registerUser(event) {
      event.preventDefault();

      // Handle registration logic
      const username = document.getElementById('register-username').value;
      const password = document.getElementById('register-password').value;

      console.log('Registering user:', username, password);
      alert('Registration successful!');
  }

//   show password
const togglePassword = document.querySelector('#togglePassword');
  const password = document.querySelector('#password','#register-password');

  togglePassword.addEventListener('click', function (e) {
    // toggle the type attribute
    const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
    password.setAttribute('type', type);
    // toggle the eye slash icon
    this.classList.toggle('fa-eye-slash');
});

const togglePassword1 = document.querySelector('#togglePassword1');
  const password1 = document.querySelector('#password1','#register-password1');

  togglePassword1.addEventListener('click', function (e) {
    // toggle the type attribute
    const type = password1.getAttribute('type') === 'password1' ? 'text' : 'password1';
    password.setAttribute('type', type);
    // toggle the eye slash icon
    this.classList.toggle('fa-eye-slash');
});
