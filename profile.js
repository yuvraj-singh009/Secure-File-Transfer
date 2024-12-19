import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase Configuration
const SUPABASE_URL = 'https://afieewyossvtxetxytnr.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmaWVld3lvc3N2dHhldHh5dG5yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjgxNTc4MCwiZXhwIjoyMDQ4MzkxNzgwfQ.agrmFADCTLm4n3w8tykxwIjz9K7MuknHk4GfOCTNWLM';
const BUCKET_NAME = 'uploads';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Initialize EmailJS
(function () {
    emailjs.init("RwhVK_22140kjAtOx");
})();

class EnhancedEncryption {
    // Generate RSA key pair
    static async generateRSAKeyPair() {
        return await crypto.subtle.generateKey(
            {
                name: "RSA-OAEP",
                modulusLength: 2048,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: "SHA-256"
            },
            true,
            ["encrypt", "decrypt"]
        );
    }

    // Export RSA public key
    static async exportPublicKey(keyPair) {
        return await crypto.subtle.exportKey('spki', keyPair.publicKey);
    }

    // Export RSA private key
    static async exportPrivateKey(keyPair) {
        return await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
    }

    // Import RSA public key
    static async importPublicKey(publicKeyBuffer) {
        return await crypto.subtle.importKey(
            'spki',
            publicKeyBuffer,
            {
                name: "RSA-OAEP",
                hash: "SHA-256"
            },
            true,
            ["encrypt"]
        );
    }

    // Import RSA private key
    static async importPrivateKey(privateKeyBuffer) {
        return await crypto.subtle.importKey(
            'pkcs8',
            privateKeyBuffer,
            {
                name: "RSA-OAEP",
                hash: "SHA-256"
            },
            true,
            ["decrypt"]
        );
    }

    // Encrypt AES key with RSA public key
    static async encryptAESKey(publicKey, aesKeyBuffer) {
        return await crypto.subtle.encrypt(
            {
                name: "RSA-OAEP"
            },
            publicKey,
            aesKeyBuffer
        );
    }

    // Decrypt AES key with RSA private key
    static async decryptAESKey(privateKey, encryptedAESKeyBuffer) {
        return await crypto.subtle.decrypt(
            {
                name: "RSA-OAEP"
            },
            privateKey,
            encryptedAESKeyBuffer
        );
    }

    // Generate an AES-GCM encryption key
    static async generateAESKey() {
        return await crypto.subtle.generateKey(
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"]
        );
    }

    // Export the AES key
    static async exportAESKey(key) {
        return await crypto.subtle.exportKey('raw', key);
    }

    // Import the AES key
    static async importAESKey(rawKey) {
        return await crypto.subtle.importKey(
            'raw',
            rawKey,
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"]
        );
    }

    // Encrypt file with AES-GCM and RSA protection
    static async encryptFile(file, publicKey) {
        // Generate a unique AES key for this file
        const fileKey = await this.generateAESKey();
        const exportedAESKey = await this.exportAESKey(fileKey);

        // Encrypt the AES key with RSA public key
        const encryptedAESKey = await this.encryptAESKey(publicKey, exportedAESKey);

        const iv = crypto.getRandomValues(new Uint8Array(12)); // Initialization Vector
        const algorithm = { name: "AES-GCM", iv: iv };

        const fileBuffer = await file.arrayBuffer();
        const encryptedData = await crypto.subtle.encrypt(algorithm, fileKey, fileBuffer);

        // Combine encrypted AES key, IV, MIME type, and encrypted data
        const mimeType = file.type;
        const mimeBuffer = new TextEncoder().encode(mimeType);
        const mimeLength = new Uint8Array([mimeBuffer.length]);

        return {
            encryptedBlob: new Blob([
                encryptedAESKey, // Encrypted AES key
                iv,
                mimeLength,
                mimeBuffer,
                encryptedData
            ]),
            encryptedAESKey: encryptedAESKey
        };
    }

