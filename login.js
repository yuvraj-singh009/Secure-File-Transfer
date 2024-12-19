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
            .select('password')
            .eq('username', username)
            .single();

        // Hide loading state
        if (loadingElement) loadingElement.style.display = 'none';

        if (!data) {
            // Username not found
            throw new Error('No username found');
        }

        const storedHashedPassword = data.password;

        // Compare the entered password with the stored hashed password
        const passwordMatch = await bcrypt.compare(password, storedHashedPassword);

        if (passwordMatch) {
            // Redirect to profile page
            const encodedUsername = encodeURIComponent(username);
            window.location.href = `profile.html?username=${encodedUsername}`;
        } else {
            // Password incorrect
            throw new Error('Incorrect password');
        }
    } catch (err) {
        // Show specific error messages
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

    // Check if the email ends with @vitbhopal.ac.in
    if (email.endsWith("@vitbhopal.ac.in")) {
        // Redirect to registration page with email as a parameter
        window.location.href = `register.html?email=${encodeURIComponent(email)}`;
    } else {
        // Display an error message and refuse access
        alert("Access denied! Please sign in using an email ending with '@vitbhopal.ac.in'.");
    }
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




// Initialize EmailJS with your user ID
emailjs.init('RwhVK_22140kjAtOx'); // Replace with your EmailJS user ID

// Initialize Supabase client
// const SUPABASE_URL = "https://afieewyossvtxetxytnr.supabase.co"; // Replace with your Supabase URL
// const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmaWVld3lvc3N2dHhldHh5dG5yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjgxNTc4MCwiZXhwIjoyMDQ4MzkxNzgwfQ.agrmFADCTLm4n3w8tykxwIjz9K7MuknHk4GfOCTNWLM"; // Replace with your Supabase public key
// const supabase =createClient(SUPABASE_URL, SUPABASE_KEY);

// Store OTPs temporarily (use a secure backend for production)
const otps = {};

// Get elements
const sendOtpButton = document.getElementById("send-otp");
const verifyOtpButton = document.getElementById("verify-otp");
const forgotPasswordLink = document.getElementById("forgot-password-link"); // Forgot password link
const forgotPasswordModal = document.getElementById("forgot-password-modal"); // Modal element
const closeModalButton = document.querySelector(".close"); // Close button in modal
const forgotPasswordForm = document.getElementById("forgot-password-form");
const verifyOtpForm = document.getElementById("verify-otp-form");

// Show forgot password modal
forgotPasswordLink.addEventListener("click", function () {
    console.log("Forgot Password link clicked!"); // Debugging log
    forgotPasswordModal.style.display = "block"; // Show the modal when the link is clicked
});

// Close modal when the close button is clicked
closeModalButton.addEventListener("click", function () {
    console.log("Modal close button clicked!"); // Debugging log
    forgotPasswordModal.style.display = "none"; // Hide the modal when the close button is clicked
});

// Click outside the modal to close it
window.addEventListener("click", function (event) {
    if (event.target === forgotPasswordModal) {
        console.log("Clicked outside modal!"); // Debugging log
        forgotPasswordModal.style.display = "none"; // Close the modal if clicked outside
    }
});

// Send OTP function
sendOtpButton.addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    console.log("Send OTP button clicked! Email:", email); // Debugging log

    if (!email) {
        alert("Please enter your email.");
        return;
    }

    try {
        const otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP
        const templateParams = {
            email: email,
            otp: otp,
        };

        // Send OTP via EmailJS
        const response = await emailjs.send('service_oj849wp', 'template_718qb9q', templateParams);

        if (response.status === 200) {
            alert('OTP sent successfully to your email.');
            otps[email] = otp; // Store OTP in memory for verification (use a DB in production)
            forgotPasswordForm.style.display = "none";
            verifyOtpForm.style.display = "block";
        } else {
            alert('Failed to send OTP. Please try again.');
        }
    } catch (error) {
        console.error("Error sending OTP:", error);
        alert("An error occurred while sending the OTP.");
    }
});

// Verify OTP function
verifyOtpButton.addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const otp = document.getElementById("otp").value;
    console.log("Verify OTP button clicked! Email:", email, "OTP:", otp); // Debugging log

    if (!otp) {
        alert("Please enter the OTP.");
        return;
    }

    try {
        // Verify OTP
        if (otps[email] && otps[email].toString() === otp) {
            delete otps[email]; // Clear OTP after successful verification
            alert("OTP verified successfully!");

            // After OTP verification, delete password from Supabase users table
            const { data, error } = await supabase
                .from('users') // Table name
                .update({ password: null }) // Set password to null (deleting the password)
                .eq('username', email); // Match the email (or username) from the form

            if (error) {
                console.error("Error deleting password:", error.message);
                alert("Error deleting password. Please try again.");
            } else {
                alert("Password deleted successfully!");
                window.location.href = `register.html?email=${encodeURIComponent(email)}`; // Redirect to register page
            }

        } else {
            alert("Invalid OTP. Please try again.");
        }
    } catch (error) {
        console.error("Error verifying OTP:", error);
        alert("An error occurred while verifying the OTP.");
    }
});

