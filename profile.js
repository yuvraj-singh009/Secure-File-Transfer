
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Replace with your Supabase credentials
const SUPABASE_URL = 'https://afieewyossvtxetxytnr.supabase.co';
// const SUPABASE_ANON_KEY = 'your-anon-key';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmaWVld3lvc3N2dHhldHh5dG5yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjgxNTc4MCwiZXhwIjoyMDQ4MzkxNzgwfQ.agrmFADCTLm4n3w8tykxwIjz9K7MuknHk4GfOCTNWLM'; 
const BUCKET_NAME = 'uploads';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Function to generate a random 5-digit OTP
function generateOTP() {
  return Math.floor(10000 + Math.random() * 90000).toString(); // Generates a 5-digit number
}
 // Function to delete a file after 5 minutes
 async function scheduleDeletion(filePath) {
    setTimeout(async () => {
      const { error } = await supabase.storage.from(otp-files).remove([filePath]);
      if (error) {
        console.error(`Error deleting file ${filePath}:`, error.message);
      } else {
        console.log(`File ${filePath} deleted successfully.`);
      }
    },1* 60 * 1000); // 5 minutes in milliseconds
  }

// Upload Form Submission
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fileInput = document.getElementById('file');
  const file = fileInput.files[0];

  if (!file) {
    document.getElementById('status').textContent = 'Please select a file.';
    return;
  }

  const otp = generateOTP(); // Generate a random OTP
  const filePath = `otp-files/${otp}-${file.name}`;

  try {
    // Upload the file with the OTP as part of the key
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(`otp-files/${otp}-${file.name}`, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw error;
    }
     // Schedule the file for deletion after 5 minutes
     scheduleDeletion(filePath);


    document.getElementById('status').textContent = `File uploaded successfully. Your OTP is: ${otp}`;
  } catch (error) {
    document.getElementById('status').textContent = `Error uploading file: ${error.message}`;
  }
});

// Retrieve Form Submission
document.getElementById('retrieveForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const retrieveOtpInput = document.getElementById('retrieveOtp');
  const otp = retrieveOtpInput.value;

  if (!otp) {
    document.getElementById('status').textContent = 'Please enter an OTP to retrieve a file.';
    return;
  }

  try {
    // List all files in the bucket
    const { data: files, error } = await supabase.storage.from(BUCKET_NAME).list('otp-files');

    if (error) {
      throw error;
    }

    // Find the file matching the OTP
    const file = files.find((f) => f.name.startsWith(`${otp}-`));

    if (!file) {
      document.getElementById('status').textContent = `No file found for OTP: ${otp}`;
      return;
    }

    // Generate a download URL
    const { data: downloadData, error: downloadError } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(`otp-files/${file.name}`, 60); // URL valid for 60 seconds

    if (downloadError) {
      throw downloadError;
    }

    // Display the download link
    document.getElementById('status').innerHTML = `
      File retrieved successfully. <a href="${downloadData.signedUrl}" target="_blank">Open File</a>
    `;
  } catch (error) {
    document.getElementById('status').textContent = `Error retrieving file: ${error.message}`;
  }
});