    // Decrypt file with RSA and AES-GCM
    static async decryptFile(encryptedFile, privateKey) {
        const fileBuffer = await encryptedFile.arrayBuffer();

        // Extract encrypted AES key (variable length based on RSA key size, using 256 bytes for 2048-bit key)
        const encryptedAESKey = fileBuffer.slice(0, 256);
        
        // Decrypt the AES key using RSA private key
        const decryptedAESKeyBuffer = await this.decryptAESKey(privateKey, encryptedAESKey);
        const fileKey = await this.importAESKey(decryptedAESKeyBuffer);

        // Extract other components
        const iv = new Uint8Array(fileBuffer.slice(256, 268)); // Next 12 bytes are IV
        const mimeLength = new Uint8Array(fileBuffer.slice(268, 269))[0]; // Length of MIME type
        const mimeBuffer = fileBuffer.slice(269, 269 + mimeLength); // MIME type
        const encryptedData = fileBuffer.slice(269 + mimeLength);

        const mimeType = new TextDecoder().decode(mimeBuffer);
        const algorithm = { name: "AES-GCM", iv: iv };

        try {
            const decryptedData = await crypto.subtle.decrypt(algorithm, fileKey, encryptedData);
            return new Blob([decryptedData], { type: mimeType });
        } catch (error) {
            console.error("Decryption failed", error);
            throw new Error("Decryption failed. The file may have been corrupted or the key is invalid.");
        }
    }
}

// Global variable to store RSA key pair
let rsaKeyPair = null;

// Function to convert key to string
async function exportKeyToString(key, isPublic) {
    const exported = await crypto.subtle.exportKey(
        isPublic ? 'spki' : 'pkcs8',
        key
    );
    return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

// Function to import key from string
async function importKeyFromString(keyStr, isPublic) {
    const keyData = Uint8Array.from(atob(keyStr), c => c.charCodeAt(0));
    return await crypto.subtle.importKey(
        isPublic ? 'spki' : 'pkcs8',
        keyData,
        {
            name: "RSA-OAEP",
            hash: "SHA-256"
        },
        true,
        [isPublic ? "encrypt" : "decrypt"]
    );
}

// Initialize or retrieve RSA Key Pair on page load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Check if keys exist in sessionStorage
        const storedPublicKey = sessionStorage.getItem('publicKey');
        const storedPrivateKey = sessionStorage.getItem('privateKey');

        if (storedPublicKey && storedPrivateKey) {
            // Reconstruct key pair from stored keys
            rsaKeyPair = {
                publicKey: await importKeyFromString(storedPublicKey, true),
                privateKey: await importKeyFromString(storedPrivateKey, false)
            };
            console.log("RSA Key Pair Restored Successfully");
        } else {
            // Generate new key pair
            rsaKeyPair = await EnhancedEncryption.generateRSAKeyPair();
            
            // Store keys in sessionStorage
            sessionStorage.setItem('publicKey', await exportKeyToString(rsaKeyPair.publicKey, true));
            sessionStorage.setItem('privateKey', await exportKeyToString(rsaKeyPair.privateKey, false));
            
            console.log("New RSA Key Pair Generated Successfully");
        }
    } catch (error) {
        console.error("Failed to initialize RSA Key Pair", error);
    }
});
// Email Validation Function
function validateVITEmail(email) {
    const regex = /^[a-zA-Z0-9._%+-]+@vitbhopal\.ac\.in$/;
    return regex.test(email);
}

