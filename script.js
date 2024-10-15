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
    window.location.href = "login.html";
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
