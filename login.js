import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import bcrypt from 'https://cdn.jsdelivr.net/npm/bcryptjs/+esm';

const supabaseUrl = 'https://afieewyossvtxetxytnr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmaWVld3lvc3N2dHhldHh5dG5yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjgxNTc4MCwiZXhwIjoyMDQ4MzkxNzgwfQ.agrmFADCTLm4n3w8tykxwIjz9K7MuknHk4GfOCTNWLM';
const supabase = createClient(supabaseUrl, supabaseKey);

document.getElementById('login-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    // Get form elements
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const submitButton = event.submitter;
    const errorElement = document.getElementById('error-message');
    const loadingElement = document.getElementById('loading-message');

    // Reset previous states
    if (errorElement) errorElement.style.display = 'none';
    
    // Show loading state
    if (loadingElement) {
        loadingElement.textContent = 'Authenticating...';
        loadingElement.style.display = 'block';
    }
    
    // Disable form inputs during authentication
    usernameInput.disabled = true;
    passwordInput.disabled = true;
    submitButton.disabled = true;

    try {
        const username = usernameInput.value;
        const password = passwordInput.value;

        // Query the Supabase 'users' table for the given username
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .single();

        // Hide loading state
        if (loadingElement) loadingElement.style.display = 'none';

        if (error) {
            throw new Error('Invalid username or password');
        }

        // Extract the stored hashed password
        const storedHashedPassword = data.password;

        // Compare the entered password with the stored hashed password
        const passwordMatch = await bcrypt.compare(password, storedHashedPassword);

        if (passwordMatch) {
            // Redirect to profile page
            const encodedUsername = encodeURIComponent(username);
            window.location.href = `profile.html?username=${encodedUsername}`;
        } else {
            throw new Error('Invalid username or password');
        }
    } catch (err) {
        // Show error message
        if (errorElement) {
            errorElement.textContent = err.message;
            errorElement.style.display = 'block';
        }
    } finally {
        // Re-enable form inputs
        usernameInput.disabled = false;
        passwordInput.disabled = false;
        submitButton.disabled = false;

        // Hide loading message
        if (loadingElement) loadingElement.style.display = 'none';
    }
});

// Google Sign-In initialization
window.onload = function () {
    google.accounts.id.initialize({
        client_id: "52604179963-bvd5aba8vpha3m8n6o5e3uuq9atf7brd.apps.googleusercontent.com",
        callback: handleCredentialResponse,
    });
    google.accounts.id.renderButton(
        document.querySelector(".g_id_signin"),
        { theme: "outline", size: "large" }
    );
    google.accounts.id.prompt();
};

// Handle Google credential response
function handleCredentialResponse(response) {
    const userObject = jwt_decode(response.credential);
    const email = userObject.email;
    window.location.href = `register.html?email=${encodeURIComponent(email)}`;
}

// Password toggle functionality
const togglePassword = document.querySelector('#togglePassword');
const password = document.querySelector('#password');

togglePassword.addEventListener('click', function (e) {
    // Toggle the type attribute
    const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
    password.setAttribute('type', type);
    // Toggle the eye slash icon
    this.classList.toggle('fa-eye-slash');
});