// Helper function to generate OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Upload Form Submission
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('file');
    const emailInput = document.getElementById('email');
    const file = fileInput.files[0];
    const email = emailInput.value;

    if (!file) {
        document.getElementById('status').textContent = 'Please select a file.';
        return;
    }

    // Validate email
    if (!validateVITEmail(email)) {
        document.getElementById('status').textContent = 'Invalid email. Only VIT Bhopal emails are allowed.';
        return;
    }

    const otp = generateOTP();

    try {
        // Generate RSA Key Pair when the file is uploaded
        const rsaKeyPair = await EnhancedEncryption.generateRSAKeyPair();

        // Encrypt the file with the generated public key
        const { encryptedBlob } = await EnhancedEncryption.encryptFile(file, rsaKeyPair.publicKey);

        // Prepare EmailJS parameters
        const serviceID = "service_oj849wp";
        const templateID = "template_vv2q8vi";
        const templateParams = {
            email: email,
            otp: otp
        };

        // Send email with OTP
        await emailjs.send(serviceID, templateID, templateParams);

        // Upload encrypted file to Supabase
        const filePath = `otp-files/${otp}-${file.name}.encrypted`;
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, encryptedBlob, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) throw error;

        // Save public and private keys alongside the encrypted file
        const keysPath = `otp-files/${otp}-${file.name}.keys`;
        const keysData = JSON.stringify({
            publicKey: await exportKeyToString(rsaKeyPair.publicKey, true),
            privateKey: await exportKeyToString(rsaKeyPair.privateKey, false)
        });

        const { data: keysDataResponse, error: keysError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(keysPath, new Blob([keysData]), {
                cacheControl: '3600',
                upsert: false
            });

        if (keysError) throw keysError;

        // Update status
        document.getElementById('status').textContent = `Encrypted file uploaded successfully. OTP sent to ${email}. Your OTP is: ${otp}`;

    } catch (error) {
        document.getElementById('status').textContent = `Error: ${error.message}`;
        console.error(error);
    }
});
// Retrieve Form Submission
document.getElementById('retrieveForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const retrieveOtpInput = document.getElementById('retrieveOtp');
    const otp = retrieveOtpInput.value;

    if (!otp) {
        document.getElementById('status').textContent = 'Please enter an OTP.';
        return;
    }

    try {
        // List all files in the bucket
        const { data: files, error } = await supabase.storage.from(BUCKET_NAME).list('otp-files');

        if (error) {
            throw new Error(`Error listing files: ${error.message || JSON.stringify(error)}`);
        }

        // Find the encrypted file matching the OTP
        const file = files.find((f) => f.name.startsWith(`${otp}-`) && f.name.endsWith('.encrypted'));

        if (!file) {
            document.getElementById('status').textContent = `No encrypted file found for OTP: ${otp}`;
            return;
        }

        // Fetch the encrypted file
        const { data: encryptedData, error: fileError } = await supabase.storage
            .from(BUCKET_NAME)
            .download(`otp-files/${file.name}`);
        
        if (fileError) {
            throw new Error(`Error fetching encrypted file: ${fileError.message || JSON.stringify(fileError)}`);
        }

        const encryptedBlob = encryptedData;

        // Fetch the RSA keys (public/private) for the file based on OTP
        const keysPath = `otp-files/${file.name.replace('.encrypted', '')}.keys`;
        const { data: keysDataResponse, error: keysError } = await supabase.storage
            .from(BUCKET_NAME)
            .download(keysPath);

        if (keysError) {
            document.getElementById('status').textContent = `Error fetching RSA keys: ${keysError.message || 'Unknown error'}`;
            return;
        }

        if (!keysDataResponse) {
            document.getElementById('status').textContent = 'No keys data returned.';
            return;
        }

        const keysData = await keysDataResponse.text();
        const { publicKey, privateKey } = JSON.parse(keysData);

        // Import the RSA keys from the stored strings
        const rsaKeyPair = {
            publicKey: await importKeyFromString(publicKey, true),
            privateKey: await importKeyFromString(privateKey, false)
        };

        // Decrypt the file with the private key
        try {
            const decryptedBlob = await EnhancedEncryption.decryptFile(encryptedBlob, rsaKeyPair.privateKey);

            // Create a download link for the decrypted file
            const url = URL.createObjectURL(decryptedBlob);
            document.getElementById('status').innerHTML = `
                File retrieved and decrypted successfully. 
                <a href="${url}" target="_blank" download="${file.name.replace('.encrypted', '')}">Download Decrypted File</a>
            `;

            // Clean up the URL after download
            setTimeout(() => URL.revokeObjectURL(url), 60000);

            // Schedule deletion of the file and keys after 2 minutes
            setTimeout(async () => {
                try {
                    const filePath = `otp-files/${file.name}`;
                    const keysPath = `otp-files/${file.name.replace('.encrypted', '')}.keys`;

                    // Delete the encrypted file
                    const { error: deleteFileError } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);
                    if (deleteFileError) {
                        console.error(`Error deleting file: ${deleteFileError.message || JSON.stringify(deleteFileError)}`);
                    } else {
                        console.log(`File deleted successfully: ${filePath}`);
                    }

                    // Delete the keys file
                    const { error: deleteKeysError } = await supabase.storage.from(BUCKET_NAME).remove([keysPath]);
                    if (deleteKeysError) {
                        console.error(`Error deleting keys: ${deleteKeysError.message || JSON.stringify(deleteKeysError)}`);
                    } else {
                        console.log(`Keys deleted successfully: ${keysPath}`);
                    }
                } catch (deleteError) {
                    console.error('Error scheduling file deletion:', deleteError);
                }
            }, 120000); // 2 minutes in milliseconds

        } catch (decryptError) {
            document.getElementById('status').textContent = 'Failed to decrypt file. Please refresh the page and try again.';
            console.error('Decryption error:', decryptError);
        }

    } catch (error) {
        document.getElementById('status').textContent = `Error retrieving file: ${error.message || error}`;
        console.error('Error:', error);
    }
});




