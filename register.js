// Import the Supabase library
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import bcrypt from 'https://cdn.jsdelivr.net/npm/bcryptjs/+esm';

// Initialize Supabase client
const SUPABASE_URL = 'https://afieewyossvtxetxytnr.supabase.co'; // Replace with your Supabase URL
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmaWVld3lvc3N2dHhldHh5dG5yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjgxNTc4MCwiZXhwIjoyMDQ4MzkxNzgwfQ.agrmFADCTLm4n3w8tykxwIjz9K7MuknHk4GfOCTNWLM'; // Replace with your Supabase anon key
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);


// Check if the email is passed from login page (after Google Sign-In)
const urlParams = new URLSearchParams(window.location.search);
const email = urlParams.get('email');

// If email is found in URL, auto-fill the username field
if (email) {
   document.getElementById('username').value = email;
}

// Handle form submission
document.getElementById('register-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    // Get form values
    const username = document.getElementById('username').value;
    const password = document.getElementById('password1').value;

      // Hash the password
      const hashedPassword = bcrypt.hashSync(password, 10);

      //Check for existing user...........
      try{
       const { data: existingUser, error: userError } = await supabase
       .from('users')
       .select('*')
       .eq('username', username)
       .single();

       if (existingUser) {
       alert('Email is already registered!');
       return;
       }



    
       
        // Insert data into Supabase table
        const { data, error } = await supabase.from('users').insert([
            { username: username, password: hashedPassword ,pass:password} // Replace 'users' with your table name
        ]);

        if (error) {
            console.error('Error inserting data:', error.message);
            alert('Failed to register user!');
        } else {
            console.log('User registered:', data);
            alert('User registered successfully!');
        }
    } catch (err) {
        console.error('Unexpected error:', err);
        alert('An error occurred!');
    }
});

//   show password
const togglePassword = document.querySelector('#togglePassword1');
const password = document.querySelector('#password1');

togglePassword.addEventListener('click', function (e) {
 // toggle the type attribute
 const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
 password.setAttribute('type', type);
 // toggle the eye slash icon
 this.classList.toggle('fa-eye-slash');
});
