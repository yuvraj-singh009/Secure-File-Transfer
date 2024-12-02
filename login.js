import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import bcrypt from 'https://cdn.jsdelivr.net/npm/bcryptjs/+esm';

const supabaseUrl = 'https://afieewyossvtxetxytnr.supabase.co'; // Replace with your Supabase URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmaWVld3lvc3N2dHhldHh5dG5yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjgxNTc4MCwiZXhwIjoyMDQ4MzkxNzgwfQ.agrmFADCTLm4n3w8tykxwIjz9K7MuknHk4GfOCTNWLM'; // Replace with your Supabase API Key
const supabase = createClient(supabaseUrl, supabaseKey);

document.getElementById('login-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Query the Supabase 'users' table for the given username and password
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single(); // Assuming there's only one record for each username-password pair
    // Get the stored hashed password
    const storedHashedPassword = users[0].password;

    // Compare entered password with the hashed password
    const passwordMatch = bcrypt.compareSync(password, storedHashedPassword);
    if (passwordMatch) {
        const usernameBeforeAt = username.split('@')[0];
        // If user is found, redirect to profile.php
        window.location.href = `profile.html?username=${username}`;
      
    } else {
        // If no user is found or there's an error
        document.getElementById('error-message').style.display = 'block';
    }
});


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
    window.location.href = `register.html?email=${encodeURIComponent(email)}`;
}