// Saved Data Upload
document.getElementById('saveform').addEventListener('submit', async (e) => {
    e.preventDefault();
    const savedFileInput = document.getElementById('savedFile');
    const savedFile = savedFileInput.files[0];
    const username = document.getElementById('username').textContent.trim(); // Get username from the div

    if (!savedFile ) {
        document.getElementById('status').textContent = 'Please select a file and ensure keys are generated.';
        return;
    }

    const Otp = generateOTP();

    try {
        // Encrypt the file with RSA public key
        const { encryptedBlob } = await EnhancedEncryption.encryptFile(savedFile, rsaKeyPair.publicKey);

        // Upload encrypted file to Supabase (Saved Data bucket)
        const savedFilePath = `${username}/${Otp}-${savedFile.name}.encrypted`;
        const { data, error } = await supabase.storage
            .from('saved')
            .upload(savedFilePath, encryptedBlob, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) throw error;

        // Display success status with OTP
        document.getElementById('status').textContent = `File uploaded successfully. Use OTP: ${Otp} to retrieve it.`;

    } catch (error) {
        document.getElementById('status').textContent = `Error uploading file: ${error.message}`;
        console.error(error);
    }
});

// Retrieve Saved Data
document.getElementById('retrieveSavedForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const retrieveSavedOtpInput = document.getElementById('retrieveSavedOtp');
    const Otp = retrieveSavedOtpInput.value;
    const username = document.getElementById('username').textContent.trim(); // Get username from the div

    if (!Otp) {
        document.getElementById('status').textContent = 'Please enter an OTP and ensure keys are generated.';
        return;
    }

    try {
        // List all files in the bucket
        const { data: files, error } = await supabase.storage.from('saved').list(username);

        if (error) throw error;

        // Find the file matching the OTP
        const file = files.find((f) => f.name.startsWith(`${Otp}-`) && f.name.endsWith('.encrypted'));

        if (!file) {
            document.getElementById('status').textContent = `No file found for OTP: ${Otp}`;
            return;
        }

         // Generate a download URL for the file in the username folder
         const filePath = `${username}/${file.name}`;
         const { data: downloadData, error: downloadError } = await supabase.storage
             .from('saved')
             .createSignedUrl(filePath, 60);
        if (downloadError) throw downloadError;

        // Fetch the file
        const response = await fetch(downloadData.signedUrl);
        const encryptedBlob = await response.blob();

        try {
            // Decrypt the file with the RSA private key
            const decryptedBlob = await EnhancedEncryption.decryptFile(encryptedBlob, rsaKeyPair.privateKey);

            // Create a download link for the decrypted file
            const url = URL.createObjectURL(decryptedBlob);
            document.getElementById('status').innerHTML = `
                File retrieved and decrypted successfully.
                <a href="${url}" target="_blank" download="${file.name.replace('.encrypted', '')}">Download Decrypted File</a>
            `;

            // Clean up the URL after download
            setTimeout(() => URL.revokeObjectURL(url), 60000); // Clean up after 1 minute

        } catch (decryptError) {
            document.getElementById('status').textContent = 'Failed to decrypt file. Please refresh the page and try again.';
            console.error('Decryption error:', decryptError);
        }

    } catch (error) {
        document.getElementById('status').textContent = `Error retrieving file: ${error.message}`;
        console.error(error);
    }
});

// Username display logic
document.addEventListener('DOMContentLoaded', () => {
    const getUrlParameter = (name) => {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        const results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    };

    const fullUsername = getUrlParameter('username');
    const displayUsername = fullUsername.split('@')[0];

    const usernameElement = document.getElementById('username');
    if (usernameElement && displayUsername) {
        usernameElement.textContent = displayUsername;
    }
});

// Session timeout logic
document.addEventListener('DOMContentLoaded', () => {
    let timeout;

    // Function to save the current keys before session expires
    const saveKeysBeforeExpiry = () => {
        if (rsaKeyPair) {
            try {
                localStorage.setItem('lastSessionPublicKey', sessionStorage.getItem('publicKey'));
                localStorage.setItem('lastSessionPrivateKey', sessionStorage.getItem('privateKey'));
            } catch (error) {
                console.error('Failed to save keys before session expiry:', error);
            }
        }
    };

    // Reset the timeout whenever there's user activity
    const resetTimeout = () => {
        clearTimeout(timeout); // Clear the existing timeout
        timeout = setTimeout(() => {
            // Save keys before redirecting
            saveKeysBeforeExpiry();
            // Redirect to the login page after 5 minutes of inactivity
            alert("You have been signed out due to inactivity.");
            window.location.href = 'login.html';
        }, 5 * 60 * 1000); // 5 minutes in milliseconds
    };

    // Event listeners for user activity
    ['mousemove', 'click', 'keypress', 'scroll'].forEach((event) => {
        document.addEventListener(event, resetTimeout);
    });

    // Initialize the timeout when the page loads
    resetTimeout();

    // Add event listener for page unload to save keys
    window.addEventListener('beforeunload', saveKeysBeforeExpiry);
});

// Function to restore keys from previous session if needed
async function restoreKeysFromPreviousSession() {
    try {
        const lastSessionPublicKey = localStorage.getItem('lastSessionPublicKey');
        const lastSessionPrivateKey = localStorage.getItem('lastSessionPrivateKey');

        if (lastSessionPublicKey && lastSessionPrivateKey) {
            // Restore keys to current session
            sessionStorage.setItem('publicKey', lastSessionPublicKey);
            sessionStorage.setItem('privateKey', lastSessionPrivateKey);

            // Clear the localStorage after restoration
            localStorage.removeItem('lastSessionPublicKey');
            localStorage.removeItem('lastSessionPrivateKey');

            return true;
        }
    } catch (error) {
        console.error('Failed to restore keys from previous session:', error);
    }
    return false;
}

// Add this to your initial DOMContentLoaded event
document.addEventListener('DOMContentLoaded', async () => {
    // Try to restore keys from previous session first
    const keysRestored = await restoreKeysFromPreviousSession();
    
    if (!keysRestored) {
        // If no keys were restored, proceed with normal key initialization
        try {
            // Your existing key initialization code...
        } catch (error) {
            console.error("Failed to initialize RSA Key Pair", error);
        }
    }
